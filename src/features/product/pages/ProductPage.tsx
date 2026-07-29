import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  Droplets,
  Info,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  Shield,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { AddressFields } from "../../../components/forms/AddressFields";
import { DeliverySlotSelect } from "../../../components/forms/DeliverySlotSelect";
import { EmptyState, ErrorState, LoadingState } from "../../../components/states/DataState";
import { RatingStars } from "../../../components/reviews/RatingStars";
import { externalTestimonialAttribution } from "../../../components/reviews/reviewAttribution";
import { ProductCard } from "../../../components/prototype/ProductCard";
import { AvailabilityBadge, Btn, Input, cn } from "../../../components/prototype/PrototypeUI";
import { getAngleLabel, resolveAssemblyImageUrl } from "../../../domain/catalog/assemblyImages";
import {
  componentIsPreferred,
  composeConfigurationDescription,
  getAssemblyVariant,
  getBallSetForModel,
  getChairModelByProductId,
  getCompatibleCovers,
  getCompatibleReducers,
  getConfigurationAvailableQuantity,
  sumRentalRates,
} from "../../../domain/catalog/configurator";
import { getCategoryNames, productsShareCategory } from "../../../domain/catalog/selectors";
import type { AssemblyAngle } from "../../../domain/catalog/types";
import { isDeliverySlotAvailable } from "../../../domain/delivery/slots";
import type { DeliverySettings } from "../../../domain/delivery/types";
import { calculateRentalPrice, normalizeProductPeriodPricing } from "../../../domain/pricing/pricingEngine";
import type { RentalPriceBreakdown } from "../../../domain/pricing/types";
import type { AddProductToQuoteOptions, FulfillmentMethod, QuoteAddress, QuoteAssemblySnapshot, QuoteItem } from "../../../domain/quote/types";
import type { Page, Product } from "../../../domain/shared/types";
import { isCompleteShippingAddress } from "../../../domain/shipping/address";
import type { ShippingEstimate } from "../../../domain/shipping/types";
import { addDays, formatDateBR, getTomorrowIsoDate, isIsoDateOnOrAfter } from "../../../lib/dates";
import { maskCep } from "../../../lib/masks";
import { formatMoneyFromCents } from "../../../lib/money";
import { buildWhatsAppUrl } from "../../../lib/contact";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";
import { useSiteContent } from "../../../stores/content/SiteContentProvider";
import type { ProductReviewsResponse, PublicProductReview } from "../../../domain/customerExperience/types";
import { listPublishedProductReviews } from "../../../services/customerExperience/customerExperienceApi";
import { estimateRemotePricing } from "../../../services/pricing/pricingApi";
import { estimateRemoteShipping } from "../../../services/shipping/shippingApi";

function priceAdjustmentLabel(monthly: number): string {
  if (monthly <= 0) return "Sem acréscimo";
  return `+ ${formatMoneyFromCents(Math.round(monthly * 100))} por 30 dias`;
}

function reducerPriceAdjustmentLabel(monthly: number): string {
  if (monthly <= 0) return "Sem acréscimo";
  return `+ ${formatMoneyFromCents(Math.round(monthly * 100))} em 30 dias · grátis em 60/90 dias`;
}


interface DisplayGalleryImage {
  id: string;
  url: string;
  alt: string;
  label: string;
  angle?: AssemblyAngle;
  source: "variant" | "model" | "product" | "fallback";
}

function ProductReviewsPanel({ rating, reviewCount, reviews, loading }: { rating: number; reviewCount: number; reviews: PublicProductReview[]; loading: boolean }) {
  return (
    <div className="grid w-full items-stretch gap-4 md:grid-cols-2">
      <div className="flex min-h-40 items-center rounded-2xl border border-border bg-secondary p-6">
        <div className="text-center">
          <p className="text-5xl font-bold text-foreground">{rating || "—"}</p>
          <div className="mt-1 flex justify-center"><RatingStars rating={rating} size={14} /></div>
          <p className="mt-1 text-xs text-muted-foreground">{reviewCount} avaliações</p>
        </div>
      </div>
      {loading ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Carregando avaliações...</div>
      ) : reviews.length ? reviews.map((review) => (
        <article key={review.id} className="min-h-40 rounded-xl border border-border bg-card p-4">
          <RatingStars rating={review.rating} size={12} className="mb-2" />
          <p className="mb-2 text-sm text-muted-foreground">“{review.comment}”</p>
          <p className="text-xs font-medium text-foreground">{review.customerDisplayName} · {new Date(review.reviewedAt ?? review.createdAt).toLocaleDateString("pt-BR")}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{review.source === "external_testimonial" ? externalTestimonialAttribution(review) : "Avaliação de cliente vinculada a uma locação"}</p>
        </article>
      )) : (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Ainda não há avaliações publicadas para este produto.</div>
      )}
    </div>
  );
}

interface ProductPageProps {
  productId: string;
  navigate: (p: Page, params?: Record<string, string>) => void;
  onAddToQuote: (product: Product, options?: AddProductToQuoteOptions) => void;
  quoteItemIds: string[];
  deliverySettings: DeliverySettings;
  existingItem?: QuoteItem | undefined;
  initialFulfillment: FulfillmentMethod;
  initialAddress: QuoteAddress;
  initialDeliverySlot: string;
}

