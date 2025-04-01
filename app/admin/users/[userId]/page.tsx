import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import UserProfileClient from "@/components/admin/UserProfileClient";

interface UserProfileParams {
  params: {
    userId: string;
  };
}

export default async function UserProfilePage({ params }: UserProfileParams) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      profile: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Users
        </Link>
      </div>

      <UserProfileClient user={user} />
    </div>
  );
}
