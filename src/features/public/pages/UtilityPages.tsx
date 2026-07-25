import React from "react";
import { FileText } from "lucide-react";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";
import type { Page, Product } from "../../../domain/shared/types";
import { Btn, Input } from "../../../components/prototype/PrototypeUI";
import { calculateRentalPrice } from "../../../domain/pricing/pricingEngine";
import { formatMoneyFromCents } from "../../../lib/money";
import { EmptyState, ErrorState, LoadingState } from "../../../components/states/DataState";
import { resolvePublicImageUrl } from "../../../domain/catalog/assemblyImages";

export function ForgotPasswordPage({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-4">Recuperar senha</h1>
      <p className="text-muted-foreground mb-6">A recuperação de senha ainda não está configurada.</p>
      <Input label="E-mail" type="email" placeholder="seu@email.com" required disabled />
      <Btn variant="primary" fullWidth className="mt-4" disabled>Enviar instruções</Btn>
      <button onClick={() => navigate("login")} className="mt-4 text-sm text-primary hover:underline block mx-auto">Voltar para o login</button>
    </div>
  );
}

export function ComparePage({
  navigate,
  onAddToQuote,
}: {
  navigate: (page: Page) => void;
  onAddToQuote: (product: Product) => void;
}) {
  const { products, syncStatus, refreshCatalog } = useCatalog();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-8">Comparar produtos</h1>
      {syncStatus === "loading" && <LoadingState title="Carregando produtos..." />}
      {syncStatus === "error" && <ErrorState description="A comparação não utiliza catálogo fictício quando a API está indisponível." onRetry={() => void refreshCatalog()} />}
      {syncStatus !== "loading" && syncStatus !== "error" && products.length === 0 && (
        <EmptyState title="Nenhum produto disponível para comparação" description="Cadastre e publique produtos no painel administrativo." />
      )}
      {products.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-6">
          {products.slice(0, 3).map((product) => {
            const imageUrl = resolvePublicImageUrl(product.photo);
            return (
              <div key={product.id} className="bg-card rounded-2xl border border-border p-5">
                {imageUrl ? (
                  <img src={imageUrl} alt={product.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                ) : (
                  <EmptyState compact title="Imagem não cadastrada" />
                )}
                <p className="font-semibold text-foreground mb-2 mt-4">{product.name}</p>
                {[
                  ["Marca", product.brand],
                  ["Idade", `${product.ageMin}–${product.ageMax}`],
                  ["Peso máx.", product.weightMax],
                  ["Preço/semana", formatMoneyFromCents(calculateRentalPrice({ rates: { daily: product.priceDaily, weekly: product.priceWeekly, monthly: product.priceMonthly }, days: 7 }).totalCents)],
                  ["Status", product.status],
                ].map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-t border-border text-sm">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                ))}
                <Btn variant="primary" fullWidth className="mt-4" onClick={() => { onAddToQuote(product); navigate("quote"); }}>Adicionar ao orçamento</Btn>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AccountContractsPage() {
  return (
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-6">Contratos</h1>
      <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
        <FileText size={40} className="mx-auto mb-4 opacity-30" />
        <p className="font-medium">Nenhum contrato disponível</p>
        <p className="text-sm mt-1">Seus contratos aparecerão aqui após a confirmação de uma reserva real.</p>
      </div>
    </div>
  );
}
