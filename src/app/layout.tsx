import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { UserProvider } from "@/contexts/UserContext";

export const metadata: Metadata = {
  title: "Lang Consultoria",
  description: "Empresa especializada em empréstimos",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">

      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="font-poppins">
        <UserProvider>
          {children}
          <Toaster position="top-right" reverseOrder={false} />
        </UserProvider>
      </body>
    </html>
  );
}
