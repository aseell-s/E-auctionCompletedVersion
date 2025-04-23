"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { z } from "zod";
import { User } from "@/types";

interface ErrorResponse {
  message: string;
}

interface RegisterResponse {
  message: string;
  user: User;
}

const registerSchema = z.object({
  companyName: z.string().nonempty("Company name is required"),
  email: z.string().email("Invalid email address"),
  phoneNo: z.string().nonempty("Phone number is required"),
  companyRegistrationNo: z
    .string()
    .nonempty("Company registration number is required"),
  address: z.string().nonempty("Address is required"),
  city: z.string().nonempty("City is required"),
  state: z.string().nonempty("State is required"),
  postalCode: z.string().nonempty("Postal code is required"),
  establishmentYear: z.string().nonempty("Establishment year is required"),
  natureOfBusiness: z.string().nonempty("Nature of business is required"),
  contactName: z.string().nonempty("Contact name is required"),
  contactPhoneNo: z.string().nonempty("Contact phone number is required"),
  country: z.string().nonempty("Country is required"),
  dob: z.string().nonempty("Date of Birth is required"),
});

export default function SellerRegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phoneNo: "",
    companyRegistrationNo: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    establishmentYear: "",
    natureOfBusiness: "",
    contactName: "",
    contactPhoneNo: "",
    country: "",
    dob: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validation = registerSchema.safeParse(form);
    if (!validation.success) {
      setError(validation.error.errors.map((err) => err.message).join(", "));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<RegisterResponse>(
        "/api/auth/seller-register",
        form
      );
      alert(response.data.message);
      setUser(response.data.user);
      router.push("/login");
    } catch (err: unknown) {
      const errorResponse = (err as AxiosError<ErrorResponse>).response?.data;
      setError(errorResponse?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({
      companyName: "",
      email: "",
      phoneNo: "",
      companyRegistrationNo: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      establishmentYear: "",
      natureOfBusiness: "",
      contactName: "",
      contactPhoneNo: "",
      country: "",
      dob: "",
    });
  };

  // ✨ Styled input and button classes
  const inputClass =
    "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white";

  const buttonClass =
    "w-full p-3 rounded-lg shadow-md transition-all font-medium text-white";

  const primaryButton = "bg-indigo-600 hover:bg-indigo-700 hover:scale-105";
  const secondaryButton = "bg-gray-500 hover:bg-gray-600 hover:scale-105";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 p-6">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-10 md:p-14 border border-gray-200 mx-auto">
        <button
          onClick={() => router.push("/login")}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          ← Back to Login
        </button>
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mt-4 mb-6">
          Seller Registration
        </h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <input
            type="text"
            name="companyName"
            placeholder="Company Name"
            onChange={handleChange}
            value={form.companyName}
            className={inputClass}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            value={form.email}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="phoneNo"
            placeholder="Phone Number"
            onChange={handleChange}
            value={form.phoneNo}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="companyRegistrationNo"
            placeholder="Company Registration No"
            onChange={handleChange}
            value={form.companyRegistrationNo}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            onChange={handleChange}
            value={form.address}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            onChange={handleChange}
            value={form.city}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="state"
            placeholder="State"
            onChange={handleChange}
            value={form.state}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            onChange={handleChange}
            value={form.postalCode}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="establishmentYear"
            placeholder="Establishment Year"
            onChange={handleChange}
            value={form.establishmentYear}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="natureOfBusiness"
            placeholder="Nature of Business"
            onChange={handleChange}
            value={form.natureOfBusiness}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="contactName"
            placeholder="Contact Name"
            onChange={handleChange}
            value={form.contactName}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="contactPhoneNo"
            placeholder="Contact Phone No"
            onChange={handleChange}
            value={form.contactPhoneNo}
            className={inputClass}
            required
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            onChange={handleChange}
            value={form.country}
            className={inputClass}
            required
          />
          <input
            type="date"
            name="dob"
            onChange={handleChange}
            value={form.dob}
            className={inputClass}
            required
          />

          <div className="col-span-2 gap-7 flex justify-between mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`${buttonClass} ${primaryButton}`}
            >
              {loading ? "Registering..." : "Register"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={`${buttonClass} ${secondaryButton}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
