"use client"

import { InputAlterar } from "../../components/InputAlterar";
import { useState, useEffect } from "react"
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
import { Input } from "./input";
import { SelectCampo } from "@/app/formulario/components/componentes/campo-select";
import { CampoInfo } from "@/app/formulario/components/componentes/campo-info";
import { FormarioInfos } from "@/app/formulario/components/types";
import { buscarCepNova, limiteCepNova, limiteCpfNova, limiteTelefoneNova } from "@/funcoes-novas";
import { SelectOpcoes } from "@/app/formulario/components/componentes/campo-select-opcoes";

interface ConsultorBusca {
  id: number;
  nome_completo: string;
}

const estadoInicial: FormarioInfos = {
  situacaoProfissional: "",
  nomeDaMae: "",
  cpfDaMae: "",
  whatsappMae: "",
  cepMae: "",
  ruaMae: "",
  bairroMae: "",
  numeroCasaMae: "",
  estadoMae: "",
  cidadeMae: "",
  nomeDoPai: "",
  cpfDaPai: "",
  whatsappPai: "",
  cepPai: "",
  ruaPai: "",
  bairroPai: "",
  numeroCasaPai: "",
  estadoPai: "",
  cidadePai: "",
}

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
  const [observacao, setObservacao] = useState("");
  const [tipoDeReferencia, setTipoDeReferencia] = useState("");
  const [nomeDaEmpresa, setNomeDaEmpresa] = useState("");
  const [enderecoDaEmpresa, setEnderecoDaEmpresa] = useState("");
  const [contatoDaEmpresa, setContatoDaEmpresa] = useState("");
  const [valorSolicitado, setValorSolicitado] = useState("");
  const [comprovanteRenda, setComprovanteRenda] = useState<File | null>(null);
  const [comprovanteEndereco, setComprovanteEndereco] = useState<File | null>(null);
  const [documentoFrente, setDocumentoFrente] = useState<File | null>(null);
  const [documentoVerso, setDocumentoVerso] = useState<File | null>(null); 
  const [segurandoDocumento, setSegurandoDocumento] = useState<File | null>(null); 
  const [carteiraDigital, setCarteiraDigital] =  useState<File | null>(null); 
  const [arquivo, setArquivo] = useState<File | null>(null); 
  const [loading, setLoading] = useState(false);
  const [mensagemErro, setMensagemErro] = useState(""); 

  const [consultorSelecionado, setConsultorSelecionado] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [cidadeReferencia, setCidadeReferencia] = useState("");
  const [estadoReferencia, setEstadoReferencia] = useState("");
  const [cepReferencia, setCepReferencia] = useState("");
  const [ruaReferencia, setRuaReferencia] = useState("");
  const [bairroReferencia, setBairroReferencia] = useState("");
  const [numeroReferencia, setNumeroReferencia] = useState("");

  const rendaRef = useRef<HTMLInputElement>(null);
  const enderecoRef = useRef<HTMLInputElement>(null);
  const frenteRef = useRef<HTMLInputElement>(null);
  const versoRef = useRef<HTMLInputElement>(null);
  const segurandoDocRef = useRef<HTMLInputElement>(null);
  const carteiraDocRef = useRef<HTMLInputElement>(null);
  const outroRef = useRef<HTMLInputElement>(null);

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  const cidadesReferencia = estadoReferencia in cidadesPorEstado
  ? cidadesPorEstado[estadoReferencia as keyof typeof cidadesPorEstado]
  : [];

// ====================

  const [formulario, setFormulario] = useState<FormarioInfos>(estadoInicial);
  
  const cidadesMae = formulario?.estadoMae ?? "" in cidadesPorEstado ? cidadesPorEstado[formulario.estadoMae as keyof typeof cidadesPorEstado] : [];

  const cidadesPai = formulario?.estadoPai ?? "" in cidadesPorEstado ? cidadesPorEstado[formulario.estadoPai as keyof typeof cidadesPorEstado] : [];

  // Função onde irá conseguir ver qual campo no formuário deve ser atualizado.
    function handleCampoInfoFormulario(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
      const { name, value } = e.target;
  
      setFormulario( (anterior) => ({
        ...anterior,
        [name]: value,
      }))
  
    }
  
    // Função onde irã conseguir aplicar a máscara no input. 
    function criarOnChangeComMascara<K extends keyof FormarioInfos>(campo: K, mascara?: (v: string) => string) {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        const valorBruto = e.target.value;
  
        const valorFinal = mascara ? mascara(valorBruto) : valorBruto;
  
        setFormulario( (prev) => ({
          ...prev,
          [campo]: valorFinal
        }));
  
      }
    }

