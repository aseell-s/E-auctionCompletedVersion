// 1. Protects routes by ensuring only authenticated users can access them.
// 2. Optionally restricts access to users with specific roles using the `allowedRoles` prop.
// 3. Redirects users:
//    - To `/login` if they are not authenticated.
//    - To `/unauthorized` if their role is not allowed.
// 4. Displays a loading spinner while the authentication status is being determined.
// 5. Renders the protected content (`children`) if the user is authenticated and authorized.
// 6. Can be used for both general protected pages and role-specific pages.
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Role } from "@prisma/client";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(session.user.role as Role)) {
      router.push("/unauthorized");
    }
  }, [session, status, router, allowedRoles]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as Role)) {
    return null;
  }

  return <>{children}</>;
}

/*
To use the route protection in your pages:

For role-specific pages:

export default function SellerDashboard() {
  return (
    <RouteGuard allowedRoles={[Role.SELLER]}>
      <YourComponent />
    </RouteGuard>
  );
}


For general protected pages:

export default function ProtectedPage() {
  return (
    <RouteGuard>
      <YourComponent />
    </RouteGuard>
  );
}


*/
