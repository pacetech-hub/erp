const CNPJ_FORMAT = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

function calcularDigitoVerificador(base: string, pesos: number[]): number {
  const soma = base
    .split('')
    .reduce((acc, digito, index) => acc + Number(digito) * pesos[index], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/** Valida o formato `00.000.000/0000-00` e os dígitos verificadores do CNPJ. */
export function isCnpjValido(cnpj: string): boolean {
  if (!CNPJ_FORMAT.test(cnpj)) {
    return false;
  }

  const numeros = cnpj.replace(/\D/g, '');

  if (/^(\d)\1{13}$/.test(numeros)) {
    return false;
  }

  const primeiroDigito = calcularDigitoVerificador(
    numeros.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const segundoDigito = calcularDigitoVerificador(
    numeros.slice(0, 12) + primeiroDigito,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return numeros.slice(12) === `${primeiroDigito}${segundoDigito}`;
}

/** Aplica a máscara 00.000.000/0000-00 enquanto o usuário digita. */
export function mascararCnpj(value: string): string {
  const numeros = value.replace(/\D/g, '').slice(0, 14);
  return numeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
