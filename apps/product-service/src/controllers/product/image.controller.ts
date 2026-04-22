import { Request, Response, NextFunction } from "express";
import { cloudinary } from "@repo/libs";
import { ENV } from "@repo/env-config";
import { ValidationError } from "@repo/error-handlers";
import {
  uploadProductImageSchema,
  uploadCloudinaryImageSchema,
  deleteCloudinaryImageSchema,
  validate,
} from "@repo/zod-schema";

// Hard limit on base64 upload size (~10 MB of image data -> ~13.3 MB base64).
const MAX_BASE64_LENGTH = 15 * 1024 * 1024;

// Only allow `data:image/<type>;base64,...` URIs to prevent Cloudinary from
// fetching arbitrary URLs (SSRF / metadata-service exfiltration / cost abuse).
const assertSafeImageSource = (value: unknown): string => {
  if (typeof value !== "string" || value.length === 0) {
    throw new ValidationError("Invalid image payload");
  }
  if (value.length > MAX_BASE64_LENGTH) {
    throw new ValidationError("Image is too large (max ~10 MB)");
  }
  const match = value.match(/^data:image\/(png|jpe?g|webp|gif|avif|heic|heif);base64,/i);
  if (!match) {
    throw new ValidationError("Only base64-encoded image data URIs are accepted");
  }
  return value;
};

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
