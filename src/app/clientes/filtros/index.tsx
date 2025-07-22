"use client";

import { InputCliente } from "../componentes/input-cliente";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { limiteCpf, limiteId } from "@/funcoes/limitacao";
import { formatarCPF, formatarData } from "@/funcoes/formatacao";
import { Cliente } from "../types";
import { cidadesPorEstado } from "../estados-cidades";
import { Select } from "../componentes/select-cliente";

export function FiltrosClientes() {

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

  const router = useRouter();

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];
  
  const itensPorPagina = 30;
  const [totalPaginas, setTotalPaginas] = useState(1);

  const buscarClientes = async () => {

    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina - 1;

    try {

      let query = supabase
        .from("clientes")
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
      } else {
        query = query.order("id", { ascending: true });
      }

      const { count } = await query.range(0, 0);
      const total = count ?? 0;

      const inicio = (paginaAtual - 1) * itensPorPagina;
      const fim = inicio + itensPorPagina - 1;

      if (inicio >= total && total > 0) {
        setPaginaAtual(1);
        return;
      }

      query = query.range(inicio, fim);
      const { data: resultado, error } = await query;

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

  function navegarCadastro() {
    router.push("clientes/cadastrar");
  }

  function detalhes(id: number) {
    router.push(`/clientes/${id}`);
  }

  const aplicarFiltro = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginaAtual(1);
    buscarClientes();
  };

  const statusOptions = [
    { label: "Pendente", value: "Pendente" },
    { label: "Em Análise", value: "Análise" },
    { label: "Autorizado", value: "Autorizado" }
  ];

  const dataOptions = [
    { label: "Mais Antigos", value: "asc" },
    { label: "Mais Recentes", value: "desc" },

  ];

  return(
    <div className="flex-1">

      <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Lista de Clientes </h1>

      {/* ========== FILTROS ========== */}

      <form onSubmit={aplicarFiltro}>
        <div className="bg-white p-4 rounded-xl shadow-md grid gap-4 
          grid-cols-1 
          sm:grid-cols-2 
          lg:grid-cols-3 
          mb-6">
          <InputCliente
            type="text"
            placeholder="Buscar por nome"
            value={nome}
            onChange={ (e) => setNome(e.target.value)}
          />
          <InputCliente
            type="text"
            placeholder="Buscar por ID do cliente"
            inputMode="numeric"
            value={id}
            onChange={ (e) => limiteId(e, setId)}
            maxLength={7}
          />
          <InputCliente
            type="text"
            placeholder="Buscar por CPF"
            inputMode="numeric"
            value={cpf}
            onChange={ (e) => limiteCpf(e, setCpf)}
            maxLength={11}
          />

          <Select
            value={status}
            onChange={setStatus}
            options={statusOptions}
            placeholder="Status"
          />

          <Select 
            value={data}
            onChange={setData}
            options={dataOptions}
            placeholder="Ordenar por data"
          />

          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setCidade(""); 
            }}
            className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          >
            <option value=""> Selecionar Estado... </option>
            {estados.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>

          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          >
            <option value=""> Selecionar Cidade... </option>
            {cidades.map((cidade) => (
              <option key={cidade} value={cidade}>{cidade}</option>
            ))}
          </select>

          <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-9"> Atualizar </button>

          <button onClick={navegarCadastro} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-9 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200"> Cadastrar </button>

        </div>
      </form>

      {/* ========== TABELA ========== */}

      <div className="bg-white rounded-xl shadow-md overflow-x-auto px-4 mb-4">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="hidden sm:table-cell px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="hidden lg:table-cell px-4 py-3">CPF</th>
              <th className="hidden sm:table-cell px-4 py-3">Cidade</th>
              <th className="hidden lg:table-cell px-4 py-3">Estado</th>
              <th className="px-4 py-3">Status</th>
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
                  <td className="hidden sm:table-cell px-4 py-2"> {info.cidade} </td>
                  <td className="hidden lg:table-cell px-4 py-2"> {info.estado} </td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded-full text-white font-semibold text-xs 
                      ${info.status === "Autorizado" ? "bg-green-500" :
                        info.status === "Análise" ? "bg-[#950DF7]" : info.status === "Pendente" ? "bg-red-500" : "bg-red-500"}`}>
                      {info.status}
                    </span>
                  </td>
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

      {/* ========== PRÓXIMA PÁGINA ========== */}
        
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

      {/* ==================================================== */}

    </div>
  )
}