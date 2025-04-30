import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/route";

export const getAuthSession = async () => {
  return await getServerSession(authOptions);
};

export { authOptions };

// 1. Retrieves the current user's session using NextAuth's `getServerSession` function.
// 2. Uses the `authOptions` configuration for authentication settings.
// 3. Simplifies session retrieval for server-side components or API routes.