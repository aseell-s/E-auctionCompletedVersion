// Custom wrapper for UploadThing components with enhanced debugging
// This file provides components for debugging and handling file uploads using the UploadThing library.
// 1. Imports functions to generate upload components (`UploadDropzone`, `UploadButton`).
// 2. Defines `DebugUploadDropzone`:
//    - A wrapper around the `UploadDropzone` component for debugging purposes.
//    - Logs props and selected files to the console for debugging.
//    - Displays a "Debug Mode Enabled" message above the dropzone.
// 3. Exports:
//    - `DebugUploadDropzone`: A debug-enabled dropzone component.
//    - `UploadDropzone`: A regular dropzone component for file uploads.
//    - `UploadButton`: A button for uploading files.
import {
  generateUploadDropzone,
  generateUploadButton,
} from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

// Debug wrapper for UploadDropzone
export const DebugUploadDropzone = (props: any) => {
  console.log("DebugUploadDropzone rendering with props:", props);
  const OriginalDropzone = generateUploadDropzone<OurFileRouter>();

  // Wrap original component with debugging
  return (
    <div className="debug-wrapper">
      <p className="text-xs text-gray-500 mb-1">Debug Mode Enabled</p>
      <OriginalDropzone
        {...props}
        onBeforeUploadBegin={(files) => {
          console.log("DEBUG: Files selected:", files);
          return props.onBeforeUploadBegin
            ? props.onBeforeUploadBegin(files)
            : files;
        }}
      />
    </div>
  );
};

// Export regular components for convenience
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const UploadButton = generateUploadButton<OurFileRouter>();
