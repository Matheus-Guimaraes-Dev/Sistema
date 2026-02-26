import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ListaDownloads from "../components/ListaDownload";
import Alterar from "../components/Alterar";
import { formatarCPF, formatarData, formatarDinheiro } from "@/funcoes/formatacao";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Detalhes( { params }: { params: { id: string } }) {

  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/auth/login')
  };

  const { id } = await params;
  const idConvertido = parseInt(id);

  if (isNaN(idConvertido)) {
    redirect("/clientes");
  };

  async function buscarCliente(id: number) {
  
    const { data, error } = await supabase
      .from("clientes")
      .select(`
      *,
      consultores (
        id,
        nome_completo
      )`)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar cliente:", error.message);
      return null;
    }

    return data;

  }

  const clienteId = (await params).id;
  const cliente = await buscarCliente(idConvertido);
  

  if (!cliente) {
    redirect("/clientes");
  }

  return (

    <div className="bg-[#002956] min-h-screen">
        <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-white mb-6"> Detalhes do Cliente </h1>

        <div className="flex gap-3 flex-wrap">
          <Link href="clientes" className="cursor-pointer"> 
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
          </Link>
        </div>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">
          
          <div>
            <p> <strong> ID:</strong> {cliente.id} </p>
            <p><strong>Nome completo:</strong> {cliente.nome_completo} </p>
            <p><strong>CPF:</strong> {formatarCPF(cliente.cpf)} </p>
            <p><strong>RG:</strong> {cliente.rg || "Não possui"}</p>
            <p><strong>Data de Emissão RG:</strong> {formatarData(cliente.data_emissao_rg) || "Não possui"} </p>
            <p><strong>Órgão Expedidor:</strong> {cliente.orgao_expedidor || "Não possui"} </p>
            <p><strong>Sexo:</strong> {cliente.sexo} </p>
            <p><strong>Estado Civil:</strong> {cliente.estado_civil} </p>
            <p><strong>Nome do Companheiro(a):</strong> {cliente.nome_completo_companheiro || "Não possui"} </p>
            <p><strong>CPF do Companheiro(a):</strong> {cliente.cpf_companheiro || "Não possui"} </p>
            <p><strong>Whatsapp do Companheiro(a):</strong> {cliente.whatsapp_companheiro || "Não possui"} </p>
            <p><strong>Moradia:</strong> {cliente.moradia}</p>
            <p><strong>Condições da Moradia:</strong> {cliente.condicoes_moradia}</p>
            <p><strong>Valor do Financiamento/Consórcio do Imóvel:</strong> {formatarDinheiro(cliente.valor_financiamento_moradia) || "Não possui"} </p>
            <p><strong>Valor do Aluguel:</strong> {formatarDinheiro(cliente.valor_aluguel) || "Não possui"}</p>
            <p><strong>CEP:</strong> {cliente.cep}</p>
            <p><strong>Rua:</strong> {cliente.rua}</p>
            <p><strong>Bairro:</strong> {cliente.bairro}</p>
          </div>

          <div>
            <p><strong>Número:</strong> {cliente.numero_casa}</p>
            <p><strong>Estado:</strong> {cliente.estado}</p>
            <p><strong>Cidade:</strong> {cliente.cidade}</p>
            <p><strong>Data de Nascimento:</strong> {formatarData(cliente.data_nascimento) || ""} </p>
            <p><strong>Email:</strong> {cliente.email || ""} </p>
            <p><strong>WhatsApp:</strong> {cliente.whatsapp || ""} </p>
            <p><strong>Telefone Reserva:</strong> {cliente.telefone_reserva || ""} </p>
            <p><strong>Status:</strong> {cliente.status || ""} </p>
            <p><strong>Data de Cadastro:</strong> {formatarData(cliente.data_cadastro) || ""} </p>
            <p> <strong>Valor Solicitado:</strong>{formatarDinheiro(cliente.valor_solicitado) || ""} </p>
            <p><strong>Chave Pix:</strong> {cliente.pix} </p>
            <p><strong>Situação Profissional: </strong> {cliente.situacao_profissional || ""} </p>
            <p><strong>Consultor:</strong> {cliente.consultores?.nome_completo || ""} </p>
            <p><strong>Observação: </strong> {cliente.observacao || ""} </p>
          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p><strong>Veículo:</strong> {cliente.categoria_veiculo || "Não possui"}</p>
            <p><strong>Condições do Veículo:</strong> {cliente.condicao_veiculo || "Não possui"}</p>
            <p><strong>Valor do Financiamento/Consórcio do Veículo:</strong> {formatarDinheiro(cliente.valor_financiamento_veiculo) || "Não possui"}</p>
          </div>

          <div>
            <p><strong>Nome da Empresa:</strong> {cliente.nome_empresa}</p>
            <p><strong>Endereço da Empresa:</strong> {cliente.endereco_empresa}</p>
            <p><strong>Contato do RH da Empresa:</strong> {cliente.numero_rh_empresa}</p>            
          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p><strong>Nome de Referência:</strong> {cliente.nome_referencia || "Não possui"} </p>
            <p><strong>Contato de Referência:</strong> {cliente.telefone_referencia || "Não possui"} </p>
            <p><strong>Tipo de Refência:</strong> {cliente.tipo_referencia || "Não possui"} </p>
            <p><strong>CEP Referência:</strong> {cliente.cep_referencia}</p>
            <p><strong>Rua Referência:</strong> {cliente.rua_referencia}</p>
          </div>

          <div>
            <p><strong>Bairro Referência:</strong> {cliente.bairro_referencia}</p>
            <p><strong>Número Referência:</strong> {cliente.numero_referencia}</p>
            <p><strong>Estado Referência:</strong> {cliente.estado_referencia}</p>
            <p><strong>Cidade Referência:</strong> {cliente.cidade_referencia}</p>

          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p><strong>Nome da Mãe:</strong> {cliente.nome_mae || "Não possui"} </p>
            <p><strong>CPF da Mãe:</strong> {cliente.cpf_mae}</p>
            <p><strong>Contato da Mãe:</strong> {cliente.whatsapp_mae || "Não possui"} </p>
            <p><strong>Estado da Mãe:</strong> {cliente.estado_mae}</p>
            <p><strong>Cidade da Mãe:</strong> {cliente.cidade_mae}</p>
          </div>

          <div>
            <p><strong>CEP da Mãe:</strong> {cliente.cep_mae}</p>
            <p><strong>Rua da Mãe:</strong> {cliente.rua_mae}</p>
            <p><strong>Bairro da Mãe:</strong> {cliente.bairro_mae}</p>
            <p><strong>Número Casa da Mãe:</strong> {cliente.numero_casa_mae}</p>

          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p><strong>Nome do Pai:</strong> {cliente.nome_pai || "Não possui"} </p>
            <p><strong>CPF do Pai:</strong> {cliente.cpf_pai}</p>
            <p><strong>Contato do Pai:</strong> {cliente.whatsapp_pai || "Não possui"} </p>
            <p><strong>Estado do Pai:</strong> {cliente.estado_pai}</p>
            <p><strong>Cidade do Pai:</strong> {cliente.cidade_pai}</p>
          </div>

          <div>
            <p><strong>CEP do Pai:</strong> {cliente.cep_pai}</p>
            <p><strong>Rua do Pai:</strong> {cliente.rua_pai}</p>
            <p><strong>Bairro do Pai:</strong> {cliente.bairro_pai}</p>
            <p><strong>Número Casa do Pai:</strong> {cliente.numero_casa_pai}</p>

          </div>

        </section>

        <section>

          <Alterar informacoesCliente={cliente} />

        </section>


        <section className="bg-white shadow rounded-xl my-5 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4"> Documentos Enviados </h2>
          <div> <ListaDownloads clienteId={clienteId} /> </div>
        </section>

      </div>
    </div>

  );
}