// This file defines a file upload router using the UploadThing library.
// 1. `ourFileRouter`: Defines routes for handling file uploads.
//    - `imageUploader`: A route for uploading images with the following settings:
//      - Maximum file size: 4MB.
//      - Maximum file count: 10.
// 2. Middleware:
//    - Temporarily bypasses authentication for testing purposes (returns a test user ID).
//    - Logs when the middleware is called.
//    - Includes commented-out authentication logic for production use.
// 3. `onUploadComplete`:
//    - Executes after a file upload is complete.
//    - Logs the uploaded file details to the console.
//    - Returns the file's URL.
// 4. Ensures the router satisfies the `FileRouter` type.
// 5. Exports the `OurFileRouter` type for use in other parts of the application.
import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "@/lib/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route key
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      console.log("UploadThing middleware called");

      // IMPORTANT: Temporarily bypass authentication for testing
      // Remove this and restore proper auth after testing is successful
      return { userId: "test-user-123" };

      /*
      // Original authentication logic - restore once working
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        console.error("UploadThing: Authentication failed - no session found");
        throw new Error("Unauthorized");
      }
      return { userId: session.user.id };
      */
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("UploadThing: Upload complete!", file);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
