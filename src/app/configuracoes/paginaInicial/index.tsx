"use client";

import FormasDePagamento from "../formasDePagamento";
import Juros from "../juros";
import JurosVencimento from "../jurosVencimento";

export default function PaginaInicial() {

  return (
    <div className="flex-1 px-5">

      <h1 className="text-2xl font-semibold text-blue-900 text-center my-5"> Configurações </h1>

      <FormasDePagamento />

      <Juros />

      <JurosVencimento />

    </div>
  );
}
