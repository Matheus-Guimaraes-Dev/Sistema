export function limiteCpfNova(valor: string) {
  return valor.replace(/\D/g, '').slice(0, 11);
}

export function limiteTelefoneNova(valor: string) {
  return valor.replace(/\D/g, '').slice(0, 11);
}

export function limiteCepNova(valor: string) {
  return valor.replace(/\D/g, '').slice(0, 8);
}
