"use client"

import { Input } from "../componentes/input"
import { useEffect, useState } from "react"
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


interface ConsultorBusca {
  id: number;
  nome_completo: string;
}

export function FomularioComponente() {

  const supabase = createClient();

  const teste= "Teste";
 
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
  const [nomeReferencia, setNomeReferencia] = useState("");
  const [telefoneReferencia, setTelefoneReferencia] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [Ncasa, setNcasa] = useState("");
  const [moradia, setMoradia] = useState("");
  const [condicaoMoradia, setCondicaoMoradia] = useState("");
  const [valorFinanciamento, setValorFinanciamento] = useState("");
  const [valorAluguel, setValorAluguel] = useState("");
  const [verificarVeiculo, setVerificarVeiculo] = useState("");
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("");
  const [condicaoVeiculo, setCondicaoVeiculo] = useState("");
  const [valorFinanciamentoVeiculo, setValorFinanciamentoVeiculo] = useState(""); 
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [nomeCompanheiro, setNomeCompanheiro] = useState("");
  const [cpfCompanheiro, setCpfCompanheiro] = useState("");
  const [whatsappCompanheiro, setWhatsappCompanheiro] = useState("");
  const [pix, setPix] = useState("");
  const [valorSolicitado, setValorSolicitado] = useState("");
  const [comprovanteRenda, setComprovanteRenda] = useState<File | null>(null);
  const [comprovanteEndereco, setComprovanteEndereco] = useState<File | null>(null);
  const [documentoFrente, setDocumentoFrente] = useState<File | null>(null);
  const [documentoVerso, setDocumentoVerso] = useState<File | null>(null); 
  const [segurandoDocumento, setSegurandoDocumento] = useState<File | null>(null); 
  const [carteiraDigital, setCarteiraDigital] = useState<File | null>(null); 

  const [consultorSelecionado, setConsultorSelecionado] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [loading, setLoading] = useState(false);
  const [mensagemErro, setMensagemErro] = useState(""); 

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  const router = useRouter();

  async function consultoresBuscando() {

    const { data, error } = await supabase  
      .from("consultores")
      .select("id, nome_completo")
      .eq("status", "Ativo")

    if(error) {
      setLoading(false);
      setMensagemErro("Erro ao buscar os consultores. Entre em contato com o consultor responsável.")
      toast.error("Erro ao buscar consultores");
      return
    }

    if(data) {
      setConsultoresBusca(data);
    }

  }

  useEffect( () => {
    consultoresBuscando();
  }, [])

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
    if ((estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && !nomeCompanheiro) {
      return toast.error("Informe o nome completo do Companheiro(a)");
    };
    if ((estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && !cpfCompanheiro) {
      return toast.error("Informe o cpf do Companheiro(a)");
    }
    if ((estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && !whatsappCompanheiro) {
      return toast.error("Informe o whatsapp do Companheiro(a)");
    }
    if (!dataNascimento.trim()) return toast.error("Insira a data de nascimento!");
    if (!whatsapp.trim()) return toast.error("Digite o seu whatsapp!");
    if (!nomeReferencia.trim()) return toast.error("Digite o nome de referência!");
    if (!telefoneReferencia.trim()) return toast.error("Digite contato de referência!");
    if (!cep.trim()) return toast.error("Digite o seu cep!");
    if (!bairro.trim()) return toast.error("Digite o seu bairro!");
    if (!rua.trim()) return toast.error("Digite a sua rua!");
    if (!Ncasa.trim()) return toast.error("Digite o número da casa!");
    if (!moradia.trim()) return toast.error("Selecione a sua moradia!");
    if (!condicaoMoradia.trim()) return toast.error("Selecione a condição da moradia");
    if (condicaoMoradia === "Alugada" && !valorAluguel) return toast.error("Informe o valor do Aluguel");
    if (condicaoMoradia === "Própria Financiada" && !valorFinanciamento) return toast.error("Informe o valor do Financiamento");
    if (!verificarVeiculo) return toast.error("Informe se possui veículo");
    if (verificarVeiculo === "Sim" && !veiculoSelecionado) return toast.error("Selecione o veículo");
    if (veiculoSelecionado && !condicaoVeiculo) return toast.error("Selecione a condição do veículo");
    if (condicaoVeiculo === "Financiado" && !valorFinanciamentoVeiculo) return toast.error("Digite o valor do financimento/consórcio do veículo");
    if (!estado.trim()) return toast.error("Selecione o seu estado!");
    if (!cidade.trim()) return toast.error("Selecione a sua cidade!");
    if (!pix.trim()) return toast.error("Digite a sua chave pix!");
    if (!consultorSelecionado.trim()) return toast.error("Selecione o consultor!");
    if (!valorSolicitado.trim()) return toast.error("Digite a quantia solicitada!");
    if (!comprovanteRenda || !comprovanteEndereco || !documentoFrente || !documentoVerso || !segurandoDocumento) return toast.error("Envie todas os 5 documentos")

    setLoading(true);

    const valorMonetarioCorreto = limparValorMonetario(valorSolicitado);
    const valorFinanciamentoMoradiaCorreto = limparValorMonetario(valorFinanciamento);
    const valorAluguelCorreto = limparValorMonetario(valorAluguel);
    const valorFinanciamentoVeiculoCoreto = limparValorMonetario(valorFinanciamentoVeiculo);

    const { data: verificarTelefone, error:verificarTelefoneErro } = await supabase
      .from("clientes")
      .select("id, whatsapp")
      .eq("whatsapp", whatsapp)

    if(verificarTelefoneErro) {
      console.log("Erro:", verificarTelefoneErro);
      setMensagemErro("Ocorreu um erro ao verificar telefone. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.");
      setLoading(false);
      return;
    }

    if(verificarTelefone && verificarTelefone.length > 0) {

      const dadosAtualizados = {
        nome_completo: nome,
        email: email,
        cpf: cpf,
        rg: rg,
        data_emissao_rg: dataRg,
        orgao_expedidor: orgaoExpedidor,
        sexo: sexo,
        estado_civil: estadoCivil,
        nome_completo_companheiro: nomeCompanheiro.trim(),
        cpf_companheiro: cpfCompanheiro.trim(),
        whatsapp_companheiro: whatsappCompanheiro,
        data_nascimento: dataNascimento,
        whatsapp: whatsapp,
        telefone_reserva: telefoneReserva,
        nome_referencia: nomeReferencia,
        telefone_referencia: telefoneReferencia,
        cep: cep,
        bairro: bairro,
        rua: rua,
        numero_casa: Ncasa,
        moradia: moradia,
        condicoes_moradia: condicaoMoradia,
        valor_financiamento_moradia: valorFinanciamentoMoradiaCorreto,
        valor_aluguel: valorAluguelCorreto,
        categoria_veiculo: veiculoSelecionado,
        condicao_veiculo: condicaoVeiculo,
        valor_financiamento_veiculo: valorFinanciamentoVeiculoCoreto,
        cidade: cidade,
        estado: estado,
        pix: pix,
        id_consultor: consultorSelecionado,
        valor_solicitado: valorMonetarioCorreto
      }

      const { error } = await supabase
        .from("clientes")
        .update(dadosAtualizados)
        .eq("id", verificarTelefone[0].id)

      if(error) {
        console.error("Erro ao atualizar cliente:", error.message);
        setMensagemErro("Ocorreu um erro ao cadastrar cliente. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.");
        setLoading(false);
        return false;
      }

      const idCliente = verificarTelefone[0].id
      const arquivos = [comprovanteRenda, comprovanteEndereco, documentoFrente, documentoVerso, segurandoDocumento, carteiraDigital]
      const campos = ["foto_comprovante_renda", "foto_comprovante_endereco", "foto_identidade_frente", "foto_identidade_verso", "segurando_documento", "CarteiraDigital"]
      const urls: Record<string, string> = {}

      const uploadPromises = arquivos.map(async (arquivo, i) => {
        
        if (!arquivo) return;

        const nomeCampo = campos[i];

        try {
          const convertido = await converterImagemParaWebP(arquivo);

          const extensao = arquivo.type === "application/pdf" ? "pdf" : "webp";
          const contentType = arquivo.type === "application/pdf" ? "application/pdf" : "image/webp";

          const nomeArquivo = `clientes/${idCliente}/${nomeCampo}-${Date.now()}.${extensao}`;

          const { error: uploadError } = await supabase
            .storage
            .from("clientes")
            .upload(nomeArquivo, convertido, {
              contentType,
            });

          if (uploadError) {
            console.error(uploadError);
            setLoading(false);
            setMensagemErro("Ocorreu um erro ao enviar arquivos. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.");
            throw new Error(`Erro ao enviar ${nomeCampo}`);
          }

          const { data: urlData } = supabase
            .storage
            .from("clientes")
            .getPublicUrl(nomeArquivo);

          urls[nomeCampo] = urlData.publicUrl;

        } catch (erro) {
          console.error("Erro na conversão:", erro);
          setLoading(false);
          alert(`Ocorreu um erro ao processar o documento referente a '${nomeCampo}'. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.`);
        }
      });

      await Promise.all(uploadPromises);

      setNome("");
      setEmail("");
      setCpf("");
      setRg("");
      setDataRg("");
      setOrgaoExpedidor("");
      setSexo("");
      setEstadoCivil("");
      setNomeCompanheiro("");
      setCpfCompanheiro("");
      setWhatsappCompanheiro("");
      setDataNascimento("");
      setWhatsapp("");
      setTelefoneReserva("");
      setNomeReferencia("");
      setTelefoneReferencia("");
      setCep("");
      setBairro("");
      setRua("");
      setNcasa("");
      setMoradia("");
      setEstado("");
      setCidade("");
      setConsultorSelecionado("");
      setPix("");
      setCondicaoMoradia("");
      setValorFinanciamento("");
      setValorAluguel("");
      setVerificarVeiculo("");
      setVeiculoSelecionado("");
      setCondicaoVeiculo("");
      setValorFinanciamentoVeiculo("");
      setValorSolicitado("");
      setComprovanteRenda(null);
      setComprovanteEndereco(null);
      setDocumentoFrente(null);
      setDocumentoVerso(null);
      setSegurandoDocumento(null);
      setCarteiraDigital(null);

      setLoading(false);

      router.push("/formulario/obrigado");

      return;

    } else {

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
          nome_completo_companheiro: nomeCompanheiro.trim(),
          cpf_companheiro: cpfCompanheiro.trim(),
          whatsapp_companheiro: whatsappCompanheiro,
          data_nascimento: dataNascimento,
          whatsapp,
          telefone_reserva: telefoneReserva,
          nome_referencia: nomeReferencia,
          telefone_referencia: telefoneReferencia,
          cep,
          bairro: bairro.trim(),
          rua: rua.trim(),
          numero_casa: Ncasa.trim(),
          moradia,
          condicoes_moradia: condicaoMoradia,
          valor_financiamento_moradia: valorFinanciamentoMoradiaCorreto,
          valor_aluguel: valorAluguelCorreto,
          categoria_veiculo: veiculoSelecionado,
          condicao_veiculo: condicaoVeiculo,
          valor_financiamento_veiculo: valorFinanciamentoVeiculoCoreto,
          estado,
          cidade,
          pix: pix.trim(),
          id_consultor: consultorSelecionado,
          valor_solicitado: valorMonetarioCorreto
        })
        .select("id")

      if (insertError || !clienteData || clienteData.length === 0) {
        setLoading(false);
        setMensagemErro("Ocorreu um erro ao cadastrar cliente. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.");
        console.error("Erro ao criar cliente:", insertError)
        return toast.error("Erro ao criar cliente")
      }

      const idCliente = clienteData[0].id
      const arquivos = [comprovanteRenda, comprovanteEndereco, documentoFrente, documentoVerso, segurandoDocumento, carteiraDigital]
      const campos = ["foto_comprovante_renda", "foto_comprovante_endereco", "foto_identidade_frente", "foto_identidade_verso", "segurando_documento", "CarteiraDigital"]
      const urls: Record<string, string> = {}

      const uploadPromises = arquivos.map(async (arquivo, i) => {

        if (!arquivo) return;

        const nomeCampo = campos[i];

        try {
          const convertido = await converterImagemParaWebP(arquivo);

          const extensao = arquivo.type === "application/pdf" ? "pdf" : "webp";
          const contentType = arquivo.type === "application/pdf" ? "application/pdf" : "image/webp";

          const nomeArquivo = `clientes/${idCliente}/${nomeCampo}-${Date.now()}.${extensao}`;

          const { error: uploadError } = await supabase
            .storage
            .from("clientes")
            .upload(nomeArquivo, convertido, {
              contentType,
            });

          if (uploadError) {
            console.error(uploadError);
            setLoading(false);
            setMensagemErro("Ocorreu um erro ao enviar documentos. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.");
            throw new Error(`Erro ao enviar ${nomeCampo}`);
          }

          const { data: urlData } = supabase
            .storage
            .from("clientes")
            .getPublicUrl(nomeArquivo);

          urls[nomeCampo] = urlData.publicUrl;

        } catch (erro) {
          console.error("Erro na conversão:", erro);
          setLoading(false);
          alert(`Ocorreu um erro ao processar o documento referente a '${nomeCampo}'. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.`);
        }
      });

      await Promise.all(uploadPromises);

      setNome("");
      setEmail("");
      setCpf("");
      setRg("");
      setDataRg("");
      setOrgaoExpedidor("");
      setSexo("");
      setEstadoCivil("");
      setNomeCompanheiro("");
      setCpfCompanheiro("");
      setWhatsappCompanheiro("");
      setDataNascimento("");
      setWhatsapp("");
      setTelefoneReserva("");
      setNomeReferencia("");
      setTelefoneReferencia("");
      setCep("");
      setBairro("");
      setRua("");
      setNcasa("");
      setMoradia("");
      setEstado("");
      setCidade("");
      setConsultorSelecionado("");
      setPix("");
      setCondicaoMoradia("");
      setValorFinanciamento("");
      setValorAluguel("");
      setVerificarVeiculo("");
      setVeiculoSelecionado("");
      setCondicaoVeiculo("");
      setValorFinanciamentoVeiculo("");
      setValorSolicitado("");
      setComprovanteRenda(null);
      setComprovanteEndereco(null);
      setDocumentoFrente(null);
      setDocumentoVerso(null);
      setSegurandoDocumento(null);
      setCarteiraDigital(null);

      setLoading(false);

      router.push("/formulario/obrigado");

    }

  }

  async function buscarCep(cep: string) {

    setLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data: viaCep = await response.json();

      setBairro(data.bairro ?? '');
      setRua(data.logradouro ?? '');
      setEstado(data.uf ?? ''); 
      setCidade(data.localidade ?? '');

    } catch(error) {
      setLoading(false);
      console.log("Deu errado!");
    }

    setLoading(false);

  }

  const sexoOptions = [
    { label: "Masculino", value: "Masculino" },
    { label: "Feminino", value: "Feminino" }
  ];

  const estadoCivilOptions = [
    { label: "Solteiro(a)", value: "Solteiro(a)" },
    { label: "Casado(a)", value: "Casado(a)" },
    { label: "Companheiro(a)", value: "Companheiro(a)"},
    { label: "Seperado(a)", value: "Separado(a)" },
    { label: "Divorciado(a)", value: "Divorciado(a)" },
    { label: "Viúvo(a)", value: "Viuvo(a)" },
  ];

  const moradiaOptions = [
    { label: "Casa", value: "Casa" },
    { label: "Apartamento", value: "Apartamento" },
    { label: "Área rural", value: "Area rural" },
  ];

  const condicaoMoradiaOptions = [
    { label: "Próprio Quitado", value: "Próprio Quitado" },
    { label: "Própria Financiada", value: "Própria Financiada" },
    { label: "Alugada", value: "Alugada" },
    { label: "Imóvel Cedido", value: "Imóvel Cedido"}
  ];

  const verificarVeiculoOptions = [
    { label: "Sim", value: "Sim" },
    { label: "Não", value: "Não" },
  ];

  const veiculosOptions = [
    { label: "Carro", value: "Carro" },
    { label: "Moto", value: "Moto" },
    { label: "Caminhão", value: "Caminhão" },
    { label: "Van", value: "Van" },
    { label: "Ônibus", value: "Ônibus" },
  ];

  const condicaoVeiculoOptions = [
    { label: "Quitado", value: "Quitado" },
    { label: "Financiado", value: "Financiado" },
    { label: "Consórcio", value: "Consórcio" },
  ];

  return(
    <form className="bg-white w-80 sm:w-full rounded-3xl pb-6 px-1 md:w-full" onSubmit={enviarFormulario}>

      <h1 className="text-center mt-4 font-semibold sm:text-2xl text-xl pt-4 "> Formulário de Cadastro </h1>

      {/* ======== FORMULARIO ========== */}

      <div className="md:grid md:grid-cols-2 md:p-2 md:my-2 md:gap-2">

        <div className="mx-2 mt-4 md:mx-0 md:mt-0">

          <Label> Nome Completo </Label>
          <Input 
            type="text"
            value={nome}
            onChange={ (e) => setNome(e.target.value)}
            required 
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Email </Label>
          <Input 
            type="text" 
            value={email}
            onChange={ (e) => setEmail(e.target.value)}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> CPF </Label>
          <Input 
            type="text"
            inputMode="numeric"
            value={cpf}
            onChange={(e) => limiteCpf(e, setCpf)}
            maxLength={11}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> RG </Label>
          <Input 
            type="text"
            inputMode="numeric"
            value={rg}
            onChange={(e) => limiteRg(e, setRg)}
            maxLength={7} 
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0 flex-col mb-4 md:mb-0">
          
          <Label> Data de Emissão RG </Label>
          <InputAlterar 
            type="date"
            value={dataRg}
            onChange={(e) => limiteDataRg(e, setDataRg)}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Orgão Expedidor </Label>
          <Input 
            type="text"
            value={orgaoExpedidor}
            onChange={ (e) => setOrgaoExpedidor(e.target.value)}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 flex flex-col mb-4 md:mt-0 md:mx-0 md:mb-0">
          
          <Label> Sexo </Label>
          <Select 
            value={sexo}
            onChange={setSexo}
            placeholder="Selecionar..."
            options={sexoOptions}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
          
          <Label> Estado Civil </Label>
          <Select 
            value={estadoCivil}
            onChange={setEstadoCivil}
            placeholder="Selecionar..."
            options={estadoCivilOptions}
          />
          
        </div>

        {(estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && (
          <div className="mx-2 mt-[-8px] md:mx-0 md:mt-0">

            <Label> Nome Completo do Companheiro(a) </Label>
            <Input 
              type="text"
              value={nomeCompanheiro}
              onChange={ (e) => setNomeCompanheiro(e.target.value)}
              required 
            />
            
          </div>
        )}

        {(estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && (
          <div className="mx-2 mt-[-8px] md:mx-0 md:mt-0">

            <Label> CPF do Companheiro(a) </Label>
            <Input 
              type="text"
              inputMode="numeric"
              value={cpfCompanheiro}
              onChange={(e) => limiteCpf(e, setCpfCompanheiro)}
              maxLength={11}
            />
            
          </div>
        )}

        {(estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && (
          <div className="mx-2 mt-[-8px] md:mx-0 md:mt-0">

            <Label> Celular do Companheiro(a) </Label>
            <Input 
              type="number"
              value={whatsappCompanheiro}
              onChange={ (e) => limiteTelefoneReserva(e, setWhatsappCompanheiro)}
              maxLength={13}
            />
            
          </div>
        )}

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
          
          <Label> Data Nascimento </Label>
          <InputAlterar 
            type="date"
            value={dataNascimento}
            onChange={(e) => limiteDataNascimento(e, setDataNascimento)}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Whatsapp </Label>
          <Input 
            type="number"
            value={whatsapp}
            onChange={(e) => limiteWhatsapp(e, setWhatsapp)}
            maxLength={13}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Telefone Reserva </Label>
          <Input 
            type="number"
            value={telefoneReserva}
            onChange={ (e) => limiteTelefoneReserva(e, setTelefoneReserva)}
            maxLength={13}
          />
          
        </div>

        <div className="mx-2 mt-[-12px] md:mx-0 md:mt-0">

          <Label> Nome de referência </Label>
          <Input 
            type="text"
            value={nomeReferencia}
            onChange={ (e) => setNomeReferencia(e.target.value)}
            required 
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Contato de referência </Label>
          <Input 
            type="number"
            value={telefoneReferencia}
            onChange={ (e) => limiteTelefoneReserva(e, setTelefoneReferencia)}
            maxLength={13}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
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

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Bairro </Label>
          <Input 
            type="text"
            value={bairro}
            onChange={ (e) => setBairro(e.target.value)}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Rua </Label>
          <Input 
            type="text"
            value={rua}
            onChange={ (e) => setRua(e.target.value)}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Nº da Casa </Label>
          <Input 
            type="number" 
            value={Ncasa}
            onChange={ (e) => setNcasa(e.target.value)}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
          
          <Label> Moradia </Label>
          <Select 
            value={moradia}
            onChange={setMoradia} 
            placeholder="Selecionar..."
            options={moradiaOptions}
          />
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
          
          <Label> Condições de Moradia </Label>
          <Select 
            value={condicaoMoradia}
            onChange={setCondicaoMoradia} 
            placeholder="Selecionar..."
            options={condicaoMoradiaOptions}
          />
          
        </div>

        {condicaoMoradia === "Própria Financiada" && (
          <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
            
            <Label> Valor do Financiamento </Label>
            <Input 
              value={valorFinanciamento}
              onChange={(e) => mostrarValor(e, setValorFinanciamento)} 
            />
            
          </div>
        )}

        {condicaoMoradia === "Alugada" && (
          <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
            
            <Label> Valor do Aluguel </Label>
            <Input 
              value={valorAluguel}
              onChange={(e) => mostrarValor(e, setValorAluguel)} 
            />

          </div>
        )}

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
          
          <Label> Possui Veículo </Label>
          <Select 
            value={verificarVeiculo}
            onChange={setVerificarVeiculo} 
            placeholder="Selecionar..."
            options={verificarVeiculoOptions}
          />
          
        </div>

        {verificarVeiculo === "Sim" && (
          <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
            
            <Label> Veículo que Possui </Label>
            <Select 
              value={veiculoSelecionado}
              onChange={setVeiculoSelecionado} 
              placeholder="Selecionar..."
              options={veiculosOptions}
            />

          </div>
        )}

        {verificarVeiculo === "Sim" && (
          <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
            
            <Label> Condições do Veículo </Label>
            <Select 
              value={condicaoVeiculo}
              onChange={setCondicaoVeiculo} 
              placeholder="Selecionar..."
              options={condicaoVeiculoOptions}
            />

          </div>
        )}

        {condicaoVeiculo === "Financiado" && (
          <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
            
            <Label> Valor do Financiamento </Label>
            <Input 
              value={valorFinanciamentoVeiculo}
              onChange={(e) => mostrarValor(e, setValorFinanciamentoVeiculo)} 
            />

          </div>
        )}

        {condicaoVeiculo === "Consórcio" && (
          <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">
            
            <Label> Valor do Consórcio </Label>
            <Input 
              value={valorFinanciamentoVeiculo}
              onChange={(e) => mostrarValor(e, setValorFinanciamentoVeiculo)} 
            />

          </div>
        )}
      
        <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">

          <Label> Estado </Label>

          <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setCidade(""); 
          }}
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
        >
          <option value="" disabled>Selecionar Estado...</option>
          {estados.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>

        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-4 md:mt-0 md:mx-0 md:mb-0">

          <Label> Cidade </Label>

          <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
        >
          <option value="" disabled>Selecionar Cidade...</option>
          {cidades.map((cidade) => (
            <option key={cidade} value={cidade}>{cidade}</option>
          ))}
        </select>

        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Chave Pix </Label>
          <Input 
            type="text" 
            value={pix}
            onChange={ (e) => setPix(e.target.value)}
          />
          
        </div>
        
        <div className="mt-[-12px] mx-2 sm:mt-4 md:mt-0 md:mx-0">
          
          <Label> Valor Solicitado </Label>
          <Input 
            type="text" 
            value={valorSolicitado}
            onChange={ (e) => mostrarValor(e, setValorSolicitado) }
          />
          
        </div>

        <div className="mt-[-12px] mb-6 mx-2 sm:mt-4 md:mt-0 md:mx-0 sm:mb-0">
          
          <Label> Consultor </Label>
          <select 
            className="w-full h-9 border-2 border-[#002956] rounded focus:outline-[#4b8ed6] text-sm sm:text-base"
            value={consultorSelecionado}
            onChange={(e) => setConsultorSelecionado(e.target.value)}
          >
            <option value="">Consultor</option>

            {consultoresBusca.map((info) => (
              <option key={info.id} value={info.id}>
                {info.nome_completo}
              </option>
            ))}
          </select>
          
        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px] md:mt-0 md:mx-0 md:mb-0">

          <Label> Foto do Comprovante de Renda </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            onChange={e => setComprovanteRenda(e.target.files?.[0] || null)}
          />

        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px] md:mt-0 md:mx-0 md:mb-0">

          <Label> Foto do Comprovante de Endereço </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            onChange={e => setComprovanteEndereco(e.target.files?.[0] || null)}
          />

        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 sm:mb-[0px] md:mt-0 md:mx-0 md:mb-0">

          <Label> Foto da identidade (FRENTE) </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            onChange={e => setDocumentoFrente(e.target.files?.[0] || null)}
          />

        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 md:mt-0 md:mx-0 md:mb-0">

          <Label> Foto da identidade (VERSO) </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            onChange={e => setDocumentoVerso(e.target.files?.[0] || null)}
          />

        </div>

        <div className="mt-[-12px] mx-2 sm:mt-4 mb-6 md:mt-0 md:mx-0 md:mb-0">

          <Label> Fotografia do titular segurando seu documento oficial </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            onChange={e => setSegurandoDocumento(e.target.files?.[0] || null)}
          />

        </div>

        <div className="flex flex-wrap w-full">
          <div className="w-full mt-[-12px] mx-2 sm:mt-4 mb-6 md:mt-0 md:mx-0 md:mb-0">

            <Label> Carteira de Trabalho Digital (CTPS Digital) em PDF </Label>
            <input 
              className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
              type="file" 
              accept="image/*,.pdf"
              onChange={e => setCarteiraDigital(e.target.files?.[0] || null)}
            />
           <div className="col-span-2 px-2">
            <p className="text-sm text-red-700 break-words max-w-[400px]"> ⚠️ Se seu documento estiver no Google Drive, baixe ele antes de enviar. </p>
            </div>
          </div>

        </div>

      {mensagemErro && (
        <div className="flex flex-wrap max-w-[340px] px-2 pb-6 mt-[-12px] sm:mt-0 sm:pb-0">
          <p className="text-[12px] text-red-600"> {mensagemErro} </p>
        </div>
      )}

        <div className="col-span-2 mt-[-12px] mx-2 md:mt-0 md:mx-0">

          <div className="cursor-pointer">
          <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer w-full mt-2"> Enviar </button>
          </div>

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