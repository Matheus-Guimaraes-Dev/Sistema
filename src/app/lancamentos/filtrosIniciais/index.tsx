"use client";

import { InputCliente } from "@/app/clientes/componentes/input-cliente";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { limiteCpf, limiteIdCliente, limiteIdDocumento } from "@/funcoes/limitacao";
import { formatarCPF, formatarData } from "@/funcoes/formatacao";
import { FaArrowDown } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import BuscarCliente from "../BuscarClientes";
import { Label } from "@/app/formulario/components/componentes/label";
import BuscarConsultor from "../BuscarConsultor";
import { mostrarValor } from "@/funcoes/formatacao";
import toast from "react-hot-toast";
import { limparValorMonetario } from "@/funcoes/formatacao";
import { cidadesPorEstado } from "@/app/clientes/estados-cidades";
import { Contas, Cliente, Consultor, ConsultorBusca } from "../types";
import { limiteDataEmprestimo, limiteDataVencimento } from "@/funcoes/limitacao";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";

interface ContasPagas {
  id: number,
  valor_pago: number,
  data_pagamento: string,
  formas_pagamento: {
    descricao: string,
  },
  contas_receber: {
    clientes: {
      nome_completo: string,
    },
    consultores: {
      nome_completo: string,
    },
    id: number,
    tipo_lancamento: string
  }
}

