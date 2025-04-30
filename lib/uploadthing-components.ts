import {
  generateUploadButton,
  generateUploadDropzone,
  generateUploader,
} from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const Uploader = generateUploader<OurFileRouter>();
// This file sets up reusable components for file uploads using the UploadThing library.
// 1. Imports functions to generate upload components (`UploadButton`, `UploadDropzone`, `Uploader`).
// 2. Imports the `OurFileRouter` type to define the file upload routing logic.
// 3. Creates and exports:
//    - `UploadButton`: A button for uploading files.
//    - `UploadDropzone`: A drag-and-drop area for uploading files.
//    - `Uploader`: A utility for programmatically handling file uploads.