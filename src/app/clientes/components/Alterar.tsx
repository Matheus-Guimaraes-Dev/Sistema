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

interface ConsultorBusca {
  id: number;
  nome_completo: string;
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
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  const valorMonetarioCorreto = limparValorMonetario(valorSolicitado);
  const valorFinanciamentoMoradiaCorreto = limparValorMonetario(valorFinanciamento);
  const valorAluguelCorreto = limparValorMonetario(valorAluguel);
  const valorFinanciamentoVeiculoCoreto = limparValorMonetario(valorFinanciamentoVeiculo);

  const [consultorSelecionado, setConsultorSelecionado] = useState("");
  const [consultoresBusca, setConsultoresBusca] = useState<ConsultorBusca[]>([]);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [ativar, setAtivar] = useState(false);

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
      setConsultorSelecionado(informacoesCliente.consultores?.id.toString() || "")
      setValorSolicitado(Number(informacoesCliente.valor_solicitado || "").toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', }) || "");
      setObservacao(informacoesCliente.observacao || "")
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
              <Label> Celular do Companheiro(a) </Label>
              <InputAlterar 
                type="number"
                value={whatsappCompanheiro}
                onChange={(e) => limiteWhatsapp(e, setWhatsappCompanheiro)}
                maxLength={13}
              />
            </div>
            )}
      
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
              <Label> Telefone Reserva </Label>
              <InputAlterar 
                type="number"
                value={telefoneReserva}
                onChange={(e) => limiteTelefoneReserva(e, setTelefoneReserva)}
                maxLength={13}
              />
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
              <Label className="text-sm sm:text-base"> Nº da Casa </Label>
              <InputAlterar 
                type="number" 
                value={Ncasa}
                onChange={ (e) => setNcasa(e.target.value)}
              />
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