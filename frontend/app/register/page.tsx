'use client';

import {
  FormEvent,
  useState,
} from 'react';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import { apiRequest } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  async function handleRegister(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await apiRequest(
        '/auth/register',
        {
          method: 'POST',

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        },
      );

      router.push('/login');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Registration failed',
      );
    } finally {
      setLoading(false);
    }
  }

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
          REGISTER CARD
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
                Create Account
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Join DevConnect and connect with developers.
              </p>

            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span>⚠️</span>

                <p>{error}</p>
              </div>
            )}

            {/* Register Form */}

            <form
              onSubmit={handleRegister}
              className="space-y-5"
            >

              {/* Name */}

              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Name
                </label>

                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value,
                    )
                  }
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  required
                />
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>

                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value,
                    )
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  required
                />
              </div>

              {/* Password */}

              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value,
                    )
                  }
                  placeholder="Enter your password"
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  required
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Password must be at least 6 characters.
                </p>
              </div>

              {/* Register Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
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

            {/* Login */}

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}

              <Link
                href="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
              >
                Login
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