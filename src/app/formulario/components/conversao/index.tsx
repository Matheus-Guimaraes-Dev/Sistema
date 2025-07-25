export async function converterImagemParaWebP(arquivoOriginal: File): Promise<Blob> {
  // Se não for imagem, apenas retorna o próprio arquivo
  if (!arquivoOriginal.type.startsWith("image/")) {
    return arquivoOriginal;
  }

  // Verifica se é .heic
  const isHeic = arquivoOriginal.type === "image/heic" ||
    arquivoOriginal.name.toLowerCase().endsWith(".heic");

  // Se for HEIC, tenta converter para JPEG primeiro
  if (isHeic) {
    try {
      const heic2any = (await import("heic2any")).default;

      const blobConvertido = await heic2any({
        blob: arquivoOriginal,
        toType: "image/jpeg",
        quality: 0.95,
      }) as Blob;

      // Atualiza o arquivoOriginal com o novo JPEG
      arquivoOriginal = new File(
        [blobConvertido],
        arquivoOriginal.name.replace(/\.heic$/i, ".jpeg"),
        { type: "image/jpeg" }
      );
    } catch (erro) {
      console.error("Erro ao converter HEIC para JPEG:", erro);
      throw new Error("Erro ao converter imagem .HEIC. Tente enviar a imagem em .JPEG");
    }
  }

  // Conversão normal para WebP
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

      img.onerror = (e) => {
        console.error("Erro ao carregar imagem:", e);
        reject("Erro ao carregar imagem");
      };

      img.src = leitor.result as string;
    };

    leitor.onerror = (e) => {
      console.error("Erro ao ler imagem:", e);
      reject("Erro ao ler imagem");
    };

    leitor.readAsDataURL(arquivoOriginal);
  });
}
