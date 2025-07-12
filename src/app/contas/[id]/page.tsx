import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatarCPF, formatarData } from "@/funcoes/formatacao";

export default async function Detalhes( { params }: { params: { id: string } }) {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const { id } = await params;
  const idConvertido = parseInt(id);

  if (isNaN(idConvertido)) {
    redirect("/consultores");
  }

  async function buscarCliente(id: number) {
  
  const { data, error } = await supabase
    .from("consultores")
    .select("*")
    .eq("id", id)
    .single();

    if (error) {
      console.error("Erro ao buscar cliente:", error.message);
      return null;
    }

    return data;

  }

  const consultor = await buscarCliente(idConvertido);

  if (!consultor) {
    redirect("/consultores");
  }

  return (

    <div className="bg-[#002956] min-h-screen">

      <h1> Teste </h1>

    </div>

  );
}