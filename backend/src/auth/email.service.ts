import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',

    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // ==========================================
  // SEND EMAIL VERIFICATION
  // ==========================================

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL;

    const verificationUrl =
      `${frontendUrl}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,

      subject: 'Verify your DevConnect email',

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        ">

          <h2>Welcome to DevConnect, ${name}!</h2>

          <p>
            Thanks for creating your DevConnect account.
          </p>

          <p>
            Please verify your email address by clicking
            the button below:
          </p>

          <a
            href="${verificationUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Verify Email
          </a>

          <p style="margin-top: 20px;">
            This verification link will expire in 24 hours.
          </p>

          <p>
            If you did not create this account,
            you can safely ignore this email.
          </p>

        </div>
      `,
    });
  }

  // ==========================================
  // SEND PASSWORD RESET EMAIL
  // ==========================================

  async sendPasswordResetEmail(
    to: string,
    name: string,
    token: string,
  ) {
    const frontendUrl = process.env.FRONTEND_URL;

    const resetUrl =
      `${frontendUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,

      subject: 'Reset your DevConnect password',

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
        ">

          <h2>Password Reset Request</h2>

          <p>
            Hi ${name},
          </p>

          <p>
            We received a request to reset your
            DevConnect password.
          </p>

          <p>
            Click the button below to create a new password:
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 12px 20px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 6px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top: 20px;">
            This link will expire soon.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>

        </div>
      `,
    });
  }
}