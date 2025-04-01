// Custom wrapper for UploadThing components with enhanced debugging

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
