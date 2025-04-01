"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";

interface CertificateDownloadButtonProps {
  auctionId: string;
  auctionTitle: string;
}

export default function CertificateDownloadButton({
  auctionId,
  auctionTitle,
}: CertificateDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setIsLoading(true);

      // Dynamically import html2pdf to reduce bundle size
      const html2pdf = (await import("html2pdf.js")).default;

      const certificateElement = document.getElementById("certificate");

      if (!certificateElement) {
        throw new Error("Certificate element not found");
      }

      const filename = `${auctionTitle.slice(
        0,
        20
      )}-certificate-${auctionId.slice(0, 8)}.pdf`;

      // Clean up any stray elements before generating PDF
      const clonedElement = certificateElement.cloneNode(true) as HTMLElement;

      const opt = {
        margin: 0,
        filename: filename,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 1.5, // Reduced scale for better fitting
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 210 * 3.78, // A4 width in pixels at 96 DPI
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          precision: 16,
          compress: true,
          hotfixes: ["px_scaling"],
        },
        pagebreak: { avoid: ["p", "h2", "h3"] },
      };

      html2pdf()
        .from(certificateElement)
        .set(opt)
        .toPdf() // Generate PDF
        .output("datauristring")
        .then((pdfAsString: string) => {
          // Create download
          const downloadLink = document.createElement("a");
          downloadLink.href = pdfAsString;
          downloadLink.download = filename;
          downloadLink.click();

          toast({
            title: "Certificate downloaded!",
            description: "Your auction certificate has been saved as PDF.",
          });
        });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast({
        title: "Download failed",
        description:
          "There was a problem generating the certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="mt-4"
      onClick={handleDownload}
      disabled={isLoading}
      size="lg"
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Generating PDF...
        </span>
      ) : (
        <span className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </span>
      )}
    </Button>
  );
}
