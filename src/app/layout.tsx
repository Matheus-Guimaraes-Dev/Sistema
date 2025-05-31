import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lang Consultoria",
  description: "Empresa especializada em empréstimos",
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
        {children}
      </body>
    </html>
  );
}
