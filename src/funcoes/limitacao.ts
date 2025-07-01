export function limiteCpf(
  e: React.ChangeEvent<HTMLInputElement>,
  setCpf: (value: string) => void
) {
  const value = e.target.value.replace(/\D/g, "");
  if (value.length <= 11) {
    setCpf(value);
  }
}

export function limiteRg(
  e: React.ChangeEvent<HTMLInputElement>,
  setRg: (value: string) => void
) {
  const value = e.target.value.replace(/\D/g, "");
  if (value.length <= 7) {
    setRg(value);
  }
}

export function limiteWhatsapp(
  e: React.ChangeEvent<HTMLInputElement>,
  setWhatsapp: (value: string) => void
) {
  const value = e.target.value.replace(/\D/g, "");
  if (value.length <= 13) {
    setWhatsapp(value);
  }
}

export function limiteTelefoneReserva(
  e: React.ChangeEvent<HTMLInputElement>,
  setTelefoneReserva: (value: string) => void
) {
  const value = e.target.value.replace(/\D/g, "");
  if (value.length <= 13) {
    setTelefoneReserva(value);
  }
}

export function limiteCep(
  e: React.ChangeEvent<HTMLInputElement>,
  setCep: (value: string) => void
) {
  const value = e.target.value.replace(/\D/g, "");
  if (value.length <= 8) {
    setCep(value);
  }
}

export function limiteId(
  e: React.ChangeEvent<HTMLInputElement>,
  setId: (value: string) => void
) {
    const value = e.target.value.replace(/\D/g, ""); 
      if (value.length <=7) {
        setId(value);
  }
}

export function limiteIdDocumento(
  e: React.ChangeEvent<HTMLInputElement>,
  setIdDocumento: (value: string) => void
) {
    const value = e.target.value.replace(/\D/g, ""); 
      if (value.length <=7) {
        setIdDocumento(value);
  }
}

export function limiteDataRg(
  e: React.ChangeEvent<HTMLInputElement>,
  setDataRg: (valor: string) => void
) {
  const value = e.target.value;
  const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

  if (regex.test(value)) {
    setDataRg(value);
  }
}

export function limiteDataNascimento(
  e: React.ChangeEvent<HTMLInputElement>,
  setDataNascimento: (valor: string) => void
) {
  const value = e.target.value;
  const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

  if (regex.test(value)) {
    setDataNascimento(value);
  }
}

export function limiteDataEmprestimo(
  e: React.ChangeEvent<HTMLInputElement>,
  setDataEmprestimo: (valor: string) => void
) {
  const value = e.target.value;
  const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

  if (regex.test(value)) {
    setDataEmprestimo(value);
  }
}

export function limiteDataVencimento(
  e: React.ChangeEvent<HTMLInputElement>,
  setDataVencimento: (valor: string) => void
) {
  const value = e.target.value;
  const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

  if (regex.test(value)) {
    setDataVencimento(value);
  }
}

export function limiteDataPagamento(
  e: React.ChangeEvent<HTMLInputElement>,
  setDataPagamento: (valor: string) => void
) {
  const value = e.target.value;
  const regex = /^\d{0,4}(-\d{0,2})?(-\d{0,2})?$/;

  if (regex.test(value)) {
    setDataPagamento(value);
  }
}

