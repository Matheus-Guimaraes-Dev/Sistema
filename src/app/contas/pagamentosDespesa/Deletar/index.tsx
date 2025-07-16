"use client"

import { useState } from "react";
import { createClient } from "@/lib/client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface InformacoesConta {
  infoConta: number;
}

export default function DeletarConta({ infoConta }: InformacoesConta ) {

  const supabase = createClient();

  const {grupo} = useUser();

  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const router = useRouter();

  // ========== EXCLUIR O EMPRESTIMO E A COMISSAO DO CONSULTOR ==========

  async function deletarEmprestimo() {

    setLoading(true);

    const { error } = await supabase
      .from("despesas_lancamentos")
      .delete()
      .eq("id", infoConta);
      
    if(error) {
      toast.error("Erro ao deletar Conta");
      return false;
    }

    setLoading(false);

    return true;

  }

  return(
    <div>

      {/* ========== CAMPO DE OPÇÕES ========== */}

      {(grupo === "Administrador" || grupo === "Proprietario") && (
        <div className="flex gap-3 flex-wrap">

          <button onClick={() => setMostrarModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Deletar </button>

        </div>
      )}

      {/* ========== MOSTRAR MODAL DE EXCLUIR ========== */}

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente excluir este lançamento? </h2>

            <p className="mb-4"> Todos os dados relacionados a este lançamento serão apagados de forma permanente. </p>

            <div className="flex justify-center gap-4">
              <button onClick={async () => {
                const sucesso = await deletarEmprestimo();
                  if (sucesso) {
                    setMostrarModal(false);
                    window.location.href = "/contas";
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"> Sim </button>

              <button onClick={() => setMostrarModal(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Não </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

    </div>
  )
}
