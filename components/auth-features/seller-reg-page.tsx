"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import { z } from "zod";
import { User } from "@/types";
import { ArrowLeft } from "lucide-react";

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
    "w-full p-2 sm:p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none bg-white text-sm sm:text-base";

  const buttonClass =
    "w-full p-2.5 sm:p-3 rounded-lg shadow-md transition-all font-medium text-white text-sm sm:text-base";

  const primaryButton = "bg-indigo-600 hover:bg-indigo-700 active:scale-95";
  const secondaryButton = "bg-gray-500 hover:bg-gray-600 active:scale-95";

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 py-4 px-2 sm:p-6">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-xl shadow-xl rounded-xl sm:rounded-2xl p-4 sm:p-8 md:p-10 border border-gray-200 mx-auto">
        <button
          onClick={() => router.push("/login")}
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 text-sm sm:text-base"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
        
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center mt-3 mb-4 sm:mt-4 sm:mb-6">
          Seller Registration
        </h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6"
        >
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Company Name</label>
            <input
              type="text"
              name="companyName"
              placeholder="Enter company name"
              onChange={handleChange}
              value={form.companyName}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              onChange={handleChange}
              value={form.email}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Phone Number</label>
            <input
              type="text"
              name="phoneNo"
              placeholder="Enter phone number"
              onChange={handleChange}
              value={form.phoneNo}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Registration Number</label>
            <input
              type="text"
              name="companyRegistrationNo"
              placeholder="Enter registration number"
              onChange={handleChange}
              value={form.companyRegistrationNo}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs text-gray-600">Address</label>
            <input
              type="text"
              name="address"
              placeholder="Enter full address"
              onChange={handleChange}
              value={form.address}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">City</label>
            <input
              type="text"
              name="city"
              placeholder="Enter city"
              onChange={handleChange}
              value={form.city}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">State</label>
            <input
              type="text"
              name="state"
              placeholder="Enter state"
              onChange={handleChange}
              value={form.state}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              placeholder="Enter postal code"
              onChange={handleChange}
              value={form.postalCode}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Country</label>
            <input
              type="text"
              name="country"
              placeholder="Enter country"
              onChange={handleChange}
              value={form.country}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Establishment Year</label>
            <input
              type="text"
              name="establishmentYear"
              placeholder="YYYY"
              onChange={handleChange}
              value={form.establishmentYear}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Nature of Business</label>
            <input
              type="text"
              name="natureOfBusiness"
              placeholder="Enter business type"
              onChange={handleChange}
              value={form.natureOfBusiness}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Contact Name</label>
            <input
              type="text"
              name="contactName"
              placeholder="Enter contact person name"
              onChange={handleChange}
              value={form.contactName}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Contact Phone</label>
            <input
              type="text"
              name="contactPhoneNo"
              placeholder="Enter contact phone"
              onChange={handleChange}
              value={form.contactPhoneNo}
              className={inputClass}
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Date of Birth</label>
            <input
              type="date"
              name="dob"
              onChange={handleChange}
              value={form.dob}
              className={inputClass}
              required
            />
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`${buttonClass} ${primaryButton} flex-1`}
            >
              {loading ? "Registering..." : "Register as Seller"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={`${buttonClass} ${secondaryButton} flex-1`}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
