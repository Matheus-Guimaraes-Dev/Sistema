"use client"

import { Select } from "@/app/clientes/componentes/select-cliente";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { cidadesPorEstado } from "@/app/clientes/estados-cidades";
import { createClient } from "@/lib/client";
import jsPDF from "jspdf";

interface ConsultorBusca {
  id: number;
  nome_completo: string;
}

interface Clientes {
  cidade: string;
  estado: string;
  nome_completo: string;
  status: string;
  data_cadastro: string;
  cpf: string;
  id: number;
}

export default function RelatorioClientes() {

  const supabase = createClient();

  const [status, setStatus] = useState("");
  const [data, setData] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [clientes, setClientes] = useState<Clientes[]>([])
  const [loading, setLoading] = useState(false);
 
  const [consultorFiltro, setConsultorFiltro] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [modalClientes, setModalClientes] = useState(false);

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  useEffect( () => {
    consultoresBuscando();
  }, [])

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

  const buscarClientes = async () => {

    setLoading(true);

    try {
      let query = supabase
        .from("clientes")
        .select("id, nome_completo, cpf, estado, cidade, status, data_cadastro", { count: "exact" });

      if (status !== "") {
        query = query.eq("status", status);
      }

      if (consultorFiltro.trim() !== "") {
        query = query.eq("id_consultor", consultorFiltro);
      }

      if (estado !== "") {
        query = query.eq("estado", estado);
      }

      if (cidade !== "") {
        query = query.eq("cidade", cidade);
      }

      if (dataInicio.trim()) query = query.gte("data_cadastro", dataInicio);
      if (dataFim.trim()) query = query.lte("data_cadastro", dataFim);

      const { data: resultado, count, error } = await query;

      if (error) {
        console.error("Erro Supabase:", error);
        return;
      }

      console.log(resultado);
      setClientes(resultado);
      generatePdf()

      setLoading(false);

    } catch (erro) {
      console.error("Erro geral:", erro);
    }

  };
  
  const statusOptions = [
    { label: "Pendente", value: "Pendente" },
    { label: "Em Análise", value: "Análise" },
    { label: "Autorizado", value: "Autorizado" },
    { label: "Cancelado", value: "Cancelado" }
  ];

  {/* ========== PDF ========== */}

  const generatePdf = async () => {

    const doc = new jsPDF("portrait", "mm", "a4"); 

    doc.text("teste", 10, 10);

    doc.save(`clientes.pdf`);

  }

  return (
    <div className=" bg-gray-100">

        <button
          className="flex items-center gap-4 p-6 bg-white rounded-xl shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
          onClick={() => setModalClientes(true)}
        > 
          <Users className="w-6 h-6 text-blue-600" /> 
          <span className="text-lg font-medium text-gray-700"> Relatório de Clientes </span> 
        </button>

      {modalClientes && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Relatório de Clientes </h2>

            <Select 
              value={status}
              onChange={setStatus}
              options={statusOptions}
              placeholder="Status do Cliente"
            />

            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setCidade(""); 
              }}
              className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6] my-4"
            >
              <option value=""> Selecionar Estado... </option>
              {estados.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>

            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6] mb-4"
            >
              <option value=""> Selecionar Cidade... </option>
              {cidades.map((cidade) => (
                <option key={cidade} value={cidade}>{cidade}</option>
              ))}
            </select>

            <p className="text-left mt-[-8px]"> Data Cadastro </p>

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
              className="w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base my-4"
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

            <div className="flex justify-between gap-4">

              <button onClick={buscarClientes} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm cursor-pointer"> Gerar </button>

              <button onClick={() => setModalClientes(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
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
