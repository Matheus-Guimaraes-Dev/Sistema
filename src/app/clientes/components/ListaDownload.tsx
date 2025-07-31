"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { FaTrashAlt } from "react-icons/fa";
import { useUser } from "@/contexts/UserContext";
import { FaEye } from "react-icons/fa";

interface Props {
  clienteId: string;
}

interface Arquivo {
  name: string;
}

export default function ListaDownloads({ clienteId }: Props) {

  const supabase = createClient();

  const { grupo } = useUser();

  const [arquivos, setArquivos] = useState<Arquivo[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const [imagemPreviewUrl, setImagemPreviewUrl] = useState<string | null>(null);
  const [mostrarPreview, setMostrarPreview] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<string | null>(null);

  const abrirModalExcluir = (nomeArquivo: string) => {
    setArquivoSelecionado(nomeArquivo);
    setMostrarModal(true);
  };

  const verImagem = async (nomeArquivo: string) => {
    const caminho = `clientes/${clienteId}/${nomeArquivo}`;
    const { data } = supabase.storage.from("clientes").getPublicUrl(caminho);

    if (!data?.publicUrl) {
      console.error("Erro ao obter URL da imagem:");
      alert("Não foi possível visualizar a imagem.");
      return;
    }

    setImagemPreviewUrl(data.publicUrl);
    setMostrarPreview(true);
  };


  const confirmarExclusao = async () => {

    if (!arquivoSelecionado) return;

    const caminho = `clientes/${clienteId}/${arquivoSelecionado}`;
    const { error } = await supabase.storage.from("clientes").remove([caminho]);

    if (error) {
      alert("Não foi possível excluir o arquivo.");
      console.error("Erro ao excluir arquivo:", error.message);
    } else {
      setArquivos((prev) => prev.filter((a) => a.name !== arquivoSelecionado));
      setMostrarModal(false);
      setArquivoSelecionado(null);
    }

  };

  useEffect(() => {

    const buscarArquivos = async () => {
      const { data, error } = await supabase.storage
        .from("clientes")
        .list(`clientes/${clienteId}`);

      if (error) {
        console.error("Erro ao listar arquivos:", error.message);
        setErro("Não foi possível carregar os arquivos.");
      } else {
        setArquivos(data || []);
      }

    };

    buscarArquivos();

  }, [clienteId]);

  function formatarNomeAmigavel(nome: string) {
    const mapa: Record<string, string> = {
      "foto_comprovante_endereco": "Comprovante (Endereço)",
      "foto_comprovante_renda": "Comprovante (Renda)",
      "foto_identidade_frente": "Identidade (Frente)",
      "foto_identidade_verso": "Identidade (Verso)",
      "segurando_documento": "Fotografia do titular segurando seu documento oficial",
      "CarteiraDigital": "CarteiraDigital"
    };

    const chave = nome.split("-")[0];
    return mapa[chave] || nome; 
  }

  const excluirArquivo = async (nomeArquivo: string) => {
  const caminho = `clientes/${clienteId}/${nomeArquivo}`;

  const { error } = await supabase.storage.from("clientes").remove([caminho]);

  if (error) {
    console.error("Erro ao excluir arquivo:", error.message);
    alert("Não foi possível excluir o arquivo.");
    return;
  }


  setArquivos((prevArquivos) =>
    prevArquivos.filter((arquivo) => arquivo.name !== nomeArquivo)
  );

};

const baixar = async (nomeArquivo: string) => {
  const caminho = `clientes/${clienteId}/${nomeArquivo}`;
  const { data } = supabase.storage.from("clientes").getPublicUrl(caminho);
  const url = data?.publicUrl;
  if (!url) return;

  const extensao = nomeArquivo.split(".").pop()?.toLowerCase();

  if (extensao === "webp") {

    const resposta = await fetch(url);
    const blob = await resposta.blob();

    const img = new Image();
    img.crossOrigin = "anonymous";
    const urlObject = URL.createObjectURL(blob);
    img.src = urlObject;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blobJPEG) => {
        if (!blobJPEG) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blobJPEG);
        link.download = nomeArquivo.replace(".webp", ".jpeg");
        link.click();
      }, "image/jpeg");
    };
  } else {
    window.open(url, "_blank");
  }
};

  function ehImagem(nome: string): boolean {
    const extensao = nome.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(extensao || "");
  }

  if (erro) return <p>{erro}</p>;

  return (
     <>
      <div className="space-y-2">
        {arquivos.map((arquivo) => (
          <div key={arquivo.name} className="flex items-center gap-2">
            <button
              onClick={() => baixar(arquivo.name)}
              className="flex items-center font-medium text-white text-[14px] px-4 py-3 bg-gradient-to-t from-[#4D36D0] to-[#8474FE] rounded-full hover:shadow-[0_0.5em_1.5em_-0.5em_rgba(77,54,208,0.75)] active:shadow-[0_0.3em_1em_-0.5em_rgba(77,54,208,0.75)] transition cursor-pointer max-w-45 sm:max-w-full whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {formatarNomeAmigavel(arquivo.name.replace(".webp", ""))}
            </button>

            {ehImagem(arquivo.name) && (
              <FaEye size={20} color={"blue"} onClick={() => verImagem(arquivo.name)} className="text-blue-600 underline hover:text-blue-800 cursor-pointer" />
            )}

            {(grupo === "Administrador" || grupo === "Proprietario") && (
              <FaTrashAlt onClick={() => abrirModalExcluir(arquivo.name)} size={20} color="red" className="cursor-pointer" />
            )}

          </div>
        ))}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/30"
            onClick={() => setMostrarModal(false)} 
          ></div>

          <div className="relative bg-white p-6 rounded-xl shadow-lg z-10 w-[90%] max-w-md text-center">
            <h2 className="text-xl font-bold mb-4">
              Deseja realmente excluir este arquivo?
            </h2>

            <p className="mb-4">
              Todos os dados relacionados a este arquivo serão apagados de forma permanente.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmarExclusao}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
              >
                Sim
              </button>

              <button
                onClick={() => setMostrarModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 cursor-pointer"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarPreview && imagemPreviewUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/30"
            onClick={() => setMostrarPreview(false)}
          ></div>

          <div className="relative bg-white p-4 rounded-xl shadow-lg z-10 max-w-3xl w-[90%] text-center">
            <button
              onClick={() => setMostrarPreview(false)}
              className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full z-20 cursor-pointer"
            >
              Fechar
            </button>
            <img
              src={imagemPreviewUrl}
              alt="Visualização do arquivo"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </>
  );
}
