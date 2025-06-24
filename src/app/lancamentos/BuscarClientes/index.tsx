"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";

interface Cliente {
  id: number;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  status: string;
  data_cadastro: string;
}

export default function BuscarCliente({
  onSelecionar,
}: {
  onSelecionar: (cliente: Cliente | null) => void;
}) {
  const supabase = createClient();

  const [pesquisa, setPesquisa] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const filtroId = Number(pesquisa); 
  const buscarPorId = !isNaN(filtroId) && filtroId <= 2147483647; 

  useEffect(() => {
    const buscarClientes = async () => {
      if (pesquisa.length === 0) {
        setClientes([]);
        return;
      }

      setCarregando(true);

      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_completo, cpf')
        .or(
          [
            `nome_completo.ilike.%${pesquisa}%`,
            `cpf.ilike.%${pesquisa}%`,
            buscarPorId ? `id.eq.${filtroId}` : null,
          ]
            .filter(Boolean)
            .join(',')
        )
        .eq("status", "Autorizado")
        .order('nome_completo', { ascending: true });

      if (error) {
        console.error("Erro ao buscar clientes:", error);
      } else {
        setClientes(data as Cliente[]);
      }

      setCarregando(false);
    };

    const delayDebounce = setTimeout(() => {
      buscarClientes();
    }, 700); 

    return () => clearTimeout(delayDebounce);
  }, [pesquisa]);

  return (
    <div className="relative w-full mt-1">
      <input
        type="text"
        value={pesquisa}
        onChange={(e) => {
          setPesquisa(e.target.value);
          setMostrarResultados(true);
          onSelecionar(null);
        }}
        placeholder="Buscar por nome, CPF ou ID"
        className="w-full h-8 border-2 border-[#002956] rounded px-1 focus:outline-[#4b8ed6]"
      />

      {carregando && (
        <div className="absolute bg-white border w-full p-2">
          Carregando...
        </div>
      )}

      {mostrarResultados && clientes.length > 0 && (
        <div className="absolute bg-white border rounded shadow w-full max-h-60 overflow-y-auto z-50">
          {clientes.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => {
                onSelecionar(cliente);
                setMostrarResultados(false);
                setPesquisa(
                  `${cliente.nome_completo} - CPF: ${cliente.cpf} - ID: ${cliente.id}`
                );
              }}
              className="p-2 hover:bg-blue-100 cursor-pointer"
            >
              <p className="font-semibold">{cliente.nome_completo}</p>
              <p className="text-sm">
                CPF: {cliente.cpf} | ID: {cliente.id}
              </p>
            </div>
          ))}
        </div>
      )}

      {mostrarResultados && !carregando && clientes.length === 0 && (
        <div className="absolute hidden bg-white border w-full p-2">
          Nenhum cliente encontrado.
        </div>
      )}
    </div>
  );
}
