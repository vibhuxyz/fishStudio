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
  if (data.userType === "user" && !data.phone_number) return false;
  if (
    (data.userType === "seller" || data.userType === "admin") &&
    (!data.email || !data.template)
  )
    return false;

  return true;
}
