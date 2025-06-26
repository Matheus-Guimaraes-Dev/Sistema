"use client"

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import { createClient } from "@/lib/client";
import { AlterarStatus } from "@/app/clientes/components/AlterarStatus";
import BuscarCliente from "../BuscarClientes";
import { formatarCPF, mostrarValor } from "@/funcoes/formatacao";
import BuscarConsultor from "../BuscarConsultor";
import { Label } from "@/app/formulario/components/componentes/label";
import toast from "react-hot-toast";

interface ClienteInfo {
  id: number;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  status: string;

};

interface ConsultorInfo {
  id: number;
  nome_completo: string;
  cpf: string;
}

interface Cliente {
  id: number;
  nome_completo: string;
  cpf: string;
}

interface Consultor {
  id: number;
  nome_completo: string;
  cpf: string;
}

interface infoEmprestimo {
  id: number;
  tipo_lancamento: string;
  valor_emprestado: number;
  valor_receber: number;
  valor_pago: number;
  cidade: string;
  estado: string;
  data_emprestimo: string;
  data_vencimento: string;
  descricao: string;
  status: string;
  numero_promissoria: number;
  comissao: number;
  status_comissao: string;
  clientes: Cliente;
  consultores: Consultor;
}

interface PropsAlterar {
  informacoesEmprestimo: infoEmprestimo;
}

