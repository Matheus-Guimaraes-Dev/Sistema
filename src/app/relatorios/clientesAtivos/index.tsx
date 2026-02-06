"use client"

import { Select } from "@/app/clientes/componentes/select-cliente";
import { FileText, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cidadesPorEstado } from "@/app/clientes/estados-cidades";
import { createClient } from "@/lib/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { InputCliente } from "@/app/clientes/componentes/input-cliente";
import { Cliente, Consultor, ConsultorBusca, Contas, Recebimentos } from "@/app/lancamentos/types";
import { limiteCpf, limiteIdCliente, limiteIdDocumento } from "@/funcoes/limitacao";
import { formatarCPF } from "@/funcoes/formatacao";

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

interface ValoresTotais {
  comissao: number,
  emprestado: number,
  receber: number
}

interface ContasPendentes {
  clientes: {
    id: number,
    cpf: string;
    nome_completo: string;
    cidade: string;
    estado: string;
    whatsapp: string;
  },
  consultores: {
    id: number,
    nome_completo: string,
  },
  data_cadastro: string,
  data_vencimento: string,
  id: number,
  tipo_lancamento: string,
  valor_emprestado: number,
  valor_pago: number,
  valor_receber: number,
  comissao: number,
}

export default function ClientesAtivos() {

  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [nome, setNome] = useState("");
  const [idCliente, setIdCliente] = useState("");
  const [idDocumento, setIdDocumento] = useState("");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState("Pendente");
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
  const [verificarIdConsultor, setVerificarIdConsultor] = useState("");

  const [modalEmprestimos, setModalEmprestimos] = useState(false);

  const [consultorFiltro, setConsultorFiltro] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [contasPagas, setContasPagas] = useState<[]>([]);
  const [filtrosCarregados, setFiltrosCarregados] = useState(false);

  const carregado = useRef(false);

  const [totalEmprestado, setTotalEmprestado] = useState(0);
  const [totalReceber, setTotalReceber] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [totalComissao, setTotalComissao] = useState(0);

  const [repetir, setRepetir] = useState(false);
  const [numeroVezes, setNumerosVezes] = useState(0);
  const [intervaloDias, setIntervaloDias] = useState(0);

  const [selecionadosPendentes, setSelecionadosPendentes] = useState<number[]>([]);
  const [selecionadosPagos, setSelecionadosPagos] = useState<{ contasReceber: number, lancamentoPago: number, valorPago: number }[]>([]);
  const [dataRecebimento, setDataRecebimento] = useState("");

  const [formasRecebimento, setFormasRecebimento] = useState<Recebimentos[]>([])
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState("");

  const [abrirModalBaixa, setAbrirModalBaixa] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [tipoData, setTipoData] = useState("emprestimo");

  const [ordemDataCrescente, setOrdemDataCrescente] = useState("");
  
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

  const buscarEmprestimosPendentes = async () => {

    if (dataInicio === "") return toast.error("Digite a data de início");
    if (dataFim === "") return toast.error("Digite a data de final");
    
    setLoading(true);

    {/* ========== PDF ========== */}

    const generatePdf = async (data: ContasPendentes[]) => {

      const doc = new jsPDF("portrait", "mm", "a4"); 

      doc.setFontSize(14);
      doc.text("Relatório de Clientes Ativos", 105, 15, {align: "center"});

      const cabecalhos = [
        ["ID", "Cliente", "CPF", "Cidade", "Estado", "Whatsapp"]
      ];

    const clientesUnicos = Array.from(
      new Map(data.map(item => [item.clientes.id, item.clientes])).values()
    );

      console.log(clientesUnicos)

      console.log(data);

      const linhas = clientesUnicos.map((lancamento) => [
        lancamento?.id,
        lancamento?.nome_completo,
        lancamento?.cpf ? formatarCPF(lancamento?.cpf) : "",
        lancamento?.cidade,
        lancamento?.estado,
        lancamento?.whatsapp
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
          0: { halign: "left", cellWidth: 12 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30 },
          3: { cellWidth: 34 },
          4: { cellWidth: 30 },
          6: { cellWidth: 30, halign: "left" },
        },
        margin: { left: 8, right: 8},
      });

     autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      body: [
        [{ content: `Total de Clientes: ${clientesUnicos.length}` }],

      ],
      theme: "plain",
      styles: { fontSize: 12,  cellPadding: { top: 2, bottom: 2 }, halign: "left" },
      margin: { left: 8, right: 8 },
    });

      doc.save(`clientesAtivos.pdf`);

    }

    setLoading(true);

    try {

      let query = supabase
        .from("contas_receber")
        .select(`
          id,
          clientes:clientes!id_cliente ( id, nome_completo, cpf, cidade, estado, whatsapp ),
          consultores:consultores!id_consultor ( id, nome_completo )
        `, { count: "exact" });

        if (consultorFiltro.trim() !== "") {
          query = query.eq("id_consultor", consultorFiltro);
        }
      
      if (modalidade.trim() !== "") {
        query = query.eq("tipo_lancamento", modalidade);
      }

      if (idDocumento.trim() !== "") {
        query = query.eq("id", Number(idDocumento));
      }

      if (estado.trim() !== "") {
        query = query.eq("estado", estado.toLocaleUpperCase());
      }

      if (cidade.trim() !== "") {
        query = query.eq("cidade", cidade.toLocaleUpperCase());
      }

      if (dataInicio.trim() || dataFim.trim()) {
        let colunaData = "data_emprestimo";

        if (tipoData === "vencimento") {
          colunaData = "data_vencimento";
        }

        if (dataInicio.trim()) query = query.gte(colunaData, dataInicio);
        if (dataFim.trim()) query = query.lte(colunaData, dataFim);
      }

      // =============================================================

      const { data: somaData, error: erroSoma } = await query;


      if (erroSoma) {
        toast.error("Erro ao calcular soma das comissões");
      } else {
      //  
      }

      const { data, error } = await query;

      const emprestimoFormatado: ContasPendentes[] = (data || []).map( (item:any) => ({
        id: item.id,
        data_cadastro: item.data_cadastro,
        data_vencimento: item.data_vencimento,
        tipo_lancamento: item.tipo_lancamento,
        valor_emprestado: item.valor_emprestado,
        valor_receber: item.valor_receber,
        valor_pago: item.valor_pago,
        consultores: item.consultores,
        clientes: item.clientes,
        comissao: item.comissao
      }));

      generatePdf(emprestimoFormatado)

      setLoading(false);

    } catch(err) {
      console.log("Erro: ", err)
    }
 

  }

  return (
    <div className=" bg-gray-100">

      <button
        className="flex items-center gap-4 p-6 bg-white rounded-xl shadow hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
        onClick={() => {
          consultoresBuscando();
          setModalEmprestimos(true);
        }}
      > 
        <Users className="w-6 h-6 text-green-600" /> 

        <span className="text-lg font-medium text-gray-700"> Clientes Ativos </span> 
      </button>
      {modalEmprestimos && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">

            <h2 className="text-xl font-bold mb-4"> Relatório de Clientes Ativos </h2>

            <div className="flex flex-col gap-2">

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
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value);
                  setCidade(""); 
                }}
                className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
              >
                <option value=""> Selecionar Estado... </option>
                {estados.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
              >
                <option value=""> Selecionar Cidade... </option>
                {cidades.map((cidade) => (
                  <option key={cidade} value={cidade}>{cidade}</option>
                ))}
              </select>

              <select 
                className="w-full h-9 border-2 border-[#002956] rounded  focus:outline-[#9eb0c4] text-sm sm:text-base"
                value={tipoData}
                onChange={ (e) => setTipoData(e.target.value)}
              >
                <option value="emprestimo"> Data Empréstimo </option>
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={ (e) => setDataInicio(e.target.value) }
                      className="w-full h-9 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value) }
                      className="w-full h-9 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                    />
                  </div>
                </div>


            </div>

            <div className="flex justify-between gap-4">

              <button onClick={buscarEmprestimosPendentes} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md text-sm cursor-pointer"> Gerar </button>

              <button onClick={() => {
                setModalEmprestimos(false);
                setCidade("");
                setConsultorFiltro("");
                setEstado("");
                setDataInicio("");
                setDataFim("");
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
