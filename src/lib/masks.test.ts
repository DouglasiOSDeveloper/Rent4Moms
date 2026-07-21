import { maskCep, maskCpf, maskPhone } from "./masks";
import { isValidCep, isValidCpf, isValidEmail, isValidPhone } from "./validators";

describe("masks and validators", () => {
  it("formats Brazilian document and contact fields", () => {
    expect(maskCep("01001000")).toBe("01001-000");
    expect(maskCpf("52998224725")).toBe("529.982.247-25");
    expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
  });

  it("validates CEP, CPF, email and phone", () => {
    expect(isValidCep("01001-000")).toBe(true);
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidEmail("cliente@exemplo.com")).toBe(true);
    expect(isValidPhone("(11) 98765-4321")).toBe(true);
  });
});
