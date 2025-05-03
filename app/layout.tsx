import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/providers/Providers";
import { UploadthingProviders } from "@/providers/uploadthing-provider";
import { Toaster } from "sonner";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-x-hidden`}>
        <UploadthingProviders>
          <Providers>{children}</Providers>
        </UploadthingProviders>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
