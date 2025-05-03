"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2 } from "lucide-react";

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

      // Create a clone of the certificate for PDF generation
      const clonedCertificate = certificateElement.cloneNode(true) as HTMLElement;
      
      // Apply A4 dimensions to the clone
      clonedCertificate.style.width = '210mm';
      clonedCertificate.style.height = '297mm';
      clonedCertificate.style.padding = '0';
      clonedCertificate.style.margin = '0';
      clonedCertificate.style.boxShadow = 'none';
      clonedCertificate.style.borderRadius = '0';
      
      // Hide the clone
      clonedCertificate.style.position = 'absolute';
      clonedCertificate.style.left = '-9999px';
      clonedCertificate.style.top = '-9999px';
      
      // Add to document for PDF generation
      document.body.appendChild(clonedCertificate);

      const opt = {
        margin: 0,
        filename: filename,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
        },
      };

      await html2pdf()
        .from(clonedCertificate)
        .set(opt)
        .save()
        .then(() => {
          toast({
            title: "Certificate downloaded!",
            description: "Your auction certificate has been saved as PDF.",
          });
          
          // Remove the clone after PDF generation
          document.body.removeChild(clonedCertificate);
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
      className="w-full sm:w-auto"
      onClick={handleDownload}
      disabled={isLoading}
      size="lg"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Generating PDF...
        </span>
      ) : (
        <span className="flex items-center justify-center">
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </span>
      )}
    </Button>
  );
}
