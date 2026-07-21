import { isDeliverySlotAvailable } from "../../domain/delivery/slots";
import type { DeliverySettings } from "../../domain/delivery/types";
import type { QuoteDraft } from "../../domain/quote/types";
import { getTomorrowIsoDate, isIsoDateOnOrAfter } from "../../lib/dates";
import { isRequired, isValidCep, isValidCpf, isValidEmail, isValidPhone } from "../../lib/validators";

export type QuoteValidationErrors = Record<string, string>;

export function validateQuoteStep(
  step: number,
  draft: QuoteDraft,
  deliverySettings: DeliverySettings,
  now = new Date(),
): QuoteValidationErrors {
  const errors: QuoteValidationErrors = {};

  if (step === 0) {
    if (draft.items.length === 0) errors.items = "Adicione pelo menos um produto ao orçamento.";
    return errors;
  }

  if (step === 1) {
    const minimumDate = getTomorrowIsoDate(deliverySettings.timeZone, now);
    if (draft.items.some((item) => !item.periodDays)) errors.period = "Selecione o período de locação.";
    if (draft.items.some((item) => !item.startDate)) {
      errors.startDate = "Informe a data de início.";
    } else if (draft.items.some((item) => !isIsoDateOnOrAfter(item.startDate, minimumDate))) {
      errors.startDate = "A data de início deve ser a partir de amanhã.";
    }

    if (draft.fulfillment === "delivery") {
      if (!isValidCep(draft.address.cep)) errors.cep = "Informe um CEP válido com 8 dígitos.";
      else if (draft.shippingQuote.status !== "calculated") errors.cep = "Este CEP ainda não possui entrega disponível.";
      if (!isRequired(draft.address.street)) errors.street = "Informe a rua ou logradouro.";
      if (!isRequired(draft.address.number)) errors.number = "Informe o número do endereço.";
      if (!isRequired(draft.address.city)) errors.city = "Informe a cidade.";
      if (!isRequired(draft.address.state) || draft.address.state.length !== 2) errors.state = "Informe a UF com 2 letras.";
      if (!draft.deliverySlot) errors.deliverySlot = "Selecione o horário para receber a entrega.";
      else if (!isDeliverySlotAvailable(draft.deliverySlot, deliverySettings)) errors.deliverySlot = "O horário escolhido não está mais disponível na configuração atual.";
    }
    return errors;
  }

  if (step === 2) {
    if (draft.customerData.name.trim().length < 3) errors.name = "Informe o nome completo.";
    if (!isValidCpf(draft.customerData.cpf)) errors.cpf = "Informe um CPF válido.";
    if (!isValidEmail(draft.customerData.email)) errors.email = "Informe um e-mail válido.";
    if (!isValidPhone(draft.customerData.phone)) errors.phone = "Informe um telefone válido com DDD.";
    if (draft.customerData.whatsapp && !isValidPhone(draft.customerData.whatsapp)) errors.whatsapp = "Informe um WhatsApp válido com DDD.";
    return errors;
  }

  if (step === 4) {
    if (!draft.consents.terms) errors.terms = "Aceite os Termos de uso.";
    if (!draft.consents.privacy) errors.privacy = "Confirme a leitura da Política de privacidade.";
    if (!draft.consents.rentalConditions) errors.rentalConditions = "Aceite as Condições gerais de locação.";
  }

  return errors;
}
