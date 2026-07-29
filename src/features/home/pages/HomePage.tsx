import React, { useEffect, useState } from "react";
import { Search, Calendar, MessageCircle, Package, Eye, DollarSign, ArrowRight, Shield, Leaf, Award, Info, Home, Droplets, Zap, Star } from "lucide-react";
import type { Page } from "../../../domain/shared/types";
import { getCategoryNames } from "../../../domain/catalog/selectors";
import { useCatalog } from "../../../stores/catalog/CatalogProvider";
import { Btn } from "../../../components/prototype/PrototypeUI";
import { ProductCard } from "../../../components/prototype/ProductCard";
import { useSiteContent } from "../../../stores/content/SiteContentProvider";
import { EmptyState, ErrorState, LoadingState } from "../../../components/states/DataState";
import { buildWhatsAppUrl } from "../../../lib/contact";
import { resolveApiResourceUrl } from "../../../services/api/apiClient";
import type { ProductReview } from "../../../domain/customerExperience/types";
import { listFeaturedReviews } from "../../../services/customerExperience/customerExperienceApi";

export function HomePage({ navigate }: {
  navigate: (p: Page, params?: Record<string, string>) => void;
}) {
  const { products, publicCategories, syncStatus, refreshCatalog } = useCatalog();
  const { siteSettings } = useSiteContent();
  const whatsappUrl = buildWhatsAppUrl(siteSettings.contact.whatsapp, siteSettings.whatsapp.defaultMessage);
  const institutionalImageUrl = siteSettings.institutionalImage
    ? resolveApiResourceUrl(`/api/v1/media/assets/${siteSettings.institutionalImage.assetId}/content`)
    : "";
  const featured = products.filter(p => p.featured);
  const publishedFaqs = [...siteSettings.faqs].filter((item) => item.isPublished).sort((left, right) => left.sortOrder - right.sortOrder).slice(0, 4);
  const [featuredReviews, setFeaturedReviews] = useState<ProductReview[]>([]);
  const [featuredReviewsLoading, setFeaturedReviewsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listFeaturedReviews()
      .then((reviews) => { if (active) setFeaturedReviews(reviews); })
      .catch(() => { if (active) setFeaturedReviews([]); })
      .finally(() => { if (active) setFeaturedReviewsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="flex flex-col">
      {/* Info bar */}
      <div className="bg-primary text-white text-center py-2.5 text-sm px-4">
        Equipamentos higienizados e revisados antes de cada locação.{" "}
        <button onClick={() => navigate("hygiene-page")} className="underline font-medium hover:opacity-80 transition-opacity">Conheça nosso processo</button>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
                {siteSettings.brand.tagline || "Conteúdo institucional ainda não publicado"}
              </h1>
              {siteSettings.brand.description ? (
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">{siteSettings.brand.description}</p>
              ) : (
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">A apresentação institucional será exibida após o cadastro no painel administrativo.</p>
              )}
              <div className="flex flex-wrap gap-3 justify-center">
                <Btn variant="primary" size="lg" onClick={() => navigate("catalog")}>
                  <Search size={18} />Encontrar uma cadeirinha
                </Btn>
                <Btn variant="outline" size="lg" onClick={() => navigate("how-it-works")}>
                  Como funciona <ArrowRight size={18} />
                </Btn>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/5" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-accent/5" />
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Droplets size={28} className="text-primary" />, title: "Higienizados", desc: "Processo completo antes de cada entrega" },
            { icon: <Shield size={28} className="text-primary" />, title: "Revisados", desc: "Verificação de componentes e segurança" },
            { icon: <Calendar size={28} className="text-primary" />, title: "Períodos flexíveis", desc: "Do mínimo necessário ao tempo que precisar" },
            { icon: <MessageCircle size={28} className="text-primary" />, title: "Atendimento próximo", desc: "Equipe disponível para orientar você" },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-3 p-6 bg-card rounded-2xl border border-border">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">{b.icon}</div>
              <p className="font-semibold text-foreground">{b.title}</p>
              <p className="text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-3">Explore por categoria</h2>
            <p className="text-muted-foreground">Encontre o equipamento ideal para cada momento</p>
          </div>
          {syncStatus === "loading" ? (
            <LoadingState title="Carregando categorias..." compact />
          ) : syncStatus === "error" ? (
            <ErrorState description="A API não respondeu e nenhum catálogo local foi usado." onRetry={() => void refreshCatalog()} compact />
          ) : publicCategories.length === 0 ? (
            <EmptyState title="Nenhuma categoria publicada" description="As categorias aparecerão aqui depois do cadastro no painel administrativo." compact />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {publicCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => navigate("catalog", { category: cat.id })}
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-primary hover:shadow-md transition-all text-center group"
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{cat.name}</p>
                  {cat.productCount > 0 && <p className="text-xs text-muted-foreground">{cat.productCount} produto{cat.productCount !== 1 ? "s" : ""}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-2">Produtos em destaque</h2>
            <p className="text-muted-foreground">Os equipamentos mais procurados pelas famílias</p>
          </div>
          <Btn variant="outline" onClick={() => navigate("catalog")}>Ver todos <ArrowRight size={16} /></Btn>
        </div>
        {syncStatus === "loading" ? (
          <LoadingState title="Carregando produtos..." />
        ) : syncStatus === "error" ? (
          <ErrorState description="Não exibimos produtos fictícios quando o catálogo está indisponível." onRetry={() => void refreshCatalog()} />
        ) : featured.length === 0 ? (
          <EmptyState title="Nenhum produto em destaque" description="Produtos publicados e marcados como destaque aparecerão nesta seção." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                categoryNames={getCategoryNames(p, publicCategories)}
                navigate={navigate}
                isComparing={false}
                onToggleCompare={() => undefined}
                showCompare={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-3">Como funciona</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Um processo simples, transparente e feito para facilitar a vida da sua família</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Escolha o produto", desc: "Navegue pelo catálogo e selecione o equipamento ideal para a faixa etária e necessidades do seu bebê." },
              { step: "02", title: "Informe o período", desc: "Selecione as datas de início e devolução. O sistema exibirá uma estimativa de valor conforme o período." },
              { step: "03", title: "Envie sua solicitação", desc: "Preencha seus dados e envie o orçamento. Nossa equipe analisará a disponibilidade e entrará em contato." },
              { step: "04", title: "Receba a confirmação", desc: "Após a análise, você receberá o orçamento final e as instruções para confirmar a reserva." },
            ].map((s, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center">
            <Info size={14} className="inline mr-1" />
            O envio da solicitação não representa confirmação automática da reserva.
          </div>
        </div>
      </section>

      {/* Why rent */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-6">Por que alugar faz sentido</h2>
            <div className="flex flex-col gap-4">
              {[
                { icon: <DollarSign size={18} className="text-primary" />, title: "Economia real", desc: "Equipamentos infantis de qualidade têm alto custo. Alugar pelo período necessário é muito mais acessível." },
                { icon: <Home size={18} className="text-primary" />, title: "Menos itens em casa", desc: "Equipamentos infantis ocupam espaço. Devolver ao fim do uso mantém sua casa organizada." },
                { icon: <Award size={18} className="text-primary" />, title: "Produtos de qualidade", desc: "Acesso a modelos premium pelo período exato em que seu bebê precisar." },
                { icon: <Leaf size={18} className="text-primary" />, title: "Escolha consciente", desc: "Alugar em vez de comprar reduz o desperdício e é uma escolha mais sustentável." },
              ].map((b, i) => (
                <div key={i} className="flex gap-4 p-4 bg-secondary rounded-xl border border-border">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">{b.icon}</div>
                  <div>
                    <p className="font-medium text-foreground">{b.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {institutionalImageUrl ? (
            <img
              src={institutionalImageUrl}
              alt={siteSettings.institutionalImage?.alt || "Imagem institucional da Rent4Moms"}
              className="w-full min-h-80 max-h-[460px] rounded-2xl border border-border object-cover shadow-sm"
            />
          ) : (
            <EmptyState title="Imagem institucional não cadastrada" description="A mídia oficial será exibida após o upload no módulo de conteúdo." />
          )}
        </div>
      </section>

      {/* Hygiene process */}
      <section className="bg-secondary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-3">Processo de higienização</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Cada equipamento passa por etapas cuidadosas entre uma locação e outra</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Eye size={20} />, title: "Inspeção", desc: "Conferência completa do estado do produto ao receber a devolução" },
              { icon: <Droplets size={20} />, title: "Limpeza e higienização", desc: "Limpeza adequada a cada material, tecidos e superfícies" },
              { icon: <Zap size={20} />, title: "Secagem", desc: "Secagem completa para garantir que nada chegue úmido ao próximo cliente" },
              { icon: <Package size={20} />, title: "Embalagem", desc: "Preparação, organização de acessórios e embalagem para a próxima entrega" },
            ].map((s, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">{s.icon}</div>
                <h4 className="font-semibold text-foreground mb-2">{s.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Btn variant="outline" onClick={() => navigate("hygiene-page")}>Conhecer o processo completo <ArrowRight size={16} /></Btn>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-2">O que dizem as famílias</h2>
        </div>
        {featuredReviewsLoading ? <LoadingState title="Carregando avaliações..." compact /> : featuredReviews.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{featuredReviews.map((review) => <article key={review.id} className="rounded-2xl border border-border bg-card p-6"><div className="mb-3 flex gap-0.5 text-amber-400">{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={15} fill={value <= review.rating ? "currentColor" : "none"} />)}</div><p className="text-sm leading-relaxed text-muted-foreground">“{review.comment}”</p><div className="mt-4 border-t border-border pt-3"><p className="text-sm font-medium text-foreground">{review.customerDisplayName}</p><p className="text-xs text-muted-foreground">{review.productName}</p></div></article>)}</div> : <EmptyState title="Nenhuma avaliação publicada" description="Avaliações reais selecionadas no painel administrativo aparecerão aqui." />}
      </section>

      {/* FAQ */}
      <section className="bg-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-2">Dúvidas frequentes</h2>
          </div>
          {publishedFaqs.length ? <div className="space-y-3">{publishedFaqs.map((item) => <details key={item.id} className="group rounded-2xl border border-border bg-card p-5 text-left"><summary className="cursor-pointer list-none font-medium text-foreground">{item.question}</summary><p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{item.answer}</p></details>)}</div> : <EmptyState title="Nenhuma dúvida publicada" description="As perguntas frequentes serão exibidas quando forem cadastradas no conteúdo do site." compact />}
          <div className="text-center mt-6">
            <Btn variant="outline" onClick={() => navigate("faq")}>Ver todas as dúvidas <ArrowRight size={16} /></Btn>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-4">Encontre o equipamento ideal para este momento.</h2>
          <p className="text-muted-foreground mb-8">Vamos encontrar juntos a opção que melhor se encaixa na fase do seu bebê e na sua rotina.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Btn variant="primary" size="lg" onClick={() => navigate("catalog")}>
              <Search size={18} />Ver produtos
            </Btn>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                <Btn variant="outline" size="lg">
                  <MessageCircle size={18} />Falar no WhatsApp
                </Btn>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

