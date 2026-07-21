import { CepLookupError, lookupAddressByCep } from "./cepService";

describe("CEP service", () => {
  it("normalizes the ViaCEP response", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      cep: "01001-000",
      logradouro: "Praça da Sé",
      complemento: "lado ímpar",
      bairro: "Sé",
      localidade: "São Paulo",
      uf: "SP",
    }), { status: 200 }));

    await expect(lookupAddressByCep("01001-000", { fetcher, baseUrl: "https://example.test/ws" })).resolves.toEqual({
      cep: "01001-000",
      street: "Praça da Sé",
      complement: "lado ímpar",
      district: "Sé",
      city: "São Paulo",
      state: "SP",
    });
    expect(fetcher).toHaveBeenCalledWith("https://example.test/ws/01001000/json/", expect.any(Object));
  });

  it("reports a missing CEP", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ erro: true }), { status: 200 }));
    await expect(lookupAddressByCep("99999-999", { fetcher, baseUrl: "https://example.test/ws" }))
      .rejects.toMatchObject({ code: "not_found" } satisfies Partial<CepLookupError>);
  });
});
