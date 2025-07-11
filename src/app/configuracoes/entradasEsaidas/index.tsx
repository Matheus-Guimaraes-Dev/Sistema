"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import toast from "react-hot-toast";
import { createClient } from "@/lib/client";

interface ContaEntrada {
  id: number;
  descricao: string;
}

interface ContaDespesa {
  id: number;
  descricao: string;
}

export default function EntradaESaida() {

  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [contasEntrada, setContasEntrada] = useState<ContaEntrada[]>([]);
  const [descricaoEntrada, setDescricaoEntrada] = useState<string>("");
  const [itemSelecionadoEntrada, setItemSelecionadoEntrada] = useState<any>(null);
  const [adicionarEntrada, setAdicionarEntrada] = useState(false);
  const [editarEntrada, setEditarEntrada] = useState(false);
  const [excluirEntrada, setExcluirEntrada] = useState(false);

  const [contasDespesa, setContasDespesa] = useState<ContaDespesa[]>([]);
  const [descricaoDespesa, setDescricaoDespesa] = useState<string>("");
  const [itemSelecionadoDespesa, setItemSelecionadoDespesa] = useState<any>(null);
  const [adicionarDespesa, setAdicionarDespesa] = useState(false);
  const [editarDespesa, setEditarDespesa] = useState(false);
  const [excluirDespesa, setExcluirDespesa] = useState(false);

  useEffect( () => {
    async function carregarContasEntradas() {
      const resultado = await buscarContasdeEntrada();
      if (resultado) {
        setContasEntrada(resultado);
      }
    }

    carregarContasEntradas();

  }, [])

  async function buscarContasdeEntrada() {

    const { data, error } = await supabase
      .from("plano_conta_entrada_lancamento")
      .select("*")
      .order("id", { ascending: true });

    if(error) {
      toast.error("Erro ao buscar contas de entrada!");
      return []
    } else {
      return data as ContaEntrada[];
    }

  }

  async function salvarEntrada(e: React.FormEvent) {

    e.preventDefault();

    if (!descricaoEntrada.trim()) return toast.error("Digite uma conta de entrada!");

    setLoading(true);

    const { error: erroInserir } = await supabase 
      .from("plano_conta_entrada_lancamento")
      .insert({
        descricao: descricaoEntrada.trim(),
      })

    if (erroInserir) {
      return toast.error("Erro ao salvar conta de entrada!");
    } else {
      toast.success("Conta - Entrada salva!");
      setDescricaoEntrada("");
      setAdicionarEntrada(false);
      const resultado = await buscarContasdeEntrada();
      setContasEntrada(resultado);
    }

    setLoading(false);

  }

  async function atualizarContaEntrada(e: React.FormEvent) {
    
    e.preventDefault();
    
    if(!descricaoEntrada.trim()) {
      return toast.error("Digite uma descrição válida!");
    }
    
    setLoading(true);

    const { error } = await supabase
      .from("plano_conta_entrada_lancamento")
      .update({ descricao: descricaoEntrada.trim() })
      .eq("id", itemSelecionadoEntrada.id);

    if(error) {
      toast.error("Erro ao atualizar Conta - Entrada!"); 
    } else {

      toast.success("Conta - Entrada atualizada!");

      setEditarEntrada(false);
      setItemSelecionadoEntrada(null);
      setDescricaoEntrada("");

      const resultado = await buscarContasdeEntrada();
      setContasEntrada(resultado);

    }

    setLoading(false);

  }

  async function excluirContaEntrada() {
    if (!itemSelecionadoEntrada) return;

    setLoading(true);

    const { error } = await supabase
      .from("plano_conta_entrada_lancamento")
      .delete()
      .eq("id", itemSelecionadoEntrada.id);

    if(error) {
      toast.error("Erro ao excluir Conta de Entrada!");
    } else {
      toast.success("Conta de Entrada excluída com sucesso!");

      setExcluirEntrada(false);
      setItemSelecionadoEntrada(null);

      const resultado = await buscarContasdeEntrada();
      setContasEntrada(resultado);

    }

    setLoading(false);

  }

  // ========== CONTA - DESPESA ==========

  useEffect( () => {
    async function carregarContasDespesas() {
      const resultado = await buscarContasdeDespesa();
      if (resultado) {
        setContasDespesa(resultado);
      }
    }

    carregarContasDespesas();

  }, [])

  async function buscarContasdeDespesa() {

    const { data, error } = await supabase
      .from("plano_conta_despesa_lancamento")
      .select("*")
      .order("id", { ascending: true });

    if(error) {
      toast.error("Erro ao buscar contas de despesa!");
      return []
    } else {
      return data as ContaDespesa[];
    }

  }

  async function salvarDespesa(e: React.FormEvent) {

    e.preventDefault();

    if (!descricaoDespesa.trim()) return toast.error("Digite uma conta de despesa!");

    setLoading(true);

    const { error: erroInserir } = await supabase 
      .from("plano_conta_despesa_lancamento")
      .insert({
        descricao: descricaoDespesa.trim(),
      })

    if (erroInserir) {
      return toast.error("Erro ao salvar conta de despesa!");
    } else {
      toast.success("Conta - Despesa salva!");
      setDescricaoDespesa("");
      setAdicionarDespesa(false);
      const resultado = await buscarContasdeDespesa();
      setContasDespesa(resultado);
    }

    setLoading(false);

  }

  async function atualizarContaDespesa(e: React.FormEvent) {
    
    e.preventDefault();
    
    if(!descricaoDespesa.trim()) {
      return toast.error("Digite uma descrição válida!");
    }
    
    setLoading(true);

    const { error } = await supabase
      .from("plano_conta_despesa_lancamento")
      .update({ descricao: descricaoDespesa.trim() })
      .eq("id", itemSelecionadoDespesa.id);

    if(error) {
      toast.error("Erro ao atualizar Conta - Despesa!"); 
    } else {

      toast.success("Conta - Despesa atualizada!");

      setEditarDespesa(false);
      setItemSelecionadoDespesa(null);
      setDescricaoDespesa("");

      const resultado = await buscarContasdeDespesa();
      setContasDespesa(resultado);

    }

    setLoading(false);

  }

  async function excluirContaDespesa() {
    if (!itemSelecionadoDespesa) return;

    setLoading(true);

    const { error } = await supabase
      .from("plano_conta_despesa_lancamento")
      .delete()
      .eq("id", itemSelecionadoDespesa.id);

    if(error) {
      toast.error("Erro ao excluir Conta de Despesa!");
    } else {
      toast.success("Conta de Despesa excluída com sucesso!");

      setExcluirDespesa(false);
      setItemSelecionadoDespesa(null);

      const resultado = await buscarContasdeDespesa();
      setContasDespesa(resultado);

    }

    setLoading(false);

  }

  return (
    <div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plano de Contas - Entrada </CardTitle>
          <Button onClick={() => setAdicionarEntrada(true)} className="cursor-pointer" variant="outline">
            <PlusCircle className="cursor-pointer w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>

        {adicionarEntrada && (

            <div className="fixed inset-0 flex items-center justify-center z-50">

              <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

                <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4"> Adicionar Conta - Entrada </h2>

                  <form onSubmit={salvarEntrada}>

                  <InputAlterar 
                    type="text"
                    value={descricaoEntrada}
                    onChange={ (e) => setDescricaoEntrada(e.target.value)}
                    placeholder="Dinheiro, pix..."
                  />

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button type="button" onClick={() => setAdicionarEntrada(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
                  </div>

                  </form>
                </div>

            </div>

        )}

        {editarEntrada && (

            <div className="fixed inset-0 flex items-center justify-center z-50">

              <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

                <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4"> Editar Conta - Entrada </h2>

                  <form onSubmit={atualizarContaEntrada}>

                  <InputAlterar 
                    type="text"
                    value={descricaoEntrada}
                    onChange={ (e) => setDescricaoEntrada(e.target.value)}
                    placeholder="Dinheiro, pix..."
                  />

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditarEntrada(false);
                        setItemSelecionadoEntrada(null);
                        setDescricaoEntrada("");
                      }} 
                      className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
                  </div>

                  </form>
                </div>

            </div>

        )}

      {excluirEntrada && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente essa conta? </h2>

            <div className="flex justify-center gap-4">
              <button
                onClick={excluirContaEntrada}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"> Sim </button>

              <button onClick={() => setExcluirEntrada(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Não </button>
            </div>
          </div>
        </div>
      )}

        <CardContent>
          <div className="space-y-3">
            {contasEntrada.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50"
              >
                <span className="font-medium">{item.descricao}</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setEditarEntrada(true);
                      setItemSelecionadoEntrada(item);
                      setDescricaoEntrada(item.descricao);
                    }} 
                    className="cursor-pointer" 
                    size="sm" 
                    variant="outline">
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    onClick={ () => {
                      setExcluirEntrada(true);
                      setItemSelecionadoEntrada(item);
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

      {/* ========== CONTA - DESPESA */}

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Plano de Contas - Despesas </CardTitle>
          <Button onClick={() => setAdicionarDespesa(true)} className="cursor-pointer" variant="outline">
            <PlusCircle className="cursor-pointer w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </CardHeader>

        {adicionarDespesa && (

            <div className="fixed inset-0 flex items-center justify-center z-50">

              <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

                <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4"> Adicionar Conta - Despesa </h2>

                  <form onSubmit={salvarDespesa}>

                  <InputAlterar 
                    type="text"
                    value={descricaoDespesa}
                    onChange={ (e) => setDescricaoDespesa(e.target.value)}
                    placeholder="Dinheiro, pix..."
                  />

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button type="button" onClick={() => setAdicionarDespesa(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
                  </div>

                  </form>
                </div>

            </div>

        )}

        {editarDespesa && (

            <div className="fixed inset-0 flex items-center justify-center z-50">

              <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

                <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4"> Editar Conta - Despesa </h2>

                  <form onSubmit={atualizarContaDespesa}>

                  <InputAlterar 
                    type="text"
                    value={descricaoDespesa}
                    onChange={ (e) => setDescricaoDespesa(e.target.value)}
                    placeholder="Dinheiro, pix..."
                  />

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditarDespesa(false);
                        setItemSelecionadoDespesa(null);
                        setDescricaoDespesa("");
                      }} 
                      className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
                  </div>

                  </form>
                </div>

            </div>

        )}

      {excluirDespesa && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente essa conta? </h2>

            <div className="flex justify-center gap-4">
              <button
                onClick={excluirContaDespesa}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"> Sim </button>

              <button onClick={() => setExcluirDespesa(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Não </button>
            </div>
          </div>
        </div>
      )}

        <CardContent>
          <div className="space-y-3">
            {contasDespesa.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50"
              >
                <span className="font-medium">{item.descricao}</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setEditarDespesa(true);
                      setItemSelecionadoDespesa(item);
                      setDescricaoDespesa(item.descricao);
                    }} 
                    className="cursor-pointer" 
                    size="sm" 
                    variant="outline">
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    onClick={ () => {
                      setExcluirDespesa(true);
                      setItemSelecionadoDespesa(item);
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
