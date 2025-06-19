import { Menu } from "@/components/componentes/menu";
import FiltrosConsultores from "./filtros";
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export default async function ListaConsultores() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return(
    <div className="sm:flex min-h-screen">

      <Menu />

      <FiltrosConsultores />
  
    </div>
  )
}