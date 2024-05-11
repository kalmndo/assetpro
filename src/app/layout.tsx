import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";
import { JotaiProviders } from "@/components/jotai-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Assetpro",
  description: "Assetpro",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <JotaiProviders>
            {children}
          </JotaiProviders>
        </TRPCReactProvider>
        <Toaster richColors />
      </body>
    </html>
  );
}
