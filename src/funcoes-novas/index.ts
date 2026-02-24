export function limiteCpfNova(valor: string) {
  return valor.replace(/\D/g, '').slice(0, 11);
}

export function limiteTelefoneNova(valor: string) {
  return valor.replace(/\D/g, '').slice(0, 11);
}

export function limiteCepNova(valor: string) {
  return valor.replace(/\D/g, '').slice(0, 8);
}

export async function buscarCepNova(cep: string | undefined) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Erro ao buscar CEP: ', error);
  }
}
