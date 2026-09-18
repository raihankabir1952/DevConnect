"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setError("Invalid or missing verification token.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/auth/verify-email?token=${encodeURIComponent(
            token
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Email verification failed."
          );
        }

        setMessage(
          data.message || "Email verified successfully."
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Email verification failed."
        );
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        {loading && (
          <>
            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              Verifying Email...
            </h1>

            <p className="text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {!loading && message && (
          <>
            <div className="mb-4 text-4xl">
              ✅
            </div>

            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              Email Verified!
            </h1>

            <p className="mb-6 text-sm text-gray-600">
              {message}
            </p>

            <Link
              href="/login"
              className="inline-block rounded-lg bg-black px-6 py-2.5 font-medium text-white transition hover:bg-gray-800"
            >
              Go to Login
            </Link>
          </>
        )}

        {!loading && error && (
          <>
            <div className="mb-4 text-4xl">
              ❌
            </div>

            <h1 className="mb-3 text-2xl font-bold text-gray-900">
              Verification Failed
            </h1>

            <p className="mb-6 text-sm text-red-600">
              {error}
            </p>

            <Link
              href="/login"
              className="inline-block rounded-lg bg-black px-6 py-2.5 font-medium text-white transition hover:bg-gray-800"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
