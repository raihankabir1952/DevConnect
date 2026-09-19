'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { apiRequest } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  async function handleLogin(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await apiRequest(
        '/auth/login',
        {
          method: 'POST',

          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      // Save JWT token
      localStorage.setItem(
        'accessToken',
        data.accessToken,
      );

      // Save user information
      localStorage.setItem(
        'user',
        JSON.stringify(data.user),
      );

      router.push('/');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!email.trim()) {
      setError(
        'Please enter your email address first.',
      );

      return;
    }

    setError('');
    setSuccess('');
    setResending(true);

    try {
      const data = await apiRequest(
        '/auth/resend-verification',
        {
          method: 'POST',

          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      setSuccess(
        data.message ||
          'Verification email sent successfully.',
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to resend verification email',
      );
    } finally {
      setResending(false);
    }
  }

  const needsVerification =
    error ===
    'Please verify your email before logging in';

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
          LOGIN CARD
      ====================================== */}

      <div className="flex min-h-[calc(100vh-100px)] items-center justify-center">

        <div className="w-full max-w-md">

          <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">

            {/* Header */}

            <div className="mb-7 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                👋
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Welcome Back
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Login to your DevConnect account.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">

                <div className="flex items-start gap-2">
                  <span>⚠️</span>

                  <p>{error}</p>
                </div>

                {/* Resend Verification */}

                {needsVerification && (
                  <button
                    type="button"
                    onClick={
                      handleResendVerification
                    }
                    disabled={resending}
                    className="mt-3 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {resending
                      ? 'Sending verification email...'
                      : 'Resend Verification Email'}
                  </button>
                )}

              </div>
            )}

            {/* Success */}

            {success && (
              <div className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                <div className="flex items-start gap-2">
                  <span>✅</span>

                  <p>{success}</p>
                </div>
              </div>
            )}

            {/* Login Form */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* Email */}

              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  required
                />
              </div>

              {/* Password */}

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">

                  <label
                    htmlFor="login-password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline sm:text-sm"
                  >
                    Forgot Password?
                  </Link>

                </div>

                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                    setSuccess('');
                  }}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  required
                />
              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>

            </form>

            {/* Divider */}

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />

              <span className="text-xs text-gray-400">
                OR
              </span>

              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* Register */}

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}

              <Link
                href="/register"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Create Account
              </Link>
            </p>

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