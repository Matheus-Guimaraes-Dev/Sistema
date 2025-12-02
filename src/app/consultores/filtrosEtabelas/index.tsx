"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { limiteCpf, limiteDataPagamento, limiteId } from "@/funcoes/limitacao";
import { formatarCPF, formatarData } from "@/funcoes/formatacao";
import { InputCliente } from "@/app/clientes/componentes/input-cliente";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import toast from "react-hot-toast";
import { ConsultorBusca } from "@/app/lancamentos/types";
import { Recebimentos } from "@/app/lancamentos/types";
import { Label } from "@/app/formulario/components/componentes/label";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";

interface Comissoes {
  id: number;
  status: string;
  valor_comissao: number;
  valor_pago: number;
  contas_receber: {
    id: number;
    tipo_lancamento: string;
    clientes: {
      nome_completo: string;
    }
  },
  consultores: {
    id: number;
    nome_completo: string;
  }
}

interface Selecionado {
  comissaoId: number;
  contaId: number;
}

export default function FiltrosETabelas() {

  const supabase = createClient();

  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [statusEmprestimo, setStatusEmprestimo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [nome, setNome] = useState("");

  const [comissoes, setComissoes] = useState<Comissoes[]>([]);

  const [consultorFiltro, setConsultorFiltro] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [filtrosCarregados, setFiltrosCarregados] = useState(false);

  const [somaComissoes, setSomaComissoes] = useState(0);

  const [loading, setLoading] = useState(false);

  const [selecionados, setSelecionados] = useState<{ comissaoId: number, contaId: number }[]>([]);

  const [dataPagamento, setDataPagamento] = useState("");

  const [tipoData, setTipoData] = useState("");

  const [formasRecebimento, setFormasRecebimento] = useState<Recebimentos[]>([])
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState("");

  const [abrirModalBaixa, setAbrirModalBaixa] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [marcarTodos, setMarcarTodos] = useState(false); 

  const router = useRouter(); 

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 200;
  const [totalPaginas, setTotalPaginas] = useState(1);

  const handleDataInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDataInicio(valor);
    localStorage.setItem("filtro_data_inicio_comissoes", valor);
  };

  const handleDataFimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDataFim(valor);
    localStorage.setItem("filtro_data_fim_comissoes", valor);
  };

  useEffect( () => {
    formasDeRecebimento();
  }, [])

  useEffect( () => {

    if(filtrosCarregados) {
      buscarComissoes();
    }

    setSelecionados([]);

  }, [paginaAtual, filtrosCarregados, status])

  useEffect( () => {
    consultoresBuscando();
  }, [])

  useEffect(() => {

    const dataInicioSalva = localStorage.getItem("filtro_data_inicio_comissoes");
    const dataFimSalva = localStorage.getItem("filtro_data_fim_comissoes");

    if (dataInicioSalva) setDataInicio(dataInicioSalva);
    if (dataFimSalva) setDataFim(dataFimSalva);

    setTimeout(() => {
      setFiltrosCarregados(true);
    }, 0);
    
  }, []);

  useEffect(() => {
    const statusAtual = localStorage.getItem("status_comissoes");
    if (statusAtual) {
      setStatus(statusAtual);
    }

    const modalidadeAtual = localStorage.getItem("modalidade_comissoes");
    if (modalidadeAtual) {
      setModalidade(modalidadeAtual);
    }

    const consultorAtual = localStorage.getItem("consultorSelecionado");
    if (consultorAtual) {
      setConsultorFiltro(consultorAtual);
    }

    const statusEmprestimoAtual = localStorage.getItem("status_emprestimo_comissoes");
    if (statusEmprestimoAtual) {
      setStatusEmprestimo(statusEmprestimoAtual);
    }

    const idAtual = localStorage.getItem("id_conta_comissoes");
    if (idAtual) {
      setId(idAtual);
    }

    const nomeAtual = localStorage.getItem("nome_cliente_comissoes_consultores");
    if (nomeAtual) {
      setNome(nomeAtual);
    }

    const tipoDataAtual = localStorage.getItem("tipo_data_comissoes");
    if (tipoDataAtual) {
      setTipoData(tipoDataAtual);
    }

  }, []);

  useEffect(() => {
    
    if (status) {
      localStorage.setItem("status_comissoes", status);
    }

    localStorage.setItem("modalidade_comissoes", modalidade)

    localStorage.setItem("consultorSelecionado", consultorFiltro);

    localStorage.setItem("status_emprestimo_comissoes", statusEmprestimo);

    localStorage.setItem("id_conta_comissoes", id);

    localStorage.setItem("nome_cliente_comissoes_consultores", nome);

    localStorage.setItem("tipo_data_comissoes", tipoData);

  }, [status, modalidade, consultorFiltro, statusEmprestimo, id, nome, tipoData]);

