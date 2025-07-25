import heic2any from "heic2any";

export async function converterImagemParaWebP(arquivoOriginal: File): Promise<Blob> {
  // Se não for imagem, apenas retorne
  if (!arquivoOriginal.type.startsWith("image/")) {
    return arquivoOriginal;
  }

  // Se for .heic, converte para .jpeg
  if (
    arquivoOriginal.type === "image/heic" ||
    arquivoOriginal.name.toLowerCase().endsWith(".heic")
  ) {
    try {
      const blobConvertido = await heic2any({
        blob: arquivoOriginal,
        toType: "image/jpeg",
        quality: 0.9,
      }) as Blob;

      arquivoOriginal = new File(
        [blobConvertido],
        arquivoOriginal.name.replace(/\.heic$/i, ".jpeg"),
        { type: "image/jpeg" }
      );
    } catch (erro) {
      throw new Error("Erro ao converter imagem .HEIC para JPEG: " + erro);
    }
  }

  // Agora faz a conversão para .webp normalmente
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas não suportado");

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject("Erro ao converter para WebP");
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = () => reject("Erro ao carregar imagem");
      img.src = leitor.result as string;
    };

    leitor.onerror = () => reject("Erro ao ler imagem");
    leitor.readAsDataURL(arquivoOriginal);
  });
}
