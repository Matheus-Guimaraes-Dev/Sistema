"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { InputAlterar } from "@/app/clientes/components/InputAlterar";
import toast from "react-hot-toast";
import { createClient } from "@/lib/client";
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

      {/*
      <Card>
        <CardHeader>
          <CardTitle>Juros do Vencimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-blue-50">
            <span className="font-medium">Aplicar juros após vencimento</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Pencil className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      */}

    </div>
  );
}
