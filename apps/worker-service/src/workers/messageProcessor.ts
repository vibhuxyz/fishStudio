import { ConsumeMessage } from "amqplib";
import { isValidOtpMessage, OtpMessage } from "../types/otpMessage.js";


export function parseMessage(msg: ConsumeMessage): OtpMessage {
  const data = JSON.parse(msg.content.toString());

  if (!isValidOtpMessage(data)) {
    throw new Error("Invalid message structure");
  }

  return data;
}


export function logMessageReceived(data: OtpMessage): void {
  const recipient = data.phone_number || data.email || "unknown";
  console.log(`📨 Received OTP request for ${data.userType}: ${recipient}`);
}
