import React, { useEffect, useRef, useState } from "react";
import { CheckCircle, LoaderCircle, MapPin } from "lucide-react";
import type { QuoteAddress } from "../../domain/quote/types";
import { maskCep, maskState } from "../../lib/masks";
import { isValidCep } from "../../lib/validators";
import { CepLookupError, lookupAddressByCep } from "../../services/cep/cepService";
import { Input, cn } from "../prototype/PrototypeUI";
import { MaskedInput } from "./MaskedInput";

export type CepLookupStatus = "idle" | "loading" | "found" | "not_found" | "error";

export function AddressFields({ address, onChange, errors = {}, onCepResolved }: {
  address: QuoteAddress;
  onChange: (patch: Partial<QuoteAddress>) => void;
  errors?: Record<string, string>;
  onCepResolved?: (cep: string) => void;
}) {
  const [lookupStatus, setLookupStatus] = useState<CepLookupStatus>("idle");
  const lastResolvedCep = useRef("");
  const cleanCep = address.cep.replace(/\D/g, "");

  useEffect(() => {
    if (!isValidCep(address.cep)) {
      setLookupStatus("idle");
      lastResolvedCep.current = "";
      return undefined;
    }
    if (lastResolvedCep.current === cleanCep) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLookupStatus("loading");
      try {
        const result = await lookupAddressByCep(address.cep, { signal: controller.signal });
        lastResolvedCep.current = cleanCep;
        onChange({
          cep: maskCep(result.cep),
          street: result.street,
          district: result.district,
          city: result.city,
          state: maskState(result.state),
          complement: address.complement || result.complement,
        });
        setLookupStatus("found");
        onCepResolved?.(maskCep(result.cep));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLookupStatus(error instanceof CepLookupError && error.code === "not_found" ? "not_found" : "error");
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [address.cep, address.complement, cleanCep, onChange, onCepResolved]);

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2">
        <MaskedInput
          label="CEP"
          placeholder="00000-000"
          value={address.cep}
          onChange={(cep) => onChange({ cep })}
          mask={maskCep}
          required
          maxLength={9}
          inputMode="numeric"
          autoComplete="postal-code"
          icon={<MapPin size={14} />}
          error={errors.cep}
        />
        {isValidCep(address.cep) && (
          <div className={cn(
            "mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs",
            lookupStatus === "found" && "bg-green-50 border-green-200 text-green-800",
            lookupStatus === "loading" && "bg-secondary border-border text-muted-foreground",
            (lookupStatus === "not_found" || lookupStatus === "error") && "bg-amber-50 border-amber-200 text-amber-800",
          )} aria-live="polite">
            {lookupStatus === "loading" && <><LoaderCircle size={13} className="animate-spin" />Buscando endereço...</>}
            {lookupStatus === "found" && <><CheckCircle size={13} />Endereço preenchido automaticamente. Confirme o número.</>}
            {lookupStatus === "not_found" && <>CEP não encontrado. Revise o número informado.</>}
            {lookupStatus === "error" && <>Não foi possível consultar o CEP agora. Você pode preencher o endereço manualmente.</>}
          </div>
        )}
      </div>
      <Input label="Rua / Logradouro" placeholder="Nome da rua" value={address.street} onChange={(street) => onChange({ street })} required autoComplete="address-line1" error={errors.street} />
      <Input label="Complemento" placeholder="Apartamento, bloco..." value={address.complement} onChange={(complement) => onChange({ complement })} autoComplete="address-line2" />
      <Input label="Número" placeholder="123" value={address.number} onChange={(number) => onChange({ number })} required inputMode="numeric" error={errors.number} />
      <Input label="Bairro" placeholder="Nome do bairro" value={address.district} onChange={(district) => onChange({ district })} autoComplete="address-level3" />
      <Input label="Cidade" placeholder="Sua cidade" value={address.city} onChange={(city) => onChange({ city })} required autoComplete="address-level2" error={errors.city} />
      <Input label="Estado" placeholder="SP" value={address.state} onChange={(state) => onChange({ state: maskState(state) })} required maxLength={2} autoComplete="address-level1" error={errors.state} />
    </div>
  );
}
