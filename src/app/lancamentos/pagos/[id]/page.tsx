import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { EmprestimoPago } from "../../types";
import Link from "next/link";
import { formatarCPF, formatarData, formatarDinheiro } from "@/funcoes/formatacao";


export default async function DetalhesPagos( { params }: { params: { id: string } } ) {

  const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
      redirect('/auth/login')
    }

    const { id } = await params;
    const idConvertido = parseInt(id);
    if (isNaN(idConvertido)) {
      redirect("/lancamentos");
    }

    async function buscarEmprestimoPago(id: number): Promise<EmprestimoPago | null> {

      const { data, error } = await supabase
        .from("pagamentos_conta_receber")
        .select(`
          id,
          valor_pago,
          observacao,
          data_pagamento,
          contas_receber (
            id,
            tipo_lancamento,
            cidade,
            estado,
            valor_emprestado,
            valor_receber,
            data_emprestimo,
            data_vencimento,
            status,
            numero_promissoria,
            status_comissao,
            comissao,
            clientes (
              id,
              nome_completo,
              cpf
            ),
            consultores (
              id,
              nome_completo
            )
          ),
          formas_pagamento (
            descricao
          )
        `)
        .eq("id", id)
        .single<EmprestimoPago>();

      if(error) {
        return null;
      }

      return data;

    }

    const emprestimoId = (await params).id;
    const emprestimo = await buscarEmprestimoPago(idConvertido);
    if(!emprestimo) {
      redirect("/lancamentos");
    }

    console.log(emprestimo);

    return (
    <div className="bg-[#002956] min-h-screen">
        <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-white mb-6"> Detalhes do Pagamento </h1>

        <div className="flex gap-3 flex-wrap">
          <Link href="/lancamentos" className="cursor-pointer"> 
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
          </Link>
        </div>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">
          
          <div>
            <p> <strong> ID:</strong> {emprestimo.contas_receber.id}.{emprestimo.id} </p>
            <p> <strong> ID do Cliente:</strong> {emprestimo.contas_receber.clientes.id} </p>
            <p><strong>Cliente:</strong> {emprestimo.contas_receber.clientes.nome_completo} </p>
            <p><strong>CPF do Cliente:</strong> {formatarCPF(emprestimo.contas_receber.clientes.cpf)} </p>
            <p> <strong> ID do Consultor:</strong> {emprestimo.contas_receber.consultores.id} </p>
            <p><strong>Consultor:</strong> {emprestimo.contas_receber.consultores.nome_completo} </p>
            <p><strong>Tipo Lançamento:</strong> {emprestimo.contas_receber.tipo_lancamento} </p>
            <p><strong>Estado:</strong> {emprestimo.contas_receber.estado} </p>
            <p><strong>Cidade:</strong> {emprestimo.contas_receber.cidade} </p>
          </div>

          <div>
            <p><strong>Status do Pagamento Total:</strong> {emprestimo.contas_receber.status} </p>
            <p><strong>Data de Emprestimo:</strong> {formatarData(emprestimo.contas_receber.data_emprestimo)} </p>
            <p><strong>Data de Vencimento:</strong> {formatarData(emprestimo.contas_receber.data_vencimento)} </p>
            <p><strong>Status da Comissão:</strong> {emprestimo.contas_receber.status_comissao} </p>
            <p><strong>Descrição:</strong> {emprestimo.observacao} </p>
          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p>
              <strong>Valor Emprestado: </strong> {formatarDinheiro(emprestimo.contas_receber.valor_emprestado)}
            </p>
            <p>
              <strong>Valor a Receber:</strong> {formatarDinheiro(emprestimo.contas_receber.valor_receber)}
            </p>
            <p>
              <strong>Valor Pago:</strong> {formatarDinheiro(emprestimo.valor_pago)}
            </p>
          </div>

          <div>
            <p><strong>Número da Promissória:</strong> {emprestimo.contas_receber.numero_promissoria || "Nenhum"} </p>
            <p>
              <strong>Valor da Comissão:</strong> {formatarDinheiro(emprestimo.contas_receber.comissao)}
            </p>
            <p>
              <strong>Juros Pago:</strong> ---
            </p>
          </div>

        </section>


      </div>
    </div>
    )
}