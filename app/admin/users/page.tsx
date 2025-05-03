// import Link from "next/link";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
// import { notFound } from "next/navigation";
// import { Users, Search, ArrowLeft } from "lucide-react";

// export default async function UsersPage() {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || session.user.role !== "SUPER_ADMIN") {
//       notFound();
//     }

//     const users = await prisma.user.findMany({
//       orderBy: { createdAt: "desc" },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         isApproved: true,
//         amount: true,
//         points: true,
//       },
//     });

//     return (
//       <div className="container mx-auto py-6 px-4">
//         <Link
//           href="/dashboard"
//           className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
//         >
//           <ArrowLeft size={16} className="mr-1" />
//           Back to Dashboard
//         </Link>

//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//           <div className="flex items-center">
//             <Users size={28} className="text-indigo-700 mr-3" />
//             <h1 className="text-2xl font-bold text-gray-900">
//               User Management
//             </h1>
//           </div>

//           <div className="relative w-full md:w-64">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search size={16} className="text-gray-400" />
//             </div>
//             <input
//               type="text"
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               placeholder="Search users..."
//               disabled
//             />
//           </div>
//         </div>

//         <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     Name
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     Email
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     Role
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     Status
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     Balance
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     Points
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                   >
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {users.map((user) => (
//                   <tr
//                     key={user.id}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-full flex items-center justify-center">
//                           <span className="text-sm font-medium text-gray-600">
//                             {user.name.charAt(0).toUpperCase()}
//                           </span>
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-medium text-gray-900">
//                             {user.name}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {user.email}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
//                         ${
//                           user.role === "SUPER_ADMIN"
//                             ? "bg-purple-100 text-purple-800"
//                             : user.role === "SELLER"
//                             ? "bg-blue-100 text-blue-800"
//                             : "bg-green-100 text-green-800"
//                         }`}
//                       >
//                         {user.role}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           user.isApproved
//                             ? "bg-green-100 text-green-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         {user.isApproved ? "Approved" : "Pending"}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900 font-medium">
//                         ${user.amount.toFixed(2)}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900 font-medium">
//                         {user.points}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                       <Link
//                         href={`/admin/users/${user.id}`}
//                         className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-colors"
//                       >
//                         Manage
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   } catch (error) {
//     console.error("Error in UsersPage:", error);
//     return (
//       <div className="p-8 text-center">
//         Error loading users. Please try again later.
//       </div>
//     );
//   }
// }
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import prisma from "@/lib/prisma";
// import { notFound } from "next/navigation";
// import UsersClient from "../../../app/../components/admin/UserProfileClient";

// export default async function UsersPage() {
//   // Get session (authentication)
//   const session = await getServerSession(authOptions);

//   // Restrict access to SUPER_ADMIN only
//   if (!session || session.user.role !== "SUPER_ADMIN") {
//     notFound();
//   }

//   // Fetch users from database
//   const users = await prisma.user.findMany({
//     orderBy: { createdAt: "desc" },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//       isApproved: true,
//       amount: true,
//       points: true,
//     },
//   });

//   // Pass users to the Client Component
//   return <UsersClient users={users} />;
// }
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Users, Search, ArrowLeft } from "lucide-react";

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

    return (
      <div className="container mx-auto py-6 px-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition-all"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center">
            <Users size={28} className="text-indigo-700 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          </div>

          <div className="relative w-full md:w-64">
            {/* <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div> */}
            {/* <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search users..."
              disabled
            /> */}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse rounded-lg shadow-md overflow-hidden">
              <thead className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white sticky top-0 shadow-sm">
                <tr>
                  {["Name", "Email", "Role", "Status", "Balance", "Points", "Actions"].map((heading, index) => (
                    <th
                      key={heading}
                      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b border-gray-300 
                        ${index === 6 ? "text-right" : "text-left"}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => {
                  // Assign a random color for avatars
                  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500", "bg-yellow-500"];
                  const colorClass = colors[user.id.length % colors.length];

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-indigo-50 transition-all duration-300 ease-in-out transform hover:scale-[1.01] 
                        ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`} // Striped rows
                    >
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-left flex items-center gap-3">
                        {/* Avatar with Random Color & Ring Effect */}
                        <div
                          className={`h-10 w-10 flex-shrink-0 ${colorClass} rounded-full flex items-center justify-center 
                            text-white font-semibold shadow-md ring-2 ring-offset-2 ring-indigo-400 transition-all duration-300`}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200 text-left">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-left">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                            {
                              SUPER_ADMIN: "bg-purple-100 text-purple-800",
                              SELLER: "bg-blue-100 text-blue-800",
                            }[user.role] || "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-left">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md ${
                            user.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold border-b border-gray-200 text-left">
                        ${user.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold border-b border-gray-200 text-left">
                        {user.points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium border-b border-gray-200">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-full transition-all shadow-md"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in UsersPage:", error);
    return (
      <div className="p-8 text-center text-red-600 font-bold">Error loading users. Please try again later.</div>
    );
  }
}
