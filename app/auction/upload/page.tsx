"use client";

import { UploadButton, UploadDropzone } from "@/lib/uploadthing-components";

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <h1 className="text-2xl font-bold">Upload Images</h1>

      <div className="w-full max-w-md">
        <UploadDropzone
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            console.log("Files:", res);
            alert("Upload Completed");
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-center text-sm text-gray-500">Or use button:</p>
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            console.log("Files:", res);
            alert("Upload Completed");
          }}
          onUploadError={(error: Error) => {
            alert(`ERROR! ${error.message}`);
          }}
        />
      </div>
    </div>
  );
}
