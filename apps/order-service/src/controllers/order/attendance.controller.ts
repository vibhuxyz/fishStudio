import { NextFunction, Response } from "express";
import { prismaPostgres } from "@repo/db-postgres";
import { prismaMongo } from "@repo/db-mongo";
import { ValidationError } from "@repo/error-handlers";
import { attendanceCheckInSchema, validate } from "@repo/zod-schema";
import { assertSafeImageSource, cloudinary, CLOUDINARY_UPLOAD_TIMEOUT_MS } from "@repo/libs/cloudinary";
import { logger } from "@repo/libs/logger";
import {
  ATTENDANCE_GEOFENCE_METERS,
  distanceInMeters,
  type Coordinates,
} from "@repo/shared/geo";

/**
 * Shift attendance for riders and cutting staff.
 *
 * A shift starts with a selfie taken at the store. The selfie answers "was it
 * actually them", the coordinates answer "were they actually there", and
 * neither is much use without the other — a photo proves nothing about place
 * and a location proves nothing about person.
 *
 * An out-of-range attempt is recorded and rejected, not silently dropped. "The
 * rider tried to check in from four kilometres away" is precisely what a
 * manager needs to see, and discarding it would leave no trace of the attempt.
 */

/** Midnight IST as a UTC instant — a shift belongs to the store's day. */
function startOfIstDay(now: Date = new Date()): Date {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

/* ─── Staff: check in ─────────────────────────────────────────────────────── */
export const checkIn = async (req: any, res: Response, next: NextFunction) => {
  try {
    const staffId = req.staff?.id;
    const storeId = req.seller?.store?.id;
    if (!staffId) return next(new ValidationError("Only staff can check in"));
    if (!storeId) return next(new ValidationError("No store context"));

    const { photo, latitude, longitude } = validate(attendanceCheckInSchema, req.body);

    const store = await prismaMongo.stores.findUnique({
      where: { id: storeId },
      select: {
        latitude: true, longitude: true, name: true,
        attendanceGeofenceMeters: true,
      },
    });
    if (store?.latitude == null || store?.longitude == null) {
      // Refusing is the honest answer: without the store's own pin there is
      // nothing to measure against, and recording an unverified check-in as if
      // it had passed a geofence would make the whole record untrustworthy.
      return next(
        new ValidationError(
          "This store has no map location set yet, so check-in can't be verified. Ask an admin to set it in store settings.",
        ),
      );
    }

    const storePoint: Coordinates = { latitude: store.latitude, longitude: store.longitude };
    const here: Coordinates = { latitude, longitude };
    const distanceMeters = distanceInMeters(storePoint, here);
    // Per-store, because the right radius depends on the site rather than on
    // the platform — see the field's note on the stores model.
    const allowedMeters = store.attendanceGeofenceMeters ?? ATTENDANCE_GEOFENCE_METERS;
    const withinGeofence = distanceMeters <= allowedMeters;

    // Already checked in today? Second attempts are a no-op rather than a new
    // row — a rider tapping twice shouldn't read as two shifts.
    const existing = await prismaPostgres.staffAttendance.findFirst({
      where: { staffId, checkInAt: { gte: startOfIstDay() }, isWithinGeofence: true },
      orderBy: { checkInAt: "desc" },
    });
    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        attendance: existing,
      });
    }

    // Uploaded before the range check so a rejected attempt still carries its
    // evidence — a dispute about a failed check-in is exactly when the photo
    // matters.
    const safeSource = assertSafeImageSource(photo);
    const uploaded = await cloudinary.uploader.upload(safeSource, {
      folder: "attendance",
      quality: "auto:good",
      fetch_format: "auto",
      transformation: [{ width: 800, crop: "limit" }],
      timeout: CLOUDINARY_UPLOAD_TIMEOUT_MS,
    });

    const attendance = await prismaPostgres.staffAttendance.create({
      data: {
        staffId,
        storeId,
        checkInAt: new Date(),
        selfieUrl: uploaded.secure_url,
        selfiePublicId: uploaded.public_id,
        latitude,
        longitude,
        distanceMeters,
        isWithinGeofence: withinGeofence,
      },
    });

    if (!withinGeofence) {
      logger.warn("[attendance] check-in outside the geofence", {
        staffId, storeId, distanceMeters, allowedMeters,
      });
      return res.status(400).json({
        success: false,
        message: `You're ${distanceMeters}m from ${store.name}. Check in within ${allowedMeters}m of the store.`,
        distanceMeters,
        allowedMeters,
      });
    }

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

