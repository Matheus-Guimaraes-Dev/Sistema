"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { limiteCpf, limiteId } from "@/funcoes/limitacao";
import { formatarCPF, formatarData, formatarDinheiro, limparValorMonetario, mostrarValor } from "@/funcoes/formatacao";
import { InputCliente } from "@/app/clientes/componentes/input-cliente";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import toast from "react-hot-toast";
import { Label } from "@/app/formulario/components/componentes/label";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import { Recebimentos } from "@/app/lancamentos/types";

interface LancamentosEntrada { 
  id: number;
  descricao: string;
  data_lancamento: string,
  valor_recebido: number,
  formas_pagamento: {
    id: number,
    descricao: string,
  },
  plano_conta_entrada_lancamento: {
    id: number,
    descricao: string,
  }
}

interface LancamentosSaida { 
  id: number;
  descricao: string;
  data_lancamento: string,
  valor_recebido: number,
  formas_pagamento: {
    id: number,
    descricao: string,
  },
  plano_conta_despesa_lancamento: {
    id: number,
    descricao: string,
  }
}

export default function LancamentosContas() {

  const supabase = createClient();

  const [id, setId] = useState("");
  const [tipoLancamentoFiltro, setTipoLancamentoFiltro] = useState("");
  const [tipoLancamento, setTipoLancamento] = useState<string | null>("Entrada");
  const [lancamentosEntrada, setLancamentosEntrada] = useState<LancamentosEntrada[]>([]);
  const [conta, setConta] = useState("");
  const [lancamentosSaida, setLancamentosSaida] = useState<LancamentosSaida[]>([]);
  const [selecionarTipoLancamento, setSelecionarTipoLancamento] = useState<string | null>(null);
  const [selecionarTipoLancamentoFiltro, setSelecionarTipoLancamentoFiltro] = useState<string>('Entrada');
  const [abrirModal, setAbrirModal] = useState(false);
  const [dataLancamento, setDataLancamento] = useState("");
  const [valorLancamento, setValorLancamento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtrosCarregados, setFiltrosCarregados] = useState(false);

  const [formasRecebimento, setFormasRecebimento] = useState<Recebimentos[]>([])
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState("");

  const [planoConta, setPlanoConta] = useState<Recebimentos[]>([]);
  const [planoContaSelecionada, setPlanoContaSelecionada] = useState("");

  const [planoContaFiltro, setPlanoContaFiltro] = useState<Recebimentos[]>([]);
  const [planoContaSelecionadaFiltro, setPlanoContaSelecionadaFiltro] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 2;
  const [totalPaginas, setTotalPaginas] = useState(1);

  const [valorAntigo, setValorAntigo] = useState("");

  const router = useRouter(); 

  const trocarTipoLancamento = (valor: string) => {
    setSelecionarTipoLancamento(valor === selecionarTipoLancamento ? null : valor);
  };

  const trocarTipoLancamentoFiltro = (valor: string) => {
    setSelecionarTipoLancamentoFiltro(
      valor === selecionarTipoLancamentoFiltro ? '' : valor
    );
  };

  const handleDataInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDataInicio(valor);
    localStorage.setItem("filtro_data_inicio_lancamentoContas", valor);
  };

  const handleDataFimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDataFim(valor);
    localStorage.setItem("filtro_data_fim_lancamentoContas", valor);
  };

  useEffect( () => {
    if (filtrosCarregados) {
      buscarLancamentos();
    }
  }, [paginaAtual, filtrosCarregados, selecionarTipoLancamentoFiltro])

  useEffect(() => {
    formasDeRecebimento();
    buscarPlanoContas();
  }, [selecionarTipoLancamento]);

  useEffect(() => {
    buscarPlanoContas();
  }, [selecionarTipoLancamentoFiltro]);

  useEffect(() => {

    const dataInicioSalva = localStorage.getItem("filtro_data_inicio_lancamentoContas");
    const dataFimSalva = localStorage.getItem("filtro_data_fim_lancamentoContas");

    if (dataInicioSalva) setDataInicio(dataInicioSalva);
    if (dataFimSalva) setDataFim(dataFimSalva);

    setTimeout(() => {
      setFiltrosCarregados(true);
    }, 0);

  }, []);

  useEffect(() => {
    const statusAtual = localStorage.getItem("status_tipoConta");
    if (statusAtual) {
      setTipoLancamentoFiltro(statusAtual);
    }
  }, []);

  useEffect(() => {
    if (tipoLancamentoFiltro) {
      localStorage.setItem("status_tipoConta", tipoLancamentoFiltro);
    }
  }, [tipoLancamentoFiltro]);

  // ========== BUSCAR AS CONTAS ==========

  async function buscarLancamentos() {

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina - 1;

    console.log(tipoLancamento);

    try {

      const inicio = (paginaAtual - 1) * itensPorPagina 
      const fim = inicio + itensPorPagina - 1;

      if(selecionarTipoLancamentoFiltro === "Entrada") {

        let query = supabase
          .from("entradas_lancamentos")
          .select(`
            id,
            descricao,
            data_lancamento,
            valor_recebido,
            plano_conta_entrada_lancamento (
              id, 
              descricao
            ),
            formas_pagamento (
              id, 
              descricao
            )
          `, { count: "exact" })
        
        if (id.trim() !== "") {
          query = query.eq("id", Number(id));
        }

        if(planoContaSelecionadaFiltro.trim() !== "") {
          query = query.eq("id_plano_conta_entrada_lancamento", Number(planoContaSelecionadaFiltro))
        }

        if (dataInicio.trim() !== "") {
          query = query.gte("data_lancamento", dataInicio);
        }

        if (dataFim.trim() !== "") {
          query = query.lte("data_lancamento", dataFim);
        }

        const { count } = await query.range(0, 0);
        const total = count ?? 0;

        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina - 1;

        if (inicio >= total && total > 0) {
          setPaginaAtual(1);
          return;
        }

        query = query.range(inicio, fim);
        const { data: resultado, error } = await query;

        if(error) {
          console.log("Erro ao buscar contas: ", error);
        } else {

          let resultadoFiltrado = (resultado || []).map( (item) => ({
            ...item,
            formas_pagamento: Array.isArray(item.formas_pagamento) ? item.formas_pagamento[0] : item.formas_pagamento,
            plano_conta_entrada_lancamento: Array.isArray(item.plano_conta_entrada_lancamento) ? item.plano_conta_entrada_lancamento[0] : item.plano_conta_entrada_lancamento,
          }));

          setLancamentosEntrada(resultadoFiltrado);

          const total = Math.ceil((count ?? 0) / itensPorPagina);
          setTotalPaginas(total);

        } 

      } else if (selecionarTipoLancamentoFiltro === "Saída") {

        let query = supabase
          .from("despesas_lancamentos")
          .select(`
            id,
            descricao,
            data_lancamento,
            valor_recebido,
            plano_conta_despesa_lancamento (
              id, 
              descricao
            ),
            formas_pagamento (
              id, 
              descricao
            )
          `, { count: "exact" })

        console.log("Ola")

        if (id.trim() !== "") {
          query = query.eq("id", Number(id));
        }

        if(planoContaSelecionadaFiltro.trim() !== "") {
          query = query.eq("id_plano_conta_despesa_lancamento", Number(planoContaSelecionadaFiltro))
        }

        if (dataInicio.trim() !== "") {
          query = query.gte("data_lancamento", dataInicio);
        }

        if (dataFim.trim() !== "") {
          query = query.lte("data_lancamento", dataFim);
        }

        const { count } = await query.range(0, 0);
        const total = count ?? 0;

        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina - 1;

        if (inicio >= total && total > 0) {
          setPaginaAtual(1);
          return;
        }

        query = query.range(inicio, fim);
        const { data: resultado, error } = await query;

        if(error) {
          console.log("Erro ao buscar contas: ", error);
        } else {

          let resultadoFiltrado = (resultado || []).map( (item) => ({
            ...item,
            formas_pagamento: Array.isArray(item.formas_pagamento) ? item.formas_pagamento[0] : item.formas_pagamento,
            plano_conta_despesa_lancamento: Array.isArray(item.plano_conta_despesa_lancamento) ? item.plano_conta_despesa_lancamento[0] : item.plano_conta_despesa_lancamento
          }));

          setLancamentosSaida(resultadoFiltrado);

          const total = Math.ceil((count ?? 0) / itensPorPagina);
          setTotalPaginas(total);

        } 

      }

    } catch(error) {
      console.log("Erro: ", error);
    }
    
  }

  // ========== ENVIAR OS LANÇAMENTOS ==========

  async function enviarLancamento(e: React.FormEvent) {

    e.preventDefault();

    if(!selecionarTipoLancamento) return toast.error("Selecione o tipo do lançamento");
    if(!planoContaSelecionada) return toast.error("Selecione uma conta");
    if(!dataLancamento) return toast.error("Selecione a data do lançamento");
    if(!valorLancamento) return toast.error("Valor do lançamento não informado");
    if(!recebimentoSelecionado) return toast.error("Selecione uma forma de recebimento/pagamento");

    setLoading(true);

    const valorLancamentoCorreto = limparValorMonetario(valorLancamento);

    if(isNaN(valorLancamentoCorreto) || valorLancamentoCorreto <= 0) {
      return toast.error("Valor do lançamento não informado");
    }

    if(selecionarTipoLancamento === "Entrada") {

      const { data, error } = await supabase
        .from("entradas_lancamentos")
        .insert({
          id_plano_conta_entrada_lancamento: planoContaSelecionada,
          id_forma_pagamento: recebimentoSelecionado,
          descricao: observacoes,
          valor_recebido: valorLancamentoCorreto,
          data_lancamento: dataLancamento
        })

      if(error) {
        toast.error("Erro ao lançar documento - Entrada");
        setLoading(false);
        return
      }

      if(!data) {
        setLoading(false);
        toast.success("Lançamento realizado com sucesso!");
        window.location.reload();
      }

    } else if (selecionarTipoLancamento === "Saída") {
      
      const { data, error } = await supabase
        .from("despesas_lancamentos")
        .insert({
          id_plano_conta_despesa_lancamento: planoContaSelecionada,
          id_forma_pagamento: recebimentoSelecionado,
          descricao: observacoes,
          valor_recebido: valorLancamentoCorreto,
          data_lancamento: dataLancamento
        })

      if(error) {
        toast.error("Erro ao lançar documento - saída");
        setLoading(false);
        return
      }

      if(!data) {
        setLoading(false);
        toast.success("Lançamento realizado com sucesso!");
        window.location.reload();
      }

    }

    return

  }

  // ========== APLICAR OS FILTROS DE PESQUISA ==========

  const aplicarFiltro = (e:React.FormEvent) => {
    e.preventDefault();

    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    if (inicio.getTime() > fim.getTime()) {
      toast.error("A data inicial não pode ser maior que a data final.");
      return;
    } 

    setPaginaAtual(1);

    buscarLancamentos();


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

  // ========== BUSCAR OS PLANOS DE CONTAS ==========

  async function buscarPlanoContas() {

    if(selecionarTipoLancamento === "Entrada" || selecionarTipoLancamentoFiltro === "Entrada") {

      const { data, error } = await supabase
        .from("plano_conta_entrada_lancamento")
        .select("id, descricao");
      
      if(error) {
        toast.error("Erro ao buscar plano de contas");
      }

      if(data) {

        setPlanoConta(data);
        
        setPlanoContaFiltro(data);

      }

    } else if (selecionarTipoLancamento === "Saída" || selecionarTipoLancamentoFiltro === "Saída") {

      
      const { data, error } = await supabase
        .from("plano_conta_despesa_lancamento")
        .select("id, descricao");
      
      if(error) {
        toast.error("Erro ao buscar contas de entrada");
      }

      if(data) {

        setPlanoConta(data);
        setPlanoContaFiltro(data);

      }

    } else {

      setPlanoContaSelecionada("");
      setPlanoConta([]);
      setPlanoContaFiltro([]);

    }

  }


  function detalhesContas(id: number) {
    router.push(`contas/${id}`);
  }

  return(

    <div className="flex-1">

      <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Lançamentos de Entrada / Saída </h1>

      {/* ========== FILTROS DE PESQUISA ========== */}

      <form onSubmit={aplicarFiltro}>
        <div className="bg-white p-4 rounded-xl shadow-md grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">

          <InputCliente
            type="text"
            placeholder="Buscar por ID da conta"
            inputMode="numeric"
            value={id}
            onChange={ (e) => limiteId(e, setId)}
            maxLength={7}
          />

        <div>
          <select
            className="w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
            value={selecionarTipoLancamentoFiltro ?? undefined}
            onChange={(e) => trocarTipoLancamentoFiltro(e.target.value)}
          >
            <option value="Entrada">Entrada</option>
            <option value="Saída">Saída</option>
          </select>
        </div>

          <div>

            <select 
              className="w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
              value={planoContaSelecionadaFiltro}
              onChange={(e) => setPlanoContaSelecionadaFiltro(e.target.value)}
            >
              <option value="">Selecione a Conta </option>

              {planoContaFiltro.map((forma) => (
                <option key={forma.id} value={forma.id}>
                  {forma.descricao}
                </option>
              ))}
            </select>
          </div>

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

          <button type="button" onClick={() => {
            setValorAntigo(selecionarTipoLancamentoFiltro)
            setSelecionarTipoLancamentoFiltro("");
            setAbrirModal(true);
          }} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-9 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200"> Lançamento </button>

        </div>
      </form>

    {/* ========== TABELA DE COMISSOES ========== */}

      <div className="bg-white shadow-md overflow-x-auto px-4 mb-4">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="px-2 py-4 w-10"> ID </th>
              <th className="px-2 py-3 w-50"> Conta </th>
              <th className="px-2 py-3 w-50"> Valor </th>
              <th className="px-2 py-3 w-50"> Data de Lançamento </th>
              <th className="px-2 py-3 text-center w-20"> Detalhes </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {selecionarTipoLancamentoFiltro === "Entrada" ? (
              lancamentosEntrada.map( (info) => (
                <tr key={info.id} className="border-b-3 border-gray-600">
                  <td className="px-2 py-2"> {info.id} </td>
                  <td className="px-2 py-2"> {info.plano_conta_entrada_lancamento?.descricao} </td>
                  <td className="px-2 py-2"> {formatarDinheiro(info.valor_recebido)} </td>
                  <td className="px-2 py-2"> {formatarData(info?.data_lancamento)} </td>
                  <td className="px-4 py-2 flex justify-center">
                    <button  onClick={() => detalhesContas(info.id)} className="text-blue-600 hover:underline cursor-pointer bg-white relative rounded-full w-6 h-6"> <IoIosArrowDroprightCircle className="absolute top-[-4px] right-[-4px]" size={32} /> </button>
                  </td>
                </tr>
              ))
            ) : (
              lancamentosSaida.map( (info) => (
                <tr key={info.id} className="border-b-3 border-gray-600">
                  <td className="px-2 py-2"> {info.id} </td>
                  <td className="px-2 py-2"> {info.plano_conta_despesa_lancamento?.descricao} </td>
                  <td className="px-2 py-2"> {formatarDinheiro(info.valor_recebido)} </td>
                  <td className="px-2 py-2"> {formatarData(info?.data_lancamento)} </td>
                  <td className="px-4 py-2 flex justify-center">
                    <button  onClick={() => detalhesContas(info.id)} className="text-blue-600 hover:underline cursor-pointer bg-white relative rounded-full w-6 h-6"> <IoIosArrowDroprightCircle className="absolute top-[-4px] right-[-4px]" size={32} /> </button>
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

      {/* ========== FAZER LANÇAMENTO ========== */}

      {abrirModal && (
      
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4 text-center"> Lançamento </h2>

            <form onSubmit={enviarLancamento}>

              <div className="mb-2">

                <Label> Modalidade do Lançamento </Label>

                <div className="flex gap-4 flex-wrap items-center">
                  {["Entrada", "Saída"].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input
                        className="w-4 h-4 border-2"
                        type="checkbox"
                        checked={selecionarTipoLancamento === item}
                        onChange={ () => trocarTipoLancamento(item)}
                      />
                      {item}
                    </label>
                  ))}
                </div>

              </div>

              <div className="mb-3">
                <Label> Conta de Lançamento </Label>

                <select 
                  className="w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
                  value={planoContaSelecionada}
                  onChange={(e) => setPlanoContaSelecionada(e.target.value)}
                >
                  <option value="">Selecione a Conta </option>

                  {planoConta.map((forma) => (
                    <option key={forma.id} value={forma.id}>
                      {forma.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">

                <Label> Data do Lançamento </Label>

                <input 
                  className="w-full h-9 border-2 px-1 border-[#002956] rounded mt-1  focus:outline-[#4b8ed6]"
                  type="date"
                  value={dataLancamento}
                  onChange={ (e) => setDataLancamento(e.target.value)}
                />
                
              </div>

              <div className="mt-2 mb-3">
                <Label> Valor do Lançamento </Label>
                <InputAlterar 
                  type="text" 
                  value={valorLancamento}
                  onChange={(e) => mostrarValor(e, setValorLancamento)}
                  placeholder="R$ 0,00"
                />
              </div>

              <div className="mb-3">
                <Label> Forma de Recebimento/Pagamento </Label>

                <select 
                  className="w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
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


              <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-9 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

              <div className="flex justify-center gap-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setAbrirModal(false);
                    setSelecionarTipoLancamento("");
                    setPlanoConta([]);
                    setPlanoContaSelecionada("");
                    setDataLancamento("");
                    setValorLancamento(""); 
                    setObservacoes("");
                    setFormasRecebimento([]);
                    setRecebimentoSelecionado("");
                    setSelecionarTipoLancamentoFiltro(valorAntigo);
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