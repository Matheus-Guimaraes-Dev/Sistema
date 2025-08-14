"use client"

import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import { useState } from "react"
import toast from 'react-hot-toast'
import { createClient } from "@/lib/client";
import { cidadesPorEstado } from "@/app/clientes/estados-cidades";
import { limiteCpf, limiteRg, limiteWhatsapp, limiteTelefoneReserva, limiteCep } from "@/funcoes/limitacao";
import InputPorcentagem from "./InputPorcentagem";
import { viaCep } from "@/components/types/types";
import { limiteDataNascimento, limiteDataRg } from "@/funcoes/limitacao";
import { Label } from "@/app/formulario/components/componentes/label";
import { Select } from "@/app/clientes/componentes/select-cliente";

export function FormularioConsultor() {
 
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
  const [comissaoMensal, setComissacaoMensal] = useState("");
  const [comissaoSemanal, setComissacaoSemanal] = useState("");
  const [comissaoDiario, setComissacaoDiario] = useState("");

  const estados = Object.keys(cidadesPorEstado);
  const cidades = estado in cidadesPorEstado 
  ? cidadesPorEstado[estado as keyof typeof cidadesPorEstado]
  : [];

  async function enviarFormulario(e: React.FormEvent) {

    e.preventDefault()

    if (!nome.trim()) return toast.error("Digite o seu nome!");
    if (!comissaoDiario.trim()) return toast.error("Digite o valor da Comissão Diário!");
    if (!comissaoSemanal.trim()) return toast.error("Digite o valor da Comissão Semanal!");
    if (!comissaoMensal.trim()) return toast.error("Digite o valor da Comissão Mensal!");

    setLoading(true);

    const { data: clienteData, error: insertError } = await supabase
      .from("consultores")
      .insert({ 
        nome_completo: nome.trim(),
        email: email.trim(),
        cpf: cpf.trim(),
        rg: rg.trim(),
        data_emissao_rg: dataRg || "01/01/1000",
        orgao_expedidor: orgaoExpedidor.trim(),
        sexo,
        estado_civil: estadoCivil,
        data_nascimento: dataNascimento || "01/01/1000",
        whatsapp,
        telefone_reserva: telefoneReserva,
        cep,
        bairro: bairro.trim(),
        rua: rua.trim(),
        numero_casa: Ncasa.trim(),
        moradia,
        estado,
        cidade,
        observacao: observacao,
        comissao_mensal: comissaoMensal,
        comissao_semanal: comissaoSemanal,
        comissao_diaria: comissaoDiario,
      })

    if (insertError) {
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
      setObservacao("");
      setComissacaoMensal("");
      setComissacaoSemanal("");
      setComissacaoDiario("");
      toast.success('Consultor Cadastrado com Sucesso!')
    }

    setLoading(false);

  }

  const sexoOptions = [
    { label: "Masculino", value: "Masculino" },
    { label: "Feminino", value: "Feminino" }
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
      console.log("Deu errado!");
    }

    setLoading(false);

  }

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
        <Label className="text-sm sm:text-base mb-3"> Data de Emissão RG </Label>
        <input 
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
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
        <input 
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          type="date"
          value={dataNascimento}
          onChange={(e) => limiteDataNascimento(e, setDataNascimento)}
        />
      </div>
      
      <div>
        <Label> Whatsapp </Label>
        <input 
          type="number"
          value={whatsapp}
          onChange={ (e) => limiteWhatsapp(e, setWhatsapp)}
          maxLength={13}
          className="w-full h-9 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6] text-sm sm:text-base"
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
        <Label> Observação </Label>
        <InputAlterar 
          type="text"
          value={observacao ?? ""}
          onChange={ (e) => setObservacao(e.target.value)}
        />
      </div>

      <div>
        <Label> Comissão Mensal </Label>
        <InputPorcentagem
          label="Desconto"
          value={comissaoMensal}
          onChange={setComissacaoMensal}
          name="desconto"
        />
      </div>

      <div>
        <Label> Comissão Semanal </Label>
        <InputPorcentagem
          label="Desconto"
          value={comissaoSemanal}
          onChange={setComissacaoSemanal}
          name="desconto"
        />
      </div>

      <div>
        <Label> Comissão Diário </Label>
        <InputPorcentagem
          label="Desconto"
          value={comissaoDiario}
          onChange={setComissacaoDiario}
          name="desconto"
        />
      </div>

      <div className="flex items-end">

        <div className="cursor-pointer flex-1">
         <button type="submit" className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer w-full"> Enviar </button>
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