import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,

    // Gmail SMTP SSL
    port: 465,
    secure: true,

    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  // ==========================================
  // SEND WELCOME + EMAIL VERIFICATION
  // ==========================================

  async sendVerificationEmail(
    to: string,
    name: string,
    token: string,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL;

    const verificationUrl =
      `${frontendUrl}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,

      subject:
        'Welcome to DevConnect 🎉 Verify your email',

      html: `
        <div style="
          margin: 0;
          padding: 40px 20px;
          background-color: #f3f4f6;
          font-family: Arial, Helvetica, sans-serif;
        ">

          <div style="
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          ">

            <div style="
              background-color: #111827;
              padding: 30px;
              text-align: center;
            ">

              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 28px;
              ">
                DevConnect
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #d1d5db;
                font-size: 14px;
              ">
                Connect. Share. Build.
              </p>

            </div>

            <div style="
              padding: 40px 35px;
              color: #111827;
            ">

              <h2 style="
                margin: 0 0 15px;
                font-size: 24px;
              ">
                Welcome, ${name}! 🎉
              </h2>

              <p style="
                margin: 0 0 15px;
                color: #4b5563;
                font-size: 15px;
                line-height: 1.7;
              ">
                Thanks for joining DevConnect.
                We're excited to have you as part of
                our community.
              </p>

              <p style="
                margin: 0 0 25px;
                color: #4b5563;
                font-size: 15px;
                line-height: 1.7;
              ">
                To get started, please verify your
                email address by clicking the button below.
              </p>

              <div style="
                text-align: center;
                margin: 30px 0;
              ">

                <a
                  href="${verificationUrl}"
                  style="
                    display: inline-block;
                    padding: 14px 28px;
                    background-color: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 15px;
                    font-weight: bold;
                    border-radius: 8px;
                  "
                >
                  Verify My Email
                </a>

              </div>

              <p style="
                margin: 0 0 10px;
                color: #6b7280;
                font-size: 13px;
                line-height: 1.6;
              ">
                This verification link will expire
                in 24 hours.
              </p>

              <p style="
                margin: 20px 0 0;
                color: #6b7280;
                font-size: 13px;
                line-height: 1.6;
              ">
                If you didn't create a DevConnect account,
                you can safely ignore this email.
              </p>

            </div>

            <div style="
              padding: 20px 30px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
              text-align: center;
            ">

              <p style="
                margin: 0;
                color: #9ca3af;
                font-size: 12px;
              ">
                © 2026 DevConnect. All rights reserved.
              </p>

            </div>

          </div>

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
    const frontendUrl =
      process.env.FRONTEND_URL;

    const resetUrl =
      `${frontendUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,

      subject:
        'Reset your DevConnect password',

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