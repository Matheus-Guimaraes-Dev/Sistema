import { converterImagemParaWebP } from "@/app/formulario/components/conversao"
import { createClient } from "@/lib/client"

import { useRef } from "react"

export default function AdicionarDocumento({ clienteId }: { clienteId: string }) {

  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const idConvertido = parseInt(clienteId)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    try {

      const arquivoConvertido = await converterImagemParaWebP(arquivo)

      const { data: arquivosExistentes, error: erroLista } = await supabase.storage
        .from("clientes")
        .list(`clientes/${idConvertido}/`)

      if (erroLista) {
        console.error("Erro ao listar arquivos:", erroLista)
        return
      }

      const proximoId = (arquivosExistentes?.length || 0) + 1

      const nomeOriginal = arquivo.name.split(".").slice(0, -1).join(".")
      const nomeLimpo = nomeOriginal.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "")

      const ehImagemConvertida = arquivoConvertido.type === "image/webp"
      const extensao = ehImagemConvertida ? "webp" : arquivo.name.split(".").pop()
      const contentType = arquivoConvertido.type

      const nomeFinal = `${nomeLimpo}_${proximoId}.${extensao}`

      const { data, error } = await supabase.storage
        .from("clientes")
        .upload(`clientes/${idConvertido}/${nomeFinal}`, arquivoConvertido, {
          cacheControl: "3600",
          upsert: false,
          contentType: contentType,
        })

      if (error) {
        console.error("Erro ao fazer upload:", error)
        return
      }

      window.location.reload();
    } catch (erro) {
      console.error("Erro geral:", erro)
    }
  }

  return (
    <>
      <input
        type="file"
        accept="image/*,.pdf"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
      />

      <button
        onClick={handleClick}
        type="button"
        className="flex items-center gap-3 px-2 py-3 bg-blue-600 text-white text-xs font-extrabold uppercase rounded-lg shadow-[0_4px_6px_-1px_rgba(72,138,236,0.19),0_2px_4px_-1px_rgba(72,138,236,0.09)]
        transition-all duration-600 ease-in-out hover:shadow-[0_10px_15px_-3px_rgba(72,138,236,0.31),0_4px_6px_-2px_rgba(72,138,236,0.09)] focus:opacity-85 focus:shadow-none active:opacity-85 active:shadow-none select-none cursor-pointer h-10"
      >
        <svg
          aria-hidden="true"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            stroke="#ffffff"
            d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125"
          />
          <path
            stroke="#ffffff"
            d="M17 15V18M17 21V18M17 18H14M17 18H20"
          />
        </svg>
        Add Arquivo
      </button>
    </>
  )
}
