import nodemailer from "nodemailer";

import ejs from "ejs";
import path from "path";
import { ENV } from "@repo/env-config";

const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: Number(ENV.SMTP_PORT) || 587,
  service: ENV.SMTP_SERVICE,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

// Render an EJS email template
const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "order-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`,
  );

  return ejs.renderFile(templatePath, data);
};

// send an email using nodemailer
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>,
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);

    await transporter.sendMail({
      from: `<${ENV.SMTP_USER}`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.log("Error sending email", error);
    return false;
  }
};
