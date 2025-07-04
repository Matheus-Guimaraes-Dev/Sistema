"use client"

import { Input } from "../componentes/input"
import { useState } from "react"
import toast from 'react-hot-toast'
import { converterImagemParaWebP } from "../conversao";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { limparValorMonetario, formatarParaReal, mostrarValor } from "@/funcoes/formatacao";
import { limiteCep, limiteRg, limiteCpf, limiteTelefoneReserva, limiteWhatsapp } from "@/funcoes/limitacao";
import { cidadesPorEstado } from "@/app/clientes/estados-cidades";
import { Label } from "../componentes/label";
import { viaCep } from "@/components/types/types";
import { limiteDataRg, limiteDataNascimento } from "@/funcoes/limitacao";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import { Select } from "@/app/clientes/componentes/select-cliente";

export function FomularioComponente() {

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
  const [comprovanteRenda, setComprovanteRenda] = useState<File | null>(null);
  const [comprovanteEndereco, setComprovanteEndereco] = useState<File | null>(null);
  const [documentoFrente, setDocumentoFrente] = useState<File | null>(null);
  const [documentoVerso, setDocumentoVerso] = useState<File | null>(null); 

  const [loading, setLoading] = useState(false);

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  const router = useRouter();

  async function enviarFormulario(e: React.FormEvent) {

    setLoading(true);

    e.preventDefault()

    if (!nome.trim()) return toast.error("Digite o seu nome!");
    if (!email.trim()) return toast.error("Digite o seu email!");
    if (!cpf.trim()) return toast.error("Digite o seu cpf!");
    if (!rg.trim()) return toast.error("Digite o seu rg!");
    if (!dataRg.trim()) return toast.error("Insira a data do Rg!");
    if (!orgaoExpedidor.trim()) return toast.error("Digite o seu Orgão Expedidor!");
    if (!sexo.trim()) return toast.error("Selecione o seu sexo!");
    if (!estadoCivil.trim()) return toast.error("Selecione seu estado civil!");
    if (!dataNascimento.trim()) return toast.error("Insira a data de nascimento!");
    if (!whatsapp.trim()) return toast.error("Digite o seu whatsapp!");
    if (!cep.trim()) return toast.error("Digite o seu cep!");
    if (!bairro.trim()) return toast.error("Digite o seu bairro!");
    if (!rua.trim()) return toast.error("Digite a sua rua!");
    if (!Ncasa.trim()) return toast.error("Digite o número da casa!");
    if (!moradia.trim()) return toast.error("Selecione a sua moradia!");
    if (!estado.trim()) return toast.error("Selecione o seu estado!");
    if (!cidade.trim()) return toast.error("Selecione a sua cidade!");
    if (!pix.trim()) return toast.error("Digite a sua chave pix!");
    if (!valorSolicitado.trim()) return toast.error("Digite a quantia solicitada!");
    if (!comprovanteRenda || !comprovanteEndereco || !documentoFrente || !documentoVerso) return toast.error("Envie todas as 4 imagens")

    const valorMonetarioCorreto = limparValorMonetario(valorSolicitado);

    const { data: clienteData, error: insertError } = await supabase
      .from("clientes")
      .insert({ 
        nome_completo: nome.trim(),
        email: email.trim(),
        cpf: cpf.trim(),
        rg: rg.trim(),
        data_emissao_rg: dataRg,
        orgao_expedidor: orgaoExpedidor.trim(),
        sexo,
        estado_civil: estadoCivil,
        data_nascimento: dataNascimento,
        whatsapp,
        telefone_reserva: telefoneReserva,
        cep,
        bairro: bairro.trim(),
        rua: rua.trim(),
        numero_casa: Ncasa.trim(),
        moradia,
        estado,
        cidade,
        pix: pix.trim(),
        valor_solicitado: valorMonetarioCorreto
      })
      .select()

    if (insertError || !clienteData || clienteData.length === 0) {
      console.error("Erro ao criar cliente:", insertError)
      return toast.error("Erro ao criar cliente")
    }

    const idCliente = clienteData[0].id
    const arquivos = [comprovanteRenda, comprovanteEndereco, documentoFrente, documentoVerso]
    const campos = ["foto_comprovante_renda", "foto_comprovante_endereco", "foto_identidade_frente", "foto_identidade_verso"]
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

    setNome("");
    setEmail("");
    setCpf("");
    setRg("");
    setDataRg("");
    setOrgaoExpedidor("");
    setSexo("");
    setEstadoCivil("");
    setDataNascimento("");
    setWhatsapp("");
    setTelefoneReserva("");
    setCep("");
    setBairro("");
    setRua("");
    setNcasa("");
    setMoradia("");
    setEstado("");
    setCidade("");
    setPix("");
    setValorSolicitado("");
    setComprovanteRenda(null);
    setComprovanteEndereco(null);
    setDocumentoFrente(null);
    setDocumentoVerso(null);

    setLoading(false);

    router.push("/formulario/obrigado");

  }

  async function buscarCep(cep: string) {

    setLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data: viaCep = await response.json();
      console.log(data);
      setBairro(data.bairro ?? '');
      setRua(data.logradouro ?? '');
      setEstado(data.uf ?? ''); 
      setCidade(data.localidade ?? '');

    } catch(error) {
      console.log("Deu errado!");
    }

    setLoading(false);

  }

  const sexoOptions = [
    { label: "Masculino", value: "Feminino" },
    { label: "Feminino", value: "Autorizado" }
  ];

  const estadoCivilOptions = [
    { label: "Solteiro", value: "Solteiro" },
    { label: "Casado", value: "Casado" },
    { label: "Seperado", value: "Separado" },
    { label: "Divorciado", value: "Divorciado" },
    { label: "Viúvo", value: "Viuvo" },
  ];

  const moradiaOptions = [
    { label: "Casa", value: "Casa" },
    { label: "Apartamento", value: "Apartamento" },
    { label: "Aluguel", value: "Aluguel" },
    { label: "Área rural", value: "Area rural" },
  ];

  return(
    <form className="bg-white w-full sm:w-100 rounded-3xl pb-6 px-2" onSubmit={enviarFormulario}>

      <h1 className="text-center mt-4 font-semibold text-2xl pt-4"> Formulário </h1>

      {/* ======== FORMULARIO ========== */}

      <div className="mx-2 mt-4">

        <Label> Nome Completo </Label>
        <Input 
          type="text"
          value={nome}
          onChange={ (e) => setNome(e.target.value)}
          required
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> Email </Label>
        <Input 
          type="text" 
          value={email}
          onChange={ (e) => setEmail(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> CPF </Label>
        <Input 
          type="text"
          inputMode="numeric"
          value={cpf}
          onChange={(e) => limiteCpf(e, setCpf)}
          maxLength={11}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> RG </Label>
        <Input 
          type="text"
          inputMode="numeric"
          value={rg}
          onChange={(e) => limiteRg(e, setRg)}
          maxLength={7} 
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 flex-col mb-4">
        
        <Label> Data de Emissão RG </Label>
        <InputAlterar 
          type="date"
          value={dataRg}
          onChange={(e) => limiteDataRg(e, setDataRg)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> Orgão Expedidor </Label>
        <Input 
          type="text"
          value={orgaoExpedidor}
          onChange={ (e) => setOrgaoExpedidor(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 flex flex-col mb-4">
        
        <Label> Sexo </Label>
        <Select 
          value={sexo}
          onChange={setSexo}
          placeholder="Selecionar..."
          options={sexoOptions}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <Label> Estado Civil </Label>
        <Select 
          value={estadoCivil}
          onChange={setEstadoCivil}
          placeholder="Selecionar..."
          options={estadoCivilOptions}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <Label> Data Nascimento </Label>
        <InputAlterar 
          type="date"
          value={dataNascimento}
          onChange={(e) => limiteDataNascimento(e, setDataNascimento)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> Whatsapp </Label>
        <Input 
          type="number"
          value={whatsapp}
          onChange={(e) => limiteWhatsapp(e, setWhatsapp)}
          maxLength={13}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> Telefone Reserva </Label>
        <Input 
          type="number"
          value={telefoneReserva}
          onChange={ (e) => limiteTelefoneReserva(e, setTelefoneReserva)}
          maxLength={13}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> CEP </Label>
        <Input 
          type="number"
          value={cep}
          onChange={ (e) => limiteCep(e, setCep)}
          onBlur={() => {
            if (cep.length === 8) buscarCep(cep);
          }}
          maxLength={9}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> Bairro </Label>
        <Input 
          type="text"
          value={bairro}
          onChange={ (e) => setBairro(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> Rua </Label>
        <Input 
          type="text"
          value={rua}
          onChange={ (e) => setRua(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> Nº da Casa </Label>
        <Input 
          type="number" 
          value={Ncasa}
          onChange={ (e) => setNcasa(e.target.value)}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <Label> Moradia </Label>
        <Select 
          value={moradia}
          onChange={setMoradia} 
          placeholder="Selecionar..."
          options={moradiaOptions}
        />
        
      </div>
    
      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">

        <Label> Estado </Label>

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

        <Label> Cidade </Label>

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
        
        <Label> Chave Pix </Label>
        <Input 
          type="text" 
          value={pix}
          onChange={ (e) => setPix(e.target.value)}
        />
        
      </div>
      
      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <Label> Valor Solicitado </Label>
        <Input 
          type="text" 
          value={valorSolicitado}
          onChange={ (e) => mostrarValor(e, setValorSolicitado) }
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <Label> Foto do Comprovante de Renda </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setComprovanteRenda(e.target.files?.[0] || null)}
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <Label> Foto do Comprovante de Endereço </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setComprovanteEndereco(e.target.files?.[0] || null)}
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <Label> Foto da identidade (FRENTE) </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setDocumentoFrente(e.target.files?.[0] || null)}
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6">

        <Label> Foto da identidade (verso) </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setDocumentoVerso(e.target.files?.[0] || null)}
        />

      </div>

      <div className="mt-[-12px] mx-2">

        <div className="cursor-pointer">
         <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer w-full mt-2"> Enviar </button>
        </div>

      </div>

      {/* ========== LOADING ========== */}

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

    </form>
  )
}