"use client"

import { Select } from "@/app/clientes/componentes/select-cliente";
import { FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cidadesPorEstado } from "@/app/clientes/estados-cidades";
import { createClient } from "@/lib/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { InputCliente } from "@/app/clientes/componentes/input-cliente";
import { Cliente, Consultor, ConsultorBusca, Contas, Recebimentos } from "@/app/lancamentos/types";

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

export default function RelatorioEmprestimosPendentes() {

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

  const [tipoData, setTipoData] = useState("");

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

  const buscarEmprestimosPendentes = async () => {

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

    setLoading(true);

    try {

      let query = supabase
        .from("contas_receber")
        .select(`
          id,
          tipo_lancamento,
          valor_emprestado,
          valor_receber,
          valor_pago,
          data_vencimento,
          data_cadastro,
          clientes:clientes!id_cliente ( id, nome_completo, cpf ),
          consultores:consultores!id_consultor ( id, nome_completo )
        `, { count: "exact" });

        if (status === "Pendente") {
          query = query.eq("status", "Pendente");
        } else { 
          query = query.eq("status", "Cancelado");
        }

        if (idCliente.trim() !== "") {
          query = query.eq("id_cliente", Number(idCliente));
        }

        if (consultorFiltro.trim() !== "") {
          query = query.eq("id_consultor", consultorFiltro);
        }
        
        const { data, error } = await query;

      console.log(data);

      setLoading(false);

    } catch(err) {
      console.log("Erro: ", err)
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
        onClick={() => setModalEmprestimos(true)}
      > 
        <FileText className="w-6 h-6 text-purple-600" />
        <span className="text-lg font-medium text-gray-700"> Relatório de Empréstimos - Pendentes </span> 
      </button>

      {modalEmprestimos && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">

            <h2 className="text-xl font-bold mb-4"> Relatório de Empréstimos Pendentes </h2>

            <div className="flex flex-col gap-2">

             <select 
                  className="w-full h-9 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
                  value={status}
                  onChange={ (e) => setStatus(e.target.value)}
                >
                  <option value="Pendente">Status - Pendente</option>
                  <option value="Cancelado"> Status - Cancelado</option>
              </select>


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
