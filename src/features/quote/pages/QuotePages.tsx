import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { NavigateToPage } from "../../../app/navigation";
import { useAppState } from "../../../app/providers";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { AddressFields } from "../../../components/forms/AddressFields";
import { DeliverySlotSelect } from "../../../components/forms/DeliverySlotSelect";
import { MaskedInput } from "../../../components/forms/MaskedInput";
import { Btn, Input, Select, Stepper, cn } from "../../../components/prototype/PrototypeUI";
import { formatDeliverySlotLabel } from "../../../domain/delivery/slots";
import type { DeliverySettings } from "../../../domain/delivery/types";
import type { PublicLegalPage } from "../../../domain/content/types";
import { calculateQuotePriceSummary } from "../../../domain/pricing/pricingEngine";
import type { FulfillmentMethod, QuoteAddress } from "../../../domain/quote/types";
import { isCompleteShippingAddress, isDeliveryAddressSupported } from "../../../domain/shipping/address";
import type { Page } from "../../../domain/shared/types";
import { addDays, formatDateBR, getTomorrowIsoDate } from "../../../lib/dates";
import { maskCpf, maskPhone } from "../../../lib/masks";
import { formatMoneyFromCents } from "../../../lib/money";
import { useQuote } from "../../../stores/quote/QuoteProvider";
import { useSiteContent } from "../../../stores/content/SiteContentProvider";
import { buildWhatsAppUrl } from "../../../lib/contact";
import { EmptyState } from "../../../components/states/DataState";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../app/components/ui/dialog";
import { validateQuoteStep, type QuoteValidationErrors } from "../validation";
import { estimateRemoteShipping } from "../../../services/shipping/shippingApi";

const CONSENT_DOCUMENTS = {
  terms: { slug: "termos-de-uso", prefix: "Li e aceito os", label: "Termos de uso" },
  privacy: { slug: "politica-de-privacidade", prefix: "Li a", label: "Política de privacidade" },
  rentalConditions: { slug: "contrato-de-locacao", prefix: "Li as", label: "Condições gerais de locação" },
} as const;

function LegalDocumentContent({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
  return <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">{blocks.map((block, index) => {
    if (block.startsWith("## ")) return <h3 key={`${block}-${index}`} className="pt-2 text-base font-semibold text-foreground">{block.slice(3)}</h3>;
    if (block.startsWith("# ")) return <h2 key={`${block}-${index}`} className="text-lg font-semibold text-foreground">{block.slice(2)}</h2>;
    if (block.split("\n").every((line) => line.startsWith("- "))) return <ul key={`${block}-${index}`} className="list-disc space-y-1 pl-5">{block.split("\n").map((line) => <li key={line}>{line.slice(2)}</li>)}</ul>;
    return <p key={`${block}-${index}`} className="whitespace-pre-line">{block}</p>;
  })}</div>;
}

