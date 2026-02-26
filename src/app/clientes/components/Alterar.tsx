"use client"

import { useState, useEffect, FormEvent } from "react";
import { InputAlterar } from "./InputAlterar";
import { createClient } from "@/lib/client";
import AdicionarDocumento from "./AdicionarDocumento";
import { AlterarStatus } from "./AlterarStatus";
import { cidadesPorEstado } from "../estados-cidades";
import { viaCep } from "@/components/types/types";
import { PropsAlterar } from "./types";
import { limparValorMonetario, mostrarValor } from "@/funcoes/formatacao";
import { limiteCpf, limiteRg, limiteWhatsapp, limiteTelefoneReserva, limiteCep } from "@/funcoes/limitacao";
import { Label } from "@/app/formulario/components/componentes/label";
import { Select } from "../componentes/select-cliente";
import toast from "react-hot-toast";
import { Input } from "@/app/formulario/components/componentes/input";
import { useUser } from "@/contexts/UserContext";
import { FormarioInfos } from "@/app/formulario/components/types";
import { SelectCampo } from "@/app/formulario/components/componentes/campo-select";
import { CampoInfo } from "@/app/formulario/components/componentes/campo-info";
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

export default function Alterar({ informacoesCliente }: PropsAlterar ) {

  const supabase = createClient();

  const { grupo } = useUser();

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
  const [tipoDeReferencia, setTipoDeReferencia] = useState("");
  const [nomeDaEmpresa, setNomeDaEmpresa] = useState("");
  const [enderecoDaEmpresa, setEnderecoDaEmpresa] = useState("");
  const [contatoDaEmpresa, setContatoDaEmpresa] = useState("");
  const [valorSolicitado, setValorSolicitado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  const valorMonetarioCorreto = limparValorMonetario(valorSolicitado);
  const valorFinanciamentoMoradiaCorreto = limparValorMonetario(valorFinanciamento);
  const valorAluguelCorreto = limparValorMonetario(valorAluguel);
  const valorFinanciamentoVeiculoCoreto = limparValorMonetario(valorFinanciamentoVeiculo);

  const [consultorSelecionado, setConsultorSelecionado] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [cidadeReferencia, setCidadeReferencia] = useState("");
  const [estadoReferencia, setEstadoReferencia] = useState("");
  const [cepReferencia, setCepReferencia] = useState("");
  const [ruaReferencia, setRuaReferencia] = useState("");
  const [bairroReferencia, setBairroReferencia] = useState("");
  const [numeroReferencia, setNumeroReferencia] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);

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

  // ====================

  const [ativar, setAtivar] = useState(false);

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  const cidadesReferencia = estadoReferencia in cidadesPorEstado
  ? cidadesPorEstado[estadoReferencia as keyof typeof cidadesPorEstado]
  : [];

  async function consultoresBuscando() {

    const { data, error } = await supabase  
      .from("consultores")
      .select("id, nome_completo")
      .eq("status", "Ativo")

    if(error) {
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

  useEffect( () => {
    if(informacoesCliente) {
      setNome(informacoesCliente.nome_completo || "");
      setEmail(informacoesCliente.email || "");
      setCpf(informacoesCliente.cpf || "");
      setRg(informacoesCliente.rg || "");
      setDataRg(informacoesCliente.data_emissao_rg || "01/01/2025");
      setOrgaoExpedidor(informacoesCliente.orgao_expedidor || "");
      setSexo(informacoesCliente.sexo || "");
      setEstadoCivil(informacoesCliente.estado_civil || "");
      setDataNascimento(informacoesCliente.data_nascimento || "01/01/2025");
      setWhatsapp(informacoesCliente.whatsapp || "");
      setTelefoneReserva(informacoesCliente.telefone_reserva || "");
      setNomeReferencia(informacoesCliente.nome_referencia || "");
      setTelefoneReferencia(informacoesCliente.telefone_referencia || "");
      setCep(informacoesCliente.cep || "");
      setBairro(informacoesCliente.bairro || "");
      setRua(informacoesCliente.rua || "");
      setNcasa(informacoesCliente.numero_casa || "");
      setMoradia(informacoesCliente.moradia || "");
      setVerificarVeiculo(informacoesCliente.categoria_veiculo ? "Sim" : "Não");
      setCondicaoMoradia(informacoesCliente.condicoes_moradia || "");
      setValorFinanciamento(Number(informacoesCliente.valor_financiamento_moradia).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }) || "");
      setValorAluguel(Number(informacoesCliente.valor_aluguel).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }) || "");
      setVeiculoSelecionado(informacoesCliente.categoria_veiculo || "");
      setCondicaoVeiculo(informacoesCliente.condicao_veiculo || "");
      setValorFinanciamentoVeiculo(Number(informacoesCliente.valor_financiamento_veiculo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }) || "");
      setEstado(informacoesCliente.estado || "");
      setCidade(informacoesCliente.cidade || "");
      setNomeCompanheiro(informacoesCliente.nome_completo_companheiro || ""),
      setCpfCompanheiro(informacoesCliente.cpf_companheiro || ""),
      setWhatsappCompanheiro(informacoesCliente.whatsapp_companheiro || ""),
      setPix(informacoesCliente.pix || "");
      setTipoDeReferencia(informacoesCliente.tipo_referencia || ""),
      setNomeDaEmpresa(informacoesCliente.nome_empresa || ""),
      setEnderecoDaEmpresa(informacoesCliente.endereco_empresa || ""),
      setContatoDaEmpresa(informacoesCliente.numero_rh_empresa || ""),
      setConsultorSelecionado(informacoesCliente.consultores?.id.toString() || "")
      setValorSolicitado(Number(informacoesCliente.valor_solicitado || "").toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }) || "");
      setObservacao(informacoesCliente.observacao || "");
      setCepReferencia(informacoesCliente.cep_referencia || "");
      setBairroReferencia(informacoesCliente.bairro_referencia || "");
      setRuaReferencia(informacoesCliente.rua_referencia || "");
      setNumeroReferencia(informacoesCliente.numero_referencia || "");
      setEstadoReferencia(informacoesCliente.estado_referencia || "");
      setCidadeReferencia(informacoesCliente.cidade_referencia || "");
      setFormulario({
        situacaoProfissional: informacoesCliente.situacao_profissional || "",
        nomeDaMae: informacoesCliente.nome_mae || "",
        cpfDaMae: informacoesCliente.cpf_mae || "",
        whatsappMae: informacoesCliente.whatsapp_mae || "",
        cepMae: informacoesCliente.cep_mae || "",
        ruaMae: informacoesCliente.rua_mae || "",
        bairroMae: informacoesCliente.bairro_mae || "",
        numeroCasaMae: informacoesCliente.numero_casa_mae || "",
        estadoMae: informacoesCliente.estado_mae || "",
        cidadeMae: informacoesCliente.cidade_mae || "",
        nomeDoPai: informacoesCliente.nome_pai || "",
        cpfDaPai: informacoesCliente.cpf_pai || "",
        whatsappPai: informacoesCliente.whatsapp_pai || "",
        cepPai: informacoesCliente.cep_pai || "",
        ruaPai: informacoesCliente.rua_pai || "",
        bairroPai: informacoesCliente.bairro_pai || "",
        numeroCasaPai: informacoesCliente.numero_casa_pai || "",
        estadoPai: informacoesCliente.estado_pai || "",
        cidadePai: informacoesCliente.cidade_pai || "",

      })
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
      tipo_referencia: tipoDeReferencia,
      nome_empresa: nomeDaEmpresa.trim(),
      endereco_empresa: enderecoDaEmpresa.trim(),
      numero_rh_empresa: contatoDaEmpresa.trim(),
      id_consultor: consultorSelecionado || null,
      valor_solicitado: valorMonetarioCorreto,
      observacao: observacao,
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

    const { data:lancamento, error:erroLancamento } = await supabase  
      .from("contas_receber")
      .select("id_cliente")
      .eq("id_cliente", informacoesCliente.id);

    if(lancamento && lancamento.length >= 1) {
      toast.error("Existem empréstimos relacionado a esse cliente. Realize a exclusão dos lançamentos correspondentes para prosseguir com a exclusão")
      return
    } else {
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
  }

  async function buscarCep(cep: string) {

    setLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data: viaCep = await response.json();

      setBairro(data.bairro);
      setRua(data.logradouro);
      setEstado(data.uf); 
      setCidade(data.localidade);

    } catch(error) {
      console.log("Deu errado!");
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
  { label: "Masculino", value: "MASCULINO" },
  { label: "Feminino", value: "FEMININO" }
];

