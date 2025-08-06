"use client"

import { FileText, Users, UserCheck, DollarSign, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useState } from "react";
import RelatorioClientes from "../clientes";

export default function OpcoesRelatorios() {
  const relatorios = [
    { nome: "Relatório de Clientes", icone: <Users className="w-6 h-6 text-blue-600" /> },
    { nome: "Relatório de Consultores", icone: <UserCheck className="w-6 h-6 text-green-600" /> },
    { nome: "Relatório de Comissões", icone: <DollarSign className="w-6 h-6 text-yellow-600" /> },
    { nome: "Relatório de Empréstimos", icone: <FileText className="w-6 h-6 text-purple-600" /> },
    { nome: "Relatório de Entradas", icone: <ArrowDownCircle className="w-6 h-6 text-emerald-600" /> },
    { nome: "Relatório de Saídas", icone: <ArrowUpCircle className="w-6 h-6 text-red-600" /> },
  ];

  const [modalClientes, setModalClientes] = useState(false);

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex-1">

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Geração de Relatórios em PDF
      </h1>
{/*
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatorios.map((relatorio, index) => (
          <button
            key={index}
            className="flex items-center gap-4 p-6 bg-white rounded-xl shadow hover:shadow-lg hover:scale-105 transition-transform"
          >
            {relatorio.icone}
            <span className="text-lg font-medium text-gray-700">{relatorio.nome}</span>
          </button>
        ))}

      </div>
*/}
      <RelatorioClientes />

      {modalClientes && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Relatório de Clientes </h2>

            <div className="flex justify-center gap-4">
              <button onClick={() => setModalClientes(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
