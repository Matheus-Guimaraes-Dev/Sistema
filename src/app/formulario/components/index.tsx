"use client"

import { Input } from "./input"
import { useState } from "react"

type CidadesPorEstado = {
  [estado: string]: string[];
}

//const cidadesPorEstado: CidadesPorEstado = {
  Rondonia: [
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



export function FomularioComponente() {

  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [sexo, setSexo] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [cep, setCep] = useState("");

   const [moradia, setMoradia] = useState("");

//  const estados = Object.keys(cidadesPorEstado);
//  const cidades = estado ? cidadesPorEstado[estado] : [];

  async function buscarCep(cep: string) {

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json();
      console.log(data.localidade);

      setCidade(data.localidade)

    } catch(error) {
      console.log("Deu errado!");
    }



  }

  function limiteCpf(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, ""); 
    if (value.length <= 11) {
      setCpf(value);
    }
  }

  function limiteRg(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if(value.length <= 7) {
      setRg(value);
    }
  }

  return(
    <form className="bg-white w-full sm:w-100 rounded-3xl pb-6 px-2">

      <h1 className="text-center mt-4 font-semibold text-2xl pt-4"> Formulário </h1>

      <div className="mx-2 mt-4">

        <label className="text-sm sm:text-base"> Nome Completo </label>
        <Input 
          type="text"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Email </label>
        <Input 
          type="text" 
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> CPF </label>
        <Input 
          type="text"
          inputMode="numeric"
          value={cpf}
          onChange={limiteCpf}
          maxLength={11}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> RG </label>
        <Input 
          type="text"
          inputMode="numeric"
          value={rg}
          onChange={limiteRg}
          maxLength={7} 
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 flex-col mb-4">
        
        <label className="text-sm sm:text-base"> Data de Emissão RG </label>
        <input 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          type="date"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Orgão Expedidor </label>
        <Input 
          type="text"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 flex flex-col mb-4">
        
        <label className="text-sm sm:text-base"> Sexo </label>
        <select 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          value={sexo}
          onChange={ (e) => setSexo(e.target.value)}
        >
          <option value="" disabled> Selecionar... </option>
          <option value="opcao1"> Masculino </option>
          <option value="opcao2"> Feminino </option>
        </select>
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <label className="text-sm sm:text-base"> Estado Civil </label>
        <select 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          value={estadoCivil}
          onChange={ (e) => setEstadoCivil(e.target.value)}
        > 
          <option value="" disabled> Selecionar... </option>
          <option value="opcao1"> Solteiro </option>
          <option value="opcao2"> Casado </option>
          <option value="opcao2"> Seperado(a) </option>
          <option value="opcao2"> Divorciado(a) </option>
          <option value="opcao2"> Viúvo(a) </option>
        </select>
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <label className="text-sm sm:text-base"> Data Nascimento </label>
        <input 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          type="date"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Whatsapp </label>
        <Input 
          type="number"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Telefone Reserva </label>
        <Input 
          type="number"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> CEP </label>
        <Input 
          type="number"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
          onBlur={() => {
            if (cep.length === 8) buscarCep(cep);
          }}
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Bairro </label>
        <Input 
          type="text"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Rua </label>
        <Input 
          type="text"
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4">
        
        <label className="text-sm sm:text-base"> Nº da Casa </label>
        <Input 
          type="number" 
        />
        
      </div>

      <div className="mt-[-12px] mx-2 sm:mt-4 mb-4">
        
        <label className="text-sm sm:text-base"> Moradia </label>
        <select 
          value={moradia}
          onChange={(e) => setMoradia(e.target.value)} 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
        >
          <option value="" disabled> Selecionar... </option>
          <option value="opcao1"> Casa </option>
          <option value="opcao2"> Apartamento </option>
          <option value="opcao2"> Aluguel </option>
          <option value="opcao2"> Área rural </option>
        </select>
        
      </div>
      



            <div className="mt-[-12px] mx-2 sm:mt-4">
        <label className="text-sm sm:text-base">Teste</label>
        <select
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          disabled={!estado}
        >
        
        </select>
      </div>

    </form>
  )
}