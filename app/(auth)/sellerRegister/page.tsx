import React, { Suspense } from 'react';
import SellerRegisterPage from '@/components/auth-features/seller-reg-page';

export const metadata = {
  title: 'Login | E-Auction',
  description: 'Login Page',
};

export default async function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <SellerRegisterPage />
    </Suspense>
  );
}
