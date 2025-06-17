"use client"

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InputAlterar } from "./InputAlterar";
import { createClient } from "@/lib/client";
import AdicionarDocumento from "./AdicionarDocumento";
import { AlterarStatus } from "./AlterarStatus";

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

interface viaCep {
  bairro: string;
  cep: string;
  uf: string;
  localidade: string;
  logradouro: string;
}

interface infoClientes {
  id: string;
  data_cadastrado: string;
  status: string;
  nome_completo: string;
  email: string;
  cpf: string;
  rg: string;
  data_emissao_rg: string;
  orgao_expedidor: string;
  sexo: string;
  estado_civil: string;
  data_nascimento: string;
  whatsapp: string;
  telefone_reserva: string;
  cep: string;
  bairro: string;
  rua: string;
  numero_casa: string;
  moradia: string;
  cidade: string;
  estado: string;
  pix: string;
  valor_solicitado: string;
  observacao: string;
}

interface PropsAlterar {
  informacoesCliente: infoClientes;
}

export default function Alterar({ informacoesCliente }: PropsAlterar ) {

  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [dataRg, setDataRg] = useState("");
  const [orgaoExpedidor, setOrgaoExpedidor] = useState("");
  const [sexo, setSexo] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telefoneReserva, setTelefoneReserva] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [Ncasa, setNcasa] = useState("");
  const [moradia, setMoradia] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [pix, setPix] = useState("");
  const [valorSolicitado, setValorSolicitado] = useState("");
  const [observacao, setObservacao] = useState("");

  const valorMonetarioCorreto = limparValorMonetario(valorSolicitado);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [ativar, setAtivar] = useState(false);

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado ? cidadesPorEstado[estado] : [];

  useEffect( () => {
    if(informacoesCliente) {
      setNome(informacoesCliente.nome_completo);
      setEmail(informacoesCliente.email);
      setCpf(informacoesCliente.cpf);
      setRg(informacoesCliente.rg);
      setDataRg(informacoesCliente.data_emissao_rg);
      setOrgaoExpedidor(informacoesCliente.orgao_expedidor);
      setSexo(informacoesCliente.sexo);
      setEstadoCivil(informacoesCliente.estado_civil);
      setDataNascimento(informacoesCliente.data_nascimento);
      setWhatsapp(informacoesCliente.whatsapp);
      setTelefoneReserva(informacoesCliente.telefone_reserva);
      setCep(informacoesCliente.cep);
      setBairro(informacoesCliente.bairro);
      setRua(informacoesCliente.rua);
      setNcasa(informacoesCliente.numero_casa);
      setMoradia(informacoesCliente.moradia);
      setEstado(informacoesCliente.estado);
      setCidade(informacoesCliente.cidade);
      setPix(informacoesCliente.pix);
      setValorSolicitado(Number(informacoesCliente.valor_solicitado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }));
      setObservacao(informacoesCliente.observacao)
    }
  }, [informacoesCliente] );

  async function atualizarCliente(e: FormEvent) {

    e.preventDefault();

    const dadosAtualizados = {
      nome_completo: nome,
      email: email,
      cpf: cpf,
      rg: rg,
      data_emissao_rg: dataRg,
      orgao_expedidor: orgaoExpedidor,
      sexo: sexo,
      estado_civil: estadoCivil,
      data_nascimento: dataNascimento,
      whatsapp: whatsapp,
      telefone_reserva: telefoneReserva,
      cep: cep,
      bairro: bairro,
      rua: rua,
      numero_casa: Ncasa,
      moradia: moradia,
      cidade: cidade,
      estado: estado,
      pix: pix,
      valor_solicitado: valorMonetarioCorreto,
      observacao: observacao,
    }

    const { error } = await supabase
      .from("clientes")
      .update(dadosAtualizados)
      .eq("id", informacoesCliente.id)

    if(error) {
      console.error("Erro ao atualizar cliente:", error.message);
      return false;
    }

    window.location.reload()

    return true

  }

  async function deletarCliente() {

    const { data: arquivos, error: erroLista } = await supabase.storage
      .from("clientes")
      .list(`clientes/${informacoesCliente.id}/`, { limit: 100 });

    if (erroLista) {
      console.log("Erro ao listar arquivos", erroLista.message);
      return false;
    }

    if (arquivos && arquivos.length > 0) {
      const caminhosArquivos = arquivos.map(
        (arquivo) => `clientes/${informacoesCliente.id}/${arquivo.name}`
      );

      const { error: erroRemover } = await supabase.storage
        .from("clientes")
        .remove(caminhosArquivos);

      if (erroRemover) {
        console.error("Erro ao remover arquivos:", erroRemover.message);
        return false;
      }
    } else {
      console.warn("Nenhum arquivo encontrado para deletar.");
    }

    const { error: erroDeletarCliente } = await supabase
      .from("clientes")
      .delete()
      .eq("id", informacoesCliente.id);

    if (erroDeletarCliente) {
      console.error("Erro ao deletar cliente:", erroDeletarCliente.message);
      return false;
    }

    return true;

  }

  async function buscarCep(cep: string) {

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data: viaCep = await response.json();
      console.log(data);

      setBairro(data.bairro);
      setRua(data.logradouro);
      setEstado(data.uf); 
      setCidade(data.localidade);

    } catch(error) {
      console.log("Deu errado!");
    }

  }

  const mostrarValor = (e: React.ChangeEvent<HTMLInputElement>) => {

    const valor = e.target.value;
    const formatado = formatarParaReal(valor);

    setValorSolicitado(formatado);
    console.log(valorSolicitado)

  }

  const formatarParaReal = (valor: string) => {
    const apenasNumeros = String(valor).replace(/\D/g, "");
    const valorNumerico = parseFloat(apenasNumeros) / 100;

    console.log("INFO: ", valorNumerico)

    if (isNaN(valorNumerico)) {
      return "";
    }

    return valorNumerico.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function ativarBotao() {
    setAtivar(!ativar)
    console.log(ativar);
  }

  function limparValorMonetario(valor: string): number {
    return parseFloat(
      String(valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
    );
  }

  function limiteCpf(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, ""); 
    if (value.length <= 11) {
      setCpf(value);
    }
  }

  function limiteRg(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if(value.length <= 7) {
      setRg(value);
    }
  }

  function limiteWhatsapp(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if(value.length <= 13) {
      setWhatsapp(value);
    }
  }

  function limiteTelefoneReserva(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if(value.length <= 13) {
      setTelefoneReserva(value);
    }
  }

  function limiteCep(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if(value.length <= 8) {
      setCep(value);
    }
  }

  return(
    <div>

      <div className="flex gap-3 flex-wrap">

        <button onClick={ativarBotao} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Alterar </button>
        
        <button onClick={() => setMostrarModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Deletar </button>

        <AdicionarDocumento clienteId={informacoesCliente.id} />

        <AlterarStatus clienteId={informacoesCliente.id} status={informacoesCliente.status} />

      </div>

      {ativar && (
        <form onSubmit={atualizarCliente} className="bg-white shadow rounded-xl p-6 my-5">

          <section className="grid md:grid-cols-2 gap-2">

            <div>
              <label className="text-sm sm:text-base"> Nome Completo </label>
              <InputAlterar 
                type="text"
                value={nome}
                onChange={ (e) => setNome(e.target.value)}
                required
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Email </label>
              <InputAlterar 
                type="text" 
                value={email}
                onChange={ (e) => setEmail(e.target.value)}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> CPF </label>
              <InputAlterar 
                type="text"
                inputMode="numeric"
                value={cpf}
                onChange={limiteCpf}
                maxLength={11}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> RG </label>
              <InputAlterar 
                type="text"
                inputMode="numeric"
                value={rg}
                onChange={limiteRg}
                maxLength={7} 
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Data de Emissão RG </label>
              <input 
                className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
                type="date"
                value={dataRg}
                onChange={ (e) => setDataRg(e.target.value)}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Orgão Expedidor </label>
              <InputAlterar 
                type="text"
                value={orgaoExpedidor}
                onChange={ (e) => setOrgaoExpedidor(e.target.value)}
              />
            </div>
      
            <div className="flex flex-col">
              <label className="text-sm sm:text-base"> Sexo </label>
              <select 
                className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
                value={sexo}
                onChange={ (e) => setSexo(e.target.value)}
              >
                <option value="" disabled> Selecionar... </option>
                <option value="Masculino"> Masculino </option>
                <option value="Feminino"> Feminino </option>
              </select>
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Estado Civil </label>
              <select 
                className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
                value={estadoCivil}
                onChange={ (e) => setEstadoCivil(e.target.value)}
              > 
                <option value="" disabled> Selecionar... </option>
                <option value="Solteiro"> Solteiro </option>
                <option value="Casado"> Casado </option>
                <option value="Separado"> Seperado(a) </option>
                <option value="Divorciado"> Divorciado(a) </option>
                <option value="Viuvo"> Viúvo(a) </option>
              </select>
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Data Nascimento </label>
              <input 
                className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
                type="date"
                value={dataNascimento}
                onChange={ (e) => setDataNascimento(e.target.value)}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Whatsapp </label>
              <input 
                type="number"
                value={whatsapp}
                onChange={limiteWhatsapp}
                maxLength={13}
                className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Telefone Reserva </label>
              <InputAlterar 
                type="number"
                value={telefoneReserva}
                onChange={limiteTelefoneReserva}
                maxLength={13}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> CEP </label>
              <InputAlterar 
                type="number"
                value={cep}
                onChange={limiteCep}
                onBlur={() => {
                  if (cep.length === 8) buscarCep(cep);
                }}
                maxLength={9}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Bairro </label>
              <InputAlterar 
                type="text"
                value={bairro}
                onChange={ (e) => setBairro(e.target.value)}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Rua </label>
              <InputAlterar 
                type="text"
                value={rua}
                onChange={ (e) => setRua(e.target.value)}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Nº da Casa </label>
              <InputAlterar 
                type="number" 
                value={Ncasa}
                onChange={ (e) => setNcasa(e.target.value)}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Moradia </label>
              <select 
                value={moradia}
                onChange={(e) => setMoradia(e.target.value)} 
                className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6] mt-1"
              >
                <option value="" disabled> Selecionar... </option>
                <option value="Casa"> Casa </option>
                <option value="Apartamento"> Apartamento </option>
                <option value="Aluguel"> Aluguel </option>
                <option value="Area rural"> Área rural </option>
              </select>
            </div>
          
            <div>
              <label className="text-sm sm:text-base"> Estado </label>
              <select
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value);
                  setCidade(""); 
                }}
                className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
              >
                <option value="" disabled>Selecionar Estado...</option>
                {estados.map((uf) => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Cidade </label>
              <select
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
              >
                <option value="" disabled>Selecionar Cidade...</option>
                {cidades.map((cidade) => (
                  <option key={cidade} value={cidade}>{cidade}</option>
                ))}
              </select>
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Chave Pix </label>
              <InputAlterar 
                type="text" 
                value={pix}
                onChange={ (e) => setPix(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm sm:text-base"> Valor Solicitado </label>
              <InputAlterar 
                type="text" 
                value={valorSolicitado}
                onChange={mostrarValor}
              />
            </div>

            <div>
              <label className="text-sm sm:text-base"> Observação </label>
              <InputAlterar 
                type="text"
                value={observacao ?? ""}
                onChange={ (e) => setObservacao(e.target.value)}
              />
            </div>

          </section>

          <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer w-full mt-8"> Salvar Alterações </button>

        </form>
      )}

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente excluir este cliente? </h2>

            <p className="mb-4"> Todos os dados relacionados a este cliente serão apagados de forma permanente. </p>

            <div className="flex justify-center gap-4">
              <button onClick={async () => {
                const sucesso = await deletarCliente();
                  if (sucesso) {
                    setMostrarModal(false);
                    window.location.href = "/clientes";
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"> Sim </button>

              <button onClick={() => setMostrarModal(false)} className="bg-gray text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"> Não </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}