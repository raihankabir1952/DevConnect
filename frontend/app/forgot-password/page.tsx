'use client';

import {
  FormEvent,
  useState,
} from 'react';

import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] =
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

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        'http://localhost:3000/auth/forgot-password',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            email,
          }),
        },
      );

      // First read the response as text
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

      // Try to convert the response to JSON
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
            'Something went wrong',
        );
      }

      setMessage(data.message);
      setEmail('');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong',
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
          FORGOT PASSWORD CARD
      ====================================== */}

      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">

        <div className="w-full max-w-md">

          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">

            {/* Header */}

            <div className="mb-7 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                🔐
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Forgot Password?
              </h1>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Enter your email address and
                we&apos;ll send you a password
                reset link.
              </p>

            </div>

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>

            </form>

            {/* Success Message */}

            {message && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                <span className="mt-0.5">
                  ✓
                </span>

                <p>{message}</p>
              </div>
            )}

            {/* Error Message */}

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span className="mt-0.5">
                  ⚠️
                </span>

                <p>{error}</p>
              </div>
            )}

            {/* Back to Login */}

            <div className="mt-7 border-t border-gray-100 pt-5 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                <span>←</span>
                Back to Login
              </Link>
            </div>

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