import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ENV } from "@repo/env-config";
import { logger } from "../utils/logger.js";
import { retryWithBackoff } from "../utils/retry.js";
import { CircuitBreaker } from "../utils/circuit-breaker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = ENV.NODE_ENV.toLowerCase() === "production";

// Circuit breakers for both providers
const brevoCircuit = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 60000 });
const smtpCircuit = new CircuitBreaker({ failureThreshold: 3, resetTimeout: 60000 });

let smtpTransporter: nodemailer.Transporter | null = null;
let etherealTransporter: nodemailer.Transporter | null = null;

const hasSmtpConfig = () =>
  !!(ENV.SMTP_HOST && ENV.SMTP_PORT && ENV.SMTP_USER && ENV.SMTP_PASS);

const getSmtpTransporter = () => {
  if (smtpTransporter) {
    return smtpTransporter;
  }

  const smtpPort = Number(ENV.SMTP_PORT);
  if (Number.isNaN(smtpPort)) {
    throw new Error(`Invalid SMTP_PORT value: ${ENV.SMTP_PORT}`);
  }

  smtpTransporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
    family: 4,
  } as any);

  return smtpTransporter;
};

/** Creates a free Ethereal test account on demand for dev — no config needed. */
const getEtherealTransporter = async (): Promise<nodemailer.Transporter> => {
  if (etherealTransporter) return etherealTransporter;

  const testAccount = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  console.log("📧 [DEV] Ethereal test account created:");
  console.log(`   User: ${testAccount.user}`);
  console.log(`   Pass: ${testAccount.pass}`);
  console.log("   Preview emails at https://ethereal.email/messages");

  return etherealTransporter;
};

const TEMPLATES_DIR =
  process.env.EMAIL_TEMPLATES_DIR || path.resolve(__dirname, "templates");

const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  const templatePath = path.resolve(TEMPLATES_DIR, `${templateName}.ejs`);

  if (!fs.existsSync(templatePath)) {
    console.error(`[sendEmail] ❌ Template not found: ${templatePath}`);
    throw new Error(`Email template not found: ${templatePath}`);
  }

  // Auto-inject branding and environment info
  const templateData = {
    ...data,
    ORG_NAME: ENV.ORG_NAME,
    ORG_EMAIL: ENV.ORG_SUPPORT_EMAIL,
    SENDER_ROLE: data.senderRole || "System", // Default role
    ENVIRONMENT: ENV.NODE_ENV,
  };

  try {
    return await ejs.renderFile(templatePath, templateData);
  } catch (error: any) {
    console.error(`[sendEmail] ❌ Template render error (${templateName}):`, error?.message ?? error);
    throw error;
  }
};

const sendWithBrevo = async (to: string, subject: string, html: string) => {
  return brevoCircuit.execute(async () => {
    return retryWithBackoff(
      async () => {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": ENV.BREVO_API_KEY as string,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: {
              name: ENV.EMAIL_FROM || "Wallet App",
              email: ENV.SMTP_USER,
            },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
        }
      },
      {
        maxAttempts: 4,
        initialDelayMs: 300,
        maxDelayMs: 8_000,
      },
    );
  });
};

const sendWithEthereal = async (to: string, subject: string, html: string) => {
  const transporter = await getEtherealTransporter();
  const info = await transporter.sendMail({
    from: `FishStudio <noreply@fishstudio.dev>`,
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`\n📬 [DEV] Email preview: ${previewUrl}\n`);
  }

  return info.messageId;
};

const sendWithNodemailer = async (
  to: string,
  subject: string,
  html: string,
) => {
  if (!hasSmtpConfig()) {
    // Dev fallback: Ethereal test account (no .env config needed)
    return sendWithEthereal(to, subject, html);
  }

  try {
    return await smtpCircuit.execute(async () => {
      return retryWithBackoff(
        async () => {
          const transporter = getSmtpTransporter();
          const info = await transporter.sendMail({
            from: `${ENV.EMAIL_FROM || "FishStudio"} <${ENV.SMTP_USER}>`,
            to,
            subject,
            html,
          });

          return info.messageId;
        },
        {
          maxAttempts: 3,
          initialDelayMs: 200,
          maxDelayMs: 3_000,
        },
      );
    });
  } catch (error: any) {
    // In dev, a real SMTP account (e.g. Gmail's ~500/day cap) shouldn't block
    // testing — fall back to Ethereal so OTP/email flows keep working locally.
    if (!isProduction) {
      logger.warn(
        `[sendMail] SMTP send failed in non-production, falling back to Ethereal: ${error?.message ?? error}`,
      );
      return sendWithEthereal(to, subject, html);
    }
    throw error;
  }
};

/**
 * Sends an email using the appropriate provider based on the environment.
 */
export async function sendEmail(
  to: string, 
  subject: string, 
  templateName: string, 
  data: Record<string, any>
) {
  try {
    const html = await renderEmailTemplate(templateName, data);

    if (!to || !subject || !html) {
      throw new Error("Invalid email parameters");
    }

    if (isProduction && ENV.BREVO_API_KEY) {
      await sendWithBrevo(to, subject, html);
      logger.info("Email sent successfully", {
        to,
        template: templateName,
        provider: "brevo",
      });
      return true;
    }

    const messageId = await sendWithNodemailer(to, subject, html);
    logger.info("Email sent successfully", {
      to,
      template: templateName,
      provider: "nodemailer",
      messageId,
    });
    return true;
  } catch (error: any) {
    console.error(`[sendEmail] ❌ Failed to send email to ${to} (template: ${templateName})`);
    console.error(`[sendEmail] Error:`, error?.message ?? error);
    console.error(`[sendEmail] Stack:`, error?.stack);
    logger.error("Email sending failed", {
      to,
      template: templateName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