const estadoCivilOptions = [
  { label: "Solteiro(a)", value: "SOLTEIRO(A)" },
  { label: "Casado(a)", value: "CASADO(A)" },
  { label: "Companheiro(a)", value: "COMPANHEIRO(A)" },
  { label: "Separado(a)", value: "SEPARADO(A)" },
  { label: "Divorciado(a)", value: "DIVORCIADO(A)" },
  { label: "Viúvo(a)", value: "VIUVO(A)" },
];

const moradiaOptions = [
  { label: "Casa", value: "CASA" },
  { label: "Apartamento", value: "APARTAMENTO" },
  { label: "Aluguel", value: "ALUGUEL" },
  { label: "Área rural", value: "AREA RURAL" },
];

const condicaoMoradiaOptions = [
  { label: "Próprio Quitado", value: "PRÓPRIO QUITADO" },
  { label: "Própria Financiada", value: "PRÓPRIA FINANCIADA" },
  { label: "Alugada", value: "ALUGADA" },
  { label: "Imóvel Cedido", value: "IMÓVEL CEDIDO" }
];

const verificarVeiculoOptions = [
  { label: "Sim", value: "SIM" },
  { label: "Não", value: "NÃO" },
];

const veiculosOptions = [
  { label: "Carro", value: "CARRO" },
  { label: "Moto", value: "MOTO" },
  { label: "Caminhão", value: "CAMINHÃO" },
  { label: "Van", value: "VAN" },
  { label: "Ônibus", value: "ÔNIBUS" },
];

