import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Detalhes( { params }: { params: { id: string } }) {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  const { data: usuarios, error: usuariosError } = await supabase
    .from('usuarios')
    .select('*')

  if (usuariosError) {
    console.error('Erro ao buscar usuários:', usuariosError)
    return <div>Erro ao carregar dados.</div>
  }

  const { id } = await params;
  const idConvertido = parseInt(id);

  if (isNaN(idConvertido)) {
    redirect("/lancamentos");
  }

  async function buscarCliente(id: number) {
  
  const { data, error } = await supabase
    .from("contas_receber")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar conta:", error.message);
    return null;
  }

  return data;

}

  const clienteId = (await params).id;
  const cliente = await buscarCliente(idConvertido);

  if (!cliente) {
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

        <h1 className="text-2xl font-bold text-white mb-6"> Detalhes do Empréstimo </h1>

        <div className="flex gap-3 flex-wrap">
          <Link href="clientes" className="cursor-pointer"> 
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm cursor-pointer"> Voltar </button>
          </Link>
        </div>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">
          
          <div>
            <p> <strong> ID:</strong> {cliente.id} </p>
            <p><strong>Cliente:</strong> {cliente.id_cliente} </p>
            <p><strong>Consultor:</strong> {cliente.id_consultor}</p>
            <p><strong>Tipo Lançamento:</strong> {cliente.tipo_lancamento} </p>
            <p><strong>Estado:</strong> {cliente.estado} </p>
            <p><strong>Cidade:</strong> {cliente.cidade} </p>
          </div>

          <div>
            <p><strong>Status:</strong> {cliente.status} </p>
            <p><strong>Data de Emprestimo:</strong> {formatarData(cliente.data_emprestimo)} </p>
            <p><strong>Data de Vencimento:</strong> {formatarData(cliente.data_vencimento)} </p>
            <p>
              <strong>Valor Solicitado:</strong>{' '}
              {Number(cliente.valor_emprestado).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>

        </section>

        <section className="grid md:grid-cols-2 bg-white shadow rounded-xl p-6 my-5">

          <div>
            <p><strong>CEP:</strong> {cliente.cep}</p>
            <p><strong>Bairro:</strong> {cliente.bairro}</p>
            <p><strong>Rua:</strong> {cliente.rua}</p>
            <p><strong>Número:</strong> {cliente.numero_casa}</p>
            <p><strong>Moradia:</strong> {cliente.moradia}</p>
          </div>

          <div>
            <p><strong>Cidade:</strong> {cliente.cidade}</p>
            <p><strong>Estado:</strong> {cliente.estado}</p>
          </div>

        </section>

      </div>
    </div>

  );
}