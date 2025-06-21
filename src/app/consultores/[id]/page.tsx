import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AlterarConsutores from "../alterarInfo";

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
    redirect("/clientes");
  }

  function formatarCPF(cpf: string) {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  function formatarData(data: string) {
    const dataObj = new Date(data + "T12:00:00");
    return dataObj.toLocaleDateString('pt-BR');
  }

  return (

    <div className="bg-[#002956] min-h-screen">
        <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-2xl font-bold text-white mb-6"> Detalhes do Consultor </h1>

        <div className="flex gap-3 flex-wrap">
          <Link href="/consultores/listaConsultores" className="cursor-pointer"> 
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
          </Link>
        </div>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">
          
          <div>
            <p> <strong> ID:</strong> {consultor.id} </p>
            <p><strong>Nome completo:</strong> {consultor.nome_completo} </p>
            <p><strong>CPF:</strong> {formatarCPF(consultor.cpf)} </p>
            <p><strong>RG:</strong> {consultor.rg}</p>
            <p><strong>Data de Emissão RG:</strong> {formatarData(consultor.data_emissao_rg)} </p>
            <p><strong>Órgão Expedidor:</strong> {consultor.orgao_expedidor} </p>
            <p><strong>Sexo:</strong> {consultor.sexo} </p>
            <p><strong>Estado Civil:</strong> {consultor.estado_civil} </p>
            <p><strong>Data de Nascimento:</strong> {formatarData(consultor.data_nascimento)} </p>
          </div>

          <div>
            <p><strong>Email:</strong> {consultor.email} </p>
            <p><strong>WhatsApp:</strong> {consultor.whatsapp} </p>
            <p><strong>Telefone Reserva:</strong> {consultor.telefone_reserva} </p>
            <p><strong>Status:</strong> {consultor.status} </p>
            <p><strong>Data de Cadastro:</strong> {formatarData(consultor.data_cadastro)} </p>
            <p><strong>Observação: </strong> {consultor.observacao} </p>
            <p><strong>Comissão Diário: </strong> {consultor.comissao_diaria}% </p>
            <p><strong>Comissão Semanal: </strong> {consultor.comissao_semanal}% </p>
            <p><strong>Comissão Mensal: </strong> {consultor.comissao_mensal}% </p>
          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p><strong>CEP:</strong> {consultor.cep}</p>
            <p><strong>Bairro:</strong> {consultor.bairro}</p>
            <p><strong>Rua:</strong> {consultor.rua}</p>
            <p><strong>Número:</strong> {consultor.numero_casa}</p>
            <p><strong>Moradia:</strong> {consultor.moradia}</p>
          </div>

          <div>
            <p><strong>Cidade:</strong> {consultor.cidade}</p>
            <p><strong>Estado:</strong> {consultor.estado}</p>
          </div>

        </section>

        <section>

          <AlterarConsutores informacoesConsultor={consultor} />

        </section>

      </div>
    </div>

  );
}