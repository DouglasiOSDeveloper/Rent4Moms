import type { Page } from "../domain/shared/types";

const STATIC_PATHS: Record<Exclude<Page, "product" | "admin-order" | "account-order">, string> = {
  home: "/",
  catalog: "/produtos",
  compare: "/comparar",
  quote: "/orcamento",
  "quote-success": "/orcamento/sucesso",
  login: "/entrar",
  signup: "/criar-conta",
  "forgot-password": "/recuperar-senha",
  account: "/minha-conta",
  "account-quotes": "/minha-conta/orcamentos",
  "account-reservations": "/minha-conta/reservas",
  "account-contracts": "/minha-conta/contratos",
  "account-profile": "/minha-conta/dados",
  "how-it-works": "/como-funciona",
  "hygiene-page": "/higienizacao",
  about: "/sobre",
  faq: "/duvidas",
  contact: "/contato",
  "privacy-policy": "/politica-de-privacidade",
  "terms-of-use": "/termos-de-uso",
  "cancellation-policy": "/politica-de-cancelamento",
  "delivery-policy": "/entrega-e-retirada",
  "rental-contract": "/contrato-de-locacao",
  "cookie-preferences": "/preferencias-de-cookies",
  admin: "/admin",
  "admin-products": "/admin/produtos",
  "admin-quotes": "/admin/orcamentos",
  "admin-reservations": "/admin/reservas",
  "admin-clients": "/admin/clientes",
  "admin-inventory": "/admin/estoque",
  "admin-calendar": "/admin/agenda",
  "admin-delivery": "/admin/entregas",
  "admin-hygiene": "/admin/higienizacao",
  "admin-maintenance": "/admin/manutencao",
  "admin-reports": "/admin/relatorios",
  "admin-users": "/admin/usuarios",
  "admin-categories": "/admin/categorias",
  "admin-configurator": "/admin/montagem-4moms",
  "admin-customer-experience": "/admin/experiencia-cliente",
  "admin-content": "/admin/conteudo",
  "admin-config": "/admin/configuracoes",
  "admin-help": "/admin/ajuda",
};

export type NavigateToPage = (page: Page, params?: Record<string, string>) => void;

export function pagePath(page: Page, params?: Record<string, string>): string {
  if (page === "product") {
    return `/produtos/${params?.productId ?? "mamaroo-40"}`;
  }
  if (page === "admin-order") {
    return `/admin/orcamentos/${params?.quoteId ?? ""}`;
  }
  if (page === "account-order") {
    return `/minha-conta/pedidos/${params?.quoteId ?? ""}`;
  }

  const path = STATIC_PATHS[page];
  if (!params || Object.keys(params).length === 0) return path;
  const search = new URLSearchParams(params).toString();
  return search ? `${path}?${search}` : path;
}

export function pageFromPathname(pathname: string): Page {
  if (/^\/produtos\/[^/]+\/?$/.test(pathname)) return "product";
  if (/^\/admin\/orcamentos\/[^/]+\/?$/.test(pathname)) return "admin-order";
  if (/^\/minha-conta\/pedidos\/[^/]+\/?$/.test(pathname)) return "account-order";

  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const match = Object.entries(STATIC_PATHS).find(([, path]) => path === normalized);
  return (match?.[0] as Page | undefined) ?? "home";
}
