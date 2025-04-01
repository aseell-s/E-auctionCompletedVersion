"use client";

import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();
  console.log("user from dashboard: ", user);

  if (!user?.role) {
    redirect("/login");
  }

  return <DashboardClient user={user} />;
}
