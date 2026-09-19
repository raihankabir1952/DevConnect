'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

export default function VerifyEmailPage() {
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get('token');

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setError(
          'Invalid or missing verification token.',
        );

        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/auth/verify-email?token=${encodeURIComponent(
            token,
          )}`,
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Email verification failed.',
          );
        }

        setMessage(
          data.message ||
            'Email verified successfully.',
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Email verification failed.',
        );
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, [token]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-8">

      {/* ======================================
          DEVCONNECT LOGO
      ====================================== */}

      <div className="flex justify-center">
        <Link
          href="/"
          className="group inline-flex items-center gap-2"
        >
          {/* J Logo */}

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-black text-white shadow-md transition duration-200 group-hover:scale-105 group-hover:shadow-lg">
            J
          </div>

          {/* Brand */}

          <span className="text-xl font-bold tracking-tight text-gray-900">
            DevConnect
          </span>
        </Link>
      </div>

      {/* ======================================
          VERIFICATION CARD
      ====================================== */}

      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">

        <div className="w-full max-w-md">

          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 text-center shadow-xl shadow-gray-200/50 sm:p-8">

            {/* ==================================
                LOADING
            ================================== */}

            {loading && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Verifying Email...
                </h1>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Please wait while we verify
                  your email address.
                </p>
              </>
            )}

            {/* ==================================
                SUCCESS
            ================================== */}

            {!loading && message && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                  ✓
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Email Verified!
                </h1>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  {message}
                </p>

                <Link
                  href="/login"
                  className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                >
                  Go to Login
                </Link>
              </>
            )}

            {/* ==================================
                ERROR
            ================================== */}

            {!loading && error && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                  !
                </div>

                <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Verification Failed
                </h1>

                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-left text-sm leading-6 text-red-600">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">
                      ⚠️
                    </span>

                    <p>{error}</p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
                >
                  Go to Login
                </Link>
              </>
            )}

          </div>

          {/* Footer */}

          <p className="mt-5 text-center text-xs text-gray-400">
            Connect • Share • Grow
          </p>

        </div>
      </div>
    </main>
  );
}