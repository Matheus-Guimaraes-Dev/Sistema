"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import toast from "react-hot-toast";
import { createClient } from "@/lib/client";
import { limparValorMonetario, mostrarValor } from "@/funcoes/formatacao";

interface Saldo {
  valor_inicial: number;
}

export default function SaldoCaixa() {

  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [editarPagamento, setEditarPagamento] = useState(false);
  const [valorCaixa, setValorCaixa] = useState("");
  const [valorInicialCaixa, setValorInicialCaixa] = useState<Saldo[]>([]); 
  const [valorInformado, setValorInformado] = useState("");

  useEffect( () => {

    buscarValor();

  }, [])

  async function buscarValor() {
  const { data, error } = await supabase
    .from("saldo_caixa")
    .select("valor_inicial")
    .eq("id", 1);

  if (error) {
    toast.error("Erro ao buscar formas de pagamento!");
    return;
  }

  if (data && data.length > 0) {
    setValorInicialCaixa(data);
    setValorCaixa(data[0].valor_inicial.toString()); // ✅ Aqui sim!
  } else {
    toast.error("Nenhum valor de caixa encontrado.");
  }
}

  async function atualizarSaldo(e: React.FormEvent) {
    
    e.preventDefault();
    
    setLoading(true);

    if(!valorInformado) return toast.error("Digite o valor do empréstimo");
    const valorEmprestimoCorreto = limparValorMonetario(valorInformado);

    const dataAtualPortoVelho = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Porto_Velho"
    });

    const { error } = await supabase
      .from("saldo_caixa")
      .update({ 
        valor_inicial: valorEmprestimoCorreto,
        data_registro: dataAtualPortoVelho
       })
      .eq("id", 1);

    if(error) {
      toast.error("Erro ao atualizar forma de pagamento!"); 
    } else {

      toast.success("Valor de Caixa atualizado com sucesso!");
      window.location.reload();
      setEditarPagamento(false);

    }

    setLoading(false);

  }

  return (
    <div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Alterar Saldo de Caixa</CardTitle>
        </CardHeader>

        {editarPagamento && (

            <div className="fixed inset-0 flex items-center justify-center z-50">

              <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

                <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
                  <h2 className="text-xl font-bold mb-4"> Valor do Caixa </h2>

                  <form onSubmit={atualizarSaldo}>

                  <InputAlterar 
                    type="text" 
                    value={valorInformado}
                    onChange={(e) => mostrarValor(e, setValorInformado)}
                    placeholder="R$ 0,00"
                  />

                  <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

                  <div className="flex justify-center gap-4">
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditarPagamento(false);
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
                <span className="font-medium">{Number(valorCaixa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', })}</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setEditarPagamento(true);
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
