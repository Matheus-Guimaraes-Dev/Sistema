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
import { limiteCpf, limiteIdCliente, limiteIdDocumento } from "@/funcoes/limitacao";

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

        if (cpf.trim() !== "") {
          const { data: clientesEncontrados, error: erroClientes } = await supabase
            .from("clientes")
            .select("id")
            .ilike("cpf", `%${cpf.trim()}%`);

          if (!erroClientes && clientesEncontrados?.length) {
            const idsClientes = clientesEncontrados.map((item) => item.id);
            query = query.in("id_cliente", idsClientes);
          } else {
            query = query.in("id", [-1]);
          }
        }

      if (nome.trim() !== "") {
        const { data: clientesEncontrados, error: erroClientes } = await supabase
          .from("clientes")
          .select("id")
          .ilike("nome_completo", `%${nome.trim()}%`);

        if (!erroClientes && clientesEncontrados?.length) {
          const idsClientes = clientesEncontrados.map((item) => item.id);

          const { data: contasRelacionadas, error: erroContas } = await supabase
            .from("contas_receber")
            .select("id")
            .in("id_cliente", idsClientes);

          if (!erroContas && contasRelacionadas?.length) {
            const idsContas = contasRelacionadas.map((item) => item.id);
            query = query.in("id", idsContas);
          } else {
            query = query.in("id", [-1]);
          }
        } else {
          query = query.in("id", [-1]);
        }
      }
      
      if (modalidade.trim() !== "") {
        query = query.eq("tipo_lancamento", modalidade);
      }

      if (idDocumento.trim() !== "") {
        query = query.eq("id", Number(idDocumento));
      }

      if (estado.trim() !== "") {
        query = query.eq("estado", estado);
      }

      if (cidade.trim() !== "") {
        query = query.eq("cidade", cidade);
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

      let querySoma = supabase
        .from("contas_receber")
        .select("valor_emprestado, valor_receber, valor_pago, comissao");

        if (status === "Pendente") {
          querySoma = querySoma.eq("status", "Pendente");
        } else { 
          querySoma = querySoma.eq("status", "Cancelado");
        }

        if (idCliente.trim() !== "") {
          querySoma = querySoma.eq("id_cliente", Number(idCliente));
        }

        if (consultorFiltro.trim() !== "") {
          querySoma = querySoma.eq("id_consultor", consultorFiltro);
        }

        if (cpf.trim() !== "") {
          const { data: clientesEncontrados, error: erroClientes } = await supabase
            .from("clientes")
            .select("id")
            .ilike("cpf", `%${cpf.trim()}%`);

          if (!erroClientes && clientesEncontrados?.length) {
            const idsClientes = clientesEncontrados.map((item) => item.id);
            querySoma = querySoma.in("id_cliente", idsClientes);
          } else {
            querySoma = querySoma.in("id", [-1]);
          }
        }

      if (nome.trim() !== "") {
        const { data: clientesEncontrados, error: erroClientes } = await supabase
          .from("clientes")
          .select("id")
          .ilike("nome_completo", `%${nome.trim()}%`);

        if (!erroClientes && clientesEncontrados?.length) {
          const idsClientes = clientesEncontrados.map((item) => item.id);

          const { data: contasRelacionadas, error: erroContas } = await supabase
            .from("contas_receber")
            .select("id")
            .in("id_cliente", idsClientes);

          if (!erroContas && contasRelacionadas?.length) {
            const idsContas = contasRelacionadas.map((item) => item.id);
            querySoma = querySoma.in("id", idsContas);
          } else {
            querySoma = querySoma.in("id", [-1]);
          }
        } else {
          querySoma = querySoma.in("id", [-1]);
        }
      }
      
      if (modalidade.trim() !== "") {
        querySoma = querySoma.eq("tipo_lancamento", modalidade);
      }

      if (idDocumento.trim() !== "") {
        querySoma = querySoma.eq("id", Number(idDocumento));
      }

      if (estado.trim() !== "") {
        querySoma = querySoma.eq("estado", estado);
      }

      if (cidade.trim() !== "") {
        querySoma = querySoma.eq("cidade", cidade);
      }

      if (dataInicio.trim() || dataFim.trim()) {
        let colunaData = "data_emprestimo";

        if (tipoData === "vencimento") {
          colunaData = "data_vencimento";
        }

        if (dataInicio.trim()) querySoma = querySoma.gte(colunaData, dataInicio);
        if (dataFim.trim()) querySoma = querySoma.lte(colunaData, dataFim);
      }

      const { data: somaData, error: erroSoma } = await querySoma;

      if (erroSoma) {
        toast.error("Erro ao calcular soma das comissões");
      } else {
        const totalQueFoiEmprestado = somaData.reduce((acc, item) => acc + (item.valor_emprestado ?? 0), 0);
        setTotalEmprestado(totalQueFoiEmprestado);
        const totalAReceber = somaData.reduce((acc, item) => acc + ((item.valor_receber ?? 0) - (item.valor_pago ?? 0)), 0);
        setTotalReceber(totalAReceber);
        const verificarTotalComissao = somaData.reduce( (acc, item) => acc + (item.comissao ?? 0), 0);
        console.log(verificarTotalComissao)
        console.log(totalQueFoiEmprestado)
        console.log("teste")
        console.log(totalAReceber)

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
                  value={status}
                  onChange={ (e) => setStatus(e.target.value)}
                >
                  <option value="Pendente">Status - Pendente</option>
                  <option value="Cancelado"> Status - Cancelado</option>
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
                <option value="vencimento"> Data Vencimento </option>
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
