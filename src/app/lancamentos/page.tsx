import { Menu } from "@/components/componentes/menu"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { FiltrosLancamentos } from "./filtrosIniciais"

export default async function Lancamentos() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return(
    <div className="sm:flex min-h-screen">

      <Menu />

      <FiltrosLancamentos />

      
    </div>
  )
}