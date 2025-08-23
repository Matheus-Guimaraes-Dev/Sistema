"use client";

import jsPDF from "jspdf";

interface Infos {
  cidade: string;
  estado: string;
  clientes: {
    id: number;
    cpf: string;
    nome_completo: string;
    cidade: string;
    estado: string;
    bairro: string;
    rua: string;
    numero_casa: string;
  },
  comissao: number;
  consultores: {
    id: number;
    cpf: string;
    nome_completo: string;
  },
  data_emprestimo: string;
  data_vencimento: string;
  descricao: string;
  id: number;
  numero_promissoria: number | null;
  status: string;
  status_comissao: string;
  tipo_lancamento: string;
  valor_emprestado: number;
  valor_pago: number | null;
  valor_receber: number;
}

interface InformacoesProps {
  informacoes: Infos;
}

export default function NotaPromissoria({ informacoes } : InformacoesProps  ) {

  function numeroPorExtenso(valor: number): string {

    if (valor === 0) return "zero real";

    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const especiais = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    function ate999(n: number): string {

      if (n === 0) return "";
      if (n === 100) return "cem";

      let texto = "";
      const c = Math.floor(n / 100);
      const d = Math.floor((n % 100) / 10);
      const u = n % 10;

      if (c > 0) texto += centenas[c];

      if (d === 1) {
        texto += (c > 0 ? " e " : "") + especiais[u];
      } else {
        if (d > 1) {
          texto += (c > 0 ? " e " : "") + dezenas[d];
          if (u > 0) texto += " e " + unidades[u];
        } else if (u > 0) {
          texto += (c > 0 ? " e " : "") + unidades[u];
        }
      }

      return texto;
    }

    function numeroInteiroPorExtenso(numero: number): string {

      const milhoes = Math.floor(numero / 1000000);
      const milhares = Math.floor((numero % 1000000) / 1000);
      const centenasNum = numero % 1000;

      let partes: string[] = [];

      if (milhoes > 0) {
        partes.push(ate999(milhoes) + (milhoes === 1 ? " milhão" : " milhões"));
      }

      if (milhares > 0) {
        partes.push(ate999(milhares) + " mil");
      }

      if (centenasNum > 0) {
        partes.push(ate999(centenasNum));
      }

      return partes.join(" e ");
    }

    const inteiro = Math.floor(valor);
    const centavos = Math.round((valor - inteiro) * 100);

    let resultado = "";

    if (inteiro > 0) {
      resultado += numeroInteiroPorExtenso(inteiro) + (inteiro === 1 ? " real" : " reais");
    }

    if (centavos > 0) {
      const centavosExtenso = numeroInteiroPorExtenso(centavos);
      resultado += (inteiro > 0 ? " e " : "") + centavosExtenso + (centavos === 1 ? " centavo" : " centavos");
    }

    return resultado;
  }

  function capitalizarData(dataISO: string) {

    const data = new Date(dataISO + "T00:00:00");

    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    
  }

  function numeroPorExtensoSimples(valor: number): string {
    const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const especiais = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    function ate999(n: number): string {
      if (n === 0) return "";
      if (n === 100) return "cem";

      let texto = "";
      const c = Math.floor(n / 100);
      const d = Math.floor((n % 100) / 10);
      const u = n % 10;

      if (c > 0) texto += centenas[c];

      if (d === 1) {
        texto += (c > 0 ? " e " : "") + especiais[u];
      } else {
        if (d > 1) {
          texto += (c > 0 ? " e " : "") + dezenas[d];
          if (u > 0) texto += " e " + unidades[u];
        } else if (u > 0) {
          texto += (c > 0 ? " e " : "") + unidades[u];
        }
      }

      return texto;
    }

    if (valor < 1000) return ate999(valor);

    const milhar = Math.floor(valor / 1000);
    const resto = valor % 1000;

    let resultado = ate999(milhar) + " mil";
    if (resto > 0) {
      resultado += (resto < 100 ? " e " : " ") + ate999(resto);
    }
    return resultado;
  }

  function dataPorExtenso(dataISO: string): string {
    const meses = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];

    const [anoStr, mesStr, diaStr] = dataISO.split("-");
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10);
    const dia = parseInt(diaStr, 10);

    const diaExtenso = numeroPorExtensoSimples(dia);

    function anoPorExtenso(ano: number): string {
      const milhares = Math.floor(ano / 1000);
      const resto = ano % 1000;

      let resultado = numeroPorExtensoSimples(milhares) + " mil";
      if (resto > 0) {
        resultado += (resto < 100 ? " e " : " ") + numeroPorExtensoSimples(resto);
      }
      return resultado;
    }

    return `${diaExtenso} de ${meses[mes - 1]} de ${anoPorExtenso(ano)}`;
  }

  function formatarMoedaBR(valor: number) {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatarCpfCnpj(valor: string) {

    const numeros = valor.replace(/\D/g, "");

    if (numeros.length === 11) {
      return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (numeros.length === 14) {
      return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    } else {
      return valor;
    }
  }

  function formatarDataISO(dataISO: string) {
    if (!dataISO) return "";
    
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  const generatePdf = async () => {
    
    const doc = new jsPDF("portrait", "mm", "a4");

    doc.setFillColor(255, 245, 120);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 90, "FD");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Nº", 45, 15);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.rect(51, 11, 25, 5, "FD");
    doc.setFontSize(10);
    const IdPromissoria = informacoes.id.toString();
    doc.text(IdPromissoria, 52, 14.8);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("AVALISTA(S)", 11, 92, { angle: 90 });
    doc.text("Nome: .........................................................................", 18, 92, { angle: 90 });
    doc.text("CPF/CNPJ: .............................. Fone: ........................", 25, 92, { angle: 90 });
    doc.text("Nome: .........................................................................", 31, 92, { angle: 90 });
    doc.text("CPF/CNPJ: .............................. Fone: ........................", 37, 92, { angle: 90 });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("R$", 153, 15);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.rect(160, 11, 42, 5, "FD");
    doc.setFontSize(10);
    const valorFinanceiro = formatarMoedaBR(informacoes.valor_receber);
    doc.text(valorFinanceiro, 161, 14.8);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    const dataVencimento = capitalizarData(informacoes.data_vencimento);
    doc.text("Vencimento:", 133, 9);
    doc.text(dataVencimento, 153, 9);

    const dataEmExtenso = dataPorExtenso(informacoes.data_vencimento);
    doc.text(`No dia ${dataEmExtenso}`, 45, 25);
    doc.text("...................................................................................................Pagar(ei)(emos) por esta única via de NOTA PROMISSÓRIA a", 45, 32);
    doc.setFont("helvetica", "bold");
    doc.text("FABIANA LANG DE SOUZA     CPF/CNPJ: 612.710.712-15", 45, 38);
    doc.setFont("helvetica", "normal");
    doc.text("OU À SUA ORDEM,", 45, 44);
    doc.text("A QUANTIA DE", 45, 48);

    const xBox = 72;           // início do retângulo
    const yBox = 41;           // topo do retângulo
    const wBox = 130;          // largura do retângulo
    const minBoxHeight = 10;   // altura mínima do retângulo (seu layout)
    const xText = 73;          // X onde começa o texto
    const yText = 44;          // baseline da 1ª linha
    const margemDireita = 3;   // folga à direita (setinha/borda)

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    const larguraUtil = (xBox + wBox - margemDireita) - xText;

    const valorExtenso = numeroPorExtenso(informacoes.valor_receber).toUpperCase();
    const base = `${valorExtenso} EM MOEDA CORRENTE DESTE PAÍS`.trim();

    let linhas = doc.splitTextToSize(base, larguraUtil);

    const pt2mm = 0.352777778;
    const lineFactor = doc.getLineHeightFactor ? doc.getLineHeightFactor() : 1.15;
    const lineHeightMm = doc.getFontSize() * lineFactor * pt2mm;
    const paddingV = 2;

    const hBox = Math.max(minBoxHeight, linhas.length * lineHeightMm + paddingV);

    const linhasQueCabem = Math.ceil((hBox - paddingV) / lineHeightMm);

    const wAst = doc.getTextWidth("*");
    const qtdAstLinhaCheia = Math.floor(larguraUtil / wAst);
    const linhasCompletas = [];

    for (let i = 0; i < linhasQueCabem; i++) {
      if (i < linhas.length) {
        const t = linhas[i].trim();
        const w = doc.getTextWidth(t);
        const restante = Math.max(0, larguraUtil - w);
        const qtdAst = Math.floor(restante / wAst);
        linhasCompletas.push(t + "*".repeat(qtdAst));
      } else {
        linhasCompletas.push("*".repeat(qtdAstLinhaCheia));
      }
    }

    doc.setFillColor(255, 255, 255);
    doc.rect(xBox, yBox, wBox, hBox, "F");
    doc.text(linhasCompletas, xText, yText);

    const cidadeEbairro = `${informacoes.clientes.cidade} - ${informacoes.clientes.bairro || "Não informado"}`;
    doc.text("Cidade: ", 45, 56);
    doc.text(cidadeEbairro, 64, 56);

    const dataEmissao = formatarDataISO(informacoes.data_emprestimo);
    doc.text("Data de Emissão: ", 150, 56);
    doc.setFont("helvetica", "bold");
    doc.text(dataEmissao, 175, 56);
    doc.setFont("helvetica", "normal");

    const nomeCliente = informacoes.clientes.nome_completo;
    doc.text("Nome: ", 45, 62);
    doc.text(nomeCliente, 64, 62);

    const cpfCliente = formatarCpfCnpj(informacoes.clientes.cpf);
    doc.text("CPF/CNPJ: ", 45, 68);
    doc.text(cpfCliente, 64, 68);

    const endereco = `${informacoes.clientes.rua || "Não informado"}, Nº: ${informacoes.clientes.numero_casa || "Não informado"}`;
    doc.text("Endereço: ", 105, 68);
    doc.text(endereco, 120, 68);

    doc.setLineWidth(0.45);
    doc.line(45, 87, 140, 87);
    doc.text(nomeCliente, 74, 92);

    doc.text("Assinatura Digital", 164, 93);
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.rect(145, 75, 57, 15, "FD");
    doc.setFontSize(10);

    doc.save(`nota-promissoria-${informacoes.id}.pdf`);
  };

  return (
      <button
        onClick={generatePdf}
        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md text-sm cursor-pointer"
      >
        Gerar Nota Promissória
      </button>
  );
}
