"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { limiteId } from "@/funcoes/limitacao";
import { formatarCPF, formatarData } from "@/funcoes/formatacao";
import { InputCliente } from "@/app/clientes/inputCliente";
import { IoIosArrowDroprightCircle } from "react-icons/io";

interface Cliente {
  id: number;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  status: string;
  data_cadastro: string;
};

export default function FiltrosConsultores() {

  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [id, setId] = useState("");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [erro, setErro] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
      
  useEffect(() => {
    buscarClientes()
  }, [paginaAtual])

  const itensPorPagina = 5
  const [totalPaginas, setTotalPaginas] = useState(1);

  const router = useRouter();

  const buscarClientes = async () => {

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina - 1;
  
    try {

      let query = supabase
        .from("consultores")
        .select("id, nome_completo, cpf, estado, cidade, status, data_cadastro", { count: "exact" });

      if (nome.trim() !== "") {
        query = query.ilike("nome_completo", `%${nome.trim()}%`);
      }

      if (id.trim() !== "") {
        query = query.eq("id", Number(id));
      }

      if (cpf.trim() !== "") {
        query = query.ilike("cpf", `%${cpf.trim()}%`);
      }

      if (status !== "") {
        query = query.eq("status", status);
      }

      if (estado !== "") {
        query = query.eq("estado", estado);
      }

      if (cidade !== "") {
        query = query.eq("cidade", cidade);
      }

      if (data === "asc" || data === "desc") {
        query = query.order("data_cadastro", { ascending: data === "asc" });
      }

      query = query.range(inicio, fim);

      const { data: resultado, error, count } = await query;

      if (error) {
        setErro("Erro ao buscar clientes.");
        console.error("Erro Supabase:", error);
      } else {

        setClientes(resultado || []);
        setErro("");

        const total = Math.ceil((count ?? 0) / itensPorPagina);
        setTotalPaginas(total);

      }
    } catch (erro) {
      console.error("Erro geral:", erro);
      setErro("Erro inesperado ao buscar clientes.");
    }
  };

  const aplicarFiltro = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginaAtual(1);
    buscarClientes();
  };

  function navegarCadastro() {
    router.push("/consultores/cadastrar");
  }

  function detalhes(id: number) {
    router.push(`/consultores/${id}`);
  }

  return(

    <div className="flex-1">

      <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Lista de Consultores </h1>

      <form onSubmit={aplicarFiltro}>
        <div className="bg-white p-4 rounded-xl shadow-md grid gap-4 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          mb-6">
          <InputCliente
            type="text"
            placeholder="Buscar do consultor"
            value={nome}
            onChange={ (e) => setNome(e.target.value)}
          />
          <InputCliente
            type="text"
            placeholder="Buscar por ID do consultor"
            inputMode="numeric"
            value={id}
            onChange={ (e) => limiteId(e, setId)}
            maxLength={7}
          />

          <select 
            className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
            value={status}
            onChange={ (e) => setStatus(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Ativo"> Ativo </option>
            <option value="Inativo"> Inativo </option>
          </select>

          <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10"> Atualizar </button>

          <button onClick={navegarCadastro} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200"> Cadastrar </button>

        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto px-4 mb-4">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="hidden sm:table-cell px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="hidden lg:table-cell px-4 py-3">CPF</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="hidden lg:table-cell px-4 py-3">Estado</th>
              <th className="hidden lg:table-cell px-4 py-3">Data de Cadastro</th>
              <th className="px-4 py-3 text-center"> Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientes && (
              clientes.map( (info) => (
                <tr key={info.id} className="hover:bg-gray-50 border-b border-gray-200">
                  <td className="hidden sm:table-cell px-4 py-2"> {info.id} </td>
                  <td className="px-4 py-2 max-w-[100px] sm:max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis"> {info.nome_completo} </td>
                  <td className="hidden lg:table-cell px-4 py-2"> {formatarCPF(info.cpf)} </td>
                  <td className="px-4 py-2"> {info.cidade} </td>
                  <td className="hidden lg:table-cell px-4 py-2"> {info.estado} </td>
                  <td className="hidden lg:table-cell px-4 py-2"> {formatarData(info.data_cadastro)} </td>
                  <td className="px-4 py-2 flex justify-center">
                    <button onClick={() => detalhes(info.id)} className="text-blue-600 hover:underline cursor-pointer"> <IoIosArrowDroprightCircle size={32} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
        
      <div className="flex gap-4 justify-center items-center mt-4 mb-6">
        <button
          onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaAtual === 1}
          className={`px-4 py-2 rounded text-white 
            ${paginaAtual === 1 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}`}
        >
          Anterior
        </button>

        <span> {paginaAtual} </span>

        <button
          onClick={() => setPaginaAtual((prev) => prev + 1)}
          disabled={paginaAtual >= totalPaginas}
          className={`px-4 py-2 rounded text-white 
            ${paginaAtual >= totalPaginas ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'}`}
        >
          Próxima
        </button>
      </div>

    </div>
  )
}