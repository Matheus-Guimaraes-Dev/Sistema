import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { UserProvider } from "@/contexts/UserContext";
import { createClient } from "@/lib/server";

export const metadata: Metadata = {
  title: "Lang Consultoria",
  description: "Empresa especializada em empréstimos",
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) 

{

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sistema")
    .select("status, data_vencimento")
    .eq("id", 1)
    .single();

  if (error) {
    console.error(error);
      return;
  }

  const hoje = new Date();

  const [ano, mes, dia] = String(data.data_vencimento).split("-").map(Number);

  const vencimentoFimDoDia = new Date(ano, mes - 1, dia, 23, 59, 59, 999);

  const jaVenceu = hoje > vencimentoFimDoDia;

  let verificar;

  if (data?.status === "BLOQUEADO" || jaVenceu === true) {
    verificar = true;
  } else {
    verificar = false;
  }

  return (
    <html lang="pt-br">

      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="font-poppins">
         {verificar ? (
           <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-6">
              <svg
                className="mx-auto w-20 h-20 text-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Sistema Temporariamente Indisponível
              </h1>

            </div>
          </main>
        ) : (
          <UserProvider>
            {children}
            <Toaster position="top-right" reverseOrder={false} />
          </UserProvider>
        )}
      </body>
    </html>
  );
}
