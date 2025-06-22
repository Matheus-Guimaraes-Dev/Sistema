"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import toast from "react-hot-toast";
import { createClient } from "@/lib/client";
import FormasDePagamento from "../formasDePagamento";
import InputPorcentagem from "@/app/consultores/cadastrar/formulario/InputPorcentagem";

interface ConsultaJuros {
  id: number,
  tipo_lancamento: string,
  tipo_juros: string,
  percentual: number;
}

export default function Juros() {

  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [juros, setJuros] = useState<ConsultaJuros[]>([]);
  const [tipoLancamento, setTipoLancamento] = useState("");
  const [percentual, setPercentual] = useState("");
   const [itemSelecionado, setItemSelecionado] = useState<any>(null);

  const [adicionarJuros, setAdicionarJuros] = useState(false);
  const [editarJuros, setEditarJuros] = useState(false);
  const [excluirJuros, setExcluirJuros] = useState(false);

  const tipoEmprestimo = "Emprestimo";

  useEffect(() => {
    carregarJuros();
  }, []);

  async function carregarJuros() {
    const resultado = await buscarJuros();
    setJuros(resultado);
  }

  async function buscarJuros() {

    const { data, error } = await supabase
      .from("configuracoes_juros")
      .select("*")
      .order("id", { ascending: true })

    if(error) {
      toast.error("Erro ao buscar juros!");
      return[]
    } else {
      return data as ConsultaJuros[];
    }

  }

  async function atualizarPagamento(e: React.FormEvent) {
    
    e.preventDefault();
    
    if(!percentual.trim()) {
      return toast.error("Digite o juros!");
    }

    if (!itemSelecionado) {
      return toast.error("Nenhum item selecionado para edição!");
    }
    
    setLoading(true);

    const { error } = await supabase
      .from("configuracoes_juros")
      .update({ 
        percentual: Number(percentual) })
      .eq("id", itemSelecionado.id);

    if(error) {
      toast.error("Erro ao atualizar percentual!"); 
    } else {

      toast.success("Percentual atualizada!");

      setEditarJuros(false);
      setItemSelecionado(null);
      setPercentual("");

      await carregarJuros();

    }

    setLoading(false);

  }

  return (
    <div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Juros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {juros.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50"
              >
                <span className="font-medium">{item.tipo_lancamento}: {item.percentual}%</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={ () => {
                      setEditarJuros(true);
                      setItemSelecionado(item);
                      setPercentual(item.percentual.toString() || "")
                    }}
                    className="cursor-pointer"
                    size="sm" 
                    variant="outline">
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editarJuros && (

            <div className="fixed inset-0 flex items-center justify-center z-50">

              <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

                <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4"> Editar Juros </h2>

                  <form onSubmit={atualizarPagamento}>

                  <InputPorcentagem 
                    value={percentual}
                    onChange={setPercentual}
                    label="10%, 7%, 3%.."
                  />

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditarJuros(false);
                        setItemSelecionado(null);
                        setPercentual("");
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
  );
}
