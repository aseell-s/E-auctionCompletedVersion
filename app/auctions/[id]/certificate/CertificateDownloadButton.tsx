"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Download, Loader2, Printer } from "lucide-react";

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
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePrint = async () => {
    try {
      setIsLoading(true);

      // Get the certificate element
      const certificateElement = document.getElementById("certificate");
      if (!certificateElement) {
        throw new Error("Certificate element not found");
      }

      // Create a filename for the PDF
      const filename = `${auctionTitle.slice(0, 20)}-certificate-${auctionId.slice(0, 8)}`;

      // Set the document title to be used as the PDF filename
      const originalTitle = document.title;
      document.title = filename;
      
      // Create a style element to hide everything except the certificate
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body * {
            visibility: hidden;
          }
          #certificate, #certificate * {
            visibility: visible;
          }
          #certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            padding: 0;
            margin: 0;
          }
        }
      `;
      document.head.appendChild(style);
      
      // Print the page (which will only show the certificate)
      window.print();
      
      // Clean up
      document.head.removeChild(style);
      document.title = originalTitle;

      toast({
        title: "Certificate ready!",
        description: "Your certificate has been prepared for printing/saving.",
      });
    } catch (error) {
      console.error("Failed to generate certificate:", error);
      toast({
        title: "Print failed",
        description: "There was a problem preparing the certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null; // Don't render anything during SSR
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Button
        className="w-full sm:w-auto"
        onClick={handlePrint}
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Preparing...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Printer className="mr-2 h-4 w-4" />
            Print Certificate
          </span>
        )}
      </Button>
      
      <Button
        className="w-full sm:w-auto"
        onClick={handlePrint}
        disabled={isLoading}
        variant="outline"
        size="lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Preparing...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Download className="mr-2 h-4 w-4" />
            Save as PDF
          </span>
        )}
      </Button>
    </div>
  );
}
