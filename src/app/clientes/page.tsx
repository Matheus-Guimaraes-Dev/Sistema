import { Menu } from "../componentes/menu"
import { FiltrosClientes } from "./filtros"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export default async function Clientes() {

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

    <div className="flex">

      <Menu />

      <FiltrosClientes />
      
    </div>
  )
}