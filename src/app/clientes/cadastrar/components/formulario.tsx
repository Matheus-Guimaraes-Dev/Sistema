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

interface ConsultorBusca {
  id: number;
  nome_completo: string;
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
        valor_solicitado: valorMonetarioCorreto
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
          valor_solicitado: valorMonetarioCorreto
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
        <Label> Nome de referência pessoal </Label>
        <InputAlterar 
          type="text"
          value={nomeReferencia}
          onChange={ (e) => setNomeReferencia(e.target.value)}
          required
        />
      </div>

      <div>
        <Label> Whatsapp de Referência </Label>
        <InputAlterar 
          type="number"
          value={telefoneReferencia}
          onChange={ (e) => limiteTelefoneReserva(e, setTelefoneReferencia)}
          maxLength={13}
        />
      </div>

      <div>
        <Label> Tipo de referência </Label>
        <Select 
          value={tipoDeReferencia}
          onChange={setTipoDeReferencia} 
          placeholder="Selecionar..."
          options={tipoReferencia}
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

      <div>
        <Label> Observação </Label>
        <InputAlterar 
          type="text"
          value={observacao ?? ""}
          onChange={ (e) => setObservacao(e.target.value)}
        />
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