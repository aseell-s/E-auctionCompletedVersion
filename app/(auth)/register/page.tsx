import React, { Suspense } from 'react';
import Register from '@/components/auth-features/register-page';

export const metadata = {
  title: 'Login | E-Auction',
  description: 'Login Page',
};

export default async function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <Register />
    </Suspense>
  );
}
