import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { Formulario  } from "./components/formulario";
import Link from "next/link";

export default async function Cadastrar() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('*')

  if (usuariosError) {
    console.error('Erro ao buscar usuários:', usuariosError)
    return <div>Erro ao carregar dados.</div>
  }

  return(
    <div className="max-w-5xl mx-auto p-6">

      <h1 className="text-2xl font-bold text-blue-800 mb-6"> Cadastrar Cliente </h1>

      <div className="flex gap-3 flex-wrap">
        <Link href="clientes" className="cursor-pointer"> 
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
        </Link>
      </div>

      <Formulario />

    </div>
  )
}