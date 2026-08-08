import { Request, Response, NextFunction } from "express";
import {
  cloudinary,
  assertSafeImageSource,
  CLOUDINARY_UPLOAD_TIMEOUT_MS as UPLOAD_TIMEOUT_MS,
} from "@repo/libs/cloudinary";
import { ENV } from "@repo/env-config";
import { ForbiddenError, ValidationError } from "@repo/error-handlers";
import { AuthRequest } from "./utils.js";
import {
  uploadProductImageSchema,
  uploadCloudinaryImageSchema,
  deleteCloudinaryImageSchema,
  validate,
} from "@repo/zod-schema";

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = validate(uploadProductImageSchema, req.body);
    const safeSource = assertSafeImageSource(fileName);
    const response = await cloudinary.uploader.upload(safeSource, {
      folder: "products",
      quality: "auto:good",
      fetch_format: "auto",
      transformation: [{ width: 1200, crop: "limit" }],
      timeout: UPLOAD_TIMEOUT_MS,
    });
    res.status(201).json({
      success: true,
      file_url: response.secure_url,
      public_id: response.public_id,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCloudinaryImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { images, fileName, folder, productTitle, category } = validate(
      uploadCloudinaryImageSchema,
      req.body,
    );
    const imageList = Array.isArray(images)
      ? images
      : fileName
        ? [fileName]
        : [];
    if (imageList.length === 0) {
      return next(new ValidationError("At least one image is required"));
    }
    const validFolders = ["banners", "products", "categriy"];
    const targetBaseFolder = validFolders.includes(folder as string)
      ? (folder as string)
      : "products";
    let cloudFolder = `${ENV.CLOUDINARY_FOLDER || "fishStudio"}/${targetBaseFolder}`;
    if (targetBaseFolder === "categriy") {
      cloudFolder = `${ENV.CLOUDINARY_FOLDER || "fishStudio"}/categriy/categoryImage/images`;
    } else if (targetBaseFolder === "products" && typeof productTitle === "string") {
      const safeTitle = productTitle
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-]/g, "");
      cloudFolder += `/${safeTitle}`;
    } else if (targetBaseFolder === "banners") {
      if (category) {
        cloudFolder += `/category/${category}/images`;
      } else {
        cloudFolder += `/homepage`;
      }
    }
    const uploadPromises = imageList.map(async (base64) => {
      const safeSource = assertSafeImageSource(base64);
      const response = await cloudinary.uploader.upload(safeSource, {
        folder: cloudFolder,
        resource_type: "image",
        overwrite: true,
        quality: "auto:good",
        fetch_format: "auto",
        transformation: [{ width: 1200, crop: "limit" }],
        timeout: UPLOAD_TIMEOUT_MS,
      });
      return {
        file_url: response.secure_url,
        fileId: response.public_id,
      };
    });
    const results = await Promise.all(uploadPromises);
    res.status(201).json({
      success: true,
      images: results,
      file_url: results[0]?.file_url,
      fileId: results[0]?.fileId,
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    next(error);
  }
};

// Every asset a seller uploads lands under their own prefix. Deletion is
// checked against it because `deleteCloudinaryImage` destroys whatever
// public_id it is handed — without this a seller could wipe another shop's
// images just by knowing the id.
const storeImageFolder = (sellerId: string) =>
  `${ENV.CLOUDINARY_FOLDER || "fishStudio"}/stores/${sellerId}/banners`;

export const uploadStoreImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;
    if (!sellerId) {
      return next(new ForbiddenError("Seller context missing"));
    }
    const { fileName } = validate(uploadProductImageSchema, req.body);
    const safeSource = assertSafeImageSource(fileName);
    const response = await cloudinary.uploader.upload(safeSource, {
      folder: storeImageFolder(sellerId),
      resource_type: "image",
      quality: "auto:good",
      fetch_format: "auto",
      transformation: [{ width: 1600, crop: "limit" }],
      timeout: UPLOAD_TIMEOUT_MS,
    });
    res.status(201).json({
      success: true,
      file_url: response.secure_url,
      fileId: response.public_id,
    });
  } catch (error) {
    console.error("Store Image Upload Error:", error);
    next(error);
  }
};

export const deleteStoreImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sellerId = req.seller?.id;
    if (!sellerId) {
      return next(new ForbiddenError("Seller context missing"));
    }
    const { fileId } = validate(deleteCloudinaryImageSchema, req.body);
    if (!fileId.startsWith(`${storeImageFolder(sellerId)}/`)) {
      return next(new ForbiddenError("You can only delete your own store images"));
    }
    const result = await cloudinary.uploader.destroy(fileId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Store Image Delete Error:", error);
    next(error);
  }
};

export const deleteCloudinaryImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = validate(deleteCloudinaryImageSchema, req.body);
    const result = await cloudinary.uploader.destroy(fileId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    next(error);
  }
};
