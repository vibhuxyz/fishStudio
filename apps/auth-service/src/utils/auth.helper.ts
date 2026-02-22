import crypto from "crypto";
import { ValidationError } from "@repo/error-handlers";
import { redis, publishToQueue } from "@repo/libs";
import { NextFunction, Request, Response } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller",
) => {
  // Implement validation logic based on userType
  const { name, email, password, phone_number } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && !phone_number)
  ) {
    throw new ValidationError(`Missing required fields!`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid email format!`);
  }
};

export const checkOtpRestrictions = async (
  identifier: string,
  next: NextFunction,
) => {
  if (await redis.get(`otp_lock:${identifier}`)) {
    throw new ValidationError(
      "Account locked due to multiple failed attempts! Try again 30 minutes later.",
    );
  }
  

  if (await redis.get(`otp_spam_lock:${identifier}`)) {
    throw new ValidationError(
      "Too many OTP requests! Please try again after some time. In one Hour",
    );
  }

  if (await redis.get(`otp_cooldown:${identifier}`)) {
    throw new ValidationError(
      "OTP request cooldown active! Please wait before requesting another OTP.",
    );
  }
};

export const trackOtpRequests = async (
  identifier: string,
  next: NextFunction,
) => {
  const otpRequestsKey = `otp_requests_count:${identifier}`;
  let otpRequests = parseInt((await redis.get(otpRequestsKey)) || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${identifier}`, "locked", "EX", 30 * 60); // 30 minutes lock
    throw new ValidationError(
      "Too many OTP requests! Please try again after some time. In one Hour",
    );
  }
  await redis.set(otpRequestsKey, otpRequests + 1, "EX", 10 * 60); // count resets after 10 minutes
  // x// remove comment later to test the api
};

export const sendOtp = async (
  userType: "user" | "seller",
  data: {
    name: string;
    email?: string;
    phone_number?: string;
    template?: string;
  },
  ) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  //send otp email logic here

  let identifier = userType === "user" ? data.phone_number : data.email;

  try {
    await redis.set(`otp:${identifier}`, otp, "EX", 5 * 60);
    await redis.set(`otp_cooldown:${identifier}`, "true", "EX", 60);

    // Publish job to RabbitMQ (not sending OTP directly)

    await publishToQueue("otp_queue", {
      userType,
      name: data.name,
      email: data.email,
      phone_number: data.phone_number,
      template: data.template,
      otp,
    });

    return { success: true, message: "OTP request queued" };
  } catch (error) {
    console.error("Unified OTP Error:", error);
    throw new Error("Could not send OTP");
  }
};

export const verifyOtp = async (
  identifier: string,
  otp: string,
  next: NextFunction,
) => {
  const sellerOtp = await redis.get(`otp:${identifier}`);

  if (!sellerOtp) {
    throw new ValidationError("Invailed or expired otp");
  }

  const failedAttamtsKey = `otp_attempts:${identifier}`;

  const failedAttampts = parseInt((await redis.get(failedAttamtsKey)) || "0");

  if (sellerOtp !== otp) {
    if (failedAttampts >= 2) {
      await redis.set(`otp_lock:${identifier}`, "locked", "EX", 1800);
      await redis.del(`otp:${identifier}`, failedAttamtsKey);
      throw new ValidationError(
        "Too many failed attempts! Your account is locked Please try again after 30 minutes",
      );
    }

    await redis.set(failedAttamtsKey, failedAttampts + 1, "EX", 300);
    throw new ValidationError(
      `Invalid OTP. ${2 - failedAttampts} attempts left.`,
    );
  }

  await redis.del(`otp:${identifier}`, failedAttamtsKey);
};

export const verifyForgetPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new ValidationError("All fields are required");
    }

    await verifyOtp(email, otp, next);

    res.status(200).json({
      success: true,
      message: `OTP verified successfully You can now reset your password`,
    });
  } catch (error) {
    next(error);
  }
};

export const createRazorpayAccount = async (
  email: string,
  contact: string,
  name: string,
  line1: string,
  country: string,
) => {};

// export const handleForgetPassword = async (
//   req: Request,
//
//   res: Response,
//   next: NextFunction,
//   userType: "user" | "seller",
//   ) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       throw new ValidationError("Email is required");
//     }

//     // find the user/seller in db

//     const user =
//       userType === "user"
//         ? await prisma.sellers.findUnique({
//             where: { email },
//           })
//         : await prisma.sellers.findUnique({
//             where: { email },
//           });

//     // if (!user) {
//     //   throw new AuthError(`${userType} not found`);
//     // }

//     // check otp checkOtpRestriction
//     await checkOtpRestrictions(email, next);
//     await trackOtpRequests(email, next);

//     // Generate  OTP and send
//     await sendOtp(
//       seller.name,
//       email,
//       userType === "user"
//         ? "forget-password-user-mail"
//         : "forget-password-seller-mail",
//     );

//     res.status(200).json({
//       success: true,
//       message: `OTP sent successfully to your email. Please Verify your account!!!`,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
//
//
//
//
//
// // export const sendOtpPhone = async (name: string, phone_number: string) => {
//   const otp = crypto.randomInt(1000, 9999).toString();

//   try {
//     if (process.env.NODE_ENV !== "production") {
//       console.log(`DEV OTP for ${phone_number}: ${otp}`);

//       await redis.set(`otp:${phone_number}`, otp, "EX", 5 * 60);
//       await redis.set(`otp_cooldown:${phone_number}`, "true", "EX", 60);

//       return { success: true, otp };
//     }

//     const payload = {
//       route: "v3",
//       sender_id: "TXTIND",
//       message: `Hello ${name}, Your OTP is ${otp}`,
//       language: "english",
//       numbers: phone_number,
//     };

//     const response = await axios.post(
//       "https://www.fast2sms.com/dev/bulkV2",
//       payload,
//       {
//         headers: {
//           authorization: process.env.FAST2SMS_API_KEY!,
//         },
//       },
//     );

//     console.log("SMS API response:", response.data);

//     if (!response.data || response.data.return === false) {
//       throw new Error("Failed to send OTP");
//     }

//     // Save OTP to Redis
//     await redis.set(`otp:${phone_number}`, otp, "EX", 5 * 60);
//     await redis.set(`otp_cooldown:${phone_number}`, "true", "EX", 60);

//     return { success: true, otp };
//   } catch (err) {
//     console.error("OTP Send Error:", err);
//     throw new Error("Could not send OTP");
//   }
// };
//
//
