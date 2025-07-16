import { Menu } from "@/components/componentes/menu"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import PaginaInicial from "./paginaInicial"

export default async function Configuracoes() {

  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("grupo")
    .eq("id", user.id)
    .single();

  if (!usuario || !["Administrador", "Proprietario"].includes(usuario.grupo)) {
    redirect("/auth/login");
  }

  return(
    <div className="sm:flex min-h-screen">

      <Menu />

      <PaginaInicial />

    </div>
  )
}