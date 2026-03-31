import { ENV } from "@repo/config";
import nodemailer from "nodemailer";

import { CircuitBreaker, Logger, retryWithBackoff } from "@repo/libs";

const logger = new Logger("EmailService");
const brevoCircuit = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  resetTimeoutMs: 45_000,
});
const smtpCircuit = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  resetTimeoutMs: 45_000,
});

const templates: Record<
  string,
  (data: any) => { subject: string; html: string }
> = {
  "topup-verification": (data) => ({
    subject: "Wallet Topup - OTP Verification",

    html: `

          <!DOCTYPE html>

          <html>

          <body style="font-family: Arial, sans-serif; padding: 20px;">

            <h1>Hi ${data.name},</h1>

            <p>You are topping up your wallet with <strong>₹${data.amount}</strong></p>

            <p><strong>Bank:</strong> ${data.bankName}</p>

            <p><strong>Account:</strong> ${data.maskedAccount}</p>

            <p>Your OTP is:</p>

            <h2 style="color: #4CAF50; font-size: 32px; letter-spacing: 8px;">${data.otp}</h2>

            <p>This code expires in 5 minutes.</p>

            <p><small>If you did not initiate this transaction, please contact support immediately.</small></p>

          </body>

          </html>

        `,
  }),

  "email-verification": (data) => ({
    subject: "Verify Your Email - Wallet App",

    html: `

        <!DOCTYPE html>

        <html>

        <head>

          <style>

            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }

            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }

            .content { padding: 30px; background: #f9f9f9; }

            .otp { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }

            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }

          </style>

        </head>

        <body>

          <div class="header">

            <h1>Welcome to Wallet App!</h1>

          </div>

          <div class="content">

            <h2>Hi ${data.name},</h2>

            <p>Thank you for registering with Wallet App. Please verify your email address to complete your registration.</p>

            <p>Your verification code is:</p>

            <div class="otp">${data.otp}</div>

            <p>This code will expire in ${data.expiryMinutes} minutes.</p>

            <p>If you didn't create an account, please ignore this email.</p>

          </div>

          <div class="footer">

            <p>&copy; 2025 Wallet App. All rights reserved.</p>

          </div>

        </body>

        </html>

      `,
  }),

  "login-verification": (data) => ({
    subject: "New Device Login - Wallet App",

    html: `

        <!DOCTYPE html>

        <html>

        <head>

          <style>

            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }

            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }

            .content { padding: 30px; background: #f9f9f9; }

            .otp { font-size: 32px; font-weight: bold; color: #2196F3; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }

            .info { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }

          </style>

        </head>

        <body>

          <div class="header">

            <h1>New Device Login Detected</h1>

          </div>

          <div class="content">

            <h2>Hi ${data.name},</h2>

            <p>We detected a login attempt from a new device.</p>

            <div class="otp">${data.otp}</div>

            <div class="info">

              <strong>Device:</strong> ${data.deviceName}<br>

              <strong>IP:</strong> ${data.ip}<br>

              <strong>Time:</strong> ${new Date(data.timestamp).toLocaleString()}

            </div>

          </div>

        </body>

        </html>

      `,
  }),

  "password-reset": (data) => ({
    subject: "Password Reset - Wallet App",

    html: `

        <!DOCTYPE html>

        <html>

        <head>

          <style>

            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }

            .header { background: #F44336; color: white; padding: 20px; text-align: center; }

            .content { padding: 30px; background: #f9f9f9; }

            .otp { font-size: 32px; font-weight: bold; color: #F44336; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }

          </style>

        </head>

        <body>

          <div class="header">

            <h1>Password Reset Request</h1>

          </div>

          <div class="content">

            <h2>Hi ${data.name},</h2>

            <p>We received a request to reset your password.</p>

            <div class="otp">${data.otp}</div>

            <p>This code will expire in ${data.expiryMinutes} minutes.</p>

          </div>

        </body>

        </html>

      `,
  }),

  "pin-reset": (data) => ({
    subject: "Wallet PIN Reset - Wallet App",

    html: `

        <!DOCTYPE html>

        <html>

        <head>

          <style>

            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }

            .header { background: #7C3AED; color: white; padding: 20px; text-align: center; }

            .content { padding: 30px; background: #f9f9f9; }

            .otp { font-size: 32px; font-weight: bold; color: #7C3AED; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }

          </style>

        </head>

        <body>

          <div class="header">

            <h1>Wallet PIN Reset Request</h1>

          </div>

          <div class="content">

            <h2>Hi ${data.name},</h2>

            <p>We received a request to reset your wallet PIN.</p>

            <div class="otp">${data.otp}</div>

            <p>This code will expire in ${data.expiryMinutes} minutes.</p>

            <p>If you did not request this, please secure your account immediately.</p>

          </div>

        </body>

        </html>

    `,
  }),

  "account-delete": (data) => ({
    subject: "Confirm Account Deletion - Wallet App",

    html: `

      <!DOCTYPE html>

      <html>

      <head>

        <style>

          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }

          .header { background: #B91C1C; color: white; padding: 20px; text-align: center; }

          .content { padding: 30px; background: #f9f9f9; }

          .otp { font-size: 32px; font-weight: bold; color: #B91C1C; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }

        </style>

      </head>

      <body>

        <div class="header">

          <h1>Account Deletion Verification</h1>

        </div>

        <div class="content">

          <h2>Hi ${data.name},</h2>

          <p>We received a request to permanently delete your wallet account.</p>

          <div class="otp">${data.otp}</div>

          <p>This OTP will expire in ${data.expiryMinutes} minutes.</p>

          <p>If you did not request account deletion, please ignore this email immediately.</p>

        </div>

      </body>

      </html>

    `,
  }),

  "bank-link-verification": (data) => ({
    subject: "Bank Account Linking - Wallet App",

    html: `

        <!DOCTYPE html>

        <html>

        <head>

          <style>

            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }

            .header { background: #FF9800; color: white; padding: 20px; text-align: center; }

            .content { padding: 30px; background: #f9f9f9; }

            .otp { font-size: 32px; font-weight: bold; color: #FF9800; text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0; letter-spacing: 8px; }

          </style>

        </head>

        <body>

          <div class="header">

            <h1>Bank Account Linking</h1>

          </div>

          <div class="content">

            <h2>Hi ${data.name},</h2>

            <p>Please verify your bank account linking request.</p>

            <div class="otp">${data.otp}</div>

            <p><strong>Bank:</strong> ${data.bankName}</p>

            <p><strong>Account:</strong> ${data.maskedAccount}</p>

            <p>This code will expire in 5 minutes.</p>

          </div>

        </body>

        </html>

      `,
  }),
};

