import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { ClientProviders } from "~/components/providers/client-providers";
import { Toaster } from "~/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "RePublic",
  description: "Best way to deploy web3 apps",
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
        <ClientProviders>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
