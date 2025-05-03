import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Navbar } from "@/components/Navbar";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user data including amount and points
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      amount: true,
      points: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} />
      <main className="px-2 sm:px-4 md:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
