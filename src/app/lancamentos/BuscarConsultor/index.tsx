"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { formatarCPF } from "@/funcoes/formatacao";

interface Consultor {
  id: number;
  nome_completo: string;
  cpf: string;
  status: string;
  comissao_mensal?: number;
  comissao_semanal?: number;
  comissao_diaria?: number;
}

export default function BuscarConsultor({
  onSelecionar,
}: {
  onSelecionar: (consultor: Consultor | null) => void;
}) {
  const supabase = createClient();

  const [pesquisa, setPesquisa] = useState("");
  const [consultores, setConsultores] = useState<Consultor[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const filtroId = Number(pesquisa); 
  const buscarPorId = !isNaN(filtroId) && filtroId <= 2147483647; 

  useEffect(() => {
    const buscarConsultores = async () => {
      if (pesquisa.length === 0) {
        setConsultores([]);
        return;
      }

      setCarregando(true);

      const { data, error } = await supabase
        .from('consultores')
        .select('id, nome_completo, cpf, comissao_mensal, comissao_semanal, comissao_semanal')
        .or(
          [
            `nome_completo.ilike.%${pesquisa}%`,
            `cpf.ilike.%${pesquisa}%`,
            buscarPorId ? `id.eq.${filtroId}` : null,
          ]
            .filter(Boolean)
            .join(',')
        )
        .eq("status", "Ativo")
        .order('nome_completo', { ascending: true });

      if (error) {
        console.error("Erro ao buscar clientes:", error);
      } else {
        setConsultores(data as Consultor[]);
      }

      setCarregando(false);
    };

    const delayDebounce = setTimeout(() => {
      buscarConsultores();
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
        className="w-full h-9 border-2 border-[#002956] rounded px-1 focus:outline-[#4b8ed6]"
      />

      {carregando && (
        <div className="absolute bg-white border w-full p-2">
          Carregando...
        </div>
      )}

      {mostrarResultados && consultores.length > 0 && (
        <div className="absolute bg-white border rounded shadow w-full max-h-60 overflow-y-auto z-50">
          {consultores.map((consultor) => (
            <div
              key={consultor.id}
              onClick={() => {
                onSelecionar(consultor);
                setMostrarResultados(false);
                setPesquisa(
                  `${consultor.nome_completo} - CPF: ${formatarCPF(consultor.cpf)} - ID: ${consultor.id}`
                );
              }}
              className="p-2 hover:bg-blue-100 cursor-pointer"
            >
              <p className="font-semibold">{consultor.nome_completo}</p>
              <p className="text-sm">
                CPF: {formatarCPF(consultor.cpf)} | ID: {consultor.id}
              </p>
            </div>
          ))}
        </div>
      )}

      {mostrarResultados && !carregando && consultores.length === 0 && (
        <div className="absolute hidden bg-white border w-full p-2">
          Nenhum cliente encontrado.
        </div>
      )}
    </div>
  );
}
