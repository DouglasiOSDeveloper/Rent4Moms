import { digitsOnly } from "./masks";

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidCep(value: string): boolean {
  return /^\d{8}$/.test(digitsOnly(value));
}

export function isValidPhone(value: string): boolean {
  return /^\d{10,11}$/.test(digitsOnly(value));
}

export function isValidEmail(value: string): boolean {
  const normalized = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function isValidCpf(value: string): boolean {
  const cpf = digitsOnly(value, 11);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length: number): number => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(cpf[9]) && calculateDigit(10) === Number(cpf[10]);
}
