"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/client";

interface Saldo {
  valor_inicial: number;
}

export default function VerificarVencimento() {

  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState("");
  const [dataDoVencimento, setDataDoVencimento] = useState(""); 

  const [modal, setModal] = useState(false);

  useEffect( () => {

    buscarVencimentos();

  }, [])

  async function buscarVencimentos() {

    const { data, error } = await supabase
      .from("sistema")
      .select("status, data_vencimento")
      .eq("id", 1)
      .single()

    if (error) {
      return;
    }

    setStatus(data.status);
    setDataDoVencimento(data.data_vencimento);

  }

  async function atualizarVencimento(e: React.FormEvent) {
    
    e.preventDefault();
    
    setLoading(true);

    const { error } = await supabase
      .from("sistema")
      .update({ 
        status: status,
        data_vencimento: dataDoVencimento
       })
      .eq("id", 1);

    if(error) {
      toast.error("Erro ao atualizar vencimento!"); 
    } else {

      toast.success("Vencimento alterado com sucesso!");
      window.location.reload();
      setModal(false);

    }

    setLoading(false);

  }

  return (
    <div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alterar Vencimento</CardTitle>
        </CardHeader>

        {modal && (

            <div className="fixed inset-0 flex items-center justify-center z-50">

              <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

                <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4"> Vencimento </h2>

                  <form onSubmit={atualizarVencimento}>

                    <select 
                      className="w-full h-9 border-2 border-[#002956] rounded  focus:outline-[#9eb0c4] text-sm sm:text-base mb-4"
                      value={status}
                      onChange={ (e) => setStatus(e.target.value)}
                    >
                      <option value="LIBERADO"> LIBERADO </option>
                      <option value="BLOQUEADO"> BLOQUEADO </option>
                    </select>

                    <div>
                    <input
                      type="date"
                      placeholder="Teste"
                      value={dataDoVencimento}
                      onChange={ (e) => setDataDoVencimento(e.target.value)}
                      className="w-full h-9 border-2 border-[#002956] rounded px-2 focus:outline-[#4b8ed6] text-sm sm:text-base"
                    />
                  </div>

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setModal(false);
                      }} 
                      className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
                  </div>

                  </form>
                </div>

            </div>

        )}

        <CardContent>
          <div className="space-y-3">
              <div
                className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50"
              >
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setModal(true);
                    }} 
                    className="cursor-pointer" 
                    size="sm" 
                    variant="outline">
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
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
