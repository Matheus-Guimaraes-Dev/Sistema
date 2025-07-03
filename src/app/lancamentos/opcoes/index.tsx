"use client"

import { useState, useEffect, FormEvent, useRef } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import { createClient } from "@/lib/client";
import BuscarCliente from "../BuscarClientes";
import { formatarCPF, mostrarValor, limparValorMonetario } from "@/funcoes/formatacao";
import BuscarConsultor from "../BuscarConsultor";
import { Label } from "@/app/formulario/components/componentes/label";
import toast from "react-hot-toast";
import { ClienteInfo, ConsultorInfo, Emprestimo, PropsAlterar, Recebimentos} from "../types";
import { limiteDataEmprestimo, limiteDataPagamento, limiteDataVencimento } from "@/funcoes/limitacao";
import { useRouter } from "next/navigation";

export default function Opcoes({ informacoesEmprestimo }: PropsAlterar ) {

  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteInfo | null>(null);
  const [consultorSelecionado, setConsultorSelecionado] = useState<ConsultorInfo | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [dataEmprestimo, setDataEmprestimo] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [valorEmprestado, setValorEmprestado] = useState("");
  const [valorRecebimento, setValorRecebimento] = useState("");
  const [juros, setJuros] = useState<{ tipo_lancamento: string; percentual: number }[]>([]);
  const [carregado, setCarregado] = useState(false);
  const [jurosDoVencimento, setJurosDoVencimento] = useState<string>("");
  const [valorComJuros, setValorComJuros] = useState<string>("");
  const [dataPagamento, setDataPagamento] = useState("");

  const [formasRecebimento, setFormasRecebimento] = useState<Recebimentos[]>([])
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState("");

  const router = useRouter();

  const selecionarTipo = (valor: string) => {
    setTipo(valor === tipo ? null : valor);
  };

  const [mostrarModal, setMostrarModal] = useState(false);
  const [abrirModalBaixa, setAbrirModalBaixa] = useState(false);

  const [ativar, setAtivar] = useState(false);

  useEffect(() => {
    buscarJuros();
  }, []);

  useEffect(() => {
    if (carregado) {
      calcularValorReceber();
    }
  }, [tipo, valorEmprestado, juros]);

  useEffect( () => {
    async function calcular() {
      if(informacoesEmprestimo) {
        const valor = await calcularJurosSeVencido(informacoesEmprestimo);
        setJurosDoVencimento(valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));
      }
    }

    calcular();

  },[informacoesEmprestimo] )

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
      setCarregado(true);

      formasDeRecebimento();

    }
  }, [informacoesEmprestimo] );

  useEffect(() => {
    if (valorRecebimento && jurosDoVencimento) {
      const valorBase = limparValorMonetario(valorRecebimento);
      const valorJuros = limparValorMonetario(jurosDoVencimento);
      const soma = valorBase + valorJuros;

      setValorComJuros(soma.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }));
    }
  }, [valorRecebimento, jurosDoVencimento]);

  // ========== ATUALIZAR O EMPRÉSTIMO ==========

  async function atualizarEmprestimo(e: FormEvent) {

    e.preventDefault();

    if(!dataEmprestimo) return toast.error("Selecione data do empréstimo");
    if(!dataVencimento) return toast.error("Selecione data do vencimento");
    if(!tipo) return toast.error("Selecione o tipo");

    const valorEmprestadoCorreto = limparValorMonetario(valorEmprestado);
    const valorRecebimentoCorreto = limparValorMonetario(valorRecebimento)

    if (isNaN(valorEmprestadoCorreto) || valorEmprestadoCorreto <= 0) {
      return toast.error("Digite o valor do empréstimo");
    }

    if (isNaN(valorRecebimentoCorreto) || valorRecebimentoCorreto <= 0) {
      return toast.error("Digite o valor do recebimento");
    }

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

    alterarAComissaoDoConsultor();

    return true

  }

  // ========== BUSCAR JUROS REFERENTE AO TIPO ==========

  const buscarJuros = async () => {

    const { data, error } = await supabase
      .from("configuracoes_juros")
      .select("tipo_lancamento, tipo_juros, percentual")
      .eq("tipo_juros", "Emprestimo")

    if(error) {
      toast.error("Erro ao buscar juros");
    } else {
      setJuros(data as { tipo_lancamento: string; percentual: number} []);
    }

  }

  const calcularValorReceber = () => {

    const valorLimpo = Number(valorEmprestado.replace(/\D/g, "")) / 100;

    if(!tipo || isNaN(valorLimpo) || valorEmprestado === "") {
      return;
    }

    const jurosSelecionado = juros.find((item) => item.tipo_lancamento === tipo);

    if(!jurosSelecionado) {
      return;
    }

    const percentual = jurosSelecionado.percentual / 100;
    const valorReceber = valorLimpo + valorLimpo * percentual;

    setValorRecebimento(valorReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }));

  }

  // ========== EXCLUIR O EMPRESTIMO E A COMISSAO DO CONSULTOR ==========

  async function deletarEmprestimo() {

    const { error: erroEmprestimo } = await supabase
      .from("contas_receber")
      .delete()
      .eq("id", informacoesEmprestimo.id)

    if(erroEmprestimo) {
      toast.error("Erro ao deletar emprestimo");
      return false;
    }

    const { error: erroComissao } = await supabase
      .from("comissoes_consultores")
      .delete()
      .eq("id_conta_receber", informacoesEmprestimo.id);
      
    if(erroComissao) {
      toast.error("Erro ao deletar Comissão");
      return false;
    }
      
    return true;

  }

  // ========== CALCULAR JUROS DO VENCIMENTO ==========

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
      toast.error("Erro ao buscar percentual de juros");
      return 0;
    }

    const percentualMensal = Number(data.percentual);
    const jurosProporcional = (percentualMensal / 30) * diasAtraso;

    const valorJuros = emprestimo.valor_emprestado * (jurosProporcional / 100);

    return Number(valorJuros.toFixed(2));
    
  }

  // ========== BAIXAR O EMPRÉSTIMO ==========

  async function baixarEmprestimo(e: React.FormEvent) {

    e.preventDefault();

    if(!clienteSelecionado) return toast.error("Selecione um cliente");
    if(!consultorSelecionado) return toast.error("Selecione um consultor");
    if(!dataPagamento.trim()) return toast.error("Selecione uma data de pagamento");
    if(!tipo) return toast.error("Selecione o tipo do lançamento");
    if(!valorEmprestado) return toast.error("Valor emprestado não informado");
    if(!valorRecebimento) return toast.error("Valor de Recebimento não informado");
    if(!recebimentoSelecionado) return toast.error("Selecione uma forma de recebimento");

    setLoading(true);

    let status = "";
    
    const valorRecebimentoCorreto = limparValorMonetario(valorRecebimento);
    const valorJurosVencimentoCorreto = limparValorMonetario(jurosDoVencimento);
    const valorComJurosCorreto = limparValorMonetario(valorComJuros);
    
    let valorTotalRecebido = informacoesEmprestimo.valor_pago + valorComJurosCorreto;

    if (isNaN(valorRecebimentoCorreto) || valorRecebimentoCorreto <= 0) {
      return toast.error("Digite o valor do recebimento");
    }

    console.log(valorRecebimento);
    console.log(valorRecebimentoCorreto);
    console.log(limparValorMonetario(valorComJuros));
    console.log(informacoesEmprestimo.valor_receber);

    if(valorTotalRecebido < informacoesEmprestimo.valor_receber) {
      status = "Pendente";
    } else {
      status = "Pago";
    }

    const { data: contasReceber, error: erroContasReceber } = await supabase  
      .from("contas_receber")
      .update({
        id_cliente: clienteSelecionado.id,
        id_consultor: consultorSelecionado.id,
        tipo_lancamento: tipo,
        cidade: clienteSelecionado.cidade,
        estado: clienteSelecionado.estado,
        valor_pago: valorTotalRecebido,
        data_pagamento_total: dataPagamento,
        descricao: observacoes,
        status: status
      })
      .eq("id", informacoesEmprestimo.id)

    const { data, error } = await supabase
      .from("pagamentos_conta_receber")
      .insert({
        id_conta_receber: informacoesEmprestimo.id,
        data_pagamento: dataPagamento,
        valor_pago: valorComJurosCorreto,
        id_forma_pagamento: recebimentoSelecionado,
        observacao: observacoes,
        juros_pago: valorJurosVencimentoCorreto,
      })
    

    if(erroContasReceber || error) {
      toast.error("Erro ao baixar empréstimo");
      return;
    }

    if(!contasReceber || !data) {
      setLoading(false);
      toast.success("Empréstimo baixado com sucesso");
      router.push("/lancamentos");
    }

    setLoading(false);

  }

  // ========== ALTERAR A COMISSÃO DO CONSULTOR SELECIONADO ==========

  async function alterarAComissaoDoConsultor() {

    const { data:Comissao, error: erroComissao } = await supabase
      .from("consultores")
      .select("comissao_mensal, comissao_semanal, comissao_diaria")
      .eq("id", consultorSelecionado?.id)

    if(erroComissao) {
      console.log("Erro ao lançar alterar Comissão.");
      return;
    }

    if(Comissao && Comissao.length > 0) {

      if(tipo === "Mensal") {

        const calculo = limparValorMonetario(valorEmprestado) *  (Comissao[0].comissao_mensal / 100);

        const { error } = await supabase
          .from("contas_receber")
          .update({
            comissao: calculo
          })
          .eq("id", informacoesEmprestimo.id);

        if(error) {
          toast.error("Erro ao atualizar juros do consultor.");
          return;
        } else {
          window.location.reload();
        }
      } else if (tipo === "Semanal") {
        const calculo = limparValorMonetario(valorEmprestado) *  (Comissao[0].comissao_semanal / 100);

        const { error } = await supabase
          .from("contas_receber")
          .update({
            comissao: calculo
          })
          .eq("id", informacoesEmprestimo.id);

        if(error) {
          toast.error("Erro ao atualizar juros do consultor.");
          return;
        } else {
          window.location.reload();
        }
      } else if (tipo === "Diario") {
        const calculo = limparValorMonetario(valorEmprestado) *  (Comissao[0].comissao_diaria / 100);

        const { error } = await supabase
          .from("contas_receber")
          .update({
            comissao: calculo
          })
          .eq("id", informacoesEmprestimo.id);

        if(error) {
          toast.error("Erro ao atualizar juros do consultor.");
          return;
        } else {
          window.location.reload();
        }
      }
    }
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

        <button onClick={() => setAtivar(!ativar)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Alterar </button>
        
        <button onClick={() => setMostrarModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Deletar </button>

        <button onClick={() => setAbrirModalBaixa(true)} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm cursor-pointer"> Baixar </button>

      </div>

      {/* ========== MOSTRAR TELA DE ALTERAÇÃO ========== */}

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
                      <strong>Consultor:</strong> {consultorSelecionado.nome_completo} (ID: {consultorSelecionado.id})
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
                onChange={ (e) => limiteDataEmprestimo(e, setDataEmprestimo)}
              />
              
            </div>

            <div className="">

              <Label> Data do Vencimento </Label>

              <InputAlterar 
                type="date"
                value={dataVencimento}
                onChange={ (e) => limiteDataVencimento(e, setDataVencimento)}
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
                        onChange={() => selecionarTipo(item)}
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

      {/* ========== MOSTRAR MODAL DE BAIXAR ========== */}

      {abrirModalBaixa && (
      
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4 text-center"> Baixa </h2>

            <form onSubmit={baixarEmprestimo}>

              <div className="mb-3">

                <Label> Buscar Cliente </Label>

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

              <div>

                <Label> Modalidade do Empréstimo </Label>

                <div className="flex gap-4 flex-wrap items-center">
                  {["Mensal", "Semanal", "Diario"].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input
                        className="w-4 h-4 border-2"
                        type="checkbox"
                        checked={tipo === item}
                        onChange={() => selecionarTipo(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>

              </div>

              <div className="mt-2 mb-3">
                <Label> Valor do Empréstimo </Label>
                <InputAlterar 
                  type="text" 
                  value={valorEmprestado}
                  onChange={(e) => mostrarValor(e, setValorEmprestado)}
                  placeholder="R$ 0,00"
                  readOnly
                />
              </div>

              <div className="mb-3">
                <Label> Valor do Juros </Label>
                <InputAlterar 
                  type="text" 
                  value={jurosDoVencimento}
                  onChange={(e) => mostrarValor(e, setJurosDoVencimento)}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="mb-3">
                <Label> Valor do Recebimento </Label>
                <InputAlterar 
                  type="text" 
                  value={valorComJuros}
                  onChange={(e) => mostrarValor(e, setValorComJuros)}
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

              <div className="mb-1">

                <Label> Observação </Label>

                <InputAlterar 
                  type="text"
                  value={observacoes}
                  onChange={ (e) => setObservacoes(e.target.value)}
                />
                
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
            <h2 className="text-xl font-bold mb-4"> Deseja realmente excluir este empréstimo? </h2>

            <p className="mb-4"> Todos os dados relacionados a este empréstimo serão apagados de forma permanente. </p>

            <div className="flex justify-center gap-4">
              <button onClick={async () => {
                const sucesso = await deletarEmprestimo();
                  if (sucesso) {
                    setMostrarModal(false);
                    window.location.href = "/lancamentos";
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