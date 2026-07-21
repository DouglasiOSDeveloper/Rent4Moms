import { digitsOnly } from "../../lib/masks";
import { isValidCep } from "../../lib/validators";

export interface CepAddressResult {
  cep: string;
  street: string;
  complement: string;
  district: string;
  city: string;
  state: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

export class CepLookupError extends Error {
  constructor(public readonly code: "invalid" | "not_found" | "network") {
    super(code);
    this.name = "CepLookupError";
  }
}

const DEFAULT_BASE_URL = "https://viacep.com.br/ws";

export async function lookupAddressByCep(
  cep: string,
  options: { fetcher?: typeof fetch; signal?: AbortSignal; baseUrl?: string } = {},
): Promise<CepAddressResult> {
  if (!isValidCep(cep)) throw new CepLookupError("invalid");
  const cleanCep = digitsOnly(cep, 8);
  const fetcher = options.fetcher ?? fetch;
  const configuredBase = options.baseUrl ?? import.meta.env.VITE_CEP_API_BASE_URL ?? DEFAULT_BASE_URL;
  const baseUrl = configuredBase.replace(/\/$/, "");

  let response: Response;
  try {
    response = await fetcher(`${baseUrl}/${cleanCep}/json/`, {
      method: "GET",
      signal: options.signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new CepLookupError("network");
  }

  if (!response.ok) throw new CepLookupError(response.status === 400 ? "invalid" : "network");
  const data = await response.json() as ViaCepResponse;
  if (data.erro) throw new CepLookupError("not_found");

  return {
    cep: data.cep ?? cep,
    street: data.logradouro ?? "",
    complement: data.complemento ?? "",
    district: data.bairro ?? "",
    city: data.localidade ?? "",
    state: data.uf ?? "",
  };
}