export default function Opcoes({ informacoesEmprestimo }: PropsAlterar ) {

  const supabase = createClient();

  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteInfo | null>(null);
  const [consultorSelecionado, setConsultorSelecionado] = useState<ConsultorInfo | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [dataEmprestimo, setDataEmprestimo] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [valorEmprestado, setValorEmprestado] = useState("");
  const [valorRecebimento, setValorRecebimento] = useState("");

  const handleChange = (valor: string) => {
    setTipo(valor === tipo ? null : valor);
  };

  const [mostrarModal, setMostrarModal] = useState(false);

  const [ativar, setAtivar] = useState(false);

  useEffect( () => {
    if(informacoesEmprestimo) {
      setClienteSelecionado({
        id: informacoesEmprestimo.clientes.id,
        nome_completo: informacoesEmprestimo.clientes.nome_completo,
        cpf: informacoesEmprestimo.clientes.cpf,
        cidade: informacoesEmprestimo.cidade,
        estado: informacoesEmprestimo.estado,
        status: "Pendente",
      });
      setConsultorSelecionado({
        id: informacoesEmprestimo.consultores.id,
        nome_completo: informacoesEmprestimo.consultores.nome_completo,
        cpf: informacoesEmprestimo.consultores.cpf
      });
      setValorRecebimento(Number(informacoesEmprestimo.valor_receber).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }));
      setValorEmprestado(Number(informacoesEmprestimo.valor_emprestado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }));
      setObservacoes(informacoesEmprestimo.descricao)
      setTipo(informacoesEmprestimo.tipo_lancamento);
      setDataVencimento(informacoesEmprestimo.data_vencimento);
      setDataEmprestimo(informacoesEmprestimo.data_emprestimo);
    }
  }, [informacoesEmprestimo] );

  async function atualizarEmprestimo(e: FormEvent) {

    e.preventDefault();

    const valorEmprestadoCorreto = limparValorMonetario(valorEmprestado);
    const valorRecebimentoCorreto = limparValorMonetario(valorRecebimento)

    const dadosAtualizados = {
      id_cliente: clienteSelecionado?.id,
      id_consultor: consultorSelecionado?.id,
      tipo_lancamento: tipo,
      valor_emprestado: valorEmprestadoCorreto,
      valor_receber: valorRecebimentoCorreto,
      data_emprestimo: dataEmprestimo,
      data_vencimento: dataVencimento,
      descricao: observacoes,
    }

    const { error } = await supabase
      .from("contas_receber")
      .update(dadosAtualizados)
      .eq("id", informacoesEmprestimo.id)

    if(error) {
      toast.error("Erro ao atualizar emprestimo");
      return false;
    }

    window.location.reload()

    return true

  }

  async function deletarCliente() {

  }

  // const mostrarValor = (e: React.ChangeEvent<HTMLInputElement>) => {

  //   const valor = e.target.value;
  //   const formatado = formatarParaReal(valor);

  //   setValorSolicitado(formatado);
  //   console.log(valorSolicitado)

  // }

  const formatarParaReal = (valor: string) => {
    const apenasNumeros = String(valor).replace(/\D/g, "");
    const valorNumerico = parseFloat(apenasNumeros) / 100;

    console.log("INFO: ", valorNumerico)

    if (isNaN(valorNumerico)) {
      return "";
    }

    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function ativarBotao() {
    setAtivar(!ativar)
    console.log(ativar);
  }

  function limparValorMonetario(valor: string): number {
    return parseFloat(
      String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
    );
  }

  // function limiteCpf(e: React.ChangeEvent<HTMLInputElement>) {
  //   const value = e.target.value.replace(/\D/g, ""); 
  //   if (value.length <= 11) {
  //     setCpf(value);
  //   }
  // }

  // function limiteRg(e: React.ChangeEvent<HTMLInputElement>) {
  //   const value = e.target.value.replace(/\D/g, "");
  //   if(value.length <= 7) {
  //     setRg(value);
  //   }
  // }

  // function limiteWhatsapp(e: React.ChangeEvent<HTMLInputElement>) {
  //   const value = e.target.value.replace(/\D/g, "");
  //   if(value.length <= 13) {
  //     setWhatsapp(value);
  //   }
  // }

  // function limiteTelefoneReserva(e: React.ChangeEvent<HTMLInputElement>) {
  //   const value = e.target.value.replace(/\D/g, "");
  //   if(value.length <= 13) {
  //     setTelefoneReserva(value);
  //   }
  // }

  // function limiteCep(e: React.ChangeEvent<HTMLInputElement>) {
  //   const value = e.target.value.replace(/\D/g, "");
  //   if(value.length <= 8) {
  //     setCep(value);
  //   }
  // }

  const limiteDataEmprestimo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

    if (regex.test(value)) {
      setDataEmprestimo(value);
    }
  };

  const limiteDataVencimento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

    if (regex.test(value)) {
      setDataVencimento(value);
    }
  };

  return(
    <div>

      <div className="flex gap-3 flex-wrap">

        <button onClick={ativarBotao} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Alterar </button>
        
        <button onClick={() => setMostrarModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Deletar </button>

      </div>

      {ativar && (
        <form onSubmit={atualizarEmprestimo} className="bg-white shadow rounded-xl p-6 my-5">

          <section className="grid md:grid-cols-2 gap-2">

            <div>
              <label className="text-sm sm:text-base"> Cliente </label>
              <BuscarCliente
                onSelecionar={(cliente) => setClienteSelecionado(cliente)}
              />
              {clienteSelecionado && (
                <div className="mt-2 p-2 border rounded">
                  <p>
                    <strong>Cliente:</strong> {clienteSelecionado.nome_completo} (ID: {clienteSelecionado.id})
                  </p>
                  <p>
                    <strong>CPF:</strong> {formatarCPF(clienteSelecionado.cpf)}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm sm:text-base"> Consultor </label>
              <BuscarConsultor
                  onSelecionar={(consultor) => setConsultorSelecionado(consultor)}
                />

                {consultorSelecionado && (
                  <div className="mt-2 p-2 border rounded">
                    <p>
                      <strong>Cliente:</strong> {consultorSelecionado.nome_completo} (ID: {consultorSelecionado.id})
                    </p>
                    <p>
                      <strong>CPF:</strong> {formatarCPF(consultorSelecionado.cpf)}
                    </p>
                  </div>
                )}
            </div>

            <div className="">

              <Label> Data do Empréstimo </Label>

              <InputAlterar 

                type="date"
                value={dataEmprestimo}
                onChange={limiteDataEmprestimo}
              />
              
            </div>

            <div className="">

              <Label> Data do Vencimento </Label>

              <InputAlterar 
                type="date"
                value={dataVencimento}
                onChange={limiteDataVencimento}
              />
              
            </div>

            <div className="">
              <Label> Valor do Empréstimo </Label>
              <InputAlterar 
                type="text" 
                value={valorEmprestado}
                onChange={(e) => mostrarValor(e, setValorEmprestado)}
                placeholder="R$ 0,00"

              />
            </div>

            <div className="">
              <Label> Valor do Recebimento </Label>
              <InputAlterar 
                type="text" 
                value={valorRecebimento}
                onChange={(e) => mostrarValor(e, setValorRecebimento)}
                placeholder="R$ 0,00"
              />
            </div>

            <div className="mb-1">

              <Label> Descrição </Label>

              <InputAlterar 
                type="text"
                value={observacoes}
                onChange={ (e) => setObservacoes(e.target.value)}
              />
                
            </div>

            <div className="flex flex-col justify-center">
              <label className="text-sm sm:text-base mb-1"> Tipo Lançamento </label>
                <div className="flex flex-wrap gap-4">
                  {["Mensal", "Semanal", "Diario"].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input
                        className="w-4 h-4 border-2"
                        type="checkbox"
                        checked={tipo === item}
                        onChange={() => handleChange(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>
                
            </div>
            

          </section>

          <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer w-full mt-8"> Salvar Alterações </button>

        </form>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente excluir este cliente? </h2>

            <p className="mb-4"> Todos os dados relacionados a este cliente serão apagados de forma permanente. </p>

            {/* <div className="flex justify-center gap-4">
              <button onClick={async () => {
                const sucesso = await deletarCliente();
                  if (sucesso) {
                    setMostrarModal(false);
                    window.location.href = "/clientes";
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"> Sim </button>

              <button onClick={() => setMostrarModal(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Não </button>
            </div> */}
          </div>
        </div>
      )}

    </div>
  )
}