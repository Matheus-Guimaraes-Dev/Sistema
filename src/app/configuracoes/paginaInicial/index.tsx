"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";

export default function PaginaInicial() {

  const [adicionarPagamento, setAdicionarPagamento] = useState(false);
  
  return (
    <div className="flex-1 p-5">

      <h1 className="text-3xl font-bold text-blue-900 text-center mb-8">
        Configurações
      </h1>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Formas de Pagamento</CardTitle>
          <Button onClick={() => setAdicionarPagamento(true)} className="cursor-pointer" variant="outline">
            <PlusCircle className="cursor-pointer w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>

        {adicionarPagamento && (
          <div className="fixed inset-0 flex items-center justify-center z-50">

            <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

            <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
              <h2 className="text-xl font-bold mb-4"> Adicionar Forma de Pagamento </h2>

              <InputAlterar 
                type="text"

                required
              />

              <div className="flex justify-center gap-4">
                <button onClick={() => setAdicionarPagamento(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
              </div>
            </div>
          </div>
        )}

        <CardContent>
          <div className="space-y-3">
            {["Pix", "Dinheiro", "Cartão de Crédito"].map((forma) => (
              <div
                key={forma}
                className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50"
              >
                <span className="font-medium">{forma}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Juros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Juros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["Diário", "Semanal", "Mensal"].map((tipo) => (
              <div
                key={tipo}
                className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50"
              >
                <span className="font-medium">{tipo}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Juros do Vencimento */}
      <Card>
        <CardHeader>
          <CardTitle>Juros do Vencimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50">
            <span className="font-medium">Aplicar juros após vencimento</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Pencil className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
