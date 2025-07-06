"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { limiteCpf, limiteId } from "@/funcoes/limitacao";
import { formatarCPF, formatarData } from "@/funcoes/formatacao";
import { InputCliente } from "@/app/clientes/componentes/input-cliente";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import toast from "react-hot-toast";
import { ConsultorBusca } from "@/app/lancamentos/types";

interface Comissoes {
  id: number;
  status: string;
  valor_comissao: number;
  valor_pago: number;
  contas_receber: {
    id: number;
    tipo_lancamento: string;
  },
  consultores: {
    id: number;
    nome_completo: string;
  }
}

export default function FiltrosETabelas() {

  const supabase = createClient();

  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const [comissoes, setComissoes] = useState<Comissoes[]>([]);

  const [consultorFiltro, setConsultorFiltro] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [filtrosCarregados, setFiltrosCarregados] = useState(false);

  const router = useRouter(); 

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;
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

    if(filtrosCarregados) {
      buscarComissoes();
    }

  }, [paginaAtual, filtrosCarregados])

  useEffect( () => {
    consultoresBuscando();
  }, [])

  useEffect(() => {
    const statusSalvo = localStorage.getItem("filtro_status_comissoes");
    const dataInicioSalva = localStorage.getItem("filtro_data_inicio_comissoes");
    const dataFimSalva = localStorage.getItem("filtro_data_fim_comissoes");

    if (statusSalvo) setStatus(statusSalvo);
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
  }, []);

  useEffect(() => {
    if (status) {
      localStorage.setItem("status_comissoes", status);
    }
  }, [status]);

  async function buscarComissoes() {

    const inicio = (paginaAtual - 1) * itensPorPagina 
    const fim = inicio + itensPorPagina - 1;

    try {

      let query = supabase
        .from("comissoes_consultores")
        .select(`
          id,
          valor_comissao,
          valor_pago,
          data_pagamento,
          status,
          consultores (
            id,
            nome_completo
          ),
          contas_receber (
            id,
            tipo_lancamento
          )
        `, { count: "exact" }); 

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
          setComissoes([]);
          setTotalPaginas(0);
          return;
        }
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
          setComissoes([]);
          setTotalPaginas(0);
          return;
        }
      }

      if(id.trim() !== "") {
        query = query.eq("id_conta_receber", Number(id));
      }

      if(status.trim() !== "") {
        query = query.eq("status", status);
      }

      if (dataInicio.trim() !== "") {
        query = query.gte("data_cadastro", dataInicio);
      }

      if (dataFim.trim() !== "") {
        query = query.lte("data_cadastro", dataFim);
      }
        
      const { count } = await query.range(0,0);
      const total = count ?? 0;

      const inicio = (paginaAtual - 1) * itensPorPagina;
      const fim = inicio + itensPorPagina - 1;

      if(inicio >= total && total > 0) {
        setPaginaAtual(1);
        return;
      }

      query = query.range(inicio, fim);
      const { data, error } = await query;

      if(error) {
        toast.error("Erro ao buscar comissões");
        return;
      } else {
          const comissoesFormatadas: Comissoes[] = data.map((item: any) => ({
            id: item.id,
            status: item.status,
            valor_comissao: item.valor_comissao,
            valor_pago: item.valor_pago,
            contas_receber: item.contas_receber,
            consultores: item.consultores,      
          }));
        setComissoes(comissoesFormatadas);

        const total = Math.ceil((count ?? 0) / itensPorPagina);
        setTotalPaginas(total);

      }


    } catch(error) {
      toast.error("erro inesperado ao buscar comissões");
      return;
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

  return(

    <div className="flex-1">

      <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Relatório de Consultores </h1>

      {/* ========== FILTROS DE PESQUISA ========== */}

      <form onSubmit={aplicarFiltro}>
        <div className="bg-white p-4 rounded-xl shadow-md grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
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
          <InputCliente
            type="text"
            placeholder="Buscar por ID da conta"
            inputMode="numeric"
            value={id}
            onChange={ (e) => limiteId(e, setId)}
            maxLength={7}
          />

          <select 
            className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
            value={status}
            onChange={ (e) => setStatus(e.target.value)}
          >
            <option value="Pendente">Pendente</option>
            <option value="Parcial">Parcial</option>
            <option value="Pago">Pago</option>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="date"
                placeholder="Teste"
                value={dataInicio}
                onChange={handleDataInicioChange}
                className="w-full h-10 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
              />
            </div>

            <div>
              <input
                type="date"
                value={dataFim}
                onChange={handleDataFimChange}
                className="w-full h-10 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
              />
            </div>
          </div>

          <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10"> Atualizar </button>

          <button type="button" onClick={navegarCadastro} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200"> Consultores </button>

        </div>
      </form>

    {/* ========== TABELA DE COMISSOES ========== */}

      <div className="bg-white shadow-md overflow-x-auto px-4 mb-4">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="px-2 py-4 w-10"> ID </th>
              <th className="px-2 py-3 w-50"> Consultor </th>
              <th className="px-2 py-3 w-50"> Valor Comissão </th>
              <th className="px-2 py-3 w-50"> Modalidade </th>
              <th className="px-2 py-3 w-45"> Status </th>
              <th className="px-2 py-3 text-center w-20"> Detalhes </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {comissoes && (
              comissoes.map( (info) => (
                <tr key={info.id} className="border-b-3 border-gray-600">
                  <td className="px-2 py-2"> {info.contas_receber?.id}.{info.id} </td>
                  <td className="px-2 py-2 max-w-[120px]"> {info.consultores?.nome_completo} </td>
                  <td className="px-2 py-2"> {Number(info.valor_comissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })} </td>
                  <td className="px-2 py-2"> {info.contas_receber.tipo_lancamento} </td>
                   <td className="px-2 py-2">
                    <span className={`px-3 py-1 rounded-full text-white font-semibold text-xs 
                      ${info.status === "Pago" ? "bg-green-500" :
                        info.status === "Parcial" ? "bg-[#950DF7]" : info.status === "Pendente" ? "bg-red-500" : "bg-red-500"}`}>
                      {info.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 flex justify-center">
                    <button  onClick={() => detalhesComissoes(info.id)} className="text-blue-600 hover:underline cursor-pointer bg-white relative rounded-full w-6 h-6"> <IoIosArrowDroprightCircle className="absolute top-[-4px] right-[-4px]" size={32} /> </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

    </div>
  )
}