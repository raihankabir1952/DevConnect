import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(
    process.env.RESEND_API_KEY,
  );

  private fromEmail =
    process.env.RESEND_FROM ||
    'onboarding@resend.dev';

  async sendVerificationEmail(
    email: string,
    name: string,
    token: string,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:3001';

    const verificationUrl =
      `${frontendUrl}/verify-email?token=${token}`;

    console.log(
      'STARTING VERIFICATION EMAIL...',
    );

    const { data, error } =
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject:
          'Verify your DevConnect account',
        html: `
          <h2>Hello ${name},</h2>

          <p>
            Thank you for registering on DevConnect.
          </p>

          <p>
            Please click the button below to verify your email address:
          </p>

          <p>
            <a
              href="${verificationUrl}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Verify Email
            </a>
          </p>

          <p>
            This verification link will expire in 24 hours.
          </p>
        `,
      });

    if (error) {
      console.error(
        'VERIFICATION EMAIL ERROR:',
        error,
      );

      throw new Error(
        'Failed to send verification email',
      );
    }

    console.log(
      'VERIFICATION EMAIL SENT SUCCESSFULLY:',
      data,
    );
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL ||
      'http://localhost:3001';

    const resetUrl =
      `${frontendUrl}/reset-password?token=${token}`;

    console.log(
      'STARTING PASSWORD RESET EMAIL...',
    );

    const { data, error } =
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject:
          'Reset your DevConnect password',
        html: `
          <h2>Hello ${name},</h2>

          <p>
            We received a request to reset your DevConnect password.
          </p>

          <p>
            Click the button below to reset your password:
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>
            This password reset link will expire in 15 minutes.
          </p>

          <p>
            If you did not request a password reset,
            you can safely ignore this email.
          </p>
        `,
      });

    if (error) {
      console.error(
        'PASSWORD RESET EMAIL ERROR:',
        error,
      );

      throw new Error(
        'Failed to send password reset email',
      );
    }

    console.log(
      'PASSWORD RESET EMAIL SENT SUCCESSFULLY:',
      data,
    );
  }
}