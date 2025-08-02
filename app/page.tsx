'use client';

import { useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    redirect('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel Management System</h1>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}