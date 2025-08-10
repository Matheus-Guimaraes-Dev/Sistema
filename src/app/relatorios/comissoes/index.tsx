"use client"

import { Select } from "@/app/clientes/componentes/select-cliente";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { cidadesPorEstado } from "@/app/clientes/estados-cidades";
import { createClient } from "@/lib/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { InputCliente } from "@/app/clientes/componentes/input-cliente";

interface ConsultorBusca {
  id: number;
  nome_completo: string;
}

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

export default function RelatorioComissoes() {

  const supabase = createClient();

  const [status, setStatus] = useState("");
  const [id, setId] = useState("");
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [comissoes, setComissoes] = useState<Comissoes[]>([])
  const [loading, setLoading] = useState(false);
  const [modalidade, setModalidade] = useState(""); 
  const [statusEmprestimo, setStatusEmprestimo] = useState("");
  const [tipoData, setTipoData] = useState("");
  const [somaComissoes, setSomaComissoes] = useState(0);

  const [consultorFiltro, setConsultorFiltro] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [modalClientes, setModalClientes] = useState(false);

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  async function consultoresBuscando() {

    const { data, error } = await supabase  
      .from("consultores")
      .select("id, nome_completo")
      .eq("status", "Ativo")

    if(error) {
      console.error("Erro ao buscar consultores");
      return
    }

    if(data) {
      setConsultoresBusca(data);
    }

  }

  const buscarComissoes = async () => {

    if (dataInicio === "") return toast.error("Digite a data de início");
    if (dataFim === "") return toast.error("Digite a data de final");
    
    setLoading(true);

    {/* ========== PDF ========== */}

    const generatePdf = async (comissoes: any[], totalDeComissoes: number) => {

      const doc = new jsPDF("portrait", "mm", "a4"); 

      doc.setFontSize(14);
      doc.text("Relatório de Comissões", 105, 15, {align: "center"});

      const cabecalhos = [
        ["ID", "Cliente", "Consultor", "Valor Comissão", "Modalidade", "Status", "Valor a Receber"]
      ];

      const linhas = comissoes.map((comissao) => [
        `${comissao.contas_receber.id}.${comissao.id}`,
        comissao.contas_receber?.clientes?.nome_completo,
        comissao.consultores?.nome_completo,
        formatarEmReais(comissao.valor_comissao),
        comissao.contas_receber?.tipo_lancamento,
        comissao.status,
        formatarEmReais(comissao.contas_receber?.valor_receber)
      ]);

      autoTable(doc, {
        startY: 25,
        head: cabecalhos,
        body: linhas,
        styles: {
          fontSize: 9,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          halign: "left"
        },
        bodyStyles: {
          halign: "left",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { halign: "left", cellWidth: 16 },
          1: { cellWidth: 54 },
          2: { cellWidth: 25 },
          3: { cellWidth: 28 },
          4: { cellWidth: 22 },
          6: { cellWidth: 30, halign: "left" },
        },
        margin: { left: 8, right: 8},
      });

      const posicaoFinal = (doc as any).lastAutoTable.finalY;

      doc.setFontSize(12);
      doc.text(`Total de Comissões: ${formatarEmReais(totalDeComissoes)}`, 8, posicaoFinal + 10);

      doc.save(`comissoes.pdf`);

    }

    try {

      let queryContas = supabase.from("contas_receber").select("id");

      if (nome.trim()) {
        const { data: clientesFiltrados, error: erroClientes } = await supabase
          .from("clientes")
          .select("id")
          .ilike("nome_completo", `%${nome.trim()}%`);

        if(erroClientes) throw new Error("Erro ao buscar clientes pelo nome");

        const idsClientes = clientesFiltrados?.map(c => c.id) ?? [];

        if (idsClientes.length === 0) {
          setComissoes([]);
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
        queryContas = queryContas.eq("status", statusEmprestimo)
      }

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
      if (erroContas) throw new Error("erro ao buscar contas relacionadas");

      const idsContas = contasRelacionadas?.map((c) => c.id ?? []);

      if (idsContas.length === 0 && (consultorFiltro || modalidade || statusEmprestimo || dataInicio || dataFim)) {
        setComissoes([]);
        return;
      }

      let query = supabase
        .from("comissoes_consultores")
        .select(`
          id,
          valor_comissao,
          valor_pago,
          data_pagamento,
          status,
          consultores (id, nome_completo),
          contas_receber (id, tipo_lancamento, status, clientes (nome_completo), valor_receber)  
        `, { count: "exact" })
        .order("id_conta_receber", { ascending: true })

      if (tipoData === "pagamento_comissao" && (dataInicio.trim() || dataFim.trim())) {
        if (dataInicio.trim()) query = query.gte("data_pagamento", dataInicio.trim());
        if (dataFim.trim()) query = query.lte("data_pagamento", dataFim.trim());
      }

      if (idsContas.length > 0) query = query.in("id_conta_receber", idsContas);
      if (id.trim()) query = query.eq("id_conta_receber", Number(id));
      if (status.trim()) query = query.eq("status", status);

      const { data, count, error } = await query;
      if (error) throw new Error("Erro ao buscar comissões");

      const comissoesFormatadas: Comissoes[] = (data || []).map( (item:any) => ({
        id: item.id,
        status: item.status,
        valor_comissao: item.valor_comissao,
        valor_pago: item.valor_pago,
        contas_receber: item.contas_receber,
        consultores: item.consultores,
      }));

      setComissoes(comissoesFormatadas);

      let somaQuery = supabase.from("comissoes_consultores").select("valor_comissao");

      if (idsContas.length > 0) somaQuery.in("id_conta_receber", idsContas);
      if (id.trim()) somaQuery = somaQuery.eq("id_conta_receber", Number(id));
      if (status.trim()) somaQuery = somaQuery.eq("status", status);

      if (tipoData === "pagamento_comissao" && (dataInicio.trim() || dataFim.trim())) {
        if (dataInicio.trim()) somaQuery = somaQuery.gte("data_pagamento", dataInicio.trim());
        if (dataFim.trim()) somaQuery = somaQuery.lte("data_pagamento", dataFim.trim());
      }

      const { data: somaData, error: erroSoma } = await somaQuery;

      let totalComissoes = 0;

      if (erroSoma) {
        toast.error("Erro ao calcular soma das comissões");
      } else {
        totalComissoes = somaData?.reduce((acc, item) => acc + (item.valor_comissao ?? 0), 0) ?? 0;
        setSomaComissoes(totalComissoes);
      }

      if (comissoesFormatadas.length === 0) {
        toast.error("Nenhum resultado encontrado");
        return;
      } else {
        generatePdf(comissoesFormatadas, totalComissoes);
      }

        
    } catch (err) {
        toast.error("Erro inesperado ao buscar comissões");
      } finally {
        setLoading(false);
      }

  }

  function formatarEmReais(valor: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  return (
    <div className=" bg-gray-100">

        <button
          className="flex items-center gap-4 p-6 bg-white rounded-xl shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
          onClick={() => {
            setModalClientes(true);
            consultoresBuscando();
          }}
        > 
          <DollarSign className="w-6 h-6 text-yellow-600" />
          <span className="text-lg font-medium text-gray-700"> Relatório de Comissões </span> 
        </button>
      {modalClientes && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">

            <h2 className="text-xl font-bold mb-4"> Relatório de Comissões </h2>

            <div className="flex flex-col gap-2">

              <InputCliente
                type="text"
                placeholder="Buscar por nome do cliente"
                value={nome}
                onChange={ (e) => setNome(e.target.value)}
              />

              <select 
                className="w-full h-9 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
                value={status}
                onChange={ (e) => setStatus(e.target.value)}
              >
                <option value=""> Status Comissão </option>
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
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full h-9 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                  />
                </div>

                <div>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full h-9 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                  />
                </div>
              </div>

              <select 
                className="w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base mb-4"
                value={consultorFiltro}
                onChange={(e) => setConsultorFiltro(e.target.value)}
              >
                <option value=""> Consultor </option>

                {consultoresBusca.map((info) => (
                  <option key={info.id} value={info.id}>
                    {info.nome_completo}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between gap-4">

              <button onClick={buscarComissoes} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm cursor-pointer"> Gerar </button>

              <button onClick={() => {
                setModalClientes(false);
                setCidade("");
                setConsultorFiltro("");
                setEstado("");
                setDataInicio("");
                setDataFim("");
                setStatus("");
              }} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
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
  );
}
