import Login from '@/components/auth-features/login-page';
import React, { Suspense } from 'react';

export const metadata = {
  title: 'Login | E-Auction',
  description: 'Login Page',
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
