// 1. Provides a login form for users to authenticate themselves.
// 2. Collects user credentials, including:
//    - Email
//    - Password
//    - User type (Seller, Buyer, or Admin).
// 3. Validates user input and sends a login request using `next-auth`'s `signIn` function.
// 4. Displays error messages if authentication fails.
// 5. Redirects authenticated users to the `/dashboard` page upon successful login.
// 6. Allows users to toggle password visibility using a "show/hide password" feature.
// 7. Includes a "Sign Up" button to navigate users to the registration page.
// 8. Uses Tailwind CSS for responsive and visually appealing styling.
// 9. Displays a loading state while the login request is being processed.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', userType: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('form: ', form);

    const result = await signIn('credentials', {
      redirect: false,
      email: form.email,
      password: form.password,
      role: form.userType,
    });

    console.log('result: ', result);

    if (result?.error) {
      // Check for the generic "CredentialsSignin" error and display a friendly message.
      if (result.error === "CredentialsSignin") {
        setError("Incorrect email or password.");
      } else if (result.error.toLowerCase().includes("email")) {
        setError("The email you entered is incorrect.");
      } else if (result.error.toLowerCase().includes("password")) {
        setError("The password you entered is incorrect.");
      } else {
        setError(result.error);
      }
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center'>
      <div className='min-h-screen w-full flex items-center justify-center p-6'>
        <div className='max-w-md w-full bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-300'>
          <h2 className='text-3xl font-extrabold text-gray-900 text-center mb-6'>
            Login to <span className='text-indigo-600'>Gluby</span>
          </h2>
          {error && <p className='text-red-500 text-center mb-4'>{error}</p>}
          <form onSubmit={handleSubmit} className='space-y-5'>
            <input
              type='email'
              name='email'
              placeholder='Email'
              onChange={handleChange}
              className='w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200'
              required
            />
            
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                placeholder='Password'
                onChange={handleChange}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200 pr-10'
                required
              />
              <span
                className='absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
            </div>

            <div>
              <label className='sr-only'>User Type</label>
              <div className='flex flex-row items-center justify-center gap-4 space-x-4'>
                <label className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='userType'
                    value='SELLER'
                    onChange={handleChange}
                    required
                  />
                  <span>Seller</span>
                </label>
                <label className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='userType'
                    value='BUYER'
                    onChange={handleChange}
                    required
                  />
                  <span>Buyer</span>
                </label>
                <label className='flex items-center space-x-2'>
                  <input
                    type='radio'
                    name='userType'
                    value='SUPER_ADMIN'
                    onChange={handleChange}
                    required
                  />
                  <span>Admin</span>
                </label>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-indigo-600 text-white p-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all hover:scale-[1.02]'
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type='button'
              className='w-full bg-gray-200 text-gray-700 p-3 rounded-lg shadow-md hover:bg-gray-300 transition-all hover:scale-[1.02]'
              onClick={() => router.push('/register')}
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
