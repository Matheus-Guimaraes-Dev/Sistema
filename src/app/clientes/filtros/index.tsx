"use client";

import { InputCliente } from "../inputCliente";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

type CidadesPorEstado = {
  [estado: string]: string[];
}

const cidadesPorEstado: CidadesPorEstado = {
  RO: [
    "Porto Velho",
    "Ji-Paraná",
    "Ariquemes",
    "Vilhena",
    "Cacoal",
    "Rolim de Moura",
    "Guajará-Mirim",
    "Jaru",
    "Pimenta Bueno",
    "Machadinho d'Oeste",
    "Buritis",
    "Ouro Preto do Oeste",
    "Espigão d'Oeste",
    "Nova Mamoré",
    "Candeias do Jamari",
    "Alta Floresta d'Oeste",
    "Presidente Médici",
    "Cujubim",
    "São Miguel do Guaporé",
    "Alto Paraíso"
  ]
}

interface Cliente {
  id: number;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  status: string;
  data_cadastro: string;
};

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

  const router = useRouter();
  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado ? cidadesPorEstado[estado] : [];

  useEffect( () => {
    buscarCliente();
  }, [])

  async function buscarCliente() {

    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome_completo, cpf, estado, cidade, status, data_cadastro")

      if(error) {
        console.error("Erro ao buscar clientes: ", error);
        setErro(error.message);
      } else {
        console.log(data);
        setClientes(data as Cliente[] || []);
      }

  }

  const filtrarClientes = async (e: React.FormEvent) => {
    e.preventDefault();

    try {

      let query = supabase.from("clientes").select("*");

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

      const { data: resultado, error } = await query;

      if (error) {
        setErro("Erro ao buscar clientes.");
        console.error("Erro Supabase:", error);
      } else {
        setClientes(resultado || []);
        setErro("");
      }
    } catch (erro) {
      console.error("Erro geral:", erro);
      setErro("Erro inesperado ao filtrar clientes.");
    }
  };

  function detalhes(id: number) {
    router.push(`/clientes/${id}`);
  }

  function limiteCpf(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, ""); 
      if (value.length <= 11) {
        setCpf(value);
    }
  }

  function limiteId(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, ""); 
      if (value.length <=7) {
        setId(value);
    }
  }
  
  function formatarCPF(cpf: string) {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  function formatarData(data: string) {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  }

  return(
    <div className="flex-1">

      <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Lista de Clientes </h1>

      <form onSubmit={filtrarClientes}>
        <div className="bg-white p-4 rounded-xl shadow-md grid gap-4 md:grid-cols-3 mb-6">
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
            onChange={limiteId}
            maxLength={7}
          />
          <InputCliente
            type="text"
            placeholder="Buscar por CPF"
            inputMode="numeric"
            value={cpf}
            onChange={limiteCpf}
            maxLength={11}
          />

          <select 
            className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
            value={status}
            onChange={ (e) => setStatus(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Análise">Em Análise</option>
            <option value="Autorizado">Autorizado</option>
          </select>

          <select 
            className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
            value={data}
            onChange={(e) => setData(e.target.value)}
          >
            <option value="">Ordenar por data</option>
            <option value="asc">Mais antigos</option>
            <option value="desc">Mais recentes</option>
          </select>

          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setCidade(""); 
            }}
            className="w-full h-10 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          >
            <option value=""> Selecionar Estado... </option>
            {estados.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>

          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="w-full h-10 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          >
            <option value=""> Selecionar Cidade... </option>
            {cidades.map((cidade) => (
              <option key={cidade} value={cidade}>{cidade}</option>
            ))}
          </select>

          <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10"> Atualizar </button>

          <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200"> Cadastrar </button>

        </div>
      </form>

      <div className="bg-white rounded-xl shadow-md overflow-auto px-4 mb-4">
        <table className="min-w-full text-sm text-left border-collapse">
          <thead className="bg-blue-700 text-white">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Data de Cadastro</th>
              <th className="px-4 py-3 text-center"> Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientes && (
              clientes.map( (info) => (
                <tr key={info.id} className="hover:bg-gray-50 border-b border-gray-200">
                  <td className="px-4 py-2"> {info.id} </td>
                  <td className="px-4 py-2 max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis"> {info.nome_completo} </td>
                  <td className="px-4 py-2"> {formatarCPF(info.cpf)} </td>
                  <td className="px-4 py-2"> {info.cidade} </td>
                  <td className="px-4 py-2"> {info.estado} </td>
                  <td className="px-4 py-2">
                    <span className={`px-3 py-1 rounded-full text-white font-semibold text-xs 
                      ${info.status === "Autorizado" ? "bg-green-500" :
                        info.status === "Análise" ? "bg-[#950DF7]" : info.status === "Pendente" ? "bg-red-500" : "bg-red-500"}`}>
                      {info.status}
                    </span>
                  </td>
                  <td className="px-4 py-2"> {formatarData(info.data_cadastro)} </td>
                  <td className="px-4 py-2 flex justify-center">
                    <button onClick={() => detalhes(info.id)} className="text-blue-600 hover:underline cursor-pointer"> <IoIosArrowDroprightCircle size={32} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}