async function buscarComissoes() {
  setLoading(true);

  try {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina - 1;

    // =========================================
    // 1️⃣ Buscar IDs de contas_receber filtradas primeiro
    let queryContas = supabase.from("contas_receber").select("id");

    // 🔹 Filtro por nome do cliente
    if (nome.trim()) {
      const { data: clientesFiltrados, error: erroClientes } = await supabase
        .from("clientes")
        .select("id")
        .ilike("nome_completo", `%${nome.trim()}%`);

      if (erroClientes) throw new Error("Erro ao buscar clientes pelo nome");

      const idsClientes = clientesFiltrados?.map(c => c.id) ?? [];

      if (idsClientes.length === 0) {
        setComissoes([]);
        setTotalPaginas(0);
        setSomaComissoes(0);
        return;
      }

      queryContas = queryContas.in("id_cliente", idsClientes);
    }

    if (consultorFiltro.trim()) {
      queryContas = queryContas.eq("id_consultor", Number(consultorFiltro));
    }

    if (modalidade.trim()) {
      queryContas = queryContas.eq("tipo_lancamento", modalidade);
    }

    if (statusEmprestimo.trim()) {
      queryContas = queryContas.eq("status", statusEmprestimo);
    }

    // 🔹 Filtro de datas dinâmico
    if ((dataInicio.trim() || dataFim.trim()) && tipoData !== "pagamento_comissao") {

      let colunaData = "data_emprestimo";
      if (tipoData === "pagamento") {
        colunaData = "data_pagamento_total";
        queryContas = queryContas.eq("status", "Pago");
      }

      if (dataInicio.trim()) queryContas = queryContas.gte(colunaData, dataInicio);
      if (dataFim.trim()) queryContas = queryContas.lte(colunaData, dataFim);

    }

    const { data: contasRelacionadas, error: erroContas } = await queryContas;
    if (erroContas) throw new Error("Erro ao buscar contas relacionadas");

    const idsContas = contasRelacionadas?.map((c) => c.id) ?? [];

    // 🔹 Se não houver contas filtradas, limpa e retorna
    if (idsContas.length === 0 && (consultorFiltro || modalidade || statusEmprestimo || dataInicio || dataFim)) {
      setComissoes([]);
      setTotalPaginas(0);
      setSomaComissoes(0);
      return;
    }

    // =========================================
    // 2️⃣ Query principal de comissões
    let query = supabase
      .from("comissoes_consultores")
      .select(`
        id,
        valor_comissao,
        valor_pago,
        data_pagamento,
        status,
        consultores (id, nome_completo),
        contas_receber (id, tipo_lancamento, status, clientes (nome_completo))
      `, { count: "exact" })
      .order("id_conta_receber", { ascending: true })
      .range(inicio, fim);

    if (tipoData === "pagamento_comissao" && (dataInicio.trim() || dataFim.trim())) {
      if (dataInicio.trim()) query = query.gte("data_pagamento", dataInicio.trim());
      if (dataFim.trim()) query = query.lte("data_pagamento", dataFim.trim());
    }

    if (idsContas.length > 0) query = query.in("id_conta_receber", idsContas);
    if (id.trim()) query = query.eq("id_conta_receber", Number(id));
    if (status.trim()) query = query.eq("status", status);

    const { data, count, error } = await query;
    if (error) throw new Error("Erro ao buscar comissões");

    const comissoesFormatadas: Comissoes[] = (data || []).map((item: any) => ({
      id: item.id,
      status: item.status,
      valor_comissao: item.valor_comissao,
      valor_pago: item.valor_pago,
      contas_receber: item.contas_receber,
      consultores: item.consultores,
    }));

    setComissoes(comissoesFormatadas);
    setTotalPaginas(Math.ceil((count ?? 0) / itensPorPagina));

    // =========================================
    // 3️⃣ Calcular soma das comissões usando os mesmos filtros
    let somaQuery = supabase.from("comissoes_consultores").select("valor_comissao");

    if (idsContas.length > 0) somaQuery = somaQuery.in("id_conta_receber", idsContas);
    if (id.trim()) somaQuery = somaQuery.eq("id_conta_receber", Number(id));
    if (status.trim()) somaQuery = somaQuery.eq("status", status);

    if (tipoData === "pagamento_comissao" && (dataInicio.trim() || dataFim.trim())) {
      if (dataInicio.trim()) somaQuery = somaQuery.gte("data_pagamento", dataInicio.trim());
      if (dataFim.trim()) somaQuery = somaQuery.lte("data_pagamento", dataFim.trim());
    }

    const { data: somaData, error: erroSoma } = await somaQuery;

    if (erroSoma) {
      toast.error("Erro ao calcular soma das comissões");
    } else {
      const totalComissoes = somaData?.reduce((acc, item) => acc + (item.valor_comissao ?? 0), 0) ?? 0;
      setSomaComissoes(totalComissoes);
    }

  } catch (err: any) {
    toast.error(err.message || "Erro inesperado ao buscar comissões");
  } finally {
    setLoading(false);
  }
}


  const aplicarFiltro = (e:React.FormEvent) => {
    e.preventDefault();

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (inicio.getTime() > fim.getTime()) {
      toast.error("A data inicial não pode ser maior que a data final.");
      return;
    } 

    setPaginaAtual(1);

    buscarComissoes();

  }

  // ========== BUSCAR CONSULTORES ==========

  async function consultoresBuscando() {

    const { data, error } = await supabase  
      .from("consultores")
      .select("id, nome_completo")
      .eq("status", "Ativo")

    if(error) {
      setLoading(false);
      toast.error("Erro ao buscar consultores");
      return
    }

    if(data) {
      setConsultoresBusca(data);
    }

  }

  function navegarCadastro() {
    router.push("/consultores/listaConsultores");
  }

  function detalhesComissoes(id: number) {
    router.push(`consultores/comissoesDetalhes/${id}`);
  }

