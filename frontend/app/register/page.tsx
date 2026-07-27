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

      // Registration successful
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
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        {/* Header */}

        <h1 className="mb-2 text-center text-3xl font-bold">
          Create Account
        </h1>

        <p className="mb-6 text-center text-gray-500">
          Join DevConnect today
        </p>

        {/* Error */}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Register Form */}

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >
          {/* Name */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value,
                )
              }
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
              required
            />
          </div>

          {/* Email */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value,
                )
              }
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
              required
            />
          </div>

          {/* Password */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
              }
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-black"
              minLength={6}
              required
            />
          </div>

          {/* Register Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-2.5 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Creating Account...'
              : 'Register'}
          </button>
        </form>

        {/* Login Link */}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}

          <Link
            href="/login"
            className="font-semibold text-black hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}