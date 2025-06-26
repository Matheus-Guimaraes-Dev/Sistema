"use client"

import { useState, useEffect, FormEvent } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import { createClient } from "@/lib/client";
import { AlterarStatusConsultor } from "../AlterarStatus";
import { cidadesPorEstado } from "@/app/clientes/estados-cidades";
import { viaCep } from "@/components/types/types";
import { PropsAlterar } from "../types";
import { Label } from "@/app/formulario/components/componentes/label";
import { limiteCpf, limiteCep, limiteWhatsapp, limiteTelefoneReserva, limiteRg } from "@/funcoes/limitacao";
import { Select } from "@/app/clientes/componentes/select-cliente";

export default function AlterarConsutores({ informacoesConsultor }: PropsAlterar ) {

  const supabase = createClient();

  const [loading, setLoading] = useState(false);
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
  const [observacao, setObservacao] = useState("");
  const [porcentagem, setPorcentagem] = useState(0);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [ativar, setAtivar] = useState(false);

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  useEffect( () => {
    if(informacoesConsultor) {
      setNome(informacoesConsultor.nome_completo);
      setEmail(informacoesConsultor.email);
      setCpf(informacoesConsultor.cpf);
      setRg(informacoesConsultor.rg);
      setDataRg(informacoesConsultor.data_emissao_rg);
      setOrgaoExpedidor(informacoesConsultor.orgao_expedidor);
      setSexo(informacoesConsultor.sexo);
      setEstadoCivil(informacoesConsultor.estado_civil);
      setDataNascimento(informacoesConsultor.data_nascimento);
      setWhatsapp(informacoesConsultor.whatsapp);
      setTelefoneReserva(informacoesConsultor.telefone_reserva);
      setCep(informacoesConsultor.cep);
      setBairro(informacoesConsultor.bairro);
      setRua(informacoesConsultor.rua);
      setNcasa(informacoesConsultor.numero_casa);
      setMoradia(informacoesConsultor.moradia);
      setEstado(informacoesConsultor.estado);
      setCidade(informacoesConsultor.cidade);
      setObservacao(informacoesConsultor.observacao);
      setPorcentagem(informacoesConsultor.porcentagem)
    }
  }, [informacoesConsultor] );

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
      observacao: observacao,
    }

    setLoading(true);

    const { error } = await supabase
      .from("consultores")
      .update(dadosAtualizados)
      .eq("id", informacoesConsultor.id)

    if(error) {
      console.error("Erro ao atualizar cliente:", error.message);
      return false;
    }

    setLoading(false);

    window.location.reload()

    return true

  }

  async function deletarCliente() {

    setLoading(true);

    const { error: erroDeletarCliente } = await supabase
      .from("clientes")
      .delete()
      .eq("id", informacoesConsultor.id);

    if (erroDeletarCliente) {
      console.error("Erro ao deletar cliente:", erroDeletarCliente.message);
      return false;
    }

    setLoading(false);

    return true;

  }

  async function buscarCep(cep: string) {

    setLoading(true);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data: viaCep = await response.json();
      console.log(data);

      setBairro(data.bairro ?? "");
      setRua(data.logradouro ?? "");
      setEstado(data.uf ?? ""); 
      setCidade(data.localidade ?? "");

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
    <div>

      <div className="flex gap-3 flex-wrap">

        <button onClick={() => setAtivar(!ativar)} className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-md text-sm cursor-pointer"> Alterar </button>
        
        <AlterarStatusConsultor consultorId={informacoesConsultor.id} status={informacoesConsultor.status} />

      </div>

      {ativar && (
        <form onSubmit={atualizarCliente} className="bg-white shadow rounded-xl p-6 my-5">

          <section className="grid md:grid-cols-2 gap-2">

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
                onChange={(e) => limiteRg(e, setCpf)}
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
      
            <div className="flex flex-col">
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
                onChange={(e) => limiteWhatsapp(e, setCpf)}
                maxLength={13}
              />
            </div>
      
            <div>
              <Label> Telefone Reserva </Label>
              <InputAlterar 
                type="number"
                value={telefoneReserva}
                onChange={(e) => limiteTelefoneReserva(e, setCpf)}
                maxLength={13}
              />
            </div>
      
            <div>
              <Label> CEP </Label>
              <InputAlterar 
                type="number"
                value={cep}
                onChange={(e) => limiteCep(e, setCpf)}
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

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div className="absolute inset-0 backdrop-blur-sm bg-white/10"> </div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4"> Deseja realmente excluir este consultor? </h2>

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

      {loading && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-white rounded-full animate-spin"></div>
        </div>
      )}

    </div>
  )
}