let smtpTransporter: nodemailer.Transporter | null = null;

const isProduction = ENV.NODE_ENV.toLowerCase() === "production";

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
  });

  return smtpTransporter;
};

const sendWithBrevo = async (to: string, subject: string, html: string) => {
  await brevoCircuit.execute(async () => {
    await retryWithBackoff(
      async () => {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            accept: "application/json",
            "api-key": ENV.BREVO_API_KEY,
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

const sendWithNodemailer = async (
  to: string,
  subject: string,
  html: string,
) => {
  return smtpCircuit.execute(async () => {
    return retryWithBackoff(
      async () => {
        const transporter = getSmtpTransporter();
        const from = `${ENV.EMAIL_FROM} <${ENV.SMTP_USER}>`;

        const info = await transporter.sendMail({
          from,
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
};

export async function sendEmail(to: string, template: string, data: any) {
  try {
    const emailTemplate = templates[template];

    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { subject, html } = emailTemplate(data);

    if (!to || !subject || !html) {
      throw new Error("Invalid email parameters");
    }

    if (isProduction) {
      await sendWithBrevo(to, subject, html);
      logger.info("Email sent successfully", {
        to,
        template,
        provider: "brevo",
      });
      return;
    }

    const messageId = await sendWithNodemailer(to, subject, html);
    logger.info("Email sent successfully", {
      to,
      template,
      provider: "nodemailer",
      messageId,
    });
  } catch (error) {
    logger.error("Email sending failed", {
      to,
      template,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}
