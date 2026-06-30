export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

export function formatCnpj(cnpj: string): string {
  const c = cleanCnpj(cnpj);
  if (c.length !== 14) return cnpj;
  return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function isValidCnpj(cnpj: string): boolean {
  const c = cleanCnpj(cnpj);
  if (c.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(c)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    const sum = base
      .split('')
      .reduce((acc, digit, i) => acc + parseInt(digit, 10) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const base12 = c.slice(0, 12);
  const digit1 = calcDigit(base12, weights1);
  const digit2 = calcDigit(base12 + digit1, weights2);

  return c === base12 + String(digit1) + String(digit2);
}