const condicaoVeiculoOptions = [
  { label: "Quitado", value: "QUITADO" },
  { label: "Financiado", value: "FINANCIADO" },
  { label: "Consórcio", value: "CONSÓRCIO" },
];

const tipoReferencia = [
  { label: "Pai", value: "PAI" },
  { label: "Mãe", value: "MÃE" },
  { label: "Irmão / Irmã", value: "IRMÃO / IRMÃ" },
  { label: "Filho / Filha", value: "FILHO / FILHA" },
  { label: "Esposo / Esposa", value: "ESPOSO / ESPOSA" },
  { label: "Companheiro(a)", value: "COMPANHEIRO(A)" },
  { label: "Amigo / Amiga", value: "AMIGO / AMIGA" },
  { label: "Colega de trabalho", value: "COLEGA DE TRABALHO" },
  { label: "Outro parente", value: "OUTRO PARENTE" }
];

  const situacaoProfissionalOptions = [
    { label: "Trabalhador CLT", value: "CLT" },
    { label: "Servidor Público", value: "SERVIDOR" },
    { label: "Aposentado (INSS)", value: "APOSENTADO" },
    { label: "Pessoa Jurídica - MEI", value: "MEI" }
  ];


  return(
    <div>

      {/* ========== BOTÕES DE OPÇÕES ========== */}

      <div className="flex gap-3 flex-wrap">

        {(grupo === "Administrador" || grupo === "Proprietario") && (
          <button onClick={() => setAtivar(!ativar)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Alterar </button>
        )}

        {(grupo === "Administrador" || grupo === "Proprietario") && (
          <button onClick={() => setMostrarModal(true)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Deletar </button>
        )}
        
        <AdicionarDocumento clienteId={informacoesCliente.id} />

        {(grupo === "Administrador" || grupo === "Proprietario") && (
          <AlterarStatus clienteId={informacoesCliente.id} status={informacoesCliente.status} />
        )}

      </div>

      {/* ========== ALTERAR INFORMACOES ========== */}

      {ativar && (
        <form onSubmit={atualizarCliente} className="bg-white shadow rounded-xl p-6 my-5">

          <section className="grid md:grid-cols-2 gap-2">

            <div>
              <Label> Nome Completo </Label>
              <InputAlterar 
                type="text"
                value={nome}
                onChange={ (e) => setNome(e.target.value)}
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
                onChange={(e) => limiteCpf(e, setCpf)}
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
                onChange={ (e) => setDataRg(e.target.value)}
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
              <Label> Data Nascimento </Label>
              <InputAlterar 
                type="date"
                value={dataNascimento}
                onChange={ (e) => setDataNascimento(e.target.value)}
              />
            </div>
      
            <div>
              <Label> Whatsapp </Label>
              <InputAlterar 
                type="number"
                value={whatsapp}
                onChange={(e) => limiteWhatsapp(e, setWhatsapp)}
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
                onChange={(e) => limiteCpf(e, setCpfCompanheiro)}
                maxLength={11}
              />
            </div>
            )}

            {(estadoCivil === "Casado(a)" || estadoCivil === "Companheiro(a)") && (
            <div>
              <Label> Whatsapp do Companheiro(a) </Label>
              <InputAlterar 
                type="number"
                value={whatsappCompanheiro}
                onChange={(e) => limiteWhatsapp(e, setWhatsappCompanheiro)}
                maxLength={13}
              />
            </div>
            )}

            <div>
              <Label> Nome Referência - Pessoal </Label>
              <InputAlterar 
                type="text"
                value={nomeReferencia}
                onChange={ (e) => setNomeReferencia(e.target.value)}
              />
            </div>

            <div>
              <Label> Whatsapp de Referência - Pessoal </Label>
              <InputAlterar 
                type="number"
                value={telefoneReferencia}
                onChange={(e) => limiteTelefoneReserva(e, setTelefoneReferencia)}
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

            <div className="mb-[-16px] sm:mb-0">
              <Label> CEP - Referencia - Pessoal </Label>
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

            <div className="mb-[-16px] sm:mb-0">

              <Label> Rua - Referencia - Pessoal </Label>
              <Input 
                type="text"
                value={ruaReferencia}
                onChange={ (e) => setRuaReferencia(e.target.value)}
              />
              
            </div>

            <div className="mb-[-16px] sm:mb-0">

              <Label> Bairro - Referencia - Pessoal </Label>
              <Input 
                type="text"
                value={bairroReferencia}
                onChange={ (e) => setBairroReferencia(e.target.value)}
              />
              
            </div>

            <div className="mb-[-16px] sm:mb-0">

              <Label> Número Endereço - Referencia - Pessoal </Label>
              <Input 
                type="number"
                value={numeroReferencia}
                onChange={ (e) => setNumeroReferencia(e.target.value)}
              />
              
            </div>

            <div>

              <Label> Estado - Referencia - Pessoal </Label>

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

              <Label> Cidade - Referencia - Pessoal </Label>

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
    
            <div>
              <Label> CEP </Label>
              <InputAlterar 
                type="number"
                value={cep}
                onChange={(e) => limiteCep(e, setCep)}
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
              <Label className="text-sm sm:text-base"> Nº da Casa </Label>
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
              <Label className="text-sm sm:text-base"> Moradia </Label>
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
              <div className="mb-[-16px] sm:mb-0">
                
                <Label> Valor do Financiamento </Label>
                <Input 
                  value={valorFinanciamento}
                  onChange={(e) => mostrarValor(e, setValorFinanciamento)} 
                />
                
              </div>
            )}
    
            {condicaoMoradia === "Alugada" && (
              <div className="mb-[-16px] sm:mb-0">
                
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
              <div className="mb-[-16px] sm:mb-0">
                
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
                onChange={(e) => limiteTelefoneReserva(e, setContatoDaEmpresa)}
                maxLength={13}
              />
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
              onChange={criarOnChangeComMascara("cpfDaMae", limiteCepNova)}
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
                onChange={(e) => mostrarValor(e, setValorSolicitado)}
              />
            </div>

            <div>
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

          </section>

          <button type="submit" className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 cursor-pointer w-full mt-8"> Salvar Alterações </button>

        </form>
      )}

      {/* ========== MODAL PARA EXCLUIR ========== */}

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

      {/* ========== LOADING ========== */}

    {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

    </div>
  )
}