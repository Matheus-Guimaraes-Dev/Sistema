"use client"

import { createClient } from "@/lib/client";
import toast from 'react-hot-toast'

export function AlterarStatus({ clienteId, status }: { clienteId: string, status: string}) {

  const supabase = createClient();

  async function atualizarStatusAnalise() {

    if(status == "Análise") {
      toast.success("Cliente já está em análise");
      return
    }

    const { error } = await supabase
      .from("clientes")
      .update({ status: "Análise" })
      .eq("id", clienteId)

    if(error) {
      console.error("Erro ao autalizar status", error.message);
      return false;
    }

    window.location.reload();

    return true;

  }

  async function atualizarStatusAutorizado() {

    if(status == "Autorizado") {
      toast.success("Cliente já está autorizado");
      return
    }

    const { error } = await supabase
      .from("clientes")
      .update({ status: "Autorizado" })
      .eq("id", clienteId)

    if(error) {
      console.error("Erro ao autalizar status", error.message);
      return false;
    }

    window.location.reload();

    return true;

  }
  

  return(
    <div>
      
      <button onClick={atualizarStatusAnalise} type="button" className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer mr-3"> Em Análise </button>

      <button onClick={atualizarStatusAutorizado} type="button" className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 cursor-pointer"> Autorizado </button>

    </div>
  )
}