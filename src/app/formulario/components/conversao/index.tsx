export async function converterImagemParaWebP(arquivoOriginal: File): Promise<Blob> {

  if (!arquivoOriginal.type.startsWith("image/")) {
    return arquivoOriginal;
  }

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
          0.7 // qualidade (de 0 a 1)
        );
      };
      img.onerror = () => reject("Erro ao carregar imagem");
      img.src = leitor.result as string;
    };

    leitor.onerror = () => reject("Erro ao ler imagem");
    leitor.readAsDataURL(arquivoOriginal);
  });
  
}
