'use client';

import {
  FormEvent,
  useState,
} from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000';

export default function ResetPasswordPage() {
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get('token');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!token) {
      setError(
        'Invalid or missing reset token.',
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        'Passwords do not match.',
      );
      return;
    }

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.',
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/reset-password`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            token,
            password,
          }),
        },
      );

      const text =
        await response.text();

      console.log(
        'STATUS:',
        response.status,
      );

      console.log(
        'RESPONSE:',
        text,
      );

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned invalid response: ${text}`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Password reset failed',
        );
      }

      setMessage(
        data.message ||
          'Password reset successfully.',
      );

      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Password reset failed',
      );
    } finally {
      setLoading(false);
    }
  };

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
          RESET PASSWORD CARD
      ====================================== */}

      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">

        <div className="w-full max-w-md">

          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">

            {/* Header */}

            <div className="mb-7 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                🔑
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Reset Password
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Enter a new password for
                your DevConnect account.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span className="mt-0.5">
                  ⚠️
                </span>

                <p>{error}</p>
              </div>
            )}

            {/* Success */}

            {message && (
              <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-4 text-sm text-green-700">

                <div className="flex items-start gap-3">

                  <span className="mt-0.5">
                    ✓
                  </span>

                  <p>{message}</p>

                </div>

                <Link
                  href="/login"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  Continue to Login
                </Link>

              </div>
            )}

            {/* Reset Form */}

            {!message && (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* New Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />

                  <p className="mt-1.5 text-xs text-gray-400">
                    Minimum 6 characters
                  </p>
                </div>

                {/* Confirm Password */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                {/* Reset Button */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>

              </form>
            )}

            {/* Back to Login */}

            {!message && (
              <div className="mt-7 border-t border-gray-100 pt-5 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  <span>←</span>
                  Back to Login
                </Link>
              </div>
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