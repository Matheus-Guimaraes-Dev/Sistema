"use client"

import { Input } from "./input"
import { useState } from "react"
import toast from 'react-hot-toast'

import { converterImagemParaWebP } from "./conversao";
import { supabase } from "@/lib/supabase";

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

export function FomularioComponente() {
 
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
  const [comprovanteRenda, setComprovanteRenda] = useState<File | null>(null);
  const [comprovanteEndereco, setComprovanteEndereco] = useState<File | null>(null);
  const [documentoFrente, setDocumentoFrente] = useState<File | null>(null);
  const [documentoVerso, setDocumentoVerso] = useState<File | null>(null); 

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado ? cidadesPorEstado[estado] : [];

  const [imagem, setImagem] = useState<File | null>(null)

  async function enviarFormulario(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return alert("Digite o nome do cliente")
    if (!comprovanteRenda || !comprovanteEndereco || !documentoFrente || !documentoVerso) return alert("Envie todas as 4 imagens")

    const { data: clienteData, error: insertError } = await supabase
      .from("clientes")
      .insert({ nome: nome.trim() })
      .select()

    if (insertError || !clienteData || clienteData.length === 0) {
      console.error(insertError)
      return alert("Erro ao criar cliente")
    }

    const idCliente = clienteData[0].id
    const arquivos = [comprovanteRenda, comprovanteEndereco, documentoFrente, documentoVerso]
    const campos = ["renda", "endereco", "identidade_frente", "identidade_verso"]
    const urls: Record<string, string> = {}

    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i]
      const nomeCampo = campos[i]

      try {
        const imagemConvertida = await converterImagemParaWebP(arquivo!)
        const nomeArquivo = `clientes/${idCliente}/${nomeCampo}-${Date.now()}.webp`

        const { error: uploadError } = await supabase
          .storage
          .from("clientes")
          .upload(nomeArquivo, imagemConvertida, {
            contentType: "image/webp"
          })

        if (uploadError) {
          console.error(uploadError)
          return alert(`Erro ao enviar ${nomeCampo}`)
        }

        const { data: urlData } = supabase
          .storage
          .from("clientes")
          .getPublicUrl(nomeArquivo)

        urls[nomeCampo] = urlData.publicUrl

      } catch (erro) {
        console.error("Erro na conversão:", erro)
        return alert(`Erro ao processar imagem de ${nomeCampo}`)
      }
    }

    const { error: updateError } = await supabase
      .from("clientes")
      .update(urls)
      .eq("id", idCliente)

    if (updateError) {
      console.error(updateError)
      return alert("Erro ao salvar URLs no cadastro")
    }

    alert("Cliente cadastrado com sucesso!")
    setNome("")
    setComprovanteRenda(null)
    setComprovanteEndereco(null)
    setDocumentoFrente(null)
    setDocumentoVerso(null)
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


  const formatarParaReal = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "");
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

  const mostrarValor = (e: React.ChangeEvent<HTMLInputElement>) => {

    const valor = e.target.value;
    const formatado = formatarParaReal(valor);

    setValorSolicitado(formatado);
    console.log(valorSolicitado)

  }

  return(
    <form className="bg-white w-full sm:w-100 rounded-3xl pb-6 px-2" onSubmit={enviarFormulario}>

      <h1 className="text-center mt-4 font-semibold text-2xl pt-4"> Formulário </h1>

      <div className="mx-2 mt-4">

        <label className="text-sm sm:text-base"> Nome Completo </label>
        <Input 
          type="text"
          value={nome}
          onChange={ (e) => setNome(e.target.value)}
          required
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Email </label>
        <Input 
          type="text" 
          value={nome}
          onChange={ (e) => setNome(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> CPF </label>
        <Input 
          type="text"
          inputMode="numeric"
          value={cpf}
          onChange={limiteCpf}
          maxLength={11}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> RG </label>
        <Input 
          type="text"
          inputMode="numeric"
          value={rg}
          onChange={limiteRg}
          maxLength={7} 
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 flex-col mb-4">
        
        <label className="text-sm sm:text-base"> Data de Emissão RG </label>
        <input 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          type="date"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Orgão Expedidor </label>
        <Input 
          type="text"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 flex flex-col mb-4">
        
        <label className="text-sm sm:text-base"> Sexo </label>
        <select 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          value={sexo}
          onChange={ (e) => setSexo(e.target.value)}
        >
          <option value="" disabled> Selecionar... </option>
          <option value="opcao1"> Masculino </option>
          <option value="opcao2"> Feminino </option>
        </select>
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <label className="text-sm sm:text-base"> Estado Civil </label>
        <select 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          value={estadoCivil}
          onChange={ (e) => setEstadoCivil(e.target.value)}
        > 
          <option value="" disabled> Selecionar... </option>
          <option value="opcao1"> Solteiro </option>
          <option value="opcao2"> Casado </option>
          <option value="opcao2"> Seperado(a) </option>
          <option value="opcao2"> Divorciado(a) </option>
          <option value="opcao2"> Viúvo(a) </option>
        </select>
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <label className="text-sm sm:text-base"> Data Nascimento </label>
        <input 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          type="date"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Whatsapp </label>
        <Input 
          type="number"
          value={whatsapp}
          onChange={limiteWhatsapp}
          maxLength={13}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Telefone Reserva </label>
        <Input 
          type="number"
          value={telefoneReserva}
          onChange={limiteTelefoneReserva}
          maxLength={13}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> CEP </label>
        <Input 
          type="number"
          value={cep}
          onChange={limiteCep}
          onBlur={() => {
            if (cep.length === 8) buscarCep(cep);
          }}
          maxLength={9}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Bairro </label>
        <Input 
          type="text"
          value={bairro}
          onChange={ (e) => setBairro(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Rua </label>
        <Input 
          type="text"
          value={rua}
          onChange={ (e) => setRua(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Nº da Casa </label>
        <Input 
          type="number" 
          value={Ncasa}
          onChange={ (e) => setNcasa(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <label className="text-sm sm:text-base"> Moradia </label>
        <select 
          value={moradia}
          onChange={(e) => setMoradia(e.target.value)} 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
        >
          <option value="" disabled> Selecionar... </option>
          <option value="opcao1"> Casa </option>
          <option value="opcao2"> Apartamento </option>
          <option value="opcao2"> Aluguel </option>
          <option value="opcao2"> Área rural </option>
        </select>
        
      </div>
    
      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">

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

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">

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

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Chave Pix </label>
        <Input 
          type="text" 
          value={pix}
          onChange={ (e) => setPix(e.target.value)}
        />
        
      </div>
      
      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Valor Solicitado </label>
        <Input 
          type="text" 
          value={valorSolicitado}
          onChange={mostrarValor}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <label className="text-sm sm:text-base"> Foto do Comprovante de Renda </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setComprovanteRenda(e.target.files?.[0] || null)}
          required
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <label className="text-sm sm:text-base"> Foto do Comprovante de Endereço </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setComprovanteEndereco(e.target.files?.[0] || null)}
          required
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <label className="text-sm sm:text-base"> Foto da identidade (FRENTE) </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setDocumentoFrente(e.target.files?.[0] || null)}
          required
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6">

        <label className="text-sm sm:text-base"> Foto da identidade (verso) </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setDocumentoVerso(e.target.files?.[0] || null)}
          required
        />

      </div>

{/*       
      <input
        type="file"
        accept="image/*"
        onChange={e => setImagem(e.target.files?.[0] || null)}
        required
      /> */}

      <div className="mt-[-12px] mx-2">

        <div className="cursor-pointer">
         <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer w-full mt-2"> Enviar </button>
        </div>

      </div>

    </form>
  )
}