export function ProductPage(props: ProductPageProps) {
  const { getProduct, syncStatus, refreshCatalog } = useCatalog();
  const product = getProduct(props.productId);

  if (syncStatus === "loading") {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"><LoadingState title="Carregando produto" description="Consultando o catálogo publicado." /></div>;
  }
  if (syncStatus === "error") {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"><ErrorState title="Não foi possível carregar o produto" description="Nenhum produto fictício foi utilizado como substituição." onRetry={() => void refreshCatalog()} /></div>;
  }
  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"><EmptyState title="Produto não encontrado" description="Este produto não está cadastrado ou publicado." actionLabel="Voltar ao catálogo" onAction={() => props.navigate("catalog")} /></div>;
  }

  return <ProductPageContent {...props} product={product} />;
}

function ProductPageContent({
  product,
  navigate,
  onAddToQuote,
  quoteItemIds,
  deliverySettings,
  existingItem,
  initialFulfillment,
  initialAddress,
  initialDeliverySlot,
}: ProductPageProps & { product: Product }) {
  const catalog = useCatalog();
  const { siteSettings } = useSiteContent();
  const { products, publicCategories } = catalog;
  const categoryNames = getCategoryNames(product, publicCategories);
  const chairModel = getChairModelByProductId(catalog, product.id);
  const existingAssembly = existingItem?.productSnapshot.assembly;
  const existingPeriod = existingItem?.periodDays;

  const [startDate, setStartDate] = useState(existingItem?.startDate ?? "");
  const [period, setPeriod] = useState<30 | 60 | 90 | null>(
    existingPeriod === 30 || existingPeriod === 60 || existingPeriod === 90 ? existingPeriod : null,
  );
  const [address, setAddress] = useState<QuoteAddress>(() => ({ ...initialAddress, cep: maskCep(initialAddress.cep) }));
  const [delivery, setDelivery] = useState<FulfillmentMethod>(initialFulfillment);
  const [deliverySlot, setDeliverySlot] = useState(initialDeliverySlot);
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("descricao");
  const [qty, setQty] = useState(existingItem?.quantity ?? 1);
  const [selectedCoverId, setSelectedCoverId] = useState<string | null>(existingAssembly?.cover.id ?? null);
  const [selectedReducerId, setSelectedReducerId] = useState<string | null>(existingAssembly?.reducer?.id ?? null);
  const [selectedAngle, setSelectedAngle] = useState<AssemblyAngle>(existingAssembly?.selectedAngle ?? "FRT");
  const [reviewData, setReviewData] = useState<ProductReviewsResponse>({ reviews: [], summary: { rating: 0, reviewCount: 0 } });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [officialPriceEstimate, setOfficialPriceEstimate] = useState<RentalPriceBreakdown | null>(null);
  const [pricingPending, setPricingPending] = useState(false);
  const [shippingEstimate, setShippingEstimate] = useState<ShippingEstimate | null>(null);
  const [shippingPending, setShippingPending] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const updateAddress = useCallback((patch: Partial<QuoteAddress>) => {
    setAddress((current) => ({ ...current, ...patch }));
    setProductErrors((current) => {
      const next = { ...current };
      for (const field of Object.keys(patch)) delete next[field];
      return next;
    });
  }, []);

  useEffect(() => {
    setSelectedCoverId(existingAssembly?.cover.id ?? null);
    setSelectedReducerId(existingAssembly?.reducer?.id ?? null);
    setSelectedAngle(existingAssembly?.selectedAngle ?? "FRT");
  }, [product.id, existingAssembly?.variantId]);


  useEffect(() => {
    let active = true;
    setReviewsLoading(true);
    listPublishedProductReviews(product.id)
      .then((response) => { if (active) setReviewData(response); })
      .catch(() => { if (active) setReviewData({ reviews: [], summary: { rating: 0, reviewCount: 0 } }); })
      .finally(() => { if (active) setReviewsLoading(false); });
    return () => { active = false; };
  }, [product.id]);

  const displayRating = reviewData.summary.rating;
  const displayReviewCount = reviewData.summary.reviewCount;
  const productWhatsAppUrl = buildWhatsAppUrl(
    siteSettings.contact.whatsapp,
    `Olá, gostaria de saber mais sobre o produto ${product.name} para ${period ? `${period} dias` : "período a definir"}.`,
  );

  const compatibleCovers = useMemo(
    () => chairModel ? getCompatibleCovers(catalog, chairModel.id) : [],
    [catalog, chairModel],
  );
  const compatibleReducers = useMemo(
    () => chairModel ? getCompatibleReducers(catalog, chairModel.id) : [],
    [catalog, chairModel],
  );
  const selectedCover = compatibleCovers.find((cover) => cover.id === selectedCoverId) ?? null;
  const selectedReducer = compatibleReducers.find((reducer) => reducer.id === selectedReducerId) ?? null;
  const ballSet = chairModel ? getBallSetForModel(catalog, chairModel.id) : undefined;
  const variant = chairModel && selectedCover
    ? getAssemblyVariant(catalog, chairModel.id, selectedCover.id, selectedReducer?.id ?? null)
    : undefined;

  const baseRates = useMemo(() => ({
    daily: product.priceDaily,
    weekly: product.priceWeekly,
    monthly: product.priceMonthly,
  }), [product.priceDaily, product.priceWeekly, product.priceMonthly]);
  const periodPricing = useMemo(() => normalizeProductPeriodPricing(product.periodPricing), [product.periodPricing]);
  const coverRates = useMemo(() => selectedCover ? [selectedCover.priceAdjustment] : [], [selectedCover]);
  const reducerRates = useMemo(() => selectedReducer ? [selectedReducer.priceAdjustment] : [], [selectedReducer]);
  const componentRates = useMemo(() => [...coverRates, ...reducerRates], [coverRates, reducerRates]);
  const configuredRates = useMemo(() => sumRentalRates(baseRates, ...componentRates), [baseRates, componentRates]);

  const composedDescription = composeConfigurationDescription(
    chairModel?.description ?? product.description,
    selectedCover?.description,
    selectedReducer?.description,
  );
  const productDetailSections = [
    { title: "Para quem é indicado", content: product.details?.audience ?? "" },
    { title: "Itens inclusos", content: product.details?.includedItems || product.specs.includes.join(", ") },
    { title: "Como utilizar", content: product.details?.usage ?? "" },
    { title: "Cuidados e segurança", content: product.details?.safety ?? "" },
  ];

  const availableQuantity = chairModel && selectedCover && ballSet
    ? getConfigurationAvailableQuantity({ chairModel, cover: selectedCover, reducer: selectedReducer, ballSet })
    : chairModel?.availableQuantity ?? Number.POSITIVE_INFINITY;

  useEffect(() => {
    if (Number.isFinite(availableQuantity) && availableQuantity > 0 && qty > availableQuantity) {
      setQty(availableQuantity);
    }
  }, [availableQuantity, qty]);

  const minimumStartDate = getTomorrowIsoDate(deliverySettings.timeZone);
  const endDate = useMemo(() => period && startDate ? addDays(startDate, period) : "", [startDate, period]);
  useEffect(() => {
    let active = true;
    if (delivery !== "delivery" || !isCompleteShippingAddress(address)) {
      setShippingEstimate(null);
      setShippingPending(false);
      setShippingMessage("");
      return () => { active = false; };
    }
    setShippingEstimate(null);
    setShippingPending(true);
    setShippingMessage("");
    const timer = window.setTimeout(() => {
      void estimateRemoteShipping(address)
        .then((estimate) => { if (active) setShippingEstimate(estimate); })
        .catch((error: unknown) => {
          if (!active) return;
          setShippingEstimate(null);
          setShippingMessage(error instanceof Error ? error.message : "Não foi possível calcular o frete.");
        })
        .finally(() => { if (active) setShippingPending(false); });
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [address, delivery]);
  const shippingCostCents = shippingEstimate?.amountCents ?? null;
  const localPriceEstimate = useMemo(() => period ? calculateRentalPrice({ baseRates, coverRates, reducerRates, periodPricing, days: period, quantity: qty }) : null, [period, baseRates, coverRates, reducerRates, periodPricing, qty]);

  useEffect(() => {
    let active = true;
    if (!period || (chairModel && (!selectedCover || !ballSet || !variant))) {
      setOfficialPriceEstimate(null);
      setPricingPending(false);
      return () => { active = false; };
    }
    setPricingPending(true);
    estimateRemotePricing({
      productId: product.id,
      periodDays: period,
      quantity: qty,
      ...(chairModel && selectedCover && ballSet && variant ? {
        configuration: {
          chairModelId: chairModel.id,
          variantId: variant.id,
          coverId: selectedCover.id,
          reducerId: selectedReducer?.id ?? null,
          ballSetId: ballSet.id,
        },
      } : {}),
    })
      .then((response) => { if (active) setOfficialPriceEstimate(response.pricing); })
      .catch(() => { if (active) setOfficialPriceEstimate(null); })
      .finally(() => { if (active) setPricingPending(false); });
    return () => { active = false; };
  }, [period, qty, product.id, chairModel, selectedCover, selectedReducer, ballSet, variant]);

  const priceEstimate = officialPriceEstimate ?? localPriceEstimate;
  const totalEstimateCents = (priceEstimate?.totalCents ?? 0)
    + (delivery === "delivery" && shippingCostCents !== null ? shippingCostCents : 0);

  const variantGalleryImages = (variant?.images ?? []).filter(
    (image) => image.isVisible && Boolean(resolveAssemblyImageUrl(image)),
  );
  const modelGalleryImages = (chairModel?.images ?? []).filter((image) => Boolean(image.url));
  const productGalleryImages = (product.images ?? []).filter((image) => Boolean(image.url));
  const displayGallery = useMemo<DisplayGalleryImage[]>(() => {
    if (variantGalleryImages.length > 0) {
      return variantGalleryImages.map((image) => ({
        id: image.id,
        url: resolveAssemblyImageUrl(image),
        alt: image.alt || product.name,
        label: getAngleLabel(image.angle, image.angleLabel),
        angle: image.angle,
        source: "variant" as const,
      }));
    }
    const genericImages = modelGalleryImages.length > 0 ? modelGalleryImages : productGalleryImages;
    const source = modelGalleryImages.length > 0 ? "model" as const : "product" as const;
    if (genericImages.length > 0) {
      return genericImages.map((image, index) => ({
        id: image.id,
        url: image.url,
        alt: image.alt || product.name,
        label: image.angle
          ? getAngleLabel(image.angle, image.angleLabel)
          : image.alt || image.originalName || `Imagem ${index + 1}`,
        angle: image.angle,
        source,
      }));
    }
    const fallbackUrl = chairModel?.defaultImage || product.photo || "";
    return fallbackUrl ? [{ id: `${product.id}-fallback`, url: fallbackUrl, alt: product.name, label: "Imagem principal", source: "fallback" as const }] : [];
  }, [variantGalleryImages, modelGalleryImages, productGalleryImages, chairModel?.defaultImage, product.photo, product.id, product.name]);
  const gallerySignature = displayGallery.map((image) => image.id).join("|");
  const [selectedGalleryImageId, setSelectedGalleryImageId] = useState<string | null>(null);

  useEffect(() => {
    const angleMatch = displayGallery.find((image) => image.angle === selectedAngle);
    const currentExists = displayGallery.some((image) => image.id === selectedGalleryImageId);
    if (!currentExists) setSelectedGalleryImageId((angleMatch ?? displayGallery[0])?.id ?? null);
  }, [gallerySignature, displayGallery, selectedAngle, selectedGalleryImageId]);

  const activeGalleryImage = displayGallery.find((image) => image.id === selectedGalleryImageId) ?? displayGallery[0];
  const activeAssemblyImage = activeGalleryImage?.source === "variant"
    ? variantGalleryImages.find((image) => image.id === activeGalleryImage.id)
    : undefined;

  useEffect(() => {
    if (activeAssemblyImage && activeAssemblyImage.angle !== selectedAngle) setSelectedAngle(activeAssemblyImage.angle);
  }, [activeAssemblyImage, selectedAngle]);
  const activeImageUrl = activeGalleryImage?.url ?? "";
  const activeImageAlt = activeGalleryImage?.alt ?? product.name;
  const canAddConfiguredProduct = !chairModel || Boolean(selectedCover && variant && ballSet && availableQuantity >= qty && availableQuantity > 0);

  const tabs = [
    { id: "descricao", label: "Descrição" },
    { id: "especificacoes", label: "Especificações" },
    { id: "higienizacao", label: "Higienização" },
    { id: "entrega", label: "Entrega e devolução" },
    { id: "avaliacoes", label: "Avaliações" },
  ];
  const related = products.filter((candidate) => candidate.id !== product.id && productsShareCategory(candidate, product)).slice(0, 3);

  const addToQuote = () => {
    const nextErrors: Record<string, string> = {};
    if (!period) nextErrors.period = "Selecione o período de locação.";
    if (!startDate) nextErrors.startDate = "Informe a data de início.";
    else if (!isIsoDateOnOrAfter(startDate, minimumStartDate)) nextErrors.startDate = "A data de início deve ser a partir de amanhã.";
    if (chairModel && !selectedCover) nextErrors.cover = "Escolha um pano compatível.";
    if (!canAddConfiguredProduct) nextErrors.configuration = "A composição selecionada não está disponível.";
    if (delivery === "delivery") {
      if (address.cep.replace(/\D/g, "").length !== 8) nextErrors.cep = "Informe um CEP válido com 8 dígitos.";
      if (!address.street.trim()) nextErrors.street = "Informe a rua ou o logradouro.";
      if (!address.number.trim()) nextErrors.number = "Informe o número ou lote.";
      if (!address.city.trim()) nextErrors.city = "Informe a cidade.";
      if (!/^[A-Za-z]{2}$/.test(address.state.trim())) nextErrors.state = "Informe a UF com 2 letras.";
      if (Object.keys(nextErrors).some((field) => ["cep", "street", "number", "city", "state"].includes(field))) {
        nextErrors.shipping = "Preencha o endereço completo para calcular o frete.";
      } else if (shippingPending) nextErrors.shipping = "Aguarde o cálculo do frete.";
      else if (shippingEstimate === null) nextErrors.shipping = shippingMessage || "Não foi possível calcular a entrega para este endereço.";
      if (!deliverySlot) nextErrors.deliverySlot = "Selecione o horário para receber a entrega.";
      else if (!isDeliverySlotAvailable(deliverySlot, deliverySettings)) nextErrors.deliverySlot = "O horário escolhido não está disponível.";
    }
    setProductErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !period || !canAddConfiguredProduct) return;

    let assembly: QuoteAssemblySnapshot | undefined;
    if (chairModel && selectedCover && ballSet && variant && activeAssemblyImage) {
      assembly = {
        chairModelId: chairModel.id,
        chairModelVersion: chairModel.version,
        chairModelName: chairModel.name,
        variantId: variant.id,
        prefix: variant.prefix,
        cover: {
          id: selectedCover.id,
          code: selectedCover.code,
          name: selectedCover.name,
          description: selectedCover.description,
          priceAdjustment: selectedCover.priceAdjustment,
        },
        reducer: selectedReducer ? {
          id: selectedReducer.id,
          code: selectedReducer.code,
          name: selectedReducer.name,
          description: selectedReducer.description,
          priceAdjustment: selectedReducer.priceAdjustment,
        } : null,
        ballSet: {
          id: ballSet.id,
          code: ballSet.code,
          name: ballSet.name,
          description: ballSet.description,
        },
        selectedAngle: activeAssemblyImage.angle,
        selectedImage: activeImageUrl,
        availableQuantity,
      };
    }

    const quoteOptions: AddProductToQuoteOptions = {
      periodDays: period,
      startDate,
      quantity: qty,
      fulfillment: delivery,
      deliverySlot: delivery === "delivery" ? deliverySlot : "",
      cep: address.cep,
      address,
      shippingEstimate: delivery === "delivery" ? shippingEstimate : null,
      rates: configuredRates,
      baseRates,
      componentRates,
      coverRates,
      reducerRates,
      periodPricing,
      description: composedDescription,
      photo: activeImageUrl,
      ...(assembly ? { assembly } : {}),
    };
    onAddToQuote(product, quoteOptions);
  };

  const configurationPanel = chairModel ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-foreground">Monte sua {chairModel.name}</p>
                  <p className="text-sm text-muted-foreground">A bolinha correta é definida automaticamente pelo modelo.</p>
                </div>
                <span className="text-xs rounded-full bg-secondary border border-border px-2 py-1 text-muted-foreground">Estoque do modelo: {chairModel.availableQuantity}</span>
              </div>

              <div className="mb-5">
                <label className="text-sm font-medium text-foreground block mb-2">1. Escolha o pano <span className="text-primary">*</span></label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {compatibleCovers.map((cover) => {
                    const disabled = cover.availableQuantity <= 0;
                    const preferred = componentIsPreferred(catalog, chairModel.id, "cover", cover.id);
                    return (
                      <button
                        key={cover.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => { setSelectedCoverId(cover.id); setProductErrors((current) => ({ ...current, cover: "", configuration: "" })); }}
                        className={cn(
                          "text-left rounded-xl border-2 p-3 transition-all",
                          selectedCoverId === cover.id ? "border-primary bg-primary/5" : "border-border bg-secondary/40 hover:border-primary/50",
                          disabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div className="flex justify-between gap-2"><span className="font-medium text-sm text-foreground">{cover.name}</span>{preferred && <span className="text-[10px] bg-accent/10 text-accent border border-accent/30 rounded-full px-1.5 py-0.5">Preferencial</span>}</div>
                        <p className="text-xs text-muted-foreground mt-1">{priceAdjustmentLabel(cover.priceAdjustment.monthly)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Disponível: {cover.availableQuantity}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-foreground block mb-2">2. Escolha o redutor</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReducerId(null)}
                    className={cn("text-left rounded-xl border-2 p-3 transition-all", selectedReducerId === null ? "border-primary bg-primary/5" : "border-border bg-secondary/40 hover:border-primary/50")}
                  >
                    <span className="font-medium text-sm text-foreground">Sem redutor</span>
                    <p className="text-xs text-muted-foreground mt-1">Sem acréscimo e sem consumo de estoque.</p>
                  </button>
                  {compatibleReducers.map((reducer) => {
                    const disabled = reducer.availableQuantity <= 0;
                    const preferred = componentIsPreferred(catalog, chairModel.id, "reducer", reducer.id);
                    return (
                      <button
                        key={reducer.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedReducerId(reducer.id)}
                        className={cn(
                          "text-left rounded-xl border-2 p-3 transition-all",
                          selectedReducerId === reducer.id ? "border-primary bg-primary/5" : "border-border bg-secondary/40 hover:border-primary/50",
                          disabled && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <div className="flex justify-between gap-2"><span className="font-medium text-sm text-foreground">{reducer.name}</span>{preferred && <span className="text-[10px] bg-accent/10 text-accent border border-accent/30 rounded-full px-1.5 py-0.5">Preferencial</span>}</div>
                        <p className="text-xs text-muted-foreground mt-1">{reducerPriceAdjustmentLabel(reducer.priceAdjustment.monthly)}</p>
                        <p className="text-xs text-muted-foreground mt-1">Disponível: {reducer.availableQuantity}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {ballSet && (
                <div className="flex items-center gap-3 rounded-xl bg-secondary border border-border p-3">
                  <PackageCheck size={18} className="text-accent shrink-0" />
                  <div className="flex-1"><p className="text-sm font-medium text-foreground">{ballSet.name}</p><p className="text-xs text-muted-foreground">Incluído automaticamente · disponível: {ballSet.availableQuantity}</p></div>
                </div>
              )}

              {selectedCover && !variant && <p className="mt-3 text-sm text-destructive">Esta combinação ainda não possui uma variante visual publicada e não pode ser adicionada.</p>}
              {selectedCover && variant && availableQuantity === 0 && <p className="mt-3 text-sm text-destructive">A composição selecionada está sem estoque no momento.</p>}
            </div>
  ) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => navigate("home")} className="hover:text-foreground">Início</button>
        <ChevronRight size={14} />
        <button onClick={() => navigate("catalog")} className="hover:text-foreground">Produtos</button>
        <ChevronRight size={14} />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-white mb-4 border border-border min-h-[420px]">
            {activeImageUrl ? <img src={activeImageUrl} alt={activeImageAlt} className="h-[420px] w-full object-contain p-2" /> : <div className="h-[420px] flex items-center justify-center p-6"><EmptyState compact title="Imagem não cadastrada" description="A imagem real deste produto ou variante ainda não foi enviada." /></div>}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-accent text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1"><Droplets size={10} />Higienizado</span>
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1"><Shield size={10} />Revisado</span>
            </div>
            <div className="absolute top-4 right-4"><AvailabilityBadge status={availableQuantity === 0 ? "unavailable" : product.status} /></div>
          </div>
          {displayGallery.length > 1 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {displayGallery.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => {
                    setSelectedGalleryImageId(image.id);
                    if (image.angle) setSelectedAngle(image.angle);
                  }}
                  className={cn(
                    "rounded-xl overflow-hidden border-2 text-left transition-colors bg-card",
                    activeGalleryImage?.id === image.id ? "border-primary" : "border-border hover:border-primary/50",
                  )}
                >
                  <img src={image.url} alt={image.alt} className="h-28 w-full bg-white object-contain p-1" />
                  <span className="block px-2 py-1.5 text-xs text-center text-foreground truncate">{image.label}</span>
                </button>
              ))}
            </div>
          ) : displayGallery.length === 1 ? (
            <p className="text-sm text-muted-foreground">Uma imagem real cadastrada. Adicione outras angulações para ampliar a galeria.</p>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhuma imagem real foi cadastrada para este produto ou modelo.</p>
          )}
          <div className="mt-6">{configurationPanel}</div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {(categoryNames.length ? categoryNames : ["Sem categoria"]).map((categoryName) => (
                <span key={categoryName} className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-muted-foreground">{categoryName}</span>
              ))}
              <span className="text-xs text-muted-foreground">Cód. {product.id.toUpperCase()}</span>
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-1">{product.name}</h1>
            <p className="text-muted-foreground">{product.brand} · {product.model}</p>
            <div className="flex items-center gap-2 mt-2">
<RatingStars rating={displayRating} size={14} />
              <span className="text-sm text-muted-foreground">{displayRating} ({displayReviewCount} avaliações)</span>
            </div>
          </div>

          <div className="flex gap-4 text-sm flex-wrap">
            <div className="bg-secondary rounded-xl px-4 py-2 text-center"><p className="text-muted-foreground text-xs">Idade</p><p className="font-medium text-foreground">{product.ageMin} – {product.ageMax}</p></div>
            <div className="bg-secondary rounded-xl px-4 py-2 text-center"><p className="text-muted-foreground text-xs">Peso máximo</p><p className="font-medium text-foreground">{product.weightMax}</p></div>
            <div className="bg-secondary rounded-xl px-4 py-2 text-center"><p className="text-muted-foreground text-xs">Conservação</p><p className="font-medium text-foreground">{product.conservation}</p></div>
          </div>


          <p className="text-muted-foreground leading-relaxed">{composedDescription}</p>

          <div className="bg-secondary rounded-2xl border border-border p-5">
            <p className="font-semibold text-foreground mb-4">Calcular período</p>
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground block mb-2">Período de locação <span className="text-primary">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {([30, 60, 90] as const).map((value) => {
                  const estimate = calculateRentalPrice({ baseRates, coverRates, reducerRates, periodPricing, days: value });
                  return (
                    <button key={value} type="button" onClick={() => { setPeriod(period === value ? null : value); setProductErrors((current) => ({ ...current, period: "" })); }} className={cn("flex flex-col items-center py-3 px-2 rounded-xl border-2 font-medium text-sm transition-all", period === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-input-background text-foreground hover:border-primary/50")}>
                      <span className="text-lg font-bold">{value}</span><span className="text-xs opacity-70">dias</span>
                      <span className="text-xs mt-0.5 font-normal text-muted-foreground">{formatMoneyFromCents(estimate.totalCents)}</span>
                      {estimate.benefitType === "discount" && <span className="text-[10px] mt-1 text-green-700">{estimate.discountPercent}% na cadeira + pano</span>}
                      {estimate.reducerWaiverCents > 0 && <span className="text-[10px] mt-0.5 text-green-700">Redutor grátis</span>}
                      {estimate.benefitType === "fixed_price" && <span className="text-[10px] mt-1 text-green-700">Preço-base especial</span>}
                      {estimate.benefitType === "free_base" && <span className="text-[10px] mt-1 text-green-700">Produto-base gratuito</span>}
                      {estimate.benefitType === "free_configuration" && <span className="text-[10px] mt-1 text-green-700">Configuração gratuita</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Preço por unidade, incluindo a composição selecionada</p>
            </div>

            <div className="mb-3">
              <Input
                label="Data de início"
                type="date"
                value={startDate}
                onChange={(value) => { setStartDate(value); setProductErrors((current) => ({ ...current, startDate: "" })); }}
                required
                min={minimumStartDate}
                error={productErrors.startDate}
              />
              {period && startDate && endDate && <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-xl text-sm"><Calendar size={14} className="text-accent shrink-0" /><span className="text-foreground">Devolução prevista: <strong>{formatDateBR(endDate)}</strong></span></div>}
            </div>

            <div className="mb-3 max-w-xs">
              <div className="flex flex-col gap-1.5"><label className="text-sm font-medium text-foreground">Quantidade</label><div className="flex items-center border border-border rounded-xl overflow-hidden bg-input-background"><button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 hover:bg-muted transition-colors"><Minus size={14} /></button><span className="flex-1 text-center font-medium">{qty}</span><button type="button" onClick={() => setQty(Math.min(Number.isFinite(availableQuantity) ? Math.max(1, availableQuantity) : qty + 1, qty + 1))} className="px-3 py-2.5 hover:bg-muted transition-colors"><Plus size={14} /></button></div></div>
            </div>

            <div className="flex gap-3 mb-4 flex-wrap">
              {([ ["delivery", "Entrega em casa"], ["pickup", "Retirada no local"], ["arrange", "Combinar"] ] as const).map(([option, label]) => (
                <label key={option} className={cn("flex-1 min-w-36 flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-xl border-2 transition-all text-sm", delivery === option ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-foreground")}><input type="radio" name="delivery" value={option} checked={delivery === option} onChange={() => { setDelivery(option); setProductErrors((current) => ({ ...current, cep: "", deliverySlot: "" })); }} className="accent-primary" />{label}</label>
              ))}
            </div>

            {delivery === "delivery" && (
              <div className="mb-4 space-y-4">
                <AddressFields address={address} onChange={updateAddress} errors={productErrors} />
                <DeliverySlotSelect
                  settings={deliverySettings}
                  value={deliverySlot}
                  onChange={(value) => { setDeliverySlot(value); setProductErrors((current) => ({ ...current, deliverySlot: "" })); }}
                  required
                  error={productErrors.deliverySlot}
                />
                <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border text-sm", shippingEstimate ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800")}>
                  <Truck size={16} className="shrink-0" />
                  {!isCompleteShippingAddress(address)
                    ? <span>Preencha o endereço completo, incluindo número ou lote, para calcular o frete correto.</span>
                    : shippingPending
                      ? <span>Calculando a distância da entrega...</span>
                      : shippingEstimate
                        ? <span>Frete estimado: <strong>{formatMoneyFromCents(shippingEstimate.amountCents)}</strong><span className="block text-xs mt-0.5">Rota de {shippingEstimate.oneWayDistanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km a partir de {shippingEstimate.originLabel}.</span></span>
                        : <span>{shippingMessage || "Não foi possível calcular a entrega para este endereço."}</span>}
                </div>
              </div>
            )}

            {period && (
              <div className="bg-card rounded-xl p-4 mb-4 border border-border">
                {chairModel && selectedCover && <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Composição</span><span className="text-foreground text-right">{selectedCover.name}{selectedReducer ? ` + ${selectedReducer.name}` : " + sem redutor"}</span></div>}
                <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Período selecionado</span><span className="text-foreground font-medium">{period} dias</span></div>
                <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Produto-base</span><span className="text-foreground">{priceEstimate ? formatMoneyFromCents(priceEstimate.baseSubtotalCents) : formatMoneyFromCents(0)}</span></div>
                {priceEstimate && priceEstimate.coverSubtotalCents > 0 && <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Pano</span><span className="text-foreground">{formatMoneyFromCents(priceEstimate.coverSubtotalCents)}</span></div>}
                {priceEstimate && priceEstimate.reducerSubtotalCents > 0 && <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Redutor</span><span className="text-foreground">{formatMoneyFromCents(priceEstimate.reducerSubtotalCents)}</span></div>}
                {priceEstimate && priceEstimate.baseDiscountCents > 0 && <div className="flex justify-between text-sm mb-2 text-green-700"><span>Desconto de {priceEstimate.discountPercent}% na cadeira + pano</span><span>− {formatMoneyFromCents(priceEstimate.baseDiscountCents)}</span></div>}
                {priceEstimate && priceEstimate.reducerWaiverCents > 0 && <div className="flex justify-between text-sm mb-2 text-green-700"><span>Redutor grátis em 60/90 dias</span><span>− {formatMoneyFromCents(priceEstimate.reducerWaiverCents)}</span></div>}
                {priceEstimate && (priceEstimate.freeBaseCents > 0 || priceEstimate.freeComponentsCents > 0) && <div className="flex justify-between text-sm mb-2 text-green-700"><span>{priceEstimate.benefitType === "free_configuration" ? "Gratuidade da configuração" : "Gratuidade do produto-base"}</span><span>− {formatMoneyFromCents(priceEstimate.freeBaseCents + priceEstimate.freeComponentsCents)}</span></div>}
                {delivery === "delivery" && <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Frete</span><span className="text-foreground">{shippingEstimate ? formatMoneyFromCents(shippingEstimate.amountCents) : shippingPending ? "Calculando..." : "A calcular"}</span></div>}
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold"><span className="text-foreground">Total estimado</span><span className="text-primary">{formatMoneyFromCents(totalEstimateCents)}</span></div>
                <p className="text-xs text-muted-foreground mt-2">{pricingPending ? "Confirmando a regra de preço..." : officialPriceEstimate ? "Preço calculado pelo backend com a política vigente." : "Prévia local; o backend recalcula antes de registrar o orçamento."}</p>
              </div>
            )}

            {Object.values(productErrors).filter(Boolean).length > 0 && (
              <div role="alert" className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {Object.values(productErrors).filter(Boolean)[0]}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Btn variant="primary" fullWidth onClick={addToQuote} disabled={!canAddConfiguredProduct}>
                {quoteItemIds.includes(product.id) ? <><Check size={16} />Atualizar no orçamento</> : <><ShoppingBag size={16} />Adicionar ao orçamento</>}
              </Btn>
              {chairModel && !selectedCover && <p className="text-xs text-center text-muted-foreground">Escolha um pano antes de adicionar ao orçamento.</p>}
              {productWhatsAppUrl && <a href={productWhatsAppUrl} target="_blank" rel="noreferrer"><Btn variant="outline" fullWidth><MessageCircle size={16} />Falar sobre este produto</Btn></a>}
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800"><Info size={14} className="inline mr-1" />Confira sempre as recomendações do fabricante e as informações de idade e peso antes da utilização.</div>
        </div>
      </div>

      <div className="mb-16">
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors", activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>{tab.label}</button>)}
        </div>

        {activeTab === "descricao" && <div className="prose max-w-none text-foreground leading-relaxed"><p>{composedDescription}</p><div className="mt-6 grid sm:grid-cols-2 gap-4">{productDetailSections.map((section) => <div key={section.title} className="bg-secondary rounded-xl p-4 border border-border"><p className="font-semibold text-foreground mb-2">{section.title}</p><p className="text-sm text-muted-foreground whitespace-pre-line">{section.content || "Informação não cadastrada."}</p></div>)}</div></div>}
        {activeTab === "especificacoes" && <div className="grid sm:grid-cols-2 gap-4">{[["Categorias", categoryNames.join(", ") || "Sem categoria"], ["Marca", product.brand], ["Modelo", product.model], ["Faixa etária", `${product.ageMin} – ${product.ageMax}`], ["Peso máximo", product.weightMax], ["Dimensões", product.specs.dimensions], ["Peso do produto", product.specs.productWeight], ["Material", product.specs.material], ["Cor", selectedCover?.name ?? product.specs.color], ["Alimentação", product.specs.electric], ["Pano", selectedCover?.name ?? "Selecione na montagem"], ["Redutor", selectedReducer?.name ?? "Sem redutor"]].map(([key, value]) => <div key={key} className="flex justify-between py-2 px-4 bg-secondary rounded-xl border border-border text-sm"><span className="text-muted-foreground">{key}</span><span className="font-medium text-foreground text-right">{value}</span></div>)}<div className="sm:col-span-2 bg-secondary rounded-xl border border-border p-4"><p className="text-sm text-muted-foreground mb-2 font-medium">Itens inclusos:</p><div className="flex flex-wrap gap-2">{product.specs.includes.map((item) => <span key={item} className="text-xs bg-card border border-border px-2 py-1 rounded-lg text-foreground">{item}</span>)}</div></div></div>}
        {activeTab === "higienizacao" && <div className="max-w-2xl"><p className="text-muted-foreground leading-relaxed mb-4">Todos os nossos equipamentos passam por um processo cuidadoso de higienização entre cada locação. Você receberá o produto limpo, higienizado e pronto para uso.</p><div className="flex flex-col gap-3">{["Inspeção ao receber a devolução", "Desmontagem quando aplicável", "Limpeza adequada ao material", "Higienização de tecidos e superfícies", "Secagem completa", "Revisão de componentes", "Embalagem e preparação"].map((step, index) => <div key={step} className="flex items-center gap-3 p-3 bg-secondary rounded-xl border border-border"><div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{index + 1}</div><span className="text-sm text-foreground">{step}</span></div>)}</div></div>}
        {activeTab === "entrega" && <div className="max-w-2xl text-muted-foreground leading-relaxed"><p>A entrega é realizada dentro da nossa área de atendimento, em horários previamente combinados. A taxa de entrega e retirada é calculada conforme a região e informada no orçamento antes da confirmação.</p><p className="mt-4">A devolução deve ser realizada na data acordada no contrato. Em caso de atraso, uma taxa adicional poderá ser aplicada conforme descrito nas condições gerais de locação.</p></div>}
        {activeTab === "avaliacoes" && <ProductReviewsPanel rating={displayRating} reviewCount={displayReviewCount} reviews={reviewData.reviews} loading={reviewsLoading} />}
      </div>

      {related.length > 0 && <div><div className="flex items-center justify-between mb-6"><h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground">Produtos relacionados</h2><button onClick={() => navigate("catalog")} className="text-sm text-primary hover:underline">Ver todos</button></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{related.map((item) => <ProductCard key={item.id} product={item} categoryNames={getCategoryNames(item, publicCategories)} navigate={navigate} isComparing={false} onToggleCompare={() => undefined} showCompare={false} />)}</div></div>}
    </div>
  );
}