function ConsentDocumentDialog({ page, open, onOpenChange }: { page: PublicLegalPage | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl"><DialogHeader><DialogTitle>{page?.title ?? "Documento legal"}</DialogTitle><DialogDescription>{page ? `${page.summary} · versão ${page.version}` : "O documento ainda não está disponível para consulta."}</DialogDescription></DialogHeader><div className="max-h-[68vh] overflow-y-auto pr-2">{page ? <LegalDocumentContent content={page.content} /> : <p className="text-sm text-muted-foreground">Atualize a página e tente novamente.</p>}</div></DialogContent></Dialog>;
}

function ValidationSummary({ errors }: { errors: QuoteValidationErrors }) {
  const messages = [...new Set(Object.values(errors))];
  if (messages.length === 0) return null;
  return (
    <div role="alert" className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <div className="flex items-center gap-2 font-medium"><AlertCircle size={16} />Revise os campos obrigatórios</div>
      <ul className="mt-2 list-disc pl-5 space-y-1">
        {messages.map((message) => <li key={message}>{message}</li>)}
      </ul>
    </div>
  );
}

export function QuotePage({ navigate, deliverySettings }: {
  navigate: (p: Page) => void;
  deliverySettings: DeliverySettings;
}) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<QuoteValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [shippingPending, setShippingPending] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const [activeLegalSlug, setActiveLegalSlug] = useState<string | null>(null);
  const { legalPages } = useSiteContent();
  const {
    draft,
    removeItem,
    updateAllItemsPeriod,
    updateAllItemsStartDate,
    updateFulfillment,
    updateDeliverySlot,
    updateAddress,
    updateShippingQuote,
    updateCustomerData,
    updateContractData,
    updateAdditionalInfo,
    updateConsents,
    submitQuote,
  } = useQuote();
  const steps = ["Produtos", "Entrega", "Dados", "Informações", "Revisão"];
  const firstItem = draft.items[0];
  const commonPeriod = draft.items.length > 0 && draft.items.every((item) => item.periodDays === firstItem.periodDays)
    ? firstItem.periodDays
    : null;
  const commonStartDate = draft.items.length > 0 && draft.items.every((item) => item.startDate === firstItem.startDate)
    ? firstItem.startDate
    : "";
  const shippingCents = draft.fulfillment === "delivery" && draft.shippingQuote.status === "calculated"
    ? draft.shippingQuote.amountCents
    : 0;
  const total = useMemo(
    () => calculateQuotePriceSummary(draft.items.map((item) => item.priceSnapshot), shippingCents),
    [draft.items, shippingCents],
  );
  const activeLegalPage = activeLegalSlug ? legalPages.find((page) => page.slug === activeLegalSlug) ?? null : null;
  const financialBreakdown = useMemo(() => draft.items.reduce((summary, item) => ({
    baseSubtotalCents: summary.baseSubtotalCents + item.priceSnapshot.baseSubtotalCents,
    accessoriesSubtotalCents: summary.accessoriesSubtotalCents + item.priceSnapshot.componentsSubtotalCents,
  }), {
    baseSubtotalCents: 0,
    accessoriesSubtotalCents: 0,
  }), [draft.items]);
  const minimumStartDate = getTomorrowIsoDate(deliverySettings.timeZone);

  const clearErrors = useCallback((...keys: string[]) => {
    setErrors((current) => {
      if (keys.every((key) => !current[key])) return current;
      const next = { ...current };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }, []);

  useEffect(() => {
    let active = true;
    if (draft.fulfillment !== "delivery") {
      setShippingPending(false);
      setShippingMessage("");
      updateShippingQuote(null, draft.address.cep);
      return () => { active = false; };
    }
    if (!isCompleteShippingAddress(draft.address)) {
      setShippingPending(false);
      setShippingMessage("");
      return () => { active = false; };
    }
    if (!isDeliveryAddressSupported(draft.address)) {
      setShippingPending(false);
      setShippingMessage("A entrega está disponível somente para endereços em Brasília-DF. Escolha retirada no local ou combine com nossa equipe.");
      updateShippingQuote(null, draft.address.cep);
      return () => { active = false; };
    }
    if (
      draft.shippingQuote.status === "calculated"
      && draft.shippingQuote.cep === draft.address.cep
    ) {
      setShippingPending(false);
      setShippingMessage("");
      return () => { active = false; };
    }
    updateShippingQuote(null, draft.address.cep);
    setShippingPending(true);
    setShippingMessage("");
    const timer = window.setTimeout(() => {
      void estimateRemoteShipping(draft.address)
        .then((estimate) => {
          if (!active) return;
          updateShippingQuote(estimate, draft.address.cep);
        })
        .catch((error: unknown) => {
          if (!active) return;
          updateShippingQuote(null, draft.address.cep);
          setShippingMessage(error instanceof Error ? error.message : "Não foi possível calcular a taxa de entrega.");
        })
        .finally(() => { if (active) setShippingPending(false); });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [
    draft.fulfillment,
    draft.address.cep,
    draft.address.street,
    draft.address.number,
    draft.address.complement,
    draft.address.district,
    draft.address.city,
    draft.address.state,
    draft.shippingQuote.status,
    draft.shippingQuote.cep,
    updateShippingQuote,
  ]);

  const handleFulfillment = (fulfillment: FulfillmentMethod) => {
    updateFulfillment(fulfillment);
    clearErrors("cep", "street", "number", "city", "state", "deliverySlot");
  };

  const handleAddressChange = useCallback((patch: Partial<QuoteAddress>) => {
    updateAddress(patch);
    Object.keys(patch).forEach((key) => clearErrors(key));
  }, [clearErrors, updateAddress]);

  const validateAndAdvance = () => {
    const nextErrors = validateQuoteStep(step, draft, deliverySettings);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setStep((current) => Math.min(4, current + 1));
  };

  const handleSubmitQuote = async () => {
    const nextErrors = validateQuoteStep(4, draft, deliverySettings);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await submitQuote();
      navigate("quote-success");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível enviar a solicitação.");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(0, current - 1));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-8">Solicitação de orçamento</h1>
      <div className="mb-10"><Stepper steps={steps} current={step} /></div>
      <ValidationSummary errors={errors} />
      {submitError && <div role="alert" className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{submitError}</div>}
      <ConsentDocumentDialog page={activeLegalPage} open={Boolean(activeLegalSlug)} onOpenChange={(open) => { if (!open) setActiveLegalSlug(null); }} />

      {step === 0 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Produtos selecionados</h2>
          {draft.items.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Seu orçamento está vazio</p>
              <p className="text-sm mt-1">Adicione produtos pelo catálogo</p>
              <Btn variant="primary" className="mt-6" onClick={() => navigate("catalog")}>Ver produtos</Btn>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {draft.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-card rounded-2xl border border-border">
                  <img src={item.productSnapshot.photo} alt={item.productSnapshot.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.productSnapshot.name}</p>
                    <p className="text-sm text-muted-foreground">{item.productSnapshot.brand} · {item.productSnapshot.model}</p>
                    {item.productSnapshot.assembly && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <p>{item.productSnapshot.assembly.cover.name} · {item.productSnapshot.assembly.reducer?.name ?? "Sem redutor"}</p>
                        <p>{item.productSnapshot.assembly.ballSet.name} · Variante {item.productSnapshot.assembly.variantId}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">Período: {item.periodDays} dias · Qtd: {item.quantity}</p>
                    {item.startDate && <p className="text-xs text-muted-foreground mt-1">{formatDateBR(item.startDate)} a {formatDateBR(item.endDate)}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatMoneyFromCents(item.priceSnapshot.totalCents)}</p>
                    {item.priceSnapshot.discountCents > 0 && <p className="text-xs text-green-700 mt-1">{item.priceSnapshot.benefitType === "free_configuration" ? "Configuração gratuita" : item.priceSnapshot.benefitType === "free_base" ? "Produto-base gratuito" : `${item.priceSnapshot.discountPercent}% de desconto no produto-base`}</p>}
                    <button onClick={() => removeItem(item.productId)} className="text-xs text-destructive mt-2 hover:underline">Remover</button>
                  </div>
                </div>
              ))}
              <div className="mt-2 p-4 bg-secondary rounded-xl border border-border flex justify-between">
                <span className="font-medium text-foreground">Total estimado</span>
                <span className="font-bold text-primary text-lg">{formatMoneyFromCents(total.totalCents)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Valor estimado. O total final será confirmado no orçamento da equipe Rent4Moms.</p>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Entrega ou retirada</h2>
          <div className="mb-6 p-5 bg-secondary rounded-2xl border border-border">
            <p className="font-semibold text-foreground mb-3">Período desejado</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {([30, 60, 90] as const).map((periodDays) => (
                <button
                  key={periodDays}
                  type="button"
                  onClick={() => { updateAllItemsPeriod(periodDays); clearErrors("period"); }}
                  className={cn(
                    "flex flex-col items-center py-3 rounded-xl border-2 font-medium text-sm transition-all",
                    commonPeriod === periodDays ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/50",
                  )}
                >
                  <span className="text-xl font-bold">{periodDays}</span>
                  <span className="text-xs opacity-70">dias</span>
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Data de início pretendida"
                type="date"
                value={commonStartDate}
                onChange={(value) => { updateAllItemsStartDate(value); clearErrors("startDate"); }}
                required
                min={minimumStartDate}
                error={errors.startDate}
              />
              {commonPeriod && commonStartDate && (
                <div className="flex flex-col justify-end">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-xl text-sm">
                    <Calendar size={14} className="text-accent" />
                    <span>Devolução: <strong>{formatDateBR(addDays(commonStartDate, commonPeriod))}</strong></span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">A primeira data disponível é amanhã. As escolhas permanecem salvas neste dispositivo.</p>
          </div>

          <div className="mb-6 rounded-2xl border border-border bg-card p-5" aria-live="polite">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-semibold text-foreground">Resumo financeiro atualizado</p>
                <p className="text-xs text-muted-foreground mt-1">Os valores mudam automaticamente conforme o período, a composição e a entrega.</p>
              </div>
              {commonPeriod && commonStartDate && (
                <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  Devolução em {formatDateBR(addDays(commonStartDate, commonPeriod))}
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Produto-base</span>
                <span className="whitespace-nowrap text-foreground">{formatMoneyFromCents(financialBreakdown.baseSubtotalCents)}</span>
              </div>
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Acessórios</span>
                <span className="whitespace-nowrap text-foreground">{formatMoneyFromCents(financialBreakdown.accessoriesSubtotalCents)}</span>
              </div>
              {total.discountCents > 0 && (
                <div className="flex justify-between gap-4 text-green-700">
                  <span>Benefícios do período</span>
                  <span className="whitespace-nowrap">− {formatMoneyFromCents(total.discountCents)}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 text-muted-foreground">
                <span>Taxa de entrega</span>
                <span className="whitespace-nowrap text-foreground">
                  {draft.fulfillment !== "delivery"
                    ? formatMoneyFromCents(0)
                    : shippingPending
                      ? "Calculando..."
                      : draft.shippingQuote.status === "calculated"
                        ? formatMoneyFromCents(total.shippingCents)
                        : "A calcular"}
                </span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between gap-4 font-semibold">
                <span className="text-foreground">Total estimado</span>
                <span className="whitespace-nowrap text-lg text-primary">{formatMoneyFromCents(total.totalCents)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-6 flex-wrap">
            {([
              ["delivery", "Entrega no endereço", Truck],
              ["pickup", "Retirada no local", MapPin],
              ["arrange", "Combinar com atendimento", MessageCircle],
            ] as const).map(([value, label, Icon]) => (
              <label key={value} className={cn("flex-1 min-w-40 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all", draft.fulfillment === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                <input type="radio" name="delivery" value={value} checked={draft.fulfillment === value} onChange={() => handleFulfillment(value)} className="sr-only" />
                <Icon size={24} className={draft.fulfillment === value ? "text-primary" : "text-muted-foreground"} />
                <span className={cn("text-sm font-medium text-center", draft.fulfillment === value ? "text-primary" : "text-foreground")}>{label}</span>
              </label>
            ))}
          </div>

          {draft.fulfillment === "delivery" && (
            <div className="space-y-4">
              <AddressFields
                address={draft.address}
                onChange={handleAddressChange}
                errors={errors}
              />
              {isCompleteShippingAddress(draft.address) && (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm",
                  draft.shippingQuote.status === "calculated" ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800",
                )} aria-live="polite">
                  <Truck size={14} className="shrink-0" />
                  {shippingPending
                    ? <span>Calculando a distância da entrega...</span>
                    : draft.shippingQuote.status === "calculated"
                      ? <span>Taxa de entrega estimada: <strong>{formatMoneyFromCents(draft.shippingQuote.amountCents)}</strong>{draft.shippingQuote.oneWayDistanceKm !== undefined && <span className="block text-xs mt-0.5">Rota de {draft.shippingQuote.oneWayDistanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km.</span>}</span>
                      : <span>{shippingMessage || "Não foi possível calcular a entrega para este endereço. Escolha retirada ou combine com a equipe."}</span>}
                </div>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">A taxa calculada cobre somente a entrega. A devolução deve ser feita pelo cliente no ponto indicado pela Rent4Moms. Caso seja solicitada retirada no endereço, será calculada uma nova tarifa.</p>
              <DeliverySlotSelect
                settings={deliverySettings}
                value={draft.deliverySlot}
                onChange={(deliverySlot) => { updateDeliverySlot(deliverySlot); clearErrors("deliverySlot"); }}
                required
                error={errors.deliverySlot}
              />
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Dados pessoais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome completo" placeholder="Seu nome completo" value={draft.customerData.name} onChange={(name) => { updateCustomerData({ name }); clearErrors("name"); }} required autoComplete="name" error={errors.name} />
            <MaskedInput label="CPF" placeholder="000.000.000-00" value={draft.customerData.cpf} onChange={(cpf) => { updateCustomerData({ cpf }); clearErrors("cpf"); }} mask={maskCpf} required maxLength={14} inputMode="numeric" error={errors.cpf} />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={draft.customerData.email} onChange={(email) => { updateCustomerData({ email }); clearErrors("email"); }} required autoComplete="email" error={errors.email} />
            <MaskedInput label="Telefone" placeholder="(11) 00000-0000" value={draft.customerData.phone} onChange={(phone) => { updateCustomerData({ phone }); clearErrors("phone"); }} mask={maskPhone} required maxLength={15} inputMode="tel" autoComplete="tel" error={errors.phone} />
            <MaskedInput label="WhatsApp" placeholder="(11) 00000-0000" value={draft.customerData.whatsapp} onChange={(whatsapp) => { updateCustomerData({ whatsapp }); clearErrors("whatsapp"); }} mask={maskPhone} maxLength={15} inputMode="tel" helper="Usado para envio de confirmações e atualizações" error={errors.whatsapp} />
          </div>
          <div className="mt-6 p-4 bg-secondary rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground mb-2">Por que solicitamos esses dados?</p>
            <p className="text-sm text-muted-foreground">Utilizamos seus dados apenas para processar sua solicitação, entrar em contato e enviar atualizações sobre o orçamento. Nenhuma informação será compartilhada sem seu consentimento.</p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-2">Informações para o contrato</h2>
          <p className="text-sm text-muted-foreground mb-6">Estes dados serão usados para preencher o PDF do contrato. Campos não informados permanecerão identificados como “Não informado”.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Data de nascimento do locatário" type="date" value={draft.contractData.customerBirthDate} onChange={(customerBirthDate) => updateContractData({ customerBirthDate })} />
            <Input label="Nacionalidade" placeholder="Ex.: Brasileira" value={draft.contractData.nationality} onChange={(nationality) => updateContractData({ nationality })} />
            <Select label="Estado civil" options={["Selecione...", "Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)", "Outro"]} value={draft.contractData.maritalStatus || "Selecione..."} onChange={(maritalStatus) => updateContractData({ maritalStatus: maritalStatus === "Selecione..." ? "" : maritalStatus })} />
            <Input label="Profissão" placeholder="Sua profissão" value={draft.contractData.occupation} onChange={(occupation) => updateContractData({ occupation })} />
            <Input label="Nome do bebê" placeholder="Nome completo" value={draft.contractData.babyName} onChange={(babyName) => updateContractData({ babyName })} />
            <Select label="Sexo do bebê" options={["Selecione...", "Feminino", "Masculino", "Prefiro não informar"]} value={draft.contractData.babySex || "Selecione..."} onChange={(babySex) => updateContractData({ babySex: babySex === "Selecione..." ? "" : babySex })} />
            <Input label="Data de nascimento do bebê" type="date" value={draft.contractData.babyBirthDate} onChange={(babyBirthDate) => updateContractData({ babyBirthDate })} />
          </div>
          <div className="mt-7 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-4">Informações adicionais</h3>
            <div className="flex flex-col gap-4">
              <Select label="Motivo do aluguel" options={["Selecione...", "Uso temporário", "Testar antes de comprar", "Viagem", "Visita de familiar", "Recém-nascido em casa", "Outro"]} value={draft.additionalInfo.reason} onChange={(reason) => updateAdditionalInfo({ reason })} />
              <Select label="Como conheceu a Rent4Moms?" options={["Selecione...", "Instagram", "Indicação de amiga(o)", "Pesquisa no Google", "Grupo de mães", "Outro"]} value={draft.additionalInfo.referralSource} onChange={(referralSource) => updateAdditionalInfo({ referralSource })} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="quote-notes" className="text-sm font-medium text-foreground">Observações adicionais</label>
                <textarea id="quote-notes" value={draft.additionalInfo.notes} onChange={(event) => updateAdditionalInfo({ notes: event.target.value })} placeholder="Alguma informação relevante para a equipe..." rows={4} className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Revisão e envio</h2>
          <div className="flex flex-col gap-4 mb-6">
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="font-medium text-foreground mb-3">Produtos</p>
              {draft.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 text-sm py-1">
                  <span className="text-muted-foreground">
                    {item.productSnapshot.name} (×{item.quantity}) · {item.periodDays} dias
                    {item.productSnapshot.assembly && <span className="block text-xs mt-0.5">{item.productSnapshot.assembly.cover.name} · {item.productSnapshot.assembly.reducer?.name ?? "Sem redutor"} · {item.productSnapshot.assembly.variantId}</span>}
                  </span>
                  <span className="text-foreground whitespace-nowrap text-right">{formatMoneyFromCents(item.priceSnapshot.totalCents)}{item.priceSnapshot.discountCents > 0 && <span className="block text-xs text-green-700">− {formatMoneyFromCents(item.priceSnapshot.discountCents)}</span>}</span>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="font-medium text-foreground mb-3">Entrega e dados</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Método: {draft.fulfillment === "delivery" ? "Entrega no endereço" : draft.fulfillment === "pickup" ? "Retirada no local" : "A combinar"}</p>
                {draft.address.street && <p>Endereço: {draft.address.street}, {draft.address.number} — {draft.address.district}, {draft.address.city}/{draft.address.state}</p>}
                {draft.fulfillment === "delivery" && draft.deliverySlot && <p>Horário: {formatDeliverySlotLabel(draft.deliverySlot, deliverySettings)}</p>}
                {commonStartDate && commonPeriod && <p>Período: {formatDateBR(commonStartDate)} a {formatDateBR(addDays(commonStartDate, commonPeriod))}</p>}
                <p>Nome: {draft.customerData.name || "—"}</p>
                <p>CPF: {draft.customerData.cpf || "—"}</p>
                <p>E-mail: {draft.customerData.email || "—"}</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 text-sm">
              <div className="flex justify-between text-muted-foreground mb-2"><span>Produtos e adicionais</span><span>{formatMoneyFromCents(total.itemsSubtotalCents)}</span></div>
              {total.discountCents > 0 && <div className="flex justify-between text-green-700 mb-2"><span>Benefícios do período</span><span>− {formatMoneyFromCents(total.discountCents)}</span></div>}
              {draft.fulfillment === "delivery" && <div className="flex justify-between text-muted-foreground mb-2"><span>Taxa de entrega</span><span>{draft.shippingQuote.status === "calculated" ? formatMoneyFromCents(total.shippingCents) : "A calcular"}</span></div>}
              <div className="border-t border-border pt-3 flex justify-between font-semibold"><span className="text-foreground">Total estimado</span><span className="text-primary text-lg">{formatMoneyFromCents(total.totalCents)}</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {(Object.entries(CONSENT_DOCUMENTS) as Array<[keyof typeof CONSENT_DOCUMENTS, (typeof CONSENT_DOCUMENTS)[keyof typeof CONSENT_DOCUMENTS]]>).map(([key, document]) => (
              <div key={key}>
                <div className="flex items-start gap-3">
                  <input id={`quote-consent-${key}`} type="checkbox" checked={draft.consents[key]} onChange={(event) => { updateConsents({ [key]: event.target.checked }); clearErrors(key); }} className="mt-0.5 h-4 w-4 accent-primary" />
                  <p className="text-sm text-foreground">
                    <label htmlFor={`quote-consent-${key}`} className="cursor-pointer">{document.prefix} </label>
                    <button type="button" onClick={() => setActiveLegalSlug(document.slug)} className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">{document.label}</button>
                    <span className="ml-0.5 text-primary">*</span>
                  </p>
                </div>
                {errors[key] && <p className="ml-7 mt-1 text-xs text-destructive">{errors[key]}</p>}
              </div>
            ))}
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={draft.consents.marketing} onChange={(event) => updateConsents({ marketing: event.target.checked })} className="mt-0.5 h-4 w-4 accent-primary" />
              <span className="text-sm text-foreground">Desejo receber novidades e promoções (opcional)</span>
            </label>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        {step > 0 ? <Btn variant="outline" onClick={goBack}><ChevronLeft size={16} />Voltar</Btn> : <Btn variant="ghost" onClick={() => navigate("catalog")}>← Catálogo</Btn>}
        {step < 4
          ? <Btn variant="primary" onClick={validateAndAdvance}>Continuar <ChevronRight size={16} /></Btn>
          : <Btn variant="primary" onClick={handleSubmitQuote} disabled={submitting}><Check size={16} />{submitting ? "Enviando..." : "Enviar solicitação de orçamento"}</Btn>}
      </div>
    </div>
  );
}

export function QuoteSuccessPage({ navigate }: { navigate: NavigateToPage }) {
  const { lastSubmission } = useQuote();
  const { auth } = useAppState();
  const { siteSettings } = useSiteContent();
  const whatsappUrl = buildWhatsAppUrl(siteSettings.contact.whatsapp, siteSettings.whatsapp.defaultMessage);

  if (!lastSubmission) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <EmptyState
          title="Nenhuma solicitação recente"
          description="A confirmação aparecerá somente depois que um orçamento real for enviado."
          actionLabel="Voltar ao catálogo"
          onAction={() => navigate("catalog")}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-accent" /></div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-4">Solicitação recebida!</h1>
      <p className="text-muted-foreground mb-2">Número da solicitação: <span className="font-semibold text-foreground">{lastSubmission.code}</span></p>
      <p className="text-muted-foreground leading-relaxed mb-8">Recebemos sua solicitação. Nossa equipe verificará os produtos, o período e a região de atendimento antes de confirmar a reserva. Você receberá um retorno em até 24 horas úteis.</p>
      <div className="bg-secondary rounded-2xl border border-border p-6 mb-8 text-left">
        <div className="flex items-center gap-3 mb-3"><Clock size={18} className="text-primary" /><span className="font-medium text-foreground">Status: {lastSubmission.status}</span></div>
        {lastSubmission.holdExpiresAt && <p className="text-sm text-foreground mb-2">As unidades selecionadas estão bloqueadas até <strong>{new Date(lastSubmission.holdExpiresAt).toLocaleString("pt-BR")}</strong>, enquanto a equipe analisa o pedido.</p>}
        {lastSubmission.allocations && lastSubmission.allocations.length > 0 && <p className="text-xs text-muted-foreground mb-2">{lastSubmission.allocations.length} componente(s) físico(s) foram separados temporariamente.</p>}
        <p className="text-sm text-muted-foreground">A reserva só é confirmada após a verificação da equipe. Pedidos cancelados ou expirados liberam automaticamente as unidades.</p>
        {lastSubmission.documentDelivery?.status === "sent" && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><strong>Documentos enviados.</strong> O contrato e as instruções de pagamento foram encaminhados para {lastSubmission.documentDelivery.recipientEmail}. Envie o contrato assinado e o comprovante de pagamento respondendo ao e-mail ou pelo WhatsApp.</div>}
        {lastSubmission.documentDelivery?.status === "failed" && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><strong>Pedido criado, mas o e-mail não foi concluído.</strong> A equipe poderá reenviar os documentos pelo painel sem criar outro orçamento.</div>}
        {lastSubmission.documentDelivery?.status === "not_configured" && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Os documentos foram gerados, mas o canal automático de e-mail ainda não está configurado. A equipe poderá encaminhá-los manualmente.</div>}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Btn variant="primary" onClick={() => auth === "client" ? navigate("account-quotes") : navigate("login", lastSubmission.code ? { pedido: lastSubmission.code } : undefined)}>Acompanhar solicitação</Btn>
        {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer"><Btn variant="outline"><MessageCircle size={16} />Falar no WhatsApp</Btn></a>}
        <Btn variant="ghost" onClick={() => navigate("catalog")}>Voltar ao catálogo</Btn>
      </div>
    </div>
  );
}
