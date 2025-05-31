"use client"

import { Input } from "./input"

export function FomularioComponente() {
  return(
    <form className="bg-white w-full mx-4 sm:w-100 rounded-3xl pb-6">

      <h1 className="text-center mt-4 font-semibold text-2xl"> Formulário </h1>

      <div className="mt-4 mx-2">

        <label> Nome Completo </label>
        <Input 
          type="text"
          placeholder="Digite o seu nome completo..."  
        />
        
      </div>

      <div className="mt-4 mx-2">
        
        <label> Email </label>
        <Input 
          type="text"
          placeholder="Digite seu email..."  
        />
        
      </div>

      <div className="mt-4 mx-2">
        
        <label> CPF </label>
        <Input 
          type="text"
          placeholder="Digite seu CPF (EX: 12345678911)..."  
        />
        
      </div>

      <div className="mt-4 mx-2">
        
        <label> RG </label>
        <Input 
          type="text"
          placeholder="Digite seu RG..."  
        />
        
      </div>

      <div className="mt-4 mx-2 flex flex-col">
        
        <label> Data de Emissão RG </label>
        <input 
          className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]"
          type="date"
          placeholder="Digite seu RG..."  
        />
        
      </div>

      <div className="mt-4 mx-2">
        
        <label> Orgão Expedidor </label>
        <Input 
          type="text"
          placeholder="Digite seu o orgão expedidor..."  
        />
        
      </div>

      <div className="mt-4 mx-2 flex flex-col">
        
        <label> Sexo </label>
        <select className="w-full h-8 border-2 px-1 border-[#002956] rounded  focus:outline-[#4b8ed6]">
          <option value="opcao1"> Masculino </option>
          <option value="opcao2"> Feminino </option>
        </select>
        
      </div>

    </form>
  )
}