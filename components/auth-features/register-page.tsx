"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";
import Link from "next/link";
import { Role } from "@prisma/client";

interface ErrorResponse {
  message: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

export default function Register() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.BUYER,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // regex: at least one digit, at least one special char, min length 8
  const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // front-end password validation
    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must be at least 8 characters long and include at least one number and one special character"
      );
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post<RegisterResponse>(
        "/api/auth/register",
        form
      );
      alert(data.message);
      setUser(data.user);
      router.push("/login");
    } catch (err: unknown) {
      const resp = (err as AxiosError<ErrorResponse>).response?.data;
      setError(resp?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("form: ", form);
  }, [form]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 p-4">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-300">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Register as <span className="text-indigo-600">Buyer</span>
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-indigo-200"
            pattern="(?=.*\d)(?=.*[!@#$%^&*]).{8,}"
            title="Must be 8+ chars, include a number & a special character"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all hover:scale-[1.02]"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="flex flex-col gap-2 items-center justify-center mt-4 text-center">
          <p className="text-gray-600">Are you a seller?</p>
          <Link
            href="/sellerRegister"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Register as Seller
          </Link>
        </div>
      </div>
    </div>
  );
}
