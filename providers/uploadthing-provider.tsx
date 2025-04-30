"use client";

import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/lib/uploadthing";

export function UploadthingProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      {children}
    </>
  );
}
// This file defines the `UploadthingProviders` component, which sets up the UploadThing configuration for server-side rendering (SSR).
// 1. Imports the `NextSSRPlugin` from the UploadThing library for SSR support.
// 2. Imports `extractRouterConfig` to extract configuration details from the file upload router.
// 3. Uses `ourFileRouter` to provide the file upload routes.
// 4. The `UploadthingProviders` component:
//    - Wraps its children with the `NextSSRPlugin`.
//    - Passes the extracted router configuration to the `NextSSRPlugin`.
// 5. Ensures that file upload functionality is properly configured for SSR in the application.