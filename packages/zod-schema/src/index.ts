import { z, ZodSchema } from "zod";
import { ValidationError } from "@repo/error-handlers";

export const validate = <T>(schema: z.ZodType<T, any, any>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorMessages = result.error.errors.map((e) => e.message).join(", ");
    throw new ValidationError(errorMessages, result.error.errors);
  }
  return result.data;
};

export * from "./schemas/index.js";
export * from "./types/index.js";

// Exporting inferred types from schemas
import * as schemas from "./schemas/index.js";

export type LoginInput = z.infer<typeof schemas.loginSchema>;
export type RegisterStaffInput = z.infer<typeof schemas.registerStaffSchema>;
export type VerifyStaffInput = z.infer<typeof schemas.verifyStaffSchema>;
export type UpdateStaffAccessInput = z.infer<typeof schemas.updateStaffAccessSchema>;
export type ForgetPasswordInput = z.infer<typeof schemas.forgetPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof schemas.resetPasswordSchema>;

export type ProductInput = z.infer<typeof schemas.productSchema>;
export type UpdateProductInput = z.infer<typeof schemas.updateProductSchema>;
export type ProductImage = z.infer<typeof schemas.productImageSchema>;
export type ProductSizePricing = z.infer<typeof schemas.productSizePricingSchema>;
export type ProductCuttingTypePricing = z.infer<typeof schemas.productCuttingTypePricingSchema>;
export type ProductPieceSizePricing = z.infer<typeof schemas.productPieceSizePricingSchema>;

export type CreateOrderInput = z.infer<typeof schemas.createOrderSchema>;
export type AcceptOrRejectOrderInput = z.infer<typeof schemas.acceptOrRejectOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof schemas.updateOrderStatusSchema>;
export type StoreInput = z.infer<typeof schemas.storeSchema>;

export type CreateCouponInput = z.infer<typeof schemas.createCouponSchema>;
export type ValidateCouponInput = z.infer<typeof schemas.validateCouponSchema>;
export type ToggleCouponStatusInput = z.infer<typeof schemas.toggleCouponStatusSchema>;