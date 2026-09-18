'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}