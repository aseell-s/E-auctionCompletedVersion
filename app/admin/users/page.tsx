import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import UserManagementClient from "@/components/admin/UserManagementClient";

export default async function UsersPage() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      notFound();
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        amount: true,
        points: true,
        createdAt: true,
      },
    });

    return <UserManagementClient initialUsers={users} />;
  } catch (error) {
    console.error("Error in UsersPage:", error);
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error loading users. Please try again later.
        </div>
      </div>
    );
  }
}
