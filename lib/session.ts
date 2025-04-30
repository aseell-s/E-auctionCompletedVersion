// This file provides utility functions for handling user authentication and session management.
// 1. `getCurrentUser`: Retrieves the current authenticated user from the session.
// 2. `isAuthenticated`: Checks if a user is currently authenticated.
// 3. `hasRole`: Verifies if the authenticated user has a specific role.
// 4. `isApproved`: Checks if the authenticated user is approved.
// 5. Defines a custom `AuthSession` type that extends the default session to include:
//    - User ID, role, approval status, email, and optional name.
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Session } from "next-auth";
import { Role } from "@prisma/client";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

export async function hasRole(role: Role) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === role;
}

export async function isApproved() {
  const session = await getServerSession(authOptions);
  return session?.user?.isApproved === true;
}

export type AuthSession = Session & {
  user: {
    id: string;
    role: Role;
    isApproved: boolean;
    email: string;
    name?: string | null;
  };
};
