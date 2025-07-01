export interface infoConsultores {
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
  observacao: string;
  porcentagem: number;
  comissao_mensal: number;
  comissao_semanal: number;
  comissao_diaria: number;
}

export interface PropsAlterar {
  informacoesConsultor: infoConsultores;
}

export interface Cliente {
  id: number;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  status: string;
  data_cadastro: string;
};