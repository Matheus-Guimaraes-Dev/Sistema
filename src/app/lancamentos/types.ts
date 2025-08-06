export interface ClienteInfo {
  id: number;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  status: string;

};

export interface ConsultorInfo {
  id: number;
  nome_completo: string;
  cpf: string;
}

export interface infoEmprestimo {
  id: number;
  tipo_lancamento: string;
  valor_emprestado: number;
  valor_receber: number;
  valor_pago: number;
  cidade: string;
  estado: string;
  data_emprestimo: string;
  data_vencimento: string;
  descricao: string;
  status: string;
  numero_promissoria: number;
  comissao: number;
  status_comissao: string;
  clientes: Cliente;
  consultores: Consultor;
}

export interface PropsAlterar {
  valorDoJuros?: string;
  informacoesEmprestimo: infoEmprestimo;
}

export interface Contas {
  id: number;
  tipo_lancamento: string;
  valor_emprestado: number;
  valor_receber: number;
  valor_pago: number;
  data_vencimento: string;
  data_cadastro: string;
  clientes: {
    id: number;
    nome_completo: string;
  } | null;
  consultores: {
    id: number;
    nome_completo: string;
  } | null;
}

export interface Cliente {
  id: number;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  bairro: string;
  rua: string;
  numero_casa: string;
  status: string;
  data_cadastro: string;
  consultores: {
    nome_completo: string;
  }[] | null | any
};

export interface Consultor {
  id: number;
  nome_completo: string;
  cpf: string;
  status: string;
  comissao_mensal?: number;
  comissao_semanal?: number;
  comissao_diaria?: number;
}

export interface Emprestimo {
  id: number;
  tipo_lancamento: string;
  valor_emprestado: number;
  valor_receber: number;
  valor_pago: number;
  cidade: string;
  estado: string;
  data_emprestimo: string;
  data_vencimento: string;
  descricao: string;
  status: string;
  numero_promissoria: number;
  comissao: number;
  status_comissao: string;
  clientes: Cliente;
  consultores: Consultor;
}

export interface Recebimentos {
  id: number;
  descricao: string;
}

export interface ConsultorBusca {
  id: number;
  nome_completo: string;
}

export interface EmprestimoPago {
  id: number;
  valor_pago: number;
  observacao: string;
  data_pagamento: string;
  juros_pago: number;
  contas_receber: {
    id: number;
    cidade: string;
    estado: string;
    clientes: {
      id: number;
      cpf: string;
      nome_completo: string;
    }
    consultores: {
      id: number;
      nome_completo: string;
    }
    valor_receber: number;
    status: string;
    valor_emprestado: number;
    tipo_lancamento: string;
    data_emprestimo: string;
    valor_pago: number;
    data_vencimento: string;
    status_comissao: string;
    numero_promissoria: number;
    comissao: number;
  }
  formas_pagamento: {
    descricao: string;
  }
}

export type Props = {
  informacoesPago: EmprestimoPago;
};