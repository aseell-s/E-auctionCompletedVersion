import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Log received credentials (for debugging only)
        console.log("Received credentials:", {
          email: credentials?.email,
          passwordProvided: !!credentials?.password,
        });
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }

        // Normalize email
        const normalizedEmail = credentials.email.trim().toLowerCase();
        console.log("Normalized email:", normalizedEmail);

        // Log the plain-text password for debugging
        console.log("User provided password (plain-text):", credentials.password);

        // Find user in the database by normalized email
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        console.log("User found from DB:", JSON.stringify(user, null, 2));

        if (!user) {
          throw new Error("Incorrect email or password.");
        }

        // Log the stored hashed password
        console.log("Stored hashed password from DB:", user.password);

        // Compare provided password with stored hash
        const passwordsMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );
        console.log("Passwords match:", passwordsMatch);

        if (!passwordsMatch) {
          throw new Error("Incorrect email or password.");
        }

        // For sellers, check if approved
        if (user.role === "SELLER" && !user.isApproved) {
          throw new Error("Your account is pending approval. Please wait for admin approval.");
        }

        console.log("Authorization successful for user:", {
          id: user.id,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isApproved: user.isApproved,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Always fetch the latest amount and points from DB
      const userData = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { amount: true, points: true },
      });
      console.log("User data for token update:", userData);

      if (userData) {
        token.amount = userData.amount;
        token.points = userData.points;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
          amount: token.amount as number,
          points: token.points as number,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
