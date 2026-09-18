import { isCnpjValido } from './cnpj.util.js';

describe('isCnpjValido', () => {
  it('aceita um CNPJ válido no formato correto', () => {
    expect(isCnpjValido('11.222.333/0001-81')).toBe(true);
  });

  it('rejeita CNPJ fora do formato 00.000.000/0000-00', () => {
    expect(isCnpjValido('11222333000181')).toBe(false);
    expect(isCnpjValido('11.222.333/0001-8')).toBe(false);
  });

  it('rejeita CNPJ com dígito verificador inválido', () => {
    expect(isCnpjValido('11.222.333/0001-80')).toBe(false);
  });

  it('rejeita sequência de dígitos repetidos', () => {
    expect(isCnpjValido('11.111.111/1111-11')).toBe(false);
  });

  it('rejeita valores que não são string', () => {
    expect(isCnpjValido(undefined as unknown as string)).toBe(false);
  });
});
