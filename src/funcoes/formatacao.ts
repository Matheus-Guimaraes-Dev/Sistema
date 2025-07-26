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

export function formatarCPF(cpf: string) {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function formatarData(data: string) {
  const dataObj = new Date(data + "T12:00:00");
  return dataObj.toLocaleDateString('pt-BR');
}

export function formatarDinheiro(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return "R$ 0,00";

  const numero = typeof valor === "string"
    ? parseFloat(valor.replace(",", "."))
    : valor;

  if (isNaN(numero)) return "R$ 0,00";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function limparNomeArquivo(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/\s+/g, "_")           
    .toLowerCase();                 
}