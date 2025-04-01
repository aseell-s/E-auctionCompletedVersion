"use client";

import { ProfileClient } from "./ProfileClient";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user?.role) {
    redirect("/login");
  }

  return <ProfileClient user={user} />;
}
