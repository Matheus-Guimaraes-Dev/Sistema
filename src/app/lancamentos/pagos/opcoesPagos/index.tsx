"use client";

import { createClient } from "@/lib/client";
import { useState } from "react";
import { Props } from "../../types";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";

export default function OpcoesPagos({ informacoesPago }: Props ) {

  const supabase = createClient();

  const {grupo} = useUser(); 

  const [loading, setLoading] = useState(false);

  async function estornarEmprestimo() {

    const correcaoValorPago = informacoesPago.contas_receber.valor_pago - informacoesPago.valor_pago;

    setLoading(true);

    const { error } = await supabase
      .from("contas_receber")
      .update({
        valor_pago: correcaoValorPago,
        status: "Pendente",
      })
      .eq("id", informacoesPago.contas_receber.id);

    const { error: ErroBuscar} = await supabase
      .from("pagamentos_conta_receber")
      .delete()
      .eq("id", informacoesPago.id)

    if(ErroBuscar || error) {
      toast.error("Erro ao estornar documento");
    } else {
      window.location.href = "/lancamentos";
    }
    
    setLoading(false);

  }

  return(
    <div>
        
        {(grupo === "Administrador" || grupo === "Proprietario") && (
          <button onClick={ () => estornarEmprestimo()} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Estornar </button>
        )}

        {loading && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
          </div>
        )}
    </div>
  )

} 

