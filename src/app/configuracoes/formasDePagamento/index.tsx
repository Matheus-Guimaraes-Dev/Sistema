"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import toast from "react-hot-toast";
import { createClient } from "@/lib/client";

interface Pagamentos {
  id: number;
  descricao: string;
}

export default function FormasDePagamento() {

  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState<Pagamentos[]>([]);
  const [descricaoPagamento, setDescricaoPagamento] = useState<string>("");
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);
  const [adicionarPagamento, setAdicionarPagamento] = useState(false);
  const [editarPagamento, setEditarPagamento] = useState(false);
  const [excluirFormaPagamento, setExcluirFormaPagamento] = useState(false);

  useEffect( () => {
    async function carregarPagamentos() {
      const resultado = await buscarPagamentos();
      if (resultado) {
        setFormaPagamento(resultado);
      }
    }

    carregarPagamentos();

  }, [])

  async function buscarPagamentos() {

    const { data, error } = await supabase
      .from("formas_pagamento")
      .select("*")
      .order("id", { ascending: true });

    if(error) {
      toast.error("Erro ao buscar formas de pagamento!");
      return []
    } else {
      return data as Pagamentos[];
    }

  }

  async function salvarPagamento(e: React.FormEvent) {

    e.preventDefault();

    if (!descricaoPagamento.trim()) return toast.error("Digite uma forma de pagamento!");

    setLoading(true);

    const { data: pagamento, error: erroInserir } = await supabase 
      .from("formas_pagamento")
      .insert({
        descricao: descricaoPagamento.trim(),
      })

    if (erroInserir) {
      return toast.error("Erro ao salvar forma de pagamento!");
    } else {
      toast.success("Forma de pagamento salva!");
      setDescricaoPagamento("");
      setAdicionarPagamento(false);
      const resultado = await buscarPagamentos();
      setFormaPagamento(resultado);
    }

    setLoading(false);

  }

  async function atualizarPagamento(e: React.FormEvent) {
    
    e.preventDefault();
    
    if(!descricaoPagamento.trim()) {
      return toast.error("Digite uma descrição válida!");
    }
    
    setLoading(true);

    const { error } = await supabase
      .from("formas_pagamento")
      .update({ descricao: descricaoPagamento.trim() })
      .eq("id", itemSelecionado.id);

    if(error) {
      toast.error("Erro ao atualizar forma de pagamento!"); 
    } else {

      toast.success("Forma de pagamento atualizada!");

      setEditarPagamento(false);
      setItemSelecionado(null);
      setDescricaoPagamento("");

      const resultado = await buscarPagamentos();
      setFormaPagamento(resultado);

    }

    setLoading(false);

  }

  async function excluirPagamento() {
    if (!itemSelecionado) return;

    setLoading(true);

    const { error } = await supabase
      .from("formas_pagamento")
      .delete()
      .eq("id", itemSelecionado.id);

    if(error) {
      toast.error("Erro ao excluir forma de pagamento!");
    } else {
      toast.success("Forma de pagamento excluída com sucesso!");

      setExcluirFormaPagamento(false);
      setItemSelecionado(null);

      const resultado = await buscarPagamentos();
      setFormaPagamento(resultado);

    }

    setLoading(false);

  }


  return (
    <div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Formas de Recebimento</CardTitle>
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

                  <form onSubmit={salvarPagamento}>

                  <InputAlterar 
                    type="text"
                    value={descricaoPagamento}
                    onChange={ (e) => setDescricaoPagamento(e.target.value)}
                    placeholder="Dinheiro, pix..."
                  />

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button type="button" onClick={() => setAdicionarPagamento(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
                  </div>

                  </form>
                </div>

            </div>

        )}

        {editarPagamento && (

            <div className="fixed inset-0 flex items-center justify-center z-50">

              <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

                <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4"> Editar Forma de Pagamento </h2>

                  <form onSubmit={atualizarPagamento}>

                  <InputAlterar 
                    type="text"
                    value={descricaoPagamento}
                    onChange={ (e) => setDescricaoPagamento(e.target.value)}
                    placeholder="Dinheiro, pix..."
                  />

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditarPagamento(false);
                        setItemSelecionado(null);
                        setDescricaoPagamento("");
                      }} 
                      className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
                  </div>

                  </form>
                </div>

            </div>

        )}

      {excluirFormaPagamento && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente essa forma de pagamento? </h2>

            <div className="flex justify-center gap-4">
              <button
                onClick={excluirPagamento}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"> Sim </button>

              <button onClick={() => setExcluirFormaPagamento(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Não </button>
            </div>
          </div>
        </div>
      )}

        <CardContent>
          <div className="space-y-3">
            {formaPagamento.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50"
              >
                <span className="font-medium">{item.descricao}</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setEditarPagamento(true);
                      setItemSelecionado(item);
                      setDescricaoPagamento(item.descricao);
                    }} 
                    className="cursor-pointer" 
                    size="sm" 
                    variant="outline">
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    onClick={ () => {
                      setExcluirFormaPagamento(true);
                      setItemSelecionado(item);
                    }}
                    size="sm" 
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

    </div>
  );
}
