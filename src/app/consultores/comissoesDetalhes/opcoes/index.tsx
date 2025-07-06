"use client"

import { useState, useEffect, FormEvent, useRef } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import { createClient } from "@/lib/client";
import { formatarCPF, mostrarValor, limparValorMonetario } from "@/funcoes/formatacao";
import BuscarConsultor from "@/app/lancamentos/BuscarConsultor";
import { Label } from "@/app/formulario/components/componentes/label";
import toast from "react-hot-toast";
import { ConsultorInfo, Recebimentos} from "@/app/lancamentos/types";
import { limiteDataPagamento } from "@/funcoes/limitacao";
import { useRouter } from "next/navigation";
import { Comissao } from "../[id]/page";

export interface PropsAlterar {
  informacoesComissoes: Comissao;
}

export default function OpcoesComissoes({ informacoesComissoes }: PropsAlterar ) {

  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [consultorSelecionado, setConsultorSelecionado] = useState<ConsultorInfo | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [carregado, setCarregado] = useState(false);
  const [dataPagamento, setDataPagamento] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [valorComissao, setValorComissao] = useState("");

  const [formasRecebimento, setFormasRecebimento] = useState<Recebimentos[]>([])
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState("");

  const router = useRouter();

  const [mostrarModal, setMostrarModal] = useState(false);
  const [abrirModalBaixa, setAbrirModalBaixa] = useState(false);

  const [ativar, setAtivar] = useState(false);

  useEffect( () => {
    if(informacoesComissoes) {
      setConsultorSelecionado({
        id: informacoesComissoes.consultores.id,
        nome_completo: informacoesComissoes.consultores.nome_completo,
        cpf: informacoesComissoes.consultores.cpf
      });
      setValorComissao(Number(informacoesComissoes.valor_comissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }));
      setObservacoes(informacoesComissoes.descricao ?? "")
      setCarregado(true);

      formasDeRecebimento();

    }
  }, [informacoesComissoes] );

  // ========== ATUALIZAR O COMISSAO ==========

  async function atualizarComissao(e: FormEvent) {

    e.preventDefault();

    setLoading(true);

    if(!consultorSelecionado) return toast.error("Selecione um consultor");

    const valorComissaoCorreto = limparValorMonetario(valorComissao);

    if (isNaN(valorComissaoCorreto) || valorComissaoCorreto <= 0) {
      return toast.error("Digite o valor do empréstimo");
    }

    const dadosAtualizados = {
      id_consultor: consultorSelecionado?.id,
      valor_comissao: valorComissaoCorreto,
      descricao: observacoes,
    }

    const { error: ErroReceber } = await supabase
      .from("contas_receber")
      .update({
        comissao: valorComissaoCorreto
      })
      .eq("id", informacoesComissoes.contas_receber.id);

    const { error } = await supabase
      .from("comissoes_consultores")
      .update(dadosAtualizados)
      .eq("id", informacoesComissoes.id)

    if(error || ErroReceber) {
      toast.error("Erro ao atualizar comissão");
      return false;
    }

    setLoading(false);

    window.location.reload();

  }

  // ========== ESTORNAR A COMISSAO DO CONSULTOR ==========

  async function estornarComissao() {

    setLoading(true);

    const dadosAtualizados = {
      valor_pago: 0,
      id_forma_pagamento: null,
      status: "Pendente",
    }

    const { error: ErroReceber } = await supabase
      .from("contas_receber")
      .update({
        status_comissao: "Pendente"
      })
      .eq("id", informacoesComissoes.contas_receber.id);

    const { error } = await supabase
      .from("comissoes_consultores")
      .update(dadosAtualizados)
      .eq("id", informacoesComissoes.id)

    if(error || ErroReceber) {
      toast.error("Erro ao estornar comissão");
      return false;
    }

    setLoading(false);

    window.location.reload();

  }

  // ========== BAIXAR O COMISSÃO ==========

  async function baixarComissao(e: React.FormEvent) {

    e.preventDefault();

    if(!consultorSelecionado) return toast.error("Selecione um consultor");
    if(!dataPagamento.trim()) return toast.error("Selecione uma data de pagamento");
    if(!valorPago) return toast.error("Valor de Pagamento não informado");
    if(!formasRecebimento) return toast.error("Selecione uma forma de recebimento");

    setLoading(true);

    let status = "";

    const valorPagoCorreto = limparValorMonetario(valorPago);
    
    if(valorPagoCorreto === 0) {
      status = "Pendente";
    } else if (valorPagoCorreto > 0 && valorPagoCorreto < informacoesComissoes.valor_comissao) {
      status = "Parcial";
    } else {
      status = "Pago";
    }

    if (isNaN(valorPagoCorreto)) {
      setLoading(false);
      return toast.error("Digite o valor do pagamento");
    }

    const { data, error } = await supabase  
      .from("comissoes_consultores")
      .update({
        id_consultor: consultorSelecionado.id,
        valor_pago: valorPagoCorreto,
        data_pagamento: dataPagamento,
        status: status,
        id_forma_pagamento: recebimentoSelecionado,
      })
      .eq("id", informacoesComissoes.id)

    const { error: erroContaReceber } = await supabase
      .from("contas_receber")
      .update({
        status_comissao: status
      })
      .eq("id", informacoesComissoes.contas_receber.id);

    if(error || erroContaReceber ) {
      toast.error("Erro ao pagar comissão");
      setLoading(false);
      return;
    }

    if(!data) {
      setLoading(false);
      toast.success("Comissão paga com sucesso");
      router.push("/consultores");
    }

    setLoading(false);

  }

  // ========== BUSCAR AS FORMAS DE RECEBIMENTO ==========

  async function formasDeRecebimento() {

    const { data, error } = await supabase
      .from("formas_pagamento")
      .select("id, descricao");
    
    if(error) {
      toast.error("Erro ao buscar formas de recebimento");
    }

    if(data) {

      setFormasRecebimento(data);

    }

  }

  return(
    <div>

      {/* ========== CAMPO DE OPÇÕES ========== */}

      <div className="flex gap-3 flex-wrap">

        {informacoesComissoes.status === "Pendente" && (
          <button onClick={() => setAtivar(!ativar)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Alterar </button>
        )} 

        {informacoesComissoes.status !== "Pendente" && (
          <button onClick={() => setMostrarModal(true)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Estornar </button>
        )} 
        
        {informacoesComissoes.status === "Pendente" && (
          <button onClick={() => setAbrirModalBaixa(true)} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm cursor-pointer"> Baixar </button>
        )}

      </div>

      {/* ========== MOSTRAR TELA DE ALTERAÇÃO ========== */}

      {ativar && (
        <form onSubmit={atualizarComissao} className="bg-white shadow rounded-xl p-6 my-5">

          <section className="grid md:grid-cols-2 gap-2">

            <div>
              <label className="text-sm sm:text-base"> Consultor </label>
              <BuscarConsultor
                  onSelecionar={(consultor) => setConsultorSelecionado(consultor)}
                />

                {consultorSelecionado && (
                  <div className="mt-2 p-2 border rounded">
                    <p>
                      <strong>Consultor:</strong> {consultorSelecionado.nome_completo} (ID: {consultorSelecionado.id})
                    </p>
                    <p>
                      <strong>CPF:</strong> {formatarCPF(consultorSelecionado.cpf)}
                    </p>
                  </div>
                )}
            </div>

            <div className="">
              <Label> Valor da Comissão </Label>
              <InputAlterar 
                type="text" 
                value={valorComissao}
                onChange={(e) => mostrarValor(e, setValorComissao)}
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
            
          </section>

          <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer w-full mt-8"> Salvar Alterações </button>

        </form>
      )}

      {/* ========== MOSTRAR MODAL DE BAIXAR ========== */}

      {abrirModalBaixa && (
      
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4 text-center"> Baixa </h2>

            <form onSubmit={baixarComissao}>

              <div className="mb-3">

                <Label> Buscar Consultor </Label>

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

              <div className="mb-3">

                <Label> Data do Pagamento </Label>

                <input 
                  className="w-full h-8 border-2 px-1 border-[#002956] rounded mt-1  focus:outline-[#4b8ed6]"
                  type="date"
                  value={dataPagamento}
                  onChange={ (e) => limiteDataPagamento(e, setDataPagamento)}
                />
                
              </div>

              <div className="mt-2 mb-3">
                <Label> Valor do Pagamento </Label>
                <InputAlterar 
                  type="text" 
                  value={valorPago}
                  onChange={(e) => mostrarValor(e, setValorPago)}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="mb-3">
                <Label> Forma de Recebimento </Label>

                <select 
                  className="w-full h-8 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
                  value={recebimentoSelecionado}
                  onChange={(e) => setRecebimentoSelecionado(e.target.value)}
                >
                  <option value="">Selecione a forma de recebimento</option>

                  {formasRecebimento.map((forma) => (
                    <option key={forma.id} value={forma.id}>
                      {forma.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

              <div className="flex justify-center gap-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setAbrirModalBaixa(false);
                  }} 
                  className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========== MOSTRAR MODAL DE EXCLUIR ========== */}

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente estornar esse lançamento? </h2>

            <div className="flex justify-center gap-4">
              <button onClick={async () => {
                const sucesso = await estornarComissao();
                  if (sucesso) {
                    setMostrarModal(false);
                    window.location.reload();
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"> Sim </button>

              <button onClick={() => setMostrarModal(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Não </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

    </div>
  )
}