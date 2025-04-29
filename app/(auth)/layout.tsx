"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const { syncWithSession } = useAuthStore();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Make sure we sync the session with our store
    if (status !== "loading") {
      syncWithSession(session);
    }

    // Only redirect when we have confirmed authenticated status
    if (status === "authenticated" && !isRedirecting) {
      setIsRedirecting(true);
      router.push("/dashboard");
    }
  }, [status, session, router, syncWithSession, isRedirecting]);

  // Show loading spinner while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full space-y-8">{children}</div>
    </div>
  );
}
