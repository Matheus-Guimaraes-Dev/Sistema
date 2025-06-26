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
  cidade: string;
  estado: string;
  pix: string;
  valor_solicitado: string;
  observacao: string;
}

export interface PropsAlterar {
  informacoesCliente: infoClientes;
}