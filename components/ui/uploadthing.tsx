"use client";

import { useCallback } from "react";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import { generateComponents } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();
