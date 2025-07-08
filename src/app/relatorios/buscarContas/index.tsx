"use client"

import { formatarDinheiro } from "@/funcoes/formatacao";
import { createClient } from "@/lib/client"
import { useEffect, useState } from "react";

export function BuscarContas() {

  const supabase = createClient();

  const [valorEmprestado, setValorEmprestado] = useState("");
  const [valorAReceber, setValorAReceber] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalLiquido, setTotalLiquido] = useState("");
  const [valorComissao, setValorComissao] = useState("");
  const [valorPagoComissao, setValorPagoComissao] = useState("");
  const [valorTotalFinal, setValorTotalFinal] = useState("");
  const [valorCaixa, setValorCaixa] = useState("");

  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');

  useEffect( () => {
    buscarValores();
  }, [])

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

  const buscarValores = async () => {

    const { data: relatorioContasReceber, error: erroContasReceber } = await supabase.rpc("relatorio_completo_contas_receber");

    if (erroContasReceber) {
      console.error("Erro ao buscar relatório:", erroContasReceber);
    } else {
      const relatorio = relatorioContasReceber?.[0];
      console.log("Relatório completo:", relatorio);
      setValorEmprestado(relatorio.valor_emprestado);
      setValorAReceber(relatorio.valor_receber);
      setValorPago(relatorio.valor_pago);
      setTotalLiquido(relatorio.total_liquido);
      setValorComissao(relatorio.valor_comissao);
      setValorPagoComissao(relatorio.valor_pago_comissoes);

      const calculo = relatorio.total_liquido - relatorio.valor_comissao;
      const calculoCaixa = relatorio.valor_inicial - relatorio.valor_emprestado + relatorio.valor_pago - relatorio.valor_pago_comissoes;

      setValorTotalFinal(calculo.toString());
      setValorCaixa(calculoCaixa.toString());

    }

    console.log(relatorioContasReceber);

    setLoading(false);
      
  }

  return(
    <div className="p-6 bg-gray-100 min-h-screen flex-1">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Relatório Financeiro</h1>

      <form className="flex w-full items-center">
        <div className="sm:max-w-200 w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div>
            <label> Data Inicio </label>
            <input
              type="date"
              placeholder="Teste"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full h-10 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
            />
          </div>

          <div>
            <label> Data Final </label>
            <input
              type="date"
              value={dataFim}
              onChange={ (e) => setDataFim(e.target.value)}
              className="w-full h-10 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
            />
          </div>

          <div className="flex items-end w-full">
            <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer sm:max-w-200 h-10 flex-1"> Atualizar </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Valor Emprestado</h2>
          <p className="text-2xl font-bold text-red-600 mt-2"> {Number(valorEmprestado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Valor a Receber</h2>
          <p className="text-2xl font-bold text-gray-700 mt-2">{Number(valorAReceber).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Valor Pago</h2>
          <p className="text-2xl font-bold text-green-600 mt-2">{Number(valorPago).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Total Líquido</h2>
          <p className="text-2xl font-bold text-gray-800 mt-2">{Number(totalLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Total Comissão a Pagar</h2>
          <p className="text-2xl font-bold text-purple-600 mt-2">{Number(valorComissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5">
          <h2 className="text-lg font-semibold text-gray-700">Comissão Paga</h2>
          <p className="text-2xl font-bold text-amber-600 mt-2">{Number(valorPagoComissao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5 md:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-semibold text-gray-700">Total Líquido Final</h2>
          <p className="text-3xl font-bold text-gray-900 mt-2">{Number(valorTotalFinal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-5 md:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-semibold text-gray-700">Valor em Caixa</h2>
          <p className="text-3xl font-bold text-emerald-700 mt-2">{Number(valorCaixa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</p>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

    </div>
  )
}