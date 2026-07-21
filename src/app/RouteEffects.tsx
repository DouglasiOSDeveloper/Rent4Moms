import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router";

function routeTitle(pathname: string): string {
  if (pathname === "/") return "Início";
  if (pathname.startsWith("/produtos/")) return "Detalhes do produto";
  if (pathname === "/produtos") return "Produtos";
  if (pathname.startsWith("/orcamento")) return "Orçamento";
  if (pathname.startsWith("/minha-conta/pedidos/")) return "Detalhes do pedido";
  if (pathname.startsWith("/minha-conta")) return "Minha conta";
  if (pathname.startsWith("/admin/orcamentos/")) return "Operação do pedido";
  if (pathname.startsWith("/admin")) return "Painel administrativo";
  if (pathname === "/entrar") return "Entrar";
  if (pathname === "/criar-conta") return "Criar conta";
  if (pathname === "/contato") return "Contato";
  if (pathname === "/sobre") return "Sobre nós";
  if (pathname === "/duvidas") return "Dúvidas frequentes";
  if (pathname === "/higienizacao") return "Higienização";
  if (pathname === "/como-funciona") return "Como funciona";
  return "Rent4Moms";
}

export function RouteEffects() {
  const { pathname } = useLocation();
  const title = useMemo(() => routeTitle(pathname), [pathname]);

  useEffect(() => {
    document.title = title === "Rent4Moms" ? title : `${title} | Rent4Moms`;
    const main = document.getElementById("main-content");
    main?.focus({ preventScroll: true });
  }, [pathname, title]);

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      Página carregada: {title}
    </div>
  );
}
