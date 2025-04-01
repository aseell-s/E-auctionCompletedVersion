import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers/Providers";
import { UploadthingProviders } from "@/providers/uploadthing-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UploadthingProviders>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </UploadthingProviders>
      </body>
    </html>
  );
}
