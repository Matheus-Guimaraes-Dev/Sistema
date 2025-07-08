"use client"

import { InputAlterar } from "../../components/InputAlterar";
import { useState } from "react"
import toast from 'react-hot-toast'
import { converterImagemParaWebP } from "@/app/formulario/components/conversao";
import { createClient } from "@/lib/client";
import { limparValorMonetario, limparNomeArquivo, mostrarValor } from "@/funcoes/formatacao";
import { limiteCpf, limiteRg, limiteWhatsapp, limiteTelefoneReserva, limiteCep, limiteDataNascimento, limiteDataRg } from "@/funcoes/limitacao";
import { cidadesPorEstado } from "../../estados-cidades";
import { viaCep } from "@/components/types/types";
import { Label } from "@/app/formulario/components/componentes/label";
import { Select } from "../../componentes/select-cliente";
import { useRef } from "react";

export function Formulario() {

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
  const [observacao, setObservacao] = useState("");
  const [valorSolicitado, setValorSolicitado] = useState("");
  const [comprovanteRenda, setComprovanteRenda] = useState<File | null>(null);
  const [comprovanteEndereco, setComprovanteEndereco] = useState<File | null>(null);
  const [documentoFrente, setDocumentoFrente] = useState<File | null>(null);
  const [documentoVerso, setDocumentoVerso] = useState<File | null>(null); 
  const [arquivo, setArquivo] = useState<File | null>(null); 
  const [loading, setLoading] = useState(false);

  const rendaRef = useRef<HTMLInputElement>(null);
  const enderecoRef = useRef<HTMLInputElement>(null);
  const frenteRef = useRef<HTMLInputElement>(null);
  const versoRef = useRef<HTMLInputElement>(null);
  const outroRef = useRef<HTMLInputElement>(null);


  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  async function enviarFormulario(e: React.FormEvent) {

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

    setLoading(true);

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
        observacao: observacao,
        valor_solicitado: valorMonetarioCorreto
      })
      .select()

    if (insertError || !clienteData || clienteData.length === 0) {
      console.error("Erro ao criar cliente:", insertError)
      return toast.error("Erro ao criar cliente")
    } else { 
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
      setObservacao("");
      setComprovanteRenda(null);
      setComprovanteEndereco(null);
      setDocumentoFrente(null);
      setDocumentoVerso(null);
      setArquivo(null);

      rendaRef.current!.value = "";
      enderecoRef.current!.value = "";
      frenteRef.current!.value = "";
      versoRef.current!.value = "";
      outroRef.current!.value = "";
      toast.success('Cliente Cadastrado com Sucesso!')
    }

    const idCliente = clienteData[0].id
    const arquivos: { arquivo: File | null, campo: string }[] = [
      { arquivo: comprovanteRenda, campo: "foto_comprovante_renda" },
      { arquivo: comprovanteEndereco, campo: "foto_comprovante_endereco" },
      { arquivo: documentoFrente, campo: "foto_identidade_frente" },
      { arquivo: documentoVerso, campo: "foto_identidade_verso" },
      { arquivo: arquivo, campo: "outro_arquivo" },
    ];
    const urls: Record<string, string> = {}

    for (const { arquivo, campo } of arquivos) {
      
      if (!arquivo) continue;

      try {
        
        const extensaoOriginal = arquivo.name.split('.').pop()?.toLowerCase() || "file";
        const isPDF = arquivo.type === "application/pdf";

        let arquivoFinal: Blob;
        let extensao: string;

        if (isPDF) {
          arquivoFinal = arquivo;
          extensao = "pdf";
        } else {
          const convertido = await converterImagemParaWebP(arquivo);
          arquivoFinal = convertido;
          extensao = "webp";
        }

        const nomeArquivo = campo === "outro_arquivo"
          ? `clientes/${idCliente}/${limparNomeArquivo(arquivo.name)}`
          : `clientes/${idCliente}/${campo}-${Date.now()}.${extensao}`;

        const { error: uploadError } = await supabase
          .storage
          .from("clientes")
          .upload(nomeArquivo, arquivoFinal, {
            contentType: arquivoFinal.type,
          });

        if (uploadError) {
          console.error(uploadError);
          return alert(`Erro ao enviar ${campo}`);
        }

        const { data: urlData } = supabase
          .storage
          .from("clientes")
          .getPublicUrl(nomeArquivo);

        urls[campo] = urlData.publicUrl;

      } catch (erro) {
        console.error("Erro no processamento do arquivo:", erro);
        return alert(`Erro ao processar o arquivo: ${campo}`);
      }
    }

    setLoading(false);

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
    <form className="grid md:grid-cols-3 bg-white shadow rounded-xl p-6 my-5 gap-2" onSubmit={enviarFormulario}>

      <div>
        <Label> Nome Completo </Label>
        <InputAlterar 
          type="text"
          value={nome}
          onChange={ (e) => setNome(e.target.value)}
          required
        />
      </div>
      
      <div>
        <Label> Email </Label>
        <InputAlterar 
          type="text" 
          value={email}
          onChange={ (e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <Label> CPF </Label>
        <InputAlterar 
          type="text"
          inputMode="numeric"
          value={cpf}
          onChange={ (e) => limiteCpf(e, setCpf)}
          maxLength={11}
        />
      </div>

      <div>
        <Label> RG </Label>
        <InputAlterar 
          type="text"
          inputMode="numeric"
          value={rg}
          onChange={ (e) => limiteRg(e, setRg)}
          maxLength={7} 
        />
      </div>

      <div>
        <Label> Data de Emissão RG </Label>
        <InputAlterar 
          type="date"
          value={dataRg}
          onChange={(e) => limiteDataRg(e, setDataRg)}
        />
      </div>

      <div>
        <Label> Orgão Expedidor </Label>
        <InputAlterar 
          type="text"
          value={orgaoExpedidor}
          onChange={ (e) => setOrgaoExpedidor(e.target.value)}
        />
      </div>

      <div>
        <Label> Sexo </Label>
        <Select 
          value={sexo}
          onChange={setSexo}
          placeholder="Selecionar..."
          options={sexoOptions}
        />
      </div>

      <div>
        <Label> Estado Civil </Label>
        <Select 
          value={estadoCivil}
          onChange={setEstadoCivil}
          placeholder="Selecionar..."
          options={estadoCivilOptions}
        />
      </div>

      <div>
        <label> Data Nascimento </label>
        <InputAlterar 
          type="date"
          value={dataNascimento}
          onChange={(e) => limiteDataNascimento(e, setDataNascimento)}
        />
      </div>

      <div>
        <Label> Whatsapp </Label>
        <InputAlterar 
          type="number"
          value={whatsapp}
          onChange={ (e) => limiteWhatsapp(e, setWhatsapp)}
          maxLength={13}
        />
      </div>

      <div>
        <Label> Telefone Reserva </Label>
        <InputAlterar 
          type="number"
          value={telefoneReserva}
          onChange={ (e) => limiteTelefoneReserva(e, setTelefoneReserva)}
          maxLength={13}
        />
      </div>

      <div>
        <Label> CEP </Label>
        <InputAlterar 
          type="number"
          value={cep}
          onChange={ (e) => limiteCep(e, setCep)}
          onBlur={() => {
            if (cep.length === 8) buscarCep(cep);
          }}
          maxLength={9}
        />
      </div>

      <div>
        <Label> Bairro </Label>
        <InputAlterar 
          type="text"
          value={bairro}
          onChange={ (e) => setBairro(e.target.value)}
        />
      </div>

      <div>
        <Label> Rua </Label>
        <InputAlterar 
          type="text"
          value={rua}
          onChange={ (e) => setRua(e.target.value)}
        />
      </div>

      <div>
        <Label> Nº da Casa </Label>
        <InputAlterar 
          type="number" 
          value={Ncasa}
          onChange={ (e) => setNcasa(e.target.value)}
        />
      </div>

      <div>
        <Label> Moradia </Label>
        <Select 
          value={moradia}
          onChange={setMoradia} 
          placeholder="Selecionar..."
          options={moradiaOptions}
        />
      </div>
    
      <div>
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

      <div>
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

      <div>
        <Label> Chave Pix </Label>
        <InputAlterar 
          type="text" 
          value={pix}
          onChange={ (e) => setPix(e.target.value)}
        />
      </div>
      
      <div>
        <Label> Valor Solicitado </Label>
        <InputAlterar 
          type="text" 
          value={valorSolicitado}
          onChange={ (e) => mostrarValor(e, setValorSolicitado)}
        />
      </div>

      <div>
        <Label> Observação </Label>
        <InputAlterar 
          type="text"
          value={observacao ?? ""}
          onChange={ (e) => setObservacao(e.target.value)}
        />
      </div>

      <div className="sm:mt-2 mb-2 sm:mb-[0px]">
        <Label> Foto do Comprovante de Renda </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          ref={rendaRef}
          onChange={e => setComprovanteRenda(e.target.files?.[0] || null)}
        />
      </div>

      <div className="sm:mt-2 mb-2 sm:mb-[0px]">
        <Label> Foto do Comprovante de Endereço </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          ref={enderecoRef}
          onChange={e => setComprovanteEndereco(e.target.files?.[0] || null)}
        />
      </div>

      <div className="sm:mt-2 mb-2 sm:mb-[0px]">
        <Label> Foto da identidade (FRENTE) </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          ref={frenteRef}
          onChange={e => setDocumentoFrente(e.target.files?.[0] || null)}
        />
      </div>

      <div className="sm:mt-2 mb-2 sm:mb-[0px]">
        <Label> Foto da identidade (verso) </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          ref={versoRef}
          onChange={e => setDocumentoVerso(e.target.files?.[0] || null)}
        />
      </div>

      <div className="sm:mt-2 mb-2 sm:mb-[0px]">
        <Label> Arquivo (Outros) </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*,.pdf"
          ref={outroRef}
          onChange={e => setArquivo(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex items-end">
        <div className="cursor-pointer flex-1">
         <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer h-12 w-full"> Enviar </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

    </form>
  )
}