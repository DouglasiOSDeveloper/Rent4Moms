const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatMoneyFromCents(valueCents: number): string {
  return brlFormatter.format(valueCents / 100);
}
