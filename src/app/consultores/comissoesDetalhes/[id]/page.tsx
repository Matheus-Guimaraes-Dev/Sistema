import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import Link from "next/link";
import { formatarData, formatarDinheiro } from "@/funcoes/formatacao";
import OpcoesComissoes from "../opcoes";

export interface Comissao {
  id: number,
  valor_comissao: number,
  valor_pago: number,
  data_pagamento: string,
  status: string,
  data_cadastro: string,
  descricao: string;
  contas_receber: {
    id: number;
    tipo_lancamento: string;
    valor_emprestado: number;
    valor_receber: number;
    status: string;
    data_emprestimo: string;
    data_vencimento: string;
    data_pagamento_total: string;
  },
  consultores: {
    id: number;
    nome_completo: string;
    cpf: string;
  },
  formas_pagamento: {
    descricao: string;
  }
}

export default async function Comissoes({ params }: { params: { id: string } } ) {
  
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

  if (!usuario || usuario.grupo === "Consultor") {
    redirect("/auth/login");
  }

  const { id } = await params;
  const idConvertido = parseInt(id);
  
  if (isNaN(idConvertido)) {
    redirect("/consultores");
  }

  async function buscarComissoes(id:number): Promise<Comissao | null> {

    const { data, error } = await supabase
      .from("comissoes_consultores")
      .select(`
        id,
        valor_comissao,
        valor_pago,
        data_pagamento,
        status,
        data_cadastro,
        descricao,
        consultores (
          id,
          nome_completo,
          cpf
        ),
        contas_receber (
          id,
          tipo_lancamento,
          valor_emprestado,
          valor_receber,
          status,
          data_emprestimo,
          data_vencimento,
          data_pagamento_total,
          descricao
        ),
        formas_pagamento (
          descricao
        )
      `)
      .eq("id", id)
      .single<Comissao>();

    if(error) {
      return null;
    }

    return data

  }

  const comissaoId = (await params).id;
  const comissao = await buscarComissoes(idConvertido);
  if(!comissao) {
    redirect("consultores");
  }

  console.log(comissao);

  return(

    <div className="bg-[#002956] min-h-screen">
        <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-white mb-6"> Detalhes da Comissão </h1>

        <div className="flex gap-3 flex-wrap">
          <Link href="/consultores" className="cursor-pointer"> 
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
          </Link>
        </div>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">
          
          <div>
            <p> <strong> ID:</strong> {comissao.contas_receber.id}.{comissao.id} </p>
            <p> <strong> ID do Consultor:</strong> {comissao.consultores.id} </p>
            <p><strong>Consultor:</strong> {comissao.consultores.nome_completo} </p>
            <p><strong>Tipo Lançamento:</strong> {comissao.contas_receber.tipo_lancamento} </p>
            <p><strong>Status da Comissão:</strong> {comissao.status} </p>
            <p><strong>Data da Comissão:</strong> {formatarData(comissao.data_cadastro)} </p>
            <p><strong>Data de Pagamento:</strong> {comissao.data_pagamento ? formatarData(comissao.data_pagamento) : ""} </p>

          </div>

          <div>
            <p><strong>Data de Emprestimo:</strong> {formatarData(comissao.contas_receber.data_emprestimo)} </p>
            <p><strong>Data de Vencimento:</strong> {formatarData(comissao.contas_receber.data_vencimento)} </p>
            <p><strong>Status do Emprestimo:</strong> {comissao.contas_receber.status} </p>
            <p><strong>Descrição:</strong> {comissao.descricao} </p>
          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p>
              <strong>Valor Emprestado: </strong> {formatarDinheiro(comissao.contas_receber.valor_emprestado)}
            </p>
            <p>
              <strong>Valor a Receber:</strong> {formatarDinheiro(comissao.contas_receber.valor_receber)}
            </p>
              <p>
                <strong>Valor da Comissão:</strong> {formatarDinheiro(comissao.valor_comissao)}
              </p>
          </div>

          <div>
            <p>
              <strong>Valor Pago: </strong> {formatarDinheiro(comissao.valor_pago) || "R$ 0,00"}
            </p>
            <p><strong>Forma de Pagamento:</strong> {comissao.formas_pagamento?.descricao || "Nenhuma"} </p>
          </div>

        </section>

        <section>

          <OpcoesComissoes informacoesComissoes={comissao} />

        </section>

      </div>
    </div>
  )

}