//==========

  async function consultoresBuscando() {

    const { data, error } = await supabase  
      .from("consultores")
      .select("id, nome_completo")
      .eq("status", "Ativo")

    if(error) {
      setLoading(false);
      setMensagemErro("Erro ao buscar consultores");
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

    if (!nome.trim()) return toast.error("Digite o nome do cliente!");
    if (!whatsapp.trim()) return toast.error("Digite o whatsapp!");

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
      setLoading(false);
      setMensagemErro("Erro ao verificar telefone.");
      return;
    }

    if(verificarTelefone && verificarTelefone.length > 0) { 

      const dadosAtualizados = {
        nome_completo: nome.toLocaleUpperCase(),
        email: email.toLocaleUpperCase(),
        cpf: cpf || "00000000000",
        rg: rg,
        data_emissao_rg: dataRg || "01/01/1000",
        orgao_expedidor: orgaoExpedidor.toLocaleUpperCase(),
        sexo: sexo.toLocaleUpperCase(),
        estado_civil: estadoCivil.toLocaleUpperCase(),
        nome_completo_companheiro: nomeCompanheiro.trim().toLocaleUpperCase(),
        cpf_companheiro: cpfCompanheiro.trim(),
        whatsapp_companheiro: whatsappCompanheiro,
        data_nascimento: dataNascimento || "01/01/1000",
        whatsapp: whatsapp,
        telefone_reserva: telefoneReserva,
        nome_referencia: nomeReferencia.toLocaleUpperCase(),
        telefone_referencia: telefoneReferencia,
        cep: cep,
        bairro: bairro.toLocaleUpperCase(),
        rua: rua.toLocaleUpperCase(),
        numero_casa: Ncasa,
        moradia: moradia.toLocaleUpperCase(),
        condicoes_moradia: condicaoMoradia.toLocaleUpperCase(),
        valor_financiamento_moradia: valorFinanciamentoMoradiaCorreto,
        valor_aluguel: valorAluguelCorreto,
        categoria_veiculo: veiculoSelecionado.toLocaleUpperCase(),
        condicao_veiculo: condicaoVeiculo.toLocaleUpperCase(),
        valor_financiamento_veiculo: valorFinanciamentoVeiculoCoreto,
        cidade: cidade.toLocaleUpperCase(),
        estado: estado.toLocaleUpperCase(),
        pix: pix,
        tipo_referencia: tipoDeReferencia.toLocaleUpperCase(),
        nome_empresa: nomeDaEmpresa.trim().toLocaleUpperCase(),
        endereco_empresa: enderecoDaEmpresa.trim().toLocaleUpperCase(),
        numero_rh_empresa: contatoDaEmpresa.trim().toLocaleUpperCase(),
        id_consultor: consultorSelecionado || null,
        valor_solicitado: valorMonetarioCorreto,
        cidade_referencia: cidadeReferencia.trim().toLocaleUpperCase(),
        estado_referencia: estadoReferencia.trim().toLocaleUpperCase(),
        cep_referencia: cepReferencia,
        rua_referencia: ruaReferencia.trim().toLocaleUpperCase(),
        bairro_referencia: bairroReferencia.trim().toLocaleUpperCase(),
        numero_referencia: numeroReferencia.trim().toLocaleUpperCase()
      }

      const { error } = await supabase
        .from("clientes")
        .update(dadosAtualizados)
        .eq("id", verificarTelefone[0].id)

      if (error) {
        setLoading(false);
        setMensagemErro("Ocorreu um erro ao cliente. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.");
        return toast.error("Erro ao atualizar cliente")
      } else { 
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
        setPix("");
        setCondicaoMoradia("");
        setValorFinanciamento("");
        setValorAluguel("");
        setVerificarVeiculo("");
        setVeiculoSelecionado("");
        setCondicaoVeiculo("");
        setValorFinanciamentoVeiculo("");
        setValorSolicitado("");
        setConsultorSelecionado("");
        setObservacao("");
        setNomeDaEmpresa("");
        setEnderecoDaEmpresa("");
        setContatoDaEmpresa("");
        setTipoDeReferencia("");
        setCidadeReferencia("");
        setEstadoReferencia("");
        setCepReferencia("");
        setRuaReferencia("");
        setNumeroReferencia("");
        setBairroReferencia("");
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
        segurandoDocRef.current!.value = "";
        carteiraDocRef.current!.value = "";
        toast.success('Cliente Cadastrado com Sucesso!')
      }

      const idCliente = verificarTelefone[0].id
      const arquivos: { arquivo: File | null, campo: string }[] = [
        { arquivo: comprovanteRenda, campo: "foto_comprovante_renda" },
        { arquivo: comprovanteEndereco, campo: "foto_comprovante_endereco" },
        { arquivo: documentoFrente, campo: "foto_identidade_frente" },
        { arquivo: documentoVerso, campo: "foto_identidade_verso" },
        { arquivo: segurandoDocumento, campo: "segurando_documento" },
        { arquivo: carteiraDigital, campo: "CarteiraDigital" },
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
            setLoading(false);
            setMensagemErro("Ocorreu um erro ao enviar documentos. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.");
            return alert(`Erro ao enviar ${campo}`);
          }

          const { data: urlData } = supabase
            .storage
            .from("clientes")
            .getPublicUrl(nomeArquivo);

          urls[campo] = urlData.publicUrl;

        } catch (erro) {
          setLoading(false);
          setMensagemErro("Ocorreu um erro ao processar documentos. Por gentileza, entre em contato com seu consultor responsável e informe o ocorrido para que a situação possa ser verificada.");
          return alert(`Erro ao processar o arquivo: ${campo}`);
        }
      }

      setLoading(false);

    } else {
      const { data: clienteData, error: insertError } = await supabase
        .from("clientes")
        .insert({ 
          nome_completo: nome.trim().toLocaleUpperCase(),
          email: email.trim().toLocaleUpperCase(),
          cpf: cpf.trim() || "00000000000",
          rg: rg.trim(),
          data_emissao_rg: dataRg || "01/01/1000",
          orgao_expedidor: orgaoExpedidor.trim(),
          sexo: sexo.toLocaleUpperCase(),
          estado_civil: estadoCivil.toLocaleUpperCase(),
          nome_completo_companheiro: nomeCompanheiro.trim().toLocaleUpperCase(),
          cpf_companheiro: cpfCompanheiro.trim(),
          whatsapp_companheiro: whatsappCompanheiro,
          data_nascimento: dataNascimento || "01/01/1000",
          whatsapp,
          telefone_reserva: telefoneReserva,
          nome_referencia: nomeReferencia.toLocaleUpperCase(),
          telefone_referencia: telefoneReferencia,
          cep,
          bairro: bairro.trim().toLocaleUpperCase(),
          rua: rua.trim().toLocaleUpperCase(),
          numero_casa: Ncasa.trim(),
          moradia: moradia.toLocaleUpperCase(),
          condicoes_moradia: condicaoMoradia.toLocaleUpperCase(),
          valor_financiamento_moradia: valorFinanciamentoMoradiaCorreto,
          valor_aluguel: valorAluguelCorreto,
          categoria_veiculo: veiculoSelecionado.toLocaleUpperCase(),
          condicao_veiculo: condicaoVeiculo.toLocaleUpperCase(),
          valor_financiamento_veiculo: valorFinanciamentoVeiculoCoreto,
          estado: estado.toLocaleUpperCase(),
          cidade: cidade.toLocaleUpperCase(),
          pix: pix.trim(),
          observacao: observacao,
          tipo_referencia: tipoDeReferencia.toLocaleUpperCase(),
          nome_empresa: nomeDaEmpresa.trim().toLocaleUpperCase(),
          endereco_empresa: enderecoDaEmpresa.trim().toLocaleUpperCase(),
          numero_rh_empresa: contatoDaEmpresa.trim().toLocaleUpperCase(),
          id_consultor: consultorSelecionado || null,
          valor_solicitado: valorMonetarioCorreto,
          cidade_referencia: cidadeReferencia.trim().toLocaleUpperCase(),
          estado_referencia: estadoReferencia.trim().toLocaleUpperCase(),
          cep_referencia: cepReferencia,
          rua_referencia: ruaReferencia.trim().toLocaleUpperCase(),
          bairro_referencia: bairroReferencia.trim().toLocaleUpperCase(),
          numero_referencia: numeroReferencia.trim().toLocaleUpperCase(),
          situacao_profissional: formulario.situacaoProfissional?.trim().toLocaleUpperCase(),
          nome_mae: formulario.nomeDaMae?.trim().toLocaleUpperCase(),
          cpf_mae: formulario.cpfDaMae?.trim().toLocaleUpperCase(),
          whatsapp_mae: formulario.whatsappMae?.trim().toLocaleUpperCase(),
          cep_mae: formulario.cepMae?.trim().toLocaleUpperCase(),
          rua_mae: formulario.ruaMae?.trim().toLocaleUpperCase(),
          bairro_mae: formulario.bairroMae?.trim().toLocaleUpperCase(),
          numero_casa_mae: formulario.numeroCasaMae?.trim().toLocaleUpperCase(),
          estado_mae: formulario.estadoMae?.trim().toLocaleUpperCase(),
          cidade_mae: formulario.cidadeMae?.trim().toLocaleUpperCase(),
          nome_pai: formulario.nomeDoPai?.trim().toLocaleUpperCase(),
          cpf_pai: formulario.cpfDaPai?.trim().toLocaleUpperCase(),
          whatsapp_pai: formulario.whatsappPai?.trim().toLocaleUpperCase(),
          cep_pai: formulario.cepPai?.trim().toLocaleUpperCase(),
          rua_pai: formulario.ruaPai?.trim().toLocaleUpperCase(),
          bairro_pai: formulario.bairroPai?.trim().toLocaleUpperCase(),
          numero_casa_pai: formulario.numeroCasaPai?.trim().toLocaleUpperCase(),
          estado_pai: formulario.estadoPai?.trim().toLocaleUpperCase(),
          cidade_pai: formulario.cidadePai?.trim().toLocaleUpperCase(),
        })
        .select()

      if (insertError || !clienteData || clienteData.length === 0) {
        setLoading(false);
        setMensagemErro("Ocorreu um erro ao cadastrar cliente. Por gentileza, entre em contato com o suporte.");
        console.log("Erro ao criar cliente: ", insertError)
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
        setPix("");
        setCondicaoMoradia("");
        setValorFinanciamento("");
        setValorAluguel("");
        setVerificarVeiculo("");
        setVeiculoSelecionado("");
        setCondicaoVeiculo("");
        setValorFinanciamentoVeiculo("");
        setValorSolicitado("");
        setConsultorSelecionado("");
        setObservacao("");
        setNomeDaEmpresa("");
        setEnderecoDaEmpresa("");
        setContatoDaEmpresa("");
        setTipoDeReferencia("");
        setCidadeReferencia("");
        setEstadoReferencia("");
        setCepReferencia("");
        setRuaReferencia("");
        setNumeroReferencia("");
        setBairroReferencia("");
        setComprovanteRenda(null);
        setComprovanteEndereco(null);
        setDocumentoFrente(null);
        setDocumentoVerso(null);
        setArquivo(null);

        setFormulario(estadoInicial);

        rendaRef.current!.value = "";
        enderecoRef.current!.value = "";
        frenteRef.current!.value = "";
        versoRef.current!.value = "";
        outroRef.current!.value = "";
        segurandoDocRef.current!.value = "";
        carteiraDocRef.current!.value = "";
        toast.success('Cliente Cadastrado com Sucesso!')
      }

      const idCliente = clienteData[0].id
      const arquivos: { arquivo: File | null, campo: string }[] = [
        { arquivo: comprovanteRenda, campo: "foto_comprovante_renda" },
        { arquivo: comprovanteEndereco, campo: "foto_comprovante_endereco" },
        { arquivo: documentoFrente, campo: "foto_identidade_frente" },
        { arquivo: documentoVerso, campo: "foto_identidade_verso" },
        { arquivo: segurandoDocumento, campo: "segurando_documento" },
        { arquivo: carteiraDigital, campo: "CarteiraDigital" },
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
            setLoading(false);
            setMensagemErro("Ocorreu um erro ao enviar documentos. Por gentileza, entre em contato com o suporte.");
            return alert(`Erro ao enviar ${campo}`);
          }

          const { data: urlData } = supabase
            .storage
            .from("clientes")
            .getPublicUrl(nomeArquivo);

          urls[campo] = urlData.publicUrl;

        } catch (erro) {
          setLoading(false);
          setMensagemErro("Ocorreu um erro ao processar cliente. Por gentileza, entre em contato com o suporte.");
          return alert(`Erro ao processar o arquivo: ${campo}`);
        }
      }

      setLoading(false);
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
      console.log("Erro!");
    }

    setLoading(false);

  }

  async function buscarCepReferencia(cep: string) {

    setLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data: viaCep = await response.json();

      setBairroReferencia(data.bairro ?? '');
      setRuaReferencia(data.logradouro ?? '');
      setEstadoReferencia(data.uf ?? ''); 
      setCidadeReferencia(data.localidade ?? '');

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
    { label: "Separado(a)", value: "Separado(a)" },
    { label: "Divorciado(a)", value: "Divorciado(a)" },
    { label: "Viúvo(a)", value: "Viuvo(a)" },
  ];

  const moradiaOptions = [
    { label: "Casa", value: "Casa" },
    { label: "Apartamento", value: "Apartamento" },
    { label: "Aluguel", value: "Aluguel" },
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

  const tipoReferencia = [
    { label: "Pai", value: "Pai" },
    { label: "Mãe", value: "Mãe" },
    { label: "Irmão / Irmã", value: "Irmão / Irmã" },
    { label: "Filho / Filha", value: "Filho / Filha" },
    { label: "Esposo / Esposa", value: "Esposo / Esposa" },
    { label: "Companheiro(a)", value: "Companheiro(a)" },
    { label: "Amigo / Amiga", value: "Amigo / Amiga" },
    { label: "Colega de trabalho", value: "Colega de trabalho" },
    { label: "Outro parente", value: "Outro parente" }
  ]

    const situacaoProfissionalOptions = [
    { label: "Trabalhador CLT", value: "CLT" },
    { label: "Servidor Público", value: "SERVIDOR" },
    { label: "Aposentado (INSS)", value: "APOSENTADO" },
    { label: "Pessoa Jurídica - MEI", value: "MEI" }
  ];

  return(
    <form className="grid md:grid-cols-3 bg-white shadow rounded-xl p-6 my-5 gap-2" onSubmit={enviarFormulario}>

      <div>
        <label className="text-red-600"> Nome Completo </label>
        <InputAlterar 
          type="text"
          value={nome}
          onChange={ (e) => setNome(e.target.value)}
          required
        />
      </div>

      <SelectOpcoes 
        label="Situação Profissional"
        name="situacaoProfissional"
        value={formulario.situacaoProfissional}
        options={situacaoProfissionalOptions}
        onChange={handleCampoInfoFormulario}
        placeholder="Selecionar..."
      />
      
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
        <label> Data Nascimento </label>
        <InputAlterar 
          type="date"
          value={dataNascimento}
          onChange={(e) => limiteDataNascimento(e, setDataNascimento)}
        />
      </div>

      <div>
        <label className="text-red-600"> Whatsapp </label>
        <InputAlterar 
          type="number"
          value={whatsapp}
          onChange={ (e) => limiteWhatsapp(e, setWhatsapp)}
          maxLength={13}
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

      {(estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && (
        <div>
          <Label> Nome Completo do Companheiro(a) </Label>
          <InputAlterar 
            type="text"
            value={nomeCompanheiro}
            onChange={ (e) => setNomeCompanheiro(e.target.value)}
            required
          />
        </div>
      )}

      {(estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && (
        <div>
          <Label> CPF do Companheiro(a) </Label>
          <InputAlterar 
            type="text"
            inputMode="numeric"
            value={cpfCompanheiro}
            onChange={ (e) => limiteCpf(e, setCpfCompanheiro)}
            maxLength={11}
          />
        </div>
      )}

      {(estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && (
        <div>
          <Label> Celular do Companheiro(a) </Label>
          <InputAlterar 
            type="number"
            value={whatsappCompanheiro}
            onChange={ (e) => limiteWhatsapp(e, setWhatsappCompanheiro)}
            maxLength={13}
          />
        </div>
      )}

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
        <Label> Rua </Label>
        <InputAlterar 
          type="text"
          value={rua}
          onChange={ (e) => setRua(e.target.value)}
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
        <Label> Nº da Casa </Label>
        <InputAlterar 
          type="number" 
          value={Ncasa}
          onChange={ (e) => setNcasa(e.target.value)}
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
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
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
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
        >
          <option value="" disabled>Selecionar Cidade...</option>
          {cidades.map((cidade) => (
            <option key={cidade} value={cidade}>{cidade}</option>
          ))}
        </select>
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

      <div className="">
            
        <Label> Condições de Moradia </Label>
        <Select 
          value={condicaoMoradia}
          onChange={setCondicaoMoradia} 
          placeholder="Selecionar..."
          options={condicaoMoradiaOptions}
        />
        
      </div>

      {condicaoMoradia === "Própria Financiada" && (
        <div className="">
          
          <Label> Valor do Financiamento </Label>
          <Input 
            value={valorFinanciamento}
            onChange={(e) => mostrarValor(e, setValorFinanciamento)} 
          />
          
        </div>
      )}

      {condicaoMoradia === "Alugada" && (
        <div className="">
          
          <Label> Valor do Aluguel </Label>
          <Input 
            value={valorAluguel}
            onChange={(e) => mostrarValor(e, setValorAluguel)} 
          />

        </div>
      )}

      <div className="">
        
        <Label> Possui Veículo </Label>
        <Select 
          value={verificarVeiculo}
          onChange={setVerificarVeiculo} 
          placeholder="Selecionar..."
          options={verificarVeiculoOptions}
        />
        
      </div>

      {verificarVeiculo === "Sim" && (
        <div className="">
          
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
        <div className="">
          
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
        <div className="">
          
          <Label> Valor do Financiamento </Label>
          <Input 
            value={valorFinanciamentoVeiculo}
            onChange={(e) => mostrarValor(e, setValorFinanciamentoVeiculo)} 
          />

        </div>
      )}

      {condicaoVeiculo === "Consórcio" && (
        <div className="">
          
          <Label> Valor do Consórcio </Label>
          <Input 
            value={valorFinanciamentoVeiculo}
            onChange={(e) => mostrarValor(e, setValorFinanciamentoVeiculo)} 
          />

        </div>
      )}

      <div>
        <Label> Nome da Empresa que Trabalha </Label>
        <InputAlterar 
          type="text"
          value={nomeDaEmpresa}
          onChange={ (e) => setNomeDaEmpresa(e.target.value)}
        />
      </div>

      <div>
        <Label> Endereço da Empresa </Label>
        <InputAlterar 
          type="text"
          value={enderecoDaEmpresa}
          onChange={ (e) => setEnderecoDaEmpresa(e.target.value)}
        />
      </div>

      <div>
        <Label> Número do RH da Empresa </Label>
        <InputAlterar 
          type="number"
          value={contatoDaEmpresa}
          onChange={ (e) => limiteTelefoneReserva(e, setContatoDaEmpresa)}
          maxLength={13}
        />
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

      <div className="">
        
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

      <div className="flex items-center justify-center my-6">
        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <h2 className="px-4 text-lg font-semibold text-gray-700 text-center whitespace-nowrap">
            Dados da Referência Pessoal
          </h2>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
      </div>

      <div>
        <Label> Nome de Referência - Pessoal </Label>
        <InputAlterar 
          type="text"
          value={nomeReferencia}
          onChange={ (e) => setNomeReferencia(e.target.value)}
          required
        />
      </div>

      <div>
        <Label> Whatsapp de Referência - Pessoal </Label>
        <InputAlterar 
          type="number"
          value={telefoneReferencia}
          onChange={ (e) => limiteTelefoneReserva(e, setTelefoneReferencia)}
          maxLength={13}
        />
      </div>

      <div>
        <Label> Tipo de Referência - Pessoal </Label>
        <Select 
          value={tipoDeReferencia}
          onChange={setTipoDeReferencia} 
          placeholder="Selecionar..."
          options={tipoReferencia}
        />
      </div>

      <div>
        <Label> CEP - Referência - Pessoal </Label>
        <Input 
          type="number"
          value={cepReferencia}
          onChange={ (e) => limiteCep(e, setCepReferencia)}
          onBlur={ () => {
            if (cepReferencia.length === 8) buscarCepReferencia(cepReferencia);
          }}
          maxLength={9}
        />
      </div>

      <div>

        <Label> Rua - Referência - Pessoal </Label>
        <Input 
          type="text"
          value={ruaReferencia}
          onChange={ (e) => setRuaReferencia(e.target.value)}
        />
        
      </div>

      <div>

        <Label> Bairro - Referência - Pessoal </Label>
        <Input 
          type="text"
          value={bairroReferencia}
          onChange={ (e) => setBairroReferencia(e.target.value)}
        />
        
      </div>

      <div>

        <Label> Número  Referência - Pessoal </Label>
        <Input 
          type="number"
          value={numeroReferencia}
          onChange={ (e) => setNumeroReferencia(e.target.value)}
        />
        
      </div>

      <div>

        <Label> Estado - Referência - Pessoal </Label>

        <select
          value={estadoReferencia}
          onChange={(e) => {
            setEstadoReferencia(e.target.value);
            setCidadeReferencia(""); 
          }}
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
        >
          <option value="" disabled>Selecionar Estado...</option>
          {estados.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>

      </div>

      <div>

        <Label> Cidade - Referência - Pessoal </Label>

        <select
          value={cidadeReferencia}
          onChange={(e) => setCidadeReferencia(e.target.value)}
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
        >
          <option value="" disabled>Selecionar Cidade...</option>
          {cidadesReferencia.map((cidadesReferencia) => (
            <option key={cidadesReferencia} value={cidadesReferencia}>{cidadesReferencia}</option>
          ))}
        </select>

      </div>

      <div className="flex items-center justify-center my-6">
                <div className="flex items-center w-full">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <h2 className="px-4 text-lg font-semibold text-gray-700 text-center whitespace-nowrap">
                    Dados da Mãe
                  </h2>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>
      
              <CampoInfo 
                label="Nome da Mãe" 
                name="nomeDaMae"
                value={formulario.nomeDaMae}
                onChange={handleCampoInfoFormulario}
              />
      
              <CampoInfo 
                label="CPF da Mãe"
                name="cpfDaMae"
                value={formulario.cpfDaMae}
                onChange={criarOnChangeComMascara("cpfDaMae", limiteCpfNova)}
              />
      
              <CampoInfo 
                label="Whatsapp da Mãe"
                name="whatsappMae"
                value={formulario.whatsappMae}
                onChange={criarOnChangeComMascara("whatsappMae", limiteTelefoneNova)}
              />
      
              <CampoInfo 
                label="CEP da Mãe"
                name="cepMae"
                value={formulario.cepMae}
                onChange={criarOnChangeComMascara("cepMae", limiteCepNova)}
                onBlur={ async () => {
                  if (formulario.cepMae?.length === 8) {
                    const dadosEndereco = await buscarCepNova(formulario.cepMae);
      
                    if (!dadosEndereco || dadosEndereco.erro === "true") return;
      
                    setFormulario( (prev) => ({
                      ...prev,
                      ruaMae: dadosEndereco.logradouro,
                      bairroMae: dadosEndereco.bairro,
                      estadoMae: dadosEndereco.uf,
                      cidadeMae: dadosEndereco.localidade
                    }))
                    
                  }
                }}
              />
      
              <CampoInfo 
                label="Rua da Mãe"
                name="ruaMae"
                value={formulario.ruaMae}
                onChange={handleCampoInfoFormulario}
              />
      
              <CampoInfo 
                label="Bairro da Mãe"
                name="bairroMae"
                value={formulario.bairroMae}
                onChange={handleCampoInfoFormulario}
              />
      
              <CampoInfo 
                label="Número da Casa da Mãe"
                name="numeroCasaMae"
                value={formulario.numeroCasaMae}
                onChange={handleCampoInfoFormulario}
              />
      
              <SelectCampo 
                label="Estado da Mãe"
                value={formulario.estadoMae ?? ""}
                onChange={(novoEstado) =>
                  setFormulario((prev) => ({
                    ...prev,
                    estadoMae: novoEstado,
                  }))
                }
                options={estados.map( (c) => ({ value: c, label: c }))}
              />
      
              <SelectCampo 
                label="Cidade da Mãe"
                value={formulario.cidadeMae ?? ""}
                onChange={(novaCidade) =>
                  setFormulario((prev) => ({
                    ...prev,
                    cidadeMae: novaCidade,
                  }))
                }
                options={cidadesMae.map( (c) => ({ value: c, label: c }))}
              />
      
              <div className="flex items-center justify-center my-6">
                <div className="flex items-center w-full">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <h2 className="px-4 text-lg font-semibold text-gray-700 text-center whitespace-nowrap">
                    Dados do Pai
                  </h2>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>
      
              <CampoInfo 
                label="Nome do Pai" 
                name="nomeDoPai"
                value={formulario.nomeDoPai}
                onChange={handleCampoInfoFormulario}
              />
      
              <CampoInfo 
                label="CPF do Pai"
                name="cpfDaPai"
                value={formulario.cpfDaPai}
                onChange={criarOnChangeComMascara("cpfDaPai", limiteCpfNova)}
              />
      
              <CampoInfo 
                label="Whatsapp do Pai"
                name="whatsappPai"
                value={formulario.whatsappPai}
                onChange={criarOnChangeComMascara("whatsappPai", limiteTelefoneNova)}
              />
      
              <CampoInfo 
                label="CEP do Pai"
                name="cepPai"
                value={formulario.cepPai}
                onChange={criarOnChangeComMascara("cepPai", limiteCepNova)}
                onBlur={ async () => {
                  if (formulario.cepPai?.length === 8) {
                    
                    setLoading(true);
      
                    const dadosEndereco = await buscarCepNova(formulario.cepPai);
      
                    if (!dadosEndereco || dadosEndereco.erro === "true") {
                      setLoading(false);
                      return
                    };
      
                    setFormulario( (prev) => ({
                      ...prev,
                      ruaPai: dadosEndereco.logradouro,
                      bairroPai: dadosEndereco.bairro,
                      estadoPai: dadosEndereco.uf,
                      cidadePai: dadosEndereco.localidade
                    }))
      
                    setLoading(false);
                    
                  }
                }}
              />
      
              <CampoInfo 
                label="Rua do Pai"
                name="ruaPai"
                value={formulario.ruaPai}
                onChange={handleCampoInfoFormulario}
              />
      
              <CampoInfo 
                label="Bairro do Pai"
                name="bairroPai"
                value={formulario.bairroPai}
                onChange={handleCampoInfoFormulario}
              />
      
              <CampoInfo 
                label="Número da Casa do Pai"
                name="numeroCasaPai"
                value={formulario.numeroCasaPai}
                onChange={handleCampoInfoFormulario}
              />
      
              <SelectCampo 
                label="Estado do Pai"
                value={formulario.estadoPai ?? ""}
                onChange={(novoEstado) =>
                  setFormulario((prev) => ({
                    ...prev,
                    estadoPai: novoEstado,
                  }))
                }
                options={estados.map( (c) => ({ value: c, label: c }))}
              />
      
              <SelectCampo 
                label="Cidade do Pai"
                value={formulario.cidadePai ?? ""}
                onChange={(novaCidade) =>
                  setFormulario((prev) => ({
                    ...prev,
                    cidadePai: novaCidade,
                  }))
                }
                options={cidadesPai.map( (c) => ({ value: c, label: c }))}
              />

      <div>
        <Label> Observação </Label>
        <InputAlterar 
          type="text"
          value={observacao ?? ""}
          onChange={ (e) => setObservacao(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-center my-6">
        <div className="flex items-center w-full">
          <div className="flex-grow border-t border-gray-300"></div>
          <h2 className="px-4 text-lg font-semibold text-gray-700 text-center whitespace-nowrap">
            Seus Documentos
          </h2>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
      </div>

      <div className="flex items-end">
        <div className="mb-2 sm:mb-[0px] flex-1">
          <Label> Foto do Comprovante de Renda </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            ref={rendaRef}
            onChange={e => setComprovanteRenda(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="flex items-end">
        <div className="sm:mt-2 mb-2 sm:mb-[0px] flex-1">
          <Label> Foto do Comprovante de Endereço </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            ref={enderecoRef}
            onChange={e => setComprovanteEndereco(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="flex items-end">
        <div className="sm:mt-2 mb-2 sm:mb-[0px] flex-1">
          <Label> Foto da identidade (FRENTE) </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            ref={frenteRef}
            onChange={e => setDocumentoFrente(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="flex items-end">
        <div className="sm:mt-2 mb-2 sm:mb-[0px] flex-1">
          <Label> Foto da identidade (verso) </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*"
            ref={versoRef}
            onChange={e => setDocumentoVerso(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div className="sm:mt-2 mb-2 sm:mb-[0px]">
        <Label> Titular segurando seu documento oficial </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*"
          ref={segurandoDocRef}
          onChange={e => setSegurandoDocumento(e.target.files?.[0] || null)}
        />
      </div>

      <div className="sm:mt-2 mb-2 sm:mb-[0px]">
        <Label> Carteira de Trabalho Digital (CTPS Digital) em PDF </Label>
        <input 
          className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
          type="file" 
          accept="image/*,.pdf"
          ref={carteiraDocRef}
          onChange={e => setCarteiraDigital(e.target.files?.[0] || null)}
        />
      </div>

      <div className="flex items-end"> 
        <div className="sm:mt-2 mb-2 sm:mb-[0px] flex-1">
          <Label> Arquivo (Outros) </Label>
          <input 
            className="block w-full text-sm text-gray-900 border border-blue-900 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-3" 
            type="file" 
            accept="image/*,.pdf"
            ref={outroRef}
            onChange={e => setArquivo(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      {mensagemErro && (
        <div className="flex flex-wrap">
          <p className="text-[12px] text-red-600"> {mensagemErro} </p>
        </div>
      )}

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