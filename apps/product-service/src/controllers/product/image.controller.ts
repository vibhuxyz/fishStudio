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

export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileName } = validate(uploadProductImageSchema, req.body);
    const response = await cloudinary.uploader.upload(fileName, {
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
    const uploadPromises = imageList.map(async (base64, index) => {
      const response = await cloudinary.uploader.upload(base64, {
        folder: cloudFolder,
        public_id: `image${index + 1}`,
        resource_type: "auto",
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
