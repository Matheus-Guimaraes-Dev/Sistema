export interface infoClientes {
  id: string;
  data_cadastrado: string;
  status: string;
  nome_completo: string;
  email: string;
  cpf: string;
  rg: string;
  data_emissao_rg: string;
  orgao_expedidor: string;
  sexo: string;
  estado_civil: string;
  data_nascimento: string;
  whatsapp: string;
  telefone_reserva: string;
  cep: string;
  bairro: string;
  rua: string;
  numero_casa: string;
  moradia: string;
  condicoes_moradia: string;
  valor_financiamento_moradia: number;
  valor_aluguel: number;
  categoria_veiculo: string;
  condicao_veiculo: string;
  valor_financiamento_veiculo: number;
  cidade: string;
  estado: string;
  nome_completo_companheiro: string;
  cpf_companheiro: string;
  whatsapp_companheiro: string;
  pix: string;
  valor_solicitado: string;
  observacao: string;
}

export interface PropsAlterar {
  informacoesCliente: infoClientes;
}