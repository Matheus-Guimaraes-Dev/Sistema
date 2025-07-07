import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Opcoes from "../opcoes";
import { formatarCPF, formatarData, formatarDinheiro } from "@/funcoes/formatacao";
import { Emprestimo } from "../types";

export default async function Detalhes( { params }: { params: { idpendente: string } }) {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }
  const { idpendente } = await params;
  const idConvertido = parseInt(idpendente);
  if (isNaN(idConvertido)) {
    redirect("/lancamentos");
  }

  async function calcularJurosSeVencido(emprestimo: Emprestimo) {

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vencimento = new Date(emprestimo.data_vencimento + "T12:00:00");

    if (vencimento >= hoje) {
      return 0; 
    }

    const diasAtraso = Math.ceil((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));

    const { data, error } = await supabase
      .from("configuracoes_juros")
      .select("percentual")
      .eq("tipo_juros", "Vencimento")
      .eq("tipo_lancamento", emprestimo.tipo_lancamento)
      .single(); 

    if (error || !data) {
      return 0;
    }

    const percentualMensal = Number(data.percentual);
    const jurosProporcional = (percentualMensal / 30) * diasAtraso;

    const valorJuros = emprestimo.valor_emprestado * (jurosProporcional / 100);

    return Number(valorJuros.toFixed(2));
    
  }

  async function buscarEmprestimoPendente(id: number): Promise<Emprestimo | null> {
  
    const { data: emprestimo, error } = await supabase
      .from("contas_receber")
      .select(`
        id, tipo_lancamento, cidade, estado, valor_emprestado, valor_receber, valor_pago, data_emprestimo, data_vencimento, descricao, status, numero_promissoria,comissao, status_comissao,
        clientes (
          id,
          nome_completo,
          cpf
        ),
        consultores (
          id,
          nome_completo,
          cpf
        )
      `)
      .eq("id", idConvertido)
      .single<Emprestimo>();

    if (error) {
      return null;
    }

    return emprestimo;

  }

  const emprestimoId = (await params).idpendente;
  const emprestimo = await buscarEmprestimoPendente(idConvertido);
  if (!emprestimo) {
    redirect("/lancamentos");
  }
  const jurosCalculado = await calcularJurosSeVencido(emprestimo);

  return (

    <div className="bg-[#002956] min-h-screen">
        <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-white mb-6"> Detalhes do Empréstimo </h1>

        <div className="flex gap-3 flex-wrap">
          <Link href="/lancamentos" className="cursor-pointer"> 
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
          </Link>
        </div>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">
          
          <div>
            <p> <strong> ID:</strong> {emprestimo.id} </p>
            <p><strong>Cliente:</strong> {emprestimo.clientes.nome_completo} </p>
            <p><strong>CPF do Cliente:</strong> {formatarCPF(emprestimo.clientes.cpf)} </p>
            <p><strong>Consultor:</strong> {emprestimo.consultores.nome_completo} </p>
            <p><strong>Tipo Lançamento:</strong> {emprestimo.tipo_lancamento} </p>
            <p><strong>Estado:</strong> {emprestimo.estado} </p>
            <p><strong>Cidade:</strong> {emprestimo.cidade} </p>
          </div>

          <div>
            <p><strong>Status do Pagamento:</strong> {emprestimo.status} </p>
            <p><strong>Data de Emprestimo:</strong> {formatarData(emprestimo.data_emprestimo)} </p>
            <p><strong>Data de Vencimento:</strong> {formatarData(emprestimo.data_vencimento)} </p>
            <p><strong>Status da Comissão:</strong> {emprestimo.status_comissao} </p>
            <p><strong>Descrição:</strong> {emprestimo.descricao} </p>
          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p>
              <strong>Valor Emprestado: </strong> {formatarDinheiro(emprestimo.valor_emprestado)}
            </p>
            <p>
              <strong>Valor a Receber:</strong> {formatarDinheiro(emprestimo.valor_receber)}
            </p>
            <p>
              <strong>Valor Pago:</strong> {formatarDinheiro(emprestimo.valor_pago) || "R$ 0,00"}
            </p>
          </div>

          <div>
            <p><strong>Número da Promissória:</strong> {emprestimo.numero_promissoria || "Nenhum"} </p>
            <p>
              <strong>Valor da Comissão:</strong> {formatarDinheiro(emprestimo.comissao)}
            </p>
            <p>
              <strong>Juros Após Vencimento:</strong> {formatarDinheiro(jurosCalculado)}
            </p>
          </div>

        </section>

        <section>

          <Opcoes informacoesEmprestimo={emprestimo} />

        </section>

      </div>
    </div>

  );
}