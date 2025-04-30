"use client";

import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();
  const { status } = useSession();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Only redirect if we've confirmed the user is not authenticated
    // and the session status is not loading
    if (!isLoading && !user?.role && status !== "loading") {
      setShouldRedirect(true);
    }
  }, [user, isLoading, status]);

  // Wait until we've confirmed auth state before redirecting
  if (shouldRedirect) {
    redirect("/login");
  }

  // Show loading state while determining auth
  if (isLoading || !user || status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return <DashboardClient user={user} />;
}
