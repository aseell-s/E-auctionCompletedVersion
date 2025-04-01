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
