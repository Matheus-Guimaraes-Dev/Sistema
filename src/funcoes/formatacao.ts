export function limparValorMonetario(valor: string): number {
  return parseFloat(
    valor
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );
}

export function formatarParaReal(valor: string) {
  const apenasNumeros = valor.replace(/\D/g, "");
  const valorNumerico = parseFloat(apenasNumeros) / 100;

  if (isNaN(valorNumerico)) {
    return "";
  }

  return valorNumerico.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function mostrarValor(
  e: React.ChangeEvent<HTMLInputElement>,
  setValor: (valor: string) => void
) {
  const valor = e.target.value;
  const formatado = formatarParaReal(valor);

  setValor(formatado);
}