/* ─── Staff: check out ────────────────────────────────────────────────────── */
export const checkOut = async (req: any, res: Response, next: NextFunction) => {
  try {
    const staffId = req.staff?.id;
    if (!staffId) return next(new ValidationError("Only staff can check out"));

    const open = await prismaPostgres.staffAttendance.findFirst({
      where: {
        staffId,
        checkOutAt: null,
        isWithinGeofence: true,
        checkInAt: { gte: startOfIstDay() },
      },
      orderBy: { checkInAt: "desc" },
    });
    if (!open) return next(new ValidationError("No open shift to check out of"));

    // No geofence on check-out. A rider finishing their last delivery is by
    // definition not at the store, and requiring them to ride back to close a
    // shift would only teach them to check out early.
    const attendance = await prismaPostgres.staffAttendance.update({
      where: { id: open.id },
      data: { checkOutAt: new Date() },
    });

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

/* ─── Staff: my own shift today ───────────────────────────────────────────── */
export const getMyAttendance = async (req: any, res: Response, next: NextFunction) => {
  try {
    const staffId = req.staff?.id;
    if (!staffId) return next(new ValidationError("Only staff have attendance"));

    const today = await prismaPostgres.staffAttendance.findFirst({
      where: { staffId, checkInAt: { gte: startOfIstDay() } },
      orderBy: { checkInAt: "desc" },
    });

    res.status(200).json({
      success: true,
      attendance: today,
      isCheckedIn: Boolean(today?.isWithinGeofence && !today.checkOutAt),
    });
  } catch (error) {
    next(error);
  }
};

/* ─── Manager: the roster for a day or a range ────────────────────────────── */
export const getStoreAttendance = async (req: any, res: Response, next: NextFunction) => {
  try {
    const storeId = req.seller?.store?.id;
    if (!storeId) return next(new ValidationError("No store context"));

    const { from, to } = req.query as { from?: string; to?: string };
    const start = from ? new Date(from) : startOfIstDay();
    const end = to ? new Date(to) : new Date();
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return next(new ValidationError("Invalid date range"));
    }

    const records = await prismaPostgres.staffAttendance.findMany({
      where: { storeId, checkInAt: { gte: start, lte: end } },
      orderBy: { checkInAt: "desc" },
      take: 500,
    });

    const staff = await prismaMongo.staffs.findMany({
      where: { id: { in: [...new Set(records.map((r) => r.staffId))] } },
      select: { id: true, name: true, role: true },
    });
    const staffById = new Map(staff.map((s) => [s.id, s]));

    // Who hasn't checked in is as much the point as who has, so the absent list
    // is built here rather than left for the client to work out.
    const roster = await prismaMongo.staffs.findMany({
      where: { storeId, isActive: true },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    });
    const presentToday = new Set(
      records.filter((r) => r.isWithinGeofence && r.checkInAt >= startOfIstDay()).map((r) => r.staffId),
    );

    // What the fence is actually doing, so the radius can be set from evidence
    // rather than guessed. The distance that matters is the one on *accepted*
    // check-ins: if the 90th percentile of those is pressed up against the
    // limit, the limit is too tight and honest riders are being turned away.
    // Rejections are counted separately — a handful is the fence working, a
    // steady stream is the fence being worked around.
    const accepted = records.filter((record) => record.isWithinGeofence);
    const acceptedDistances = accepted
      .map((record) => record.distanceMeters)
      .sort((a, b) => a - b);
    const percentile = (p: number) =>
      acceptedDistances.length === 0
        ? null
        : acceptedDistances[
            Math.min(acceptedDistances.length - 1, Math.floor(acceptedDistances.length * p))
          ];

    const store = await prismaMongo.stores.findUnique({
      where: { id: storeId },
      select: { attendanceGeofenceMeters: true },
    });
    const geofenceMeters = store?.attendanceGeofenceMeters ?? ATTENDANCE_GEOFENCE_METERS;

    res.status(200).json({
      success: true,
      records: records.map((record) => ({
        ...record,
        staffName: staffById.get(record.staffId)?.name ?? "Unknown",
        staffRole: staffById.get(record.staffId)?.role ?? null,
      })),
      absentToday: roster.filter((member) => !presentToday.has(member.id)),
      geofenceMeters,
      calibration: {
        totalAttempts: records.length,
        rejected: records.length - accepted.length,
        medianAcceptedMeters: percentile(0.5),
        p90AcceptedMeters: percentile(0.9),
        maxAcceptedMeters: acceptedDistances.at(-1) ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
};
