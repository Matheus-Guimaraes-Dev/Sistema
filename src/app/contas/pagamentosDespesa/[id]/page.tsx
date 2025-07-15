import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatarCPF, formatarData, formatarDinheiro } from "@/funcoes/formatacao";
import DeletarConta from "../Deletar";

type Conta = {
  id: number;
  descricao: string;
  data_lancamento: string;
  valor_recebido: number;
  plano_conta_despesa_lancamento: {
    id: number;
    descricao: string;
  };
  formas_pagamento: {
    id: number;
    descricao: string;
  }
};

export default async function Detalhes( { params }: { params: { id: string } }) {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const { id } = await params;
  const idConvertido = parseInt(id);

  if (isNaN(idConvertido)) {
    redirect("/contas");
  }

  async function buscarDetalhesConta(id: number): Promise<Conta | null> {
    const { data, error } = await supabase
      .from("despesas_lancamentos ")
      .select(`
        id,
        descricao,
        data_lancamento,
        valor_recebido,
        plano_conta_despesa_lancamento (
          id,
          descricao
        ),
        formas_pagamento (
          id, 
          descricao
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar conta:", error.message);
      return null;
    }

    return data as unknown as Conta;
  }

  const conta = await buscarDetalhesConta(idConvertido);

  if (!conta) {
    redirect("/contas");
  }

  return (

    <div className="bg-[#002956] min-h-screen">
        <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-white mb-6"> Detalhes do Lançamento </h1>

        <div className="flex gap-3 flex-wrap">
          <Link href="/contas" className="cursor-pointer"> 
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
          </Link>
        </div>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">
          
          <div>
            <p> <strong> ID:</strong> {conta.id} </p>
            <p><strong>Conta:</strong> {conta.plano_conta_despesa_lancamento.descricao} </p>
            <p><strong>Forma de Pagamento:</strong> {conta.formas_pagamento.descricao}</p>
            <p><strong>Data de Lançamento:</strong> {formatarData(conta.data_lancamento)} </p>
            <p><strong>Descricao:</strong> {conta.descricao} </p>
            <p><strong>Valor Recebido:</strong> {formatarDinheiro(conta.valor_recebido)} </p>
          </div>

        </section>

        <section>

          <DeletarConta infoConta={conta.id} />

        </section>

        </div>

    </div>

  );
}