export function FiltrosLancamentos() {

  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  
  const [nome, setNome] = useState("");
  const [idCliente, setIdCliente] = useState("");
  const [idDocumento, setIdDocumento] = useState("");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [contas, setContas] = useState<Contas[]>([]);
  const [ordenarValor, setOrdenarValor] = useState("");
  const [erro, setErro] = useState("");
  const [dataEmprestimo, setDataEmprestimo] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [valorEmprestado, setValorEmprestado] = useState("");
  const [valorRecebimento, setValorRecebimento] = useState("");
  const [juros, setJuros] = useState<{ tipo_lancamento: string; percentual: number }[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [filtros, setFiltros] = useState(true);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [consultorSelecionado, setConsultorSelecionado] = useState<Consultor | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [modalidade, setModalidade] = useState("");

  const [consultorFiltro, setConsultorFiltro] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [contasPagas, setContasPagas] = useState<ContasPagas[]>([]);
  const [filtrosCarregados, setFiltrosCarregados] = useState(false);


  const trocarTipo = (valor: string) => {
    setTipo(valor === tipo ? null : valor);
  };

  useEffect(() => {
    const larguraTela = window.innerWidth;

    if (larguraTela >= 640) {
      setFiltros(true);
    } else {
      setFiltros(false); 
    }
  }, []);

  useEffect(() => {
    const hoje = new Date();

    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const formatarData = (data: Date) => {
      return data.toISOString().split("T")[0];
    };

    setDataInicio(formatarData(primeiroDia));
    setDataFim(formatarData(ultimoDia));
  }, []);

  useEffect(() => {
    const statusAtual = localStorage.getItem("status");
    if (statusAtual) {
      setStatus(statusAtual);
    }
  }, []);

  useEffect(() => {
    if (status) {
      localStorage.setItem("status", status);
    }
  }, [status]);

  useEffect(() => {
    const statusSalvo = localStorage.getItem("filtro_status");
    const dataInicioSalva = localStorage.getItem("filtro_data_inicio");
    const dataFimSalva = localStorage.getItem("filtro_data_fim");
    
    if (statusSalvo) setStatus(statusSalvo);
    if (dataInicioSalva) setDataInicio(dataInicioSalva);
    if (dataFimSalva) setDataFim(dataFimSalva);

    // Espera 1 ciclo para garantir atualização
    setTimeout(() => {
      setFiltrosCarregados(true);
    }, 0);
  }, []);



  const [porcentagem, setPorcentagem] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);

  const [abrirModalCadastrar, setAbrirModalCadastrar] = useState(false);

  useEffect(() => {
    if(status === "Pendente") {
       buscarContas();
    } else {
      if (filtrosCarregados) {
        buscarContasPagas();
      }
    }
    buscarJuros();
  }, [paginaAtual, status, filtrosCarregados])

  useEffect(() => {
    calcularValorReceber();
    consultoresBuscando();
  }, [tipo, valorEmprestado, juros]);

  const router = useRouter();
  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];
  
  const itensPorPagina = 5
  const [totalPaginas, setTotalPaginas] = useState(1);

  // ========== BUSCAR E CALCULAR JUROS ==========

  const buscarJuros = async () => {

    const { data, error } = await supabase
      .from("configuracoes_juros")
      .select("tipo_lancamento, tipo_juros, percentual")
      .eq("tipo_juros", "Emprestimo")
    
    if(error) {
      toast.error("Erro ao buscar Juros");
    } else {
      setJuros(data as { tipo_lancamento: string; percentual: number }[]);
    }

  }

  // ========== VALOR A RECEBER ==========

  const calcularValorReceber = () => {
    
    const valorLimpo = Number(valorEmprestado.replace(/\D/g, "")) / 100;

    if (!tipo || !valorLimpo) {
      setValorRecebimento("");
      return;
    }

    const jurosSelecionado = juros.find((item) => item.tipo_lancamento === tipo);

    if (!jurosSelecionado) {
      setValorRecebimento("");
      return;
    }

    const percentual = jurosSelecionado.percentual / 100;
    const valorReceber = valorLimpo + valorLimpo * percentual;

    setValorRecebimento(valorReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  };

  // ========== BUSCAR AS CONTAS PENDENTES ==========

  const buscarContas = async () => {

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina - 1;

    try {
      let query = supabase
        .from("contas_receber")
        .select(`
          id,
          tipo_lancamento,
          valor_emprestado,
          valor_receber,
          data_vencimento,
          data_cadastro,
          clientes:clientes!id_cliente ( id, nome_completo ),
          consultores:consultores!id_consultor ( id, nome_completo )
        `, { count: "exact" });

      // if (id.trim() !== "") {
      //   query = query.eq("id", Number(id));
      // }

      if (status !== "") {
        query = query.eq("status", status);
      }

      if (estado !== "") {
        query = query.eq("estado", estado);
      }

      if (cidade !== "") {
        query = query.eq("cidade", cidade);
      }

      if (data === "asc" || data === "desc") {
        query = query.order("data_cadastro", { ascending: data === "asc" });
      }

      query = query.range(inicio, fim);

      const { data: resultado, error, count } = await query;

      if (error) {
        setErro("Erro ao buscar empréstimos.");
        console.error("Erro Supabase:", error);
      } else {

        let resultadoFiltrado = (resultado || []).map((item) => ({
          ...item,
          clientes: Array.isArray(item.clientes) ? item.clientes[0] : item.clientes,
          consultores: Array.isArray(item.consultores) ? item.consultores[0] : item.consultores,
        }));

        if (nome.trim() !== "") {
          resultadoFiltrado = resultadoFiltrado.filter((item) =>
            item.clientes?.nome_completo?.toLowerCase().includes(nome.trim().toLowerCase())
          );
        }

        setContas(resultadoFiltrado);
        setErro("");

        const total = Math.ceil((count ?? 0) / itensPorPagina);
        setTotalPaginas(total);

      }
      
    } catch (erro) {
        console.error("Erro geral:", erro);
        setErro("Erro inesperado ao buscar constas.");
      }
  };

  // ========== BUSCAR AS CONTAS PAGAS ==========

  async function buscarContasPagas() {

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina -1;

    try {

      let query = supabase
        .from("pagamentos_conta_receber")
        .select(`
        id,
        valor_pago,
        data_pagamento,
        formas_pagamento (
          descricao
        ),
        contas_receber (
          id,
          tipo_lancamento,
          clientes (
            nome_completo
          ),
          consultores (
            nome_completo
          )
        )
      `, { count: "exact" });

      if (idCliente.trim() !== "") {
        const { data: contasRelacionadas, error: erroContas } = await supabase
          .from("contas_receber")
          .select("id")
          .eq("id_cliente", Number(idCliente));

        if (erroContas) {
          toast.error("Erro ao buscar contas do cliente");
          return;
        }

        const ids = contasRelacionadas?.map((item) => item.id) || [];

        if (ids.length > 0) {
          query = query.in("id_conta_receber", ids);
        } else {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }
      }

      if (consultorFiltro.trim() !== "") {
        const { data: contasRelacionadas, error: erroContas } = await supabase
          .from("contas_receber")
          .select("id")
          .eq("id_consultor", Number(consultorFiltro));

        if (erroContas) {
          toast.error("Erro ao buscar contas do cliente");
          return;
        }

        const ids = contasRelacionadas?.map((item) => item.id) || [];

        if (ids.length > 0) {
          query = query.in("id_conta_receber", ids);
        } else {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }
      }

      if (cpf.trim() !== "") {
        const { data: clienteData, error: erroCliente } = await supabase
          .from("clientes")
          .select("id")
          .ilike("cpf", `%${cpf.trim()}%`)

        if (erroCliente || !clienteData?.length) {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }

        const idClienteEncontrado = clienteData[0].id;

        const { data: contasRelacionadas, error: erroContas } = await supabase
          .from("contas_receber")
          .select("id")
          .eq("id_cliente", idClienteEncontrado);

        if (erroContas) {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }

        const ids = contasRelacionadas?.map((item) => item.id) || [];

        if (ids.length > 0) {
          query = query.in("id_conta_receber", ids);
        } else {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }
      }

      if (nome.trim() !== "") {

        const { data: clientesEncontrados, error: erroClientes } = await supabase
          .from("clientes")
          .select("id")
          .ilike("nome_completo", `%${nome.trim()}%`);

        if (erroClientes || !clientesEncontrados?.length) {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }

        const idsClientes = clientesEncontrados.map((item) => item.id);

        const { data: contasRelacionadas, error: erroContas } = await supabase
          .from("contas_receber")
          .select("id")
          .in("id_cliente", idsClientes);

        if (erroContas || !contasRelacionadas?.length) {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }

        const idsContas = contasRelacionadas.map((item) => item.id);

        query = query.in("id_conta_receber", idsContas);
      }

      if (modalidade.trim() !== "") {
        const { data: contasRelacionadas, error: erroContas } = await supabase
          .from("contas_receber")
          .select("id")
          .eq("tipo_lancamento", modalidade);

        if (erroContas) {
          toast.error("Erro ao buscar contas do cliente");
          return;
        }

        const ids = contasRelacionadas?.map((item) => item.id) || [];

        if (ids.length > 0) {
          query = query.in("id_conta_receber", ids);
        } else {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }
      }

      if (idDocumento.trim() !== "") {
        query = query.eq("id_conta_receber", Number(idDocumento));
      }

      if (ordenarValor === "asc" || ordenarValor === "desc") {
        query = query.order("valor_pago", { ascending: ordenarValor === "asc" });
      }

      if (estado.trim() !== "") {
        const { data: contasRelacionadas, error: erroContas } = await supabase
          .from("contas_receber")
          .select("id")
          .eq("estado", estado);

        if (erroContas) {
          toast.error("Erro ao buscar contas do cliente");
          return;
        }

        const ids = contasRelacionadas?.map((item) => item.id) || [];

        if (ids.length > 0) {
          query = query.in("id_conta_receber", ids);
        } else {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }
      }

      if (cidade.trim() !== "") {
        const { data: contasRelacionadas, error: erroContas } = await supabase
          .from("contas_receber")
          .select("id")
          .eq("cidade", cidade);

        if (erroContas) {
          toast.error("Erro ao buscar contas do cliente");
          return;
        }

        const ids = contasRelacionadas?.map((item) => item.id) || [];

        if (ids.length > 0) {
          query = query.in("id_conta_receber", ids);
        } else {
          setContasPagas([]);
          setTotalPaginas(0);
          return;
        }
      }

      if (dataInicio.trim() !== "") {
        query = query.gte("data_pagamento", dataInicio);
      }

      if (dataFim.trim() !== "") {
        query = query.lte("data_pagamento", dataFim);
      }

      query = query.range(inicio, fim);

      const { data, error, count } = await query;

      if (error) {
        toast.error("Erro ao buscar empréstimos pagos");
        return;
      } else {
        const dadosTratados: ContasPagas[] = data.map((item: any) => ({
          ...item,
          contas_receber: {
            ...item.contas_receber,
            clientes: item.contas_receber?.clientes,
            consultores: item.contas_receber?.consultores,
          },
          formas_pagamento: item.formas_pagamento,
        }));

        setContasPagas(dadosTratados);

        const total = Math.ceil((count ?? 0) / itensPorPagina);
        setTotalPaginas(total);

      }

    } catch (erro) {
      console.error("Erro geral:", erro);
    }
  }

  // =========================================

  function detalhes(id: number) {
    router.push(`/lancamentos/${id}`);
  }

  function detalhesPagos(id: number) {
    router.push(`/lancamentos/pagos/${id}`);
  }

  const aplicarFiltro = (e: React.FormEvent) => {
    e.preventDefault();

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (inicio.getTime() > fim.getTime()) {
      toast.error("A data inicial não pode ser maior que a data final.");
      return;
    } 

    setPaginaAtual(1);
    if(status === "Pendente") {
      buscarContas();
    } else {
      console.log("teste");
      console.log("Id do documento", idDocumento)
      console.log("Id cliente", idCliente)
      buscarContasPagas();
    }
  };

  // =========================================

  // ========== CALCULAR COMISSÃO ==========

  const calcularComissao = () => {
    if (!consultorSelecionado || !tipo || !valorEmprestado) {
      return 0;
    }

    const valor = limparValorMonetario(valorEmprestado);

    let percentual = 0;

    if (tipo === "Mensal") {
      percentual = consultorSelecionado.comissao_mensal || 0;
    } else if (tipo === "Semanal") {
      percentual = consultorSelecionado.comissao_semanal || 0;
    } else if (tipo === "Diario") {
      percentual = consultorSelecionado.comissao_diaria || 0;
    }

    return Number((valor * (percentual / 100)).toFixed(2));
  };

  // ========== CADASTRAR NOVO EMPRÉSTIMO ==========

  async function enviarLancamento(e: React.FormEvent) {

    e.preventDefault();

    if(!clienteSelecionado) return toast.error("Selecione um cliente");
    if(!dataEmprestimo) return toast.error("Selecione a data do empréstimo");
    if(!dataVencimento) return toast.error("Selecione a data do vencimento");
    if(!consultorSelecionado) return toast.error("Selecione um consultor");
    if(!tipo) return toast.error("Selecione uma modalidade");
    if(!valorEmprestado) return toast.error("Digite o valor do empréstimo");

    setLoading(true);
    
    const comissaoCalculada = calcularComissao();

    const valorEmprestimoCorreto = limparValorMonetario(valorEmprestado);
    const valorRecebimentoCorreto = limparValorMonetario(valorRecebimento)

    const { data: contaInserida, error: erroEmprestimo } = await supabase  
      .from("contas_receber")
      .insert({
        id_cliente: clienteSelecionado.id,
        id_consultor: consultorSelecionado.id,
        tipo_lancamento: tipo,
        estado: clienteSelecionado.estado,
        cidade: clienteSelecionado.cidade,
        valor_emprestado: valorEmprestimoCorreto,
        valor_receber: valorRecebimentoCorreto,
        data_emprestimo: dataEmprestimo,
        data_vencimento: dataVencimento,
        descricao: observacoes,
        comissao: Number(comissaoCalculada),
      })
      .select("id")
      .single();

     if (erroEmprestimo || !contaInserida) {
      setLoading(false);
      toast.error("Erro ao salvar empréstimo");
      return
    }

    const { error: erroComissao } = await supabase
      .from("comissoes_consultores")
      .insert({
        id_consultor: consultorSelecionado.id,
        id_conta_receber: contaInserida.id,
        valor_comissao: Number(comissaoCalculada),
      })

    if (erroComissao) {
      setLoading(false);
      return toast.error("Erro ao salvar comissão do consultor");
    }

    toast.success("Empréstimo salvo com sucesso");
    if(status === "Pendente") {
      buscarContas();
    }
    setAbrirModalCadastrar(false);
    setPorcentagem("");
    setDataEmprestimo("");
    setDataVencimento("");
    setClienteSelecionado(null);
    setConsultorSelecionado(null);
    setTipo(null);
    setValorEmprestado("");
    setObservacoes("");
    setLoading(false);

  } 

  // ========== APLICAR A COR POR DATA VENCIMENTO ==========

  const corPorData = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento + "T12:00:00");

    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth();
    const anoHoje = hoje.getFullYear();

    const diaVenc = vencimento.getDate();
    const mesVenc = vencimento.getMonth();
    const anoVenc = vencimento.getFullYear();

    if (
      anoVenc < anoHoje ||
      (anoVenc === anoHoje && mesVenc < mesHoje) ||
      (anoVenc === anoHoje && mesVenc === mesHoje && diaVenc < diaHoje)
    ) {
      return "bg-red-300";
    }

    if (
      anoVenc === anoHoje &&
      mesVenc === mesHoje &&
      diaVenc === diaHoje
    ) {
      return "bg-yellow-300";
    }

    return "bg-green-300";
  };

  // ========== BUSCAR CONSULTORES ==========

  async function consultoresBuscando() {

    const { data, error } = await supabase  
      .from("consultores")
      .select("id, nome_completo")
      .eq("status", "Ativo")

    if(error) {
      toast.error("Erro ao buscar consultores");
      return
    }

    if(data) {
      setConsultoresBusca(data);
    }

  }


  return(
    <div className="flex-1">

      <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Lançamentos </h1>

      <AnimatePresence>
        {filtros && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
            onSubmit={aplicarFiltro}
          >
            <div className="bg-white p-4 rounded-xl shadow-md grid gap-4 grid-cols- sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <InputCliente
                type="text"
                placeholder="Buscar por nome do cliente"
                value={nome}
                onChange={ (e) => setNome(e.target.value)}
              />
              <InputCliente
                type="text"
                placeholder="Buscar por ID do cliente"
                inputMode="numeric"
                value={idCliente}
                onChange={ (e) => limiteIdCliente(e, setIdCliente)}
                maxLength={7}
              />
              <InputCliente
                type="text"
                placeholder="Buscar por CPF"
                inputMode="numeric"
                value={cpf}
                onChange={ (e) => limiteCpf(e, setCpf)}
                maxLength={11}
              />
              <InputCliente
                type="text"
                placeholder="Buscar por ID do documento"
                inputMode="numeric"
                value={idDocumento}
                onChange={ (e) => limiteIdDocumento(e, setIdDocumento)}
                maxLength={7}
              />

              <select 
                className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
                value={status}
                onChange={ (e) => setStatus(e.target.value)}
              >
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
              </select>

              <select 
                className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
                value={modalidade}
                onChange={ (e) => setModalidade(e.target.value)}
              >
                <option value=""> Modalidade </option>
                <option value="Mensal">Mensal</option>
                <option value="Semanal">Semanal</option>
                <option value="Diario">Diário</option>
              </select>

                <select 
                  className="w-full h-10 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
                  value={consultorFiltro}
                  onChange={(e) => setConsultorFiltro(e.target.value)}
                >
                  <option value="">Consultor</option>

                  {consultoresBusca.map((info) => (
                    <option key={info.id} value={info.id}>
                      {info.nome_completo}
                    </option>
                  ))}
                </select>

              <select
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value);
                  setCidade(""); 
                }}
                className="w-full h-10 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
              >
                <option value=""> Selecionar Estado... </option>
                {estados.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full h-10 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
              >
                <option value=""> Selecionar Cidade... </option>
                {cidades.map((cidade) => (
                  <option key={cidade} value={cidade}>{cidade}</option>
                ))}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    placeholder="Teste"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full h-10 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full h-10 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                  />
                </div>
              </div>

              <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10"> Atualizar </button>

              <button onClick={() => setAbrirModalCadastrar(true)} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 hidden sm:block"> Lançamento </button>

            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="px-4 sm:hidden mb-4">
        <div onClick={() => setFiltros(!filtros)} className='flex items-center justify-between px-4 gap-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm text-center cursor-pointer py-2 w-full'>
          
          <button type="button" className="text-lg cursor-pointer"> Filtros </button>

          {filtros ? (
            <FaArrowUp size={24} color="FFF" />
          ) : <FaArrowDown size={24} color="FFF" /> }

        </div>

        <div className="mt-4">
          <button onClick={() => setAbrirModalCadastrar(true)} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200"> Lançamento </button>
        </div>

      </div>

      {status === "Pendente" && (
        <div className="bg-white shadow-md overflow-x-auto px-4 mb-4">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="hidden sm:table-cell px-2 py-3 w-10">ID</th>
                <th className="px-2 py-3 w-50">Cliente</th>
                <th className="px-2 py-3 w-50">Consultor</th>
                <th className="px-2 py-3 w-25">Tipo</th>
                <th className="px-2 py-3 w-45">Valor Emprestado</th>
                <th className="px-2 py-3 w-45">Valor a Receber</th>
                <th className="hidden lg:table-cell px-2 py-3 w-45">Data de Vencimento</th>
                <th className="px-2 py-3 text-center w-20"> Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contas && (
                contas.map( (info) => (
                  <tr key={info.id} className={`${corPorData(info.data_vencimento)} border-b-3 border-gray-600`}>
                    <td className="hidden sm:table-cell px-2 py-2"> {info.id} </td>
                    <td className="px-2 py-2 max-w-[120px] sm:max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis"> {info.clientes?.nome_completo || "Sem cliente"} </td>
                    <td className="px-2 py-2 max-w-[90px] sm:max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis"> {info.consultores?.nome_completo || "Sem consultor"} </td>
                    <td className="px-2 py-2"> {info.tipo_lancamento} </td>
                    <td className="px-2 py-2"> {Number(info.valor_emprestado).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })} </td>
                    <td className="px-2 py-2"> {Number(info.valor_receber).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })} </td>
                    <td className="hidden lg:table-cell px-2 py-2"> {formatarData(info.data_vencimento)} </td>
                    <td className="px-4 py-2 flex justify-center">
                      <button onClick={() => detalhes(info.id)} className="text-blue-600 hover:underline cursor-pointer bg-white relative rounded-full w-6 h-6"> <IoIosArrowDroprightCircle className="absolute top-[-4px] right-[-4px]" size={32} /> </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ========== TABELA DE PAGOS ========== */}

      {status === "Pago" && (
        <div className="bg-white shadow-md overflow-x-auto px-4 mb-4">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-blue-700 text-white">
              <tr>
                <th className="hidden sm:table-cell px-2 py-3 w-10">ID</th>
                <th className="px-2 py-3 w-50">Cliente</th>
                <th className="px-2 py-3 w-50">Consultor</th>
                <th className="px-2 py-3 w-25">Tipo</th>
                <th className="px-2 py-3 w-45">Valor Pago</th>
                <th className="hidden lg:table-cell px-2 py-3 w-45">Data de Pagamento</th>
                <th className="px-2 py-3 text-center w-20"> Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contasPagas && (
                contasPagas.map( (info) => (
                  <tr key={info.id}>
                    <td className="hidden sm:table-cell px-2 py-2"> {info.contas_receber?.id}.{info.id} </td>
                    <td className="px-2 py-2 max-w-[120px] sm:max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis"> {info.contas_receber?.clientes?.nome_completo || "Sem cliente"} </td>
                    <td className="px-2 py-2 max-w-[90px] sm:max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis"> {info?.contas_receber?.consultores?.nome_completo || "Sem consultor"} </td>
                    <td className="px-2 py-2"> {info?.contas_receber?.tipo_lancamento} </td>
                    <td className="px-2 py-2"> {Number(info?.valor_pago).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })} </td>
                    <td className="hidden lg:table-cell px-2 py-2"> {formatarData(info?.data_pagamento)} </td>
                    <td className="px-4 py-2 flex justify-center">
                      <button onClick={() => detalhesPagos(info.id)} className="text-blue-600 hover:underline cursor-pointer bg-white relative rounded-full w-6 h-6"> <IoIosArrowDroprightCircle className="absolute top-[-4px] right-[-4px]" size={32} /> </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
        
      <div className="flex gap-4 justify-center items-center mt-4 mb-6">
        <button
          onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaAtual === 1}
          className={`px-4 py-2 rounded text-white 
            ${paginaAtual === 1 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}`}
        >
          Anterior
        </button>

        <span> {paginaAtual} </span>

        <button
          onClick={() => setPaginaAtual((prev) => prev + 1)}
          disabled={paginaAtual >= totalPaginas}
          className={`px-4 py-2 rounded text-white 
            ${paginaAtual >= totalPaginas ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}`}
        >
          Próxima
        </button>
      </div>

      {abrirModalCadastrar && (
      
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4 text-center"> Lançamento </h2>

            <form onSubmit={enviarLancamento}>

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

                <Label> Data do Empréstimo </Label>

                <input 
                  className="w-full h-8 border-2 px-1 border-[#002956] rounded mt-1  focus:outline-[#4b8ed6]"
                  type="date"
                  value={dataEmprestimo}
                  onChange={ (e) => limiteDataEmprestimo(e, setDataEmprestimo)}
                />
                
              </div>

              <div className="mb-3">

                <Label> Data do Vencimento </Label>

                <input 
                  className="w-full h-8 border-2 px-1 border-[#002956] rounded mt-1  focus:outline-[#4b8ed6]"
                  type="date"
                  value={dataVencimento}
                  onChange={ (e) => limiteDataVencimento(e, setDataVencimento)}
                />
                
              </div>

              <div className="mb-3">

                <Label> Buscar Consultor </Label>

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

              <div>

                <Label> Modalidade do Empréstimo </Label>

                <div className="flex gap-4 flex-wrap items-center">
                  {["Mensal", "Semanal", "Diario"].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input
                        className="w-4 h-4 border-2"
                        type="checkbox"
                        checked={tipo === item}
                        onChange={() => trocarTipo(item)}
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
                />
              </div>

              <div className="mb-3">
                <Label> Valor do Recebimento </Label>
                <InputAlterar 
                  type="text" 
                  value={valorRecebimento}
                  onChange={(e) => mostrarValor(e, setValorRecebimento)}
                  placeholder="R$ 0,00"
                  readOnly
                />
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
                    setAbrirModalCadastrar(false);
                    setPorcentagem("");
                    setDataEmprestimo("");
                    setDataVencimento("");
                    setClienteSelecionado(null);
                    setConsultorSelecionado(null);
                    setTipo(null);
                    setValorEmprestado("");
                    setObservacoes("");
                  }} 
                  className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
              </div>

            </form>
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