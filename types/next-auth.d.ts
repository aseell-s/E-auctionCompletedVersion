import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    isApproved: boolean;
  }

  interface Session {
    user: User;
  }
}
