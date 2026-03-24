export interface OtpMessage {
  userType: "admin" | "user" | "seller";
  name: string;
  email?: string;
  phone_number?: string;
  template?: string;
  otp: string;
}

/**
 * Type guard to validate OTP message
 */
export function isValidOtpMessage(data: any): data is OtpMessage {
  if (!data || typeof data !== "object") return false;
  if (!data.userType || !data.name || !data.otp) return false;

  // Validate user type fields
  if (data.userType === "user") {
    // For users, we need either phone OR email+template
    const hasPhone = !!data.phone_number;
    const hasEmail = !!data.email && !!data.template;
    if (!hasPhone && !hasEmail) return false;
  } else if (data.userType === "seller" || data.userType === "admin") {
    // For admins/sellers, email and template are mandatory
    if (!data.email || !data.template) return false;
  }

  return true;
}
