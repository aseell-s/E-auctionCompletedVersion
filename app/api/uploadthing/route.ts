// - Defines GET and POST routes for file uploads using UploadThing.
// - Uses ourFileRouter to manage upload logic and permissions.
// - Includes HEAD endpoint to check if the API is working.
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/uploadthing";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  // Add debug config
  config: {
    debug: true,
    logLevel: "debug",
  },
});

// Add basic test endpoint to verify API routing
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "x-uploadthing-api": "working",
    },
  });
}
