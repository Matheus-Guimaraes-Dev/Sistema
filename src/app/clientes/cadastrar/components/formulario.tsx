"use client"

import { InputAlterar } from "../../components/InputAlterar";
import { useState } from "react"
import toast from 'react-hot-toast'
import { converterImagemParaWebP } from "@/app/formulario/components/conversao";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";

import { limparValorMonetario, formatarParaReal, mostrarValor } from "@/funcoes/formatacao";
import { limiteCpf, limiteRg, limiteWhatsapp, limiteTelefoneReserva, limiteCep } from "@/funcoes/limitacao";

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

export function Formulario() {
 
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

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado ? cidadesPorEstado[estado] : [];

  const supabase = createClient();

  const router = useRouter();

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

}

  const limiteDataRg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

    if (regex.test(value)) {
      setDataRg(value);
    }
  };

  const limiteDataNascimento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

    if (regex.test(value)) {
      setDataNascimento(value);
    }
  };

  async function buscarCep(cep: string) {

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

  }

  function limparNomeArquivo(nome: string) {
    return nome
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, "_") 
      .toLowerCase();
  }

  return(
    <form className="grid md:grid-cols-3 bg-white shadow rounded-xl p-6 my-5 gap-2" onSubmit={enviarFormulario}>

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
                onChange={ (e) => limiteCpf(e, setCpf)}
                maxLength={11}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> RG </label>
              <InputAlterar 
                type="text"
                inputMode="numeric"
                value={rg}
                onChange={ (e) => limiteRg(e, setRg)}
                maxLength={7} 
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base mb-3"> Data de Emissão RG </label>
              <input 
                className="w-full h-8 border-2 px-1 border-[#002956] rounded mt-1  focus:outline-[#4b8ed6]"
                type="date"
                value={dataRg}
                onChange={limiteDataRg}
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
                onChange={limiteDataNascimento}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Whatsapp </label>
              <input 
                type="number"
                value={whatsapp}
                onChange={ (e) => limiteWhatsapp(e, setWhatsapp)}
                maxLength={13}
                className="w-full h-8 border-2 px-1 mt-1 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> Telefone Reserva </label>
              <InputAlterar 
                type="number"
                value={telefoneReserva}
                onChange={ (e) => limiteTelefoneReserva(e, setTelefoneReserva)}
                maxLength={13}
              />
            </div>
      
            <div>
              <label className="text-sm sm:text-base"> CEP </label>
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
                className="w-full mt-1 h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
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
                className="w-full mt-1 h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
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
                onChange={ (e) => mostrarValor(e, setValorSolicitado)}
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

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <label className="text-sm sm:text-base"> Foto do Comprovante de Renda </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setComprovanteRenda(e.target.files?.[0] || null)}
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <label className="text-sm sm:text-base"> Foto do Comprovante de Endereço </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setComprovanteEndereco(e.target.files?.[0] || null)}
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px]">

        <label className="text-sm sm:text-base"> Foto da identidade (FRENTE) </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setDocumentoFrente(e.target.files?.[0] || null)}
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6">

        <label className="text-sm sm:text-base"> Foto da identidade (verso) </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          onChange={e => setDocumentoVerso(e.target.files?.[0] || null)}
        />

      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-6">

        <label className="text-sm sm:text-base"> Arquivo (Outros) </label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*,.pdf"
          onChange={e => setArquivo(e.target.files?.[0] || null)}
        />

      </div>

      <div className="flex items-center">

        <div className="cursor-pointer flex-1">
         <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer w-full"> Enviar </button>
        </div>

      </div>

    </form>
  )
}