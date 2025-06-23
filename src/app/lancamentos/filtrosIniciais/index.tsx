"use client";

import { InputCliente } from "@/app/clientes/inputCliente";
import { IoIosArrowDroprightCircle } from "react-icons/io";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { limiteCpf, limiteId, limiteIdDocumento } from "@/funcoes/limitacao";
import { formatarCPF, formatarData } from "@/funcoes/formatacao";
import InputPorcentagem from "@/app/consultores/cadastrar/formulario/InputPorcentagem";
import { FaArrowDown } from "react-icons/fa";
import { FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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

export function FiltrosLancamentos() {

  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [id, setId] = useState("");
  const [idDocumento, setIdDocumento] = useState("");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ordenarValor, setOrdenarValor] = useState("");
  const [erro, setErro] = useState("");

  const [filtros, setFiltros] = useState(true);


useEffect(() => {
  const larguraTela = window.innerWidth;

  if (larguraTela >= 640) {
    setFiltros(true); // Desktop começa aberto
  } else {
    setFiltros(false); // Mobile começa fechado
  }
}, []);

  const [porcentagem, setPorcentagem] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);

  const [abrirModalCadastrar, setAbrirModalCadastrar] = useState(false);

  useEffect(() => {
    buscarClientes()
  }, [paginaAtual])

  const router = useRouter();
  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado ? cidadesPorEstado[estado] : [];
  
  const itensPorPagina = 5
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

  return(
    <div className="flex-1">

      <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Lançamentos </h1>

      <AnimatePresence>
        {filtros && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
            onSubmit={aplicarFiltro}
          >
            <div className="bg-white p-4 rounded-xl shadow-md grid gap-4 
              grid-cols-1 
              sm:grid-cols-2 
              lg:grid-cols-3 
              mb-6">
              <InputCliente
                type="text"
                placeholder="Buscar por nome do cliente"
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
              <InputCliente
                type="text"
                placeholder="Buscar por ID do documento"
                inputMode="numeric"
                value={id}
                onChange={ (e) => limiteIdDocumento(e, setIdDocumento)}
                maxLength={7}
              />

              <select 
                className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
                value={status}
                onChange={ (e) => setStatus(e.target.value)}
              >
                <option value="">Status</option>
                <option value="Pago">Pago</option>
                <option value="Pendente">Pendente</option>
              </select>

              <select 
                className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
                value={status}
                onChange={ (e) => setStatus(e.target.value)}
              >
                <option value="">Consultor</option>
                <option value="Pago">Arthur</option>
                <option value="Pendente">Bia</option>
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
                className="w-full h-10 border-2 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
                value={ordenarValor}
                onChange={(e) => setOrdenarValor(e.target.value)}
              >
                <option value="">Ordenar por Valor</option>
                <option value="asc">Maior para Menor</option>
                <option value="desc">Menor para Maior</option>
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

              <button onClick={() => setAbrirModalCadastrar(true)} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 hidden sm:block"> Cadastrar </button>

            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="px-4 sm:hidden mb-4">
        <div onClick={() => setFiltros(!filtros)} className='flex items-center justify-between px-4 gap-2 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm text-center cursor-pointer py-2 w-full'>
          
          <button type="button" className="text-lg cursor-pointer"> Filtros </button>

          {filtros ? (
            <FaArrowUp size={24} color="FFF" />
          ) : <FaArrowDown size={24} color="FFF" /> }

        </div>

        <div className="mt-4">
          <button onClick={() => setAbrirModalCadastrar(true)} className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200"> Lançamento </button>
        </div>

      </div>

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

      {abrirModalCadastrar && (
      
      <div className="fixed inset-0 flex items-center justify-center z-50">

        <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

        <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
          <h2 className="text-xl font-bold mb-4"> Lançamento </h2>

          <form>

          <InputPorcentagem 
            value={porcentagem}
            onChange={setPorcentagem}
            label="10%, 7%, 3%.."
          />

          <button type="submit" className="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-lg text-center cursor-pointer w-full h-10 bg-[linear-gradient(90deg,_rgba(4,128,8,1)_1%,_rgba(0,125,67,1)_50%,_rgba(10,115,5,1)_100%)] hover:bg-[linear-gradient(90deg,_rgba(6,150,10,1)_1%,_rgba(0,145,77,1)_50%,_rgba(12,135,7,1)_100%)] transition duration-200 my-4"> Salvar </button>

          <div className="flex justify-center gap-4">
            <button 
              type="button" 
              onClick={() => {
                setAbrirModalCadastrar(false);
                setPorcentagem("");
              }} 
              className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Fechar </button>
          </div>

          </form>
        </div>
      </div>
      )}

      {filtros && (
        <div>
          oi
        </div>
      )}


    </div>
  )
}