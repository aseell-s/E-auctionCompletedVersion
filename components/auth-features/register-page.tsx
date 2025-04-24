// 1. Provides a registration form for users to create an account.
// 2. Collects user details, including:
//    - Name
//    - Email
//    - Password
//    - Role (default is "BUYER").
// 3. Handles form input changes and updates the state dynamically.
// 4. Sends a POST request to the `/api/auth/register` endpoint to register the user.
// 5. Displays success messages upon successful registration and redirects the user to the `/login` page.
// 6. Handles errors during registration and displays error messages to the user.
// 7. Uses `useAuthStore` to update the global state with the registered user's information.
// 8. Includes a "Register as Seller" link to navigate users to the seller registration page.
// 9. Uses Tailwind CSS for responsive and visually appealing styling.
// 10. Displays a loading state while the registration request is being processed.
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';
import Link from 'next/link';

interface ErrorResponse {
  message: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    console.log('form: ', form);
  }, [form]);

  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = (await axios.post<RegisterResponse>(
        '/api/auth/register',
        form
      )) as AxiosResponse<RegisterResponse>;
      console.log('response.data: ', response.data);
      alert(response.data.message);
      setUser(response.data.user);
      router.push('/login');
    } catch (err: unknown) {
      const errorResponse = (err as AxiosError<ErrorResponse>).response?.data;
      setError(errorResponse?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 p-4'>
      <div className='w-full max-w-md bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-300'>
        <h2 className='text-3xl font-extrabold text-gray-900 text-center mb-6'>
          Register as <span className='text-indigo-600'>Buyer</span>
        </h2>
        {error && <p className='text-red-500 text-center mb-4'>{error}</p>}
        <form onSubmit={handleSubmit} className='space-y-5'>
          <input
            type='text'
            name='name'
            placeholder='Name'
            onChange={handleChange}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200'
            required
          />
          <input
            type='email'
            name='email'
            placeholder='Email'
            onChange={handleChange}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200'
            required
          />
          <input
            type='password'
            name='password'
            placeholder='Password'
            onChange={handleChange}
            className='w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200'
            required
          />
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-indigo-600 text-white p-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all hover:scale-[1.02]'
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className='flex felx-col gap-2 items-center justify-center mt-4 text-center'>
          <p className='text-gray-600'>Are you a seller?</p>
          <Link
            href='/sellerRegister'
            className='text-indigo-600 hover:text-indigo-700 font-medium'
          >
            Register as Seller
          </Link>
        </div>
      </div>
    </div>
  );
}