// ==========================================================

  async function baixarMultiplasComissoes(e: React.FormEvent) {
    
    e.preventDefault();

    if (selecionados.length === 0) return toast.error("Nenhuma comissão selecionada");
    if (!dataPagamento.trim()) return toast.error("Selecione uma data de pagamento");
    if (!recebimentoSelecionado) return toast.error("Selecione uma forma de recebimento");

    setLoading(true);

    const erros: string[] = [];

    for (const { comissaoId, contaId } of selecionados) {
      const { data: comissao, error: erroComissao } = await supabase
        .from("comissoes_consultores")
        .select("id, valor_comissao")
        .eq("id", comissaoId)
        .single();

      if (erroComissao || !comissao) {
        setLoading(false);
        erros.push(`Erro ao buscar comissão ${comissaoId}`);
        continue;
      }

      const valorPago = comissao.valor_comissao ?? 0;
      const status = valorPago === 0 ? "Pendente" : "Pago";

      const { error: erroUpdateComissao } = await supabase
        .from("comissoes_consultores")
        .update({
          valor_pago: valorPago,
          data_pagamento: dataPagamento,
          status: status,
          id_forma_pagamento: recebimentoSelecionado,
        })
        .eq("id", comissaoId);

      const { error: erroUpdateConta } = await supabase
        .from("contas_receber")
        .update({
          status_comissao: status,
        })
        .eq("id", contaId);

      if (erroUpdateComissao || erroUpdateConta) {
        erros.push(`Erro ao atualizar comissão ${comissaoId}`);
      }
    }

    setLoading(false);

    if (erros.length > 0) {
      setLoading(false);
      toast.error("Algumas comissões não foram atualizadas:\n" + erros.join("\n"));
    } else {
      toast.success("Todas as comissões foram pagas com sucesso!");
      buscarComissoes();
      setSelecionados([]);
      setMarcarTodos(false);
      setRecebimentoSelecionado("");
      setDataPagamento("");
      setAbrirModalBaixa(false);
    }
  }

  // ====================================

  async function estornarMultiplasComissoes(e: React.FormEvent) {
    e.preventDefault();

    if (selecionados.length === 0) return toast.error("Nenhuma comissão selecionada");

    setLoading(true);

    const erros: string[] = [];

    const dadosAtualizadosComissoes = {
      valor_pago: 0,
      id_forma_pagamento: null,
      status: "Pendente",
    };

    for (const item of selecionados) {
      const { comissaoId, contaId } = item;

      const { error: erroEstornoConta } = await supabase
        .from("contas_receber")
        .update({ status_comissao: "Pendente" })
        .eq("id", contaId);

      const { error: erroEstornoComissao } = await supabase
        .from("comissoes_consultores")
        .update(dadosAtualizadosComissoes)
        .eq("id", comissaoId);

      if (erroEstornoConta || erroEstornoComissao) {
        erros.push(`Erro ao estornar comissão ${comissaoId}`);
      }
    }

    setLoading(false);

    if (erros.length > 0) {
      setLoading(false);
      toast.error("Algumas comissões não foram estornadas:\n" + erros.join("\n"));
    } else {
      toast.success("Todas as comissões foram estornadas com sucesso!");
    }

    buscarComissoes();
    setSelecionados([]);
    setMarcarTodos(false);
    setMostrarModal(false);
  }

  // ====================================

  function boxSelecionado(comissaoId: number, contaId: number) {
    setSelecionados((prev) => {
      const existe = prev.find((item) => item.comissaoId === comissaoId);
      if (existe) {
        return prev.filter((item) => item.comissaoId !== comissaoId);
      } else {
        return [...prev, { comissaoId, contaId }];
      }
    });
  }

  
  const valorTotalSelecionado = useMemo(() => {
    return comissoes
      .filter((item) =>
        selecionados.some((sel) => sel.comissaoId === item.id)
      )
      .reduce((soma, item) => soma + (item.valor_comissao ?? 0), 0);
  }, [comissoes, selecionados]);

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

  useEffect( () => {
    selecionarTodosPendentes();
  }, [marcarTodos])

  function selecionarTodosPendentes() {

    const marcados: any = [];

    comissoes.map( (item) => {
      marcados.push({comissaoId: item.id, contaId: item.contas_receber.id})
    })
    
    if (marcarTodos) {
      setSelecionados(marcados);
    } else {
      setSelecionados([]);
    }
    
  }

  return(

    <div className="flex-1">

      <div className="min-h-screen flex flex-col">

        <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Relatório de Consultores </h1>

        {/* ========== FILTROS DE PESQUISA ========== */}

        <form onSubmit={aplicarFiltro}>
          <div className="bg-white p-4 rounded-xl shadow-md grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <select 
              className="w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
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

            <InputCliente
              type="text"
              placeholder="Buscar por nome do cliente"
              value={nome}
              onChange={ (e) => setNome(e.target.value)}
            />

            <InputCliente
              type="text"
              placeholder="Buscar por ID da conta"
              inputMode="numeric"
              value={id}
              onChange={ (e) => limiteId(e, setId)}
              maxLength={7}
            />

            <select 
              className="w-full h-9 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
              value={status}
              onChange={ (e) => setStatus(e.target.value)}
            >
              <option value="Pendente">Pendente</option>
              <option value="Parcial">Parcial</option>
              <option value="Pago">Pago</option>
            </select>

            <select 
              className="w-full h-9 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
              value={modalidade}
              onChange={ (e) => setModalidade(e.target.value)}
            >
              <option value=""> Modalidade </option>
              <option value="Mensal">Mensal</option>
              <option value="Semanal">Semanal</option>
              <option value="Diario">Diário</option>
            </select>

            <select 
              className="w-full h-9 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
              value={statusEmprestimo}
              onChange={ (e) => setStatusEmprestimo(e.target.value)}
            >
              <option value=""> Status do Emprestimo </option>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
            </select>

            <select 
              className="w-full h-9 border-2 border-[#002956] rounded  focus:outline-[#9eb0c4] text-sm sm:text-base"
              value={tipoData}
              onChange={ (e) => setTipoData(e.target.value)}
            >
              <option value="emprestimo"> Data Empréstimo </option>
              <option value="pagamento"> Data Pagamento - Empréstimo </option>
              <option value="pagamento_comissao"> Data Pagamento - Comissão </option>

            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  placeholder="Teste"
                  value={dataInicio}
                  onChange={handleDataInicioChange}
                  className="w-full h-9 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                />
              </div>

              <div>
                <input
                  type="date"
                  value={dataFim}
                  onChange={handleDataFimChange}
                  className="w-full h-9 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                />
              </div>
            </div>

            <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-9"> Atualizar </button>

            <button type="button" onClick={navegarCadastro} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-9 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200"> Consultores </button>

          </div>
        </form>

      {/* ========== TABELA DE COMISSOES ========== */}

        <div className="bg-white shadow-md overflow-x-auto px-4 mb-4 flex-1">
          <div className="max-h-[400px] overflow-y-auto relative">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-blue-700 text-white sticky top-0 z-10">
                <tr>
                  <th className="w-1"> </th>
                  <th className="px-4 py-3 w-20">ID</th>
                  <th className="px-4 py-3 w-40">Cliente</th>
                  <th className="px-4 py-3 w-40">Consultor</th>
                  <th className="px-4 py-3 w-40">Valor Comissão</th>
                  <th className="px-4 py-3 w-32">Modalidade</th>
                  <th className="px-4 py-3 w-32">Status</th>
                  <th className="px-4 py-3 text-center w-20">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comissoes?.map((info) => (
                  <tr key={info.id} className="border-b border-gray-300">
                    <td>
                      <input
                        type="checkbox"
                        checked={selecionados.some((item) => item.comissaoId === info.id)}
                        onChange={() => boxSelecionado(info.id, info.contas_receber.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-2">{info.contas_receber?.id}.{info.id}</td>
                    <td className="px-4 py-2 max-w-[120px] sm:max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">{info.contas_receber?.clientes?.nome_completo}</td>
                    <td className="px-4 py-2">{info.consultores?.nome_completo}</td>
                    <td className="px-4 py-2">
                      {Number(info.valor_comissao).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="px-4 py-2">{info.contas_receber.tipo_lancamento}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-white font-semibold text-xs 
                        ${info.status === "Pago" ? "bg-green-500"
                          : info.status === "Parcial" ? "bg-[#950DF7]"
                          : "bg-red-500"}`}>
                        {info.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex justify-center">
                      <button
                        onClick={() => detalhesComissoes(info.id)}
                        className="text-blue-600 hover:underline cursor-pointer bg-white relative rounded-full w-6 h-6"
                      >
                        <IoIosArrowDroprightCircle
                          className="absolute top-[-4px] right-[-4px]"
                          size={32}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="absolute top-3 left-2 z-10">
              <input
                type="checkbox"
                checked={marcarTodos}
                onChange={() => { 
                  setMarcarTodos(!marcarTodos);
                }}
                className="w-4 h-4 z-1"
              />
            </div>

          </div>
        </div>

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

        <div className="px-4 mb-4 flex gap-2 justify-between">

          {status === "Pendente" && (
            <button onClick={() => setAbrirModalBaixa(true)} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm cursor-pointer"> Baixar </button>
          )}

          {(status === "Pago" || status === "Parcial") && (
            <button onClick={() => setMostrarModal(true)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Estornar </button>
          )}

          {valorTotalSelecionado > 0 && (
            <div className="mt-4 text-right font-semibold text-lg">
              Total selecionado:{" "}
              {valorTotalSelecionado.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 px-4 py-3 bg-white border-t border-gray-200 shadow-sm rounded-b-md">
          <div className="text-sm sm:text-base font-medium text-gray-700">
            <span className="text-gray-600">Soma das comissões:</span> 
            <span className="text-blue-700 font-semibold ml-2">
              {somaComissoes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

      </div>

      {/* ========== MODAL DE BAIXA ========== */}

      {abrirModalBaixa && (
            
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4 text-center"> Baixa </h2>

            <form onSubmit={baixarMultiplasComissoes}>

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
                  value={valorTotalSelecionado.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                  placeholder="R$ 0,00"
                  readOnly 
                />
              </div>

              <div className="mb-3">
                <Label> Forma de Pagamento </Label>

                <select 
                  className="w-full h-8 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
                  value={recebimentoSelecionado}
                  onChange={(e) => setRecebimentoSelecionado(e.target.value)}
                >
                  <option value="">Selecione a forma de pagamento</option>

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
                    setDataPagamento("");
                    setRecebimentoSelecionado("");
                    setAbrirModalBaixa(false);
                  }} 
                  className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========== MODAL DE ESTORNAR ========== */}

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente estornar esse lançamento? </h2>

            <div className="flex justify-center gap-4">
              <button onClick={estornarMultiplasComissoes}
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