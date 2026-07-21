import React, { useState } from "react";
import {
  Menu, X, ShoppingBag, Heart, Star, ChevronDown, ChevronRight, ChevronLeft,
  ChevronUp, Search, Filter, MapPin, Calendar, Phone, Mail, Instagram,
  MessageCircle, User, Settings, LogOut, Bell, Package, FileText, Truck,
  Wrench, CheckCircle, Clock, AlertCircle, XCircle, Eye, Edit, Trash2,
  Plus, Download, BarChart2, Users, DollarSign, TrendingUp, ArrowRight,
  Shield, Leaf, Award, Info, Lock, Check, Home, List, Tag, Archive,
  Layers, Droplets, Clipboard, Activity, Hash, RefreshCw, Upload,
  MoreHorizontal, Minus, BookOpen, Globe, Zap
} from "lucide-react";
import type { AuthState, Page } from "../../domain/shared/types";
import { Btn, cn } from "../prototype/PrototypeUI";
import { useSiteContent } from "../../stores/content/SiteContentProvider";

export function Header({ currentPage, navigate, quoteCount, auth, onLogout }: {
  currentPage: Page; navigate: (p: Page) => void; quoteCount: number;
  auth: AuthState; onLogout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { siteSettings } = useSiteContent();
  const navLinks: { label: string; page: Page }[] = [
    { label: "Início", page: "home" },
    { label: "Produtos", page: "catalog" },
    { label: "Como funciona", page: "how-it-works" },
    { label: "Higienização", page: "hygiene-page" },
    { label: "Sobre nós", page: "about" },
    { label: "Dúvidas", page: "faq" },
    { label: "Contato", page: "contact" },
  ];
  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button type="button" aria-label="Ir para a página inicial" onClick={() => navigate("home")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">R4</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-foreground tracking-tight">
              {siteSettings.brand.name}
            </span>
          </button>

          <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-6">
            {navLinks.map(l => (
              <button
                key={l.page}
                onClick={() => navigate(l.page)}
                className={cn("text-sm transition-colors", currentPage === l.page ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground")}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Abrir orçamento com ${quoteCount} item(ns)`}
              onClick={() => navigate("quote")}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShoppingBag size={20} />
              {quoteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{quoteCount}</span>
              )}
            </button>
            {auth === "guest" ? (
              <>
                <Btn variant="ghost" size="sm" onClick={() => navigate("login")} className="hidden sm:inline-flex">Entrar</Btn>
                <Btn variant="primary" size="sm" onClick={() => navigate("quote")}>
                  <span className="hidden sm:inline">Fazer orçamento</span>
                  <span className="sm:hidden">Orçamento</span>
                </Btn>
              </>
            ) : auth === "client" ? (
              <div className="flex items-center gap-2">
                <Btn variant="ghost" size="sm" onClick={() => navigate("account")}><User size={16} />Minha conta</Btn>
                <button type="button" aria-label="Sair da conta" onClick={onLogout} className="p-2 text-muted-foreground hover:text-foreground"><LogOut size={16} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Btn variant="ghost" size="sm" onClick={() => navigate("admin")}><Settings size={16} />Admin</Btn>
                <button type="button" aria-label="Sair da conta" onClick={onLogout} className="p-2 text-muted-foreground hover:text-foreground"><LogOut size={16} /></button>
              </div>
            )}
            <button type="button" aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-muted-foreground">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation" className="lg:hidden border-t border-border bg-card">
          <div className="px-4 py-4 flex flex-col gap-2">
            {navLinks.map(l => (
              <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }}
                className="text-left py-2 px-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

