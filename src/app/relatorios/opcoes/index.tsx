"use client"

import { FileText, Users, UserCheck, DollarSign, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import RelatorioClientes from "../clientes";
import RelatorioComissoes from "../comissoes";
import RelatorioEmprestimosPendentes from "../contasPendentes";
import RelatorioEmprestimosPagos from "../contasPagas";
import RelatorioEmprestimosPendentesDetalhado from "../contasPendentesDetalhado";
import ClientesAtivos from "../clientesAtivos";

export default function OpcoesRelatorios() {
  
  const relatorios = [
    { nome: "Relatório de Clientes", icone: <Users className="w-6 h-6 text-blue-600" /> },
    { nome: "Relatório de Consultores", icone: <UserCheck className="w-6 h-6 text-green-600" /> },
    { nome: "Relatório de Comissões", icone: <DollarSign className="w-6 h-6 text-yellow-600" /> },
    { nome: "Relatório de Empréstimos", icone: <FileText className="w-6 h-6 text-purple-600" /> },
    { nome: "Relatório de Entradas", icone: <ArrowDownCircle className="w-6 h-6 text-emerald-600" /> },
    { nome: "Relatório de Saídas", icone: <ArrowUpCircle className="w-6 h-6 text-red-600" /> },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex-1">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Geração de Relatórios em PDF
      </h1>

      <div className="flex gap-4 flex-wrap sm:flex-row">

        <RelatorioClientes />

        <RelatorioComissoes />

        <RelatorioEmprestimosPendentes />

        <RelatorioEmprestimosPagos />

        <RelatorioEmprestimosPendentesDetalhado />

        <ClientesAtivos />

      </div>

    </div>
  );
}
