import { FormularioConsultor } from "./formulario";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CadastrarConsultor() {

  const supabase = await createClient()
  
    const { data, error } = await supabase.auth.getUser()
  
    if (error || !data?.user) {
      redirect('/auth/login')
    }

  return(
    <div className="bg-[#002956] min-h-screen">
      <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-white mb-6"> Cadastrar Consultor </h1>

        <div className="flex gap-3 flex-wrap">
          <Link href="/consultores/listaConsultores" className="cursor-pointer"> 
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
          </Link>
        </div>

        <FormularioConsultor />

      </div>
    </div>
  )
}