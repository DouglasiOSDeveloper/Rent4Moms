import React, { useState, useCallback, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
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

// ─── TYPES ──────────────────────────────────────────────────────────────────

type Page =
  | "home" | "catalog" | "product" | "compare"
  | "quote" | "quote-success"
  | "login" | "signup" | "forgot-password"
  | "account" | "account-quotes" | "account-reservations" | "account-contracts" | "account-profile"
  | "how-it-works" | "hygiene-page" | "about" | "faq" | "contact"
  | "admin" | "admin-products" | "admin-quotes" | "admin-reservations"
  | "admin-clients" | "admin-calendar" | "admin-delivery" | "admin-hygiene"
  | "admin-reports" | "admin-users" | "admin-config";

type AuthState = "guest" | "client" | "admin";

interface Product {
  id: string; name: string; brand: string; model: string;
  category: string; categorySlug: string;
  ageMin: string; ageMax: string; weightMax: string;
  priceDaily: number; priceWeekly: number; priceMonthly: number;
  status: "available" | "few_units" | "on_demand" | "unavailable";
  description: string; rating: number; reviews: number;
  photo: string; featured: boolean; conservation: string;
  tags: string[]; minDays: number;
  specs: { dimensions: string; productWeight: string; material: string; color: string; electric: string; includes: string[] };
}

interface QuoteItem { product: Product; days: number; startDate: string; endDate: string; qty: number }
interface Customer { id: string; name: string; cpf: string; email: string; phone: string; city: string; status: string; since: string; orders: number }
interface QuoteRecord { id: string; customer: string; products: string; period: string; value: string; status: string; date: string; updatedAt: string }
interface Reservation { id: string; customer: string; product: string; unit: string; start: string; end: string; status: string; address: string; payment: string }

interface ShippingZone {
  id: number; name: string; cepPrefix: string; rate: number; description: string;
}

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const PRODUCTS: Product[] = [
  {
    id: "mamaroo-40", name: "MamaRoo 4.0", brand: "4moms", model: "Classic Grey",
    category: "Cadeiras de balanço", categorySlug: "cadeiras-de-balanco",
    ageMin: "0 meses", ageMax: "6 meses", weightMax: "9 kg",
    priceDaily: 29, priceWeekly: 149, priceMonthly: 399,
    status: "available", conservation: "Muito bom",
    description: "Cadeira de balanço eletrônica com 5 movimentos únicos inspirados nos pais. Conexão Bluetooth e sons naturais. Um dos modelos mais procurados pelas famílias.",
    rating: 4.9, reviews: 31, featured: true, minDays: 7,
    photo: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=450&fit=crop&auto=format",
    tags: ["eletrônica", "bluetooth", "5 movimentos", "sons naturais"],
    specs: { dimensions: "73×56×96 cm", productWeight: "5,5 kg", material: "Plástico ABS + tecido removível", color: "Cinza clássico", electric: "Bateria ou adaptador AC", includes: ["Cadeira MamaRoo", "Adaptador AC", "Manual"] },
  },
  {
    id: "chicco-nextfit", name: "NextFit Sport", brand: "Chicco", model: "NextFit Sport Black",
    category: "Cadeirinhas para carro", categorySlug: "cadeirinhas-para-carro",
    ageMin: "0 meses", ageMax: "4 anos", weightMax: "27 kg",
    priceDaily: 35, priceWeekly: 189, priceMonthly: 499,
    status: "available", conservation: "Bom",
    description: "Cadeirinha conversível com 9 posições de recline. Aprovada pelos principais testes de segurança. Ideal para bebês recém-nascidos até crianças maiores.",
    rating: 4.7, reviews: 18, featured: true, minDays: 7,
    photo: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=450&fit=crop&auto=format",
    tags: ["conversível", "recline", "isofix", "segurança"],
    specs: { dimensions: "44×68×64 cm", productWeight: "8,2 kg", material: "Aço + espuma EPS + tecido", color: "Preto", electric: "Não", includes: ["Cadeirinha", "Capa de proteção", "Manual"] },
  },
  {
    id: "graco-turbobooster", name: "TurboBooster LX", brand: "Graco", model: "TurboBooster LX",
    category: "Cadeirinhas para carro", categorySlug: "cadeirinhas-para-carro",
    ageMin: "3 anos", ageMax: "10 anos", weightMax: "54 kg",
    priceDaily: 22, priceWeekly: 110, priceMonthly: 290,
    status: "few_units", conservation: "Bom",
    description: "Assento de elevação com apoio lateral de proteção. Encosto removível para uso como booster simples. Ótimo custo-benefício para crianças maiores.",
    rating: 4.5, reviews: 12, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&h=450&fit=crop&auto=format",
    tags: ["booster", "encosto removível", "proteção lateral"],
    specs: { dimensions: "40×46×66 cm", productWeight: "4,1 kg", material: "Polipropileno + tecido", color: "Cinza e azul", electric: "Não", includes: ["Assento", "Encosto", "Manual"] },
  },
  {
    id: "fisher-highchair", name: "SpaceSaver High Chair", brand: "Fisher-Price", model: "SpaceSaver Deluxe",
    category: "Cadeiras de alimentação", categorySlug: "cadeiras-de-alimentacao",
    ageMin: "6 meses", ageMax: "3 anos", weightMax: "18 kg",
    priceDaily: 18, priceWeekly: 89, priceMonthly: 230,
    status: "available", conservation: "Muito bom",
    description: "Cadeira de alimentação compacta que encaixa em uma cadeira comum. Bandeja removível e lavável. Perfeita para apartamentos e espaços menores.",
    rating: 4.6, reviews: 24, featured: true, minDays: 5,
    photo: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=450&fit=crop&auto=format",
    tags: ["compacta", "bandeja lavável", "para apartamento"],
    specs: { dimensions: "35×40×30 cm (na cadeira)", productWeight: "2,3 kg", material: "Plástico + tecido acolchoado", color: "Bege", electric: "Não", includes: ["Assento", "Bandeja", "Cinto 5 pontos", "Manual"] },
  },
  {
    id: "ingenuity-boutique", name: "Boutique Collection Swing", brand: "Ingenuity", model: "Boutique Collection 2-in-1",
    category: "Cadeiras de balanço", categorySlug: "cadeiras-de-balanco",
    ageMin: "0 meses", ageMax: "9 meses", weightMax: "11 kg",
    priceDaily: 25, priceWeekly: 119, priceMonthly: 299,
    status: "available", conservation: "Muito bom",
    description: "Balanço 2 em 1 que converte em cadeira vibratória portátil. 6 velocidades e músicas embutidas. Dobrável para facilitar o transporte.",
    rating: 4.4, reviews: 15, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&h=450&fit=crop&auto=format",
    tags: ["2 em 1", "vibratória", "dobrável", "músicas"],
    specs: { dimensions: "58×80×98 cm", productWeight: "6,3 kg", material: "Plástico + tecido lavável", color: "Cinza e nude", electric: "Bateria (4 D)", includes: ["Balanço", "Brinquedos removíveis", "Manual"] },
  },
  {
    id: "mamaroo-sleep", name: "MamaRoo Sleep", brand: "4moms", model: "MamaRoo Sleep Bassinet",
    category: "Bebês-conforto", categorySlug: "bebes-conforto",
    ageMin: "0 meses", ageMax: "6 meses", weightMax: "9 kg",
    priceDaily: 39, priceWeekly: 199, priceMonthly: 520,
    status: "on_demand", conservation: "Excelente",
    description: "Berço inteligente com movimentos naturais que reproduzem o colo dos pais. 5 movimentos, ruído branco integrado e monitoramento via app.",
    rating: 4.8, reviews: 9, featured: true, minDays: 14,
    photo: "https://images.unsplash.com/photo-1548544027-7c9c78b58a0d?w=600&h=450&fit=crop&auto=format",
    tags: ["berço inteligente", "ruído branco", "app", "premium"],
    specs: { dimensions: "84×58×92 cm", productWeight: "9,1 kg", material: "Alumínio + tecido respirável", color: "Cinza", electric: "Sim (bivolt)", includes: ["Berço", "Lençol", "Adaptador", "Manual"] },
  },
  {
    id: "chicco-artsana", name: "Polly 2 Start", brand: "Chicco", model: "Polly 2 Start",
    category: "Cadeiras de alimentação", categorySlug: "cadeiras-de-alimentacao",
    ageMin: "0 meses", ageMax: "3 anos", weightMax: "15 kg",
    priceDaily: 20, priceWeekly: 98, priceMonthly: 259,
    status: "available", conservation: "Bom",
    description: "Cadeira de alimentação evolutiva que acompanha o bebê do nascimento aos 3 anos. 7 posições de recline, bandeja bipartida e pés antiderrapantes.",
    rating: 4.6, reviews: 20, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop&auto=format",
    tags: ["evolutiva", "recline", "bandeja bipartida"],
    specs: { dimensions: "52×78×98 cm", productWeight: "7,5 kg", material: "Plástico + tecido", color: "Rosa nude", electric: "Não", includes: ["Cadeira", "Bandeja", "Redutor recém-nascido", "Manual"] },
  },
  {
    id: "joie-stages", name: "Stages FX", brand: "Joie", model: "Stages FX ISOFIX",
    category: "Cadeirinhas para carro", categorySlug: "cadeirinhas-para-carro",
    ageMin: "0 meses", ageMax: "7 anos", weightMax: "25 kg",
    priceDaily: 32, priceWeekly: 165, priceMonthly: 429,
    status: "few_units", conservation: "Muito bom",
    description: "Cadeirinha 3 em 1 com ISOFIX que cresce com a criança. Posição rearfacing para recém-nascidos, conversível e booster. Testada para múltiplos impactos.",
    rating: 4.7, reviews: 14, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1617952547479-0f8b6cc45dc3?w=600&h=450&fit=crop&auto=format",
    tags: ["3 em 1", "isofix", "rearfacing", "evolutiva"],
    specs: { dimensions: "46×65×75 cm", productWeight: "9,8 kg", material: "Aço + EPS + tecido", color: "Grafite", electric: "Não", includes: ["Cadeirinha", "Redutor", "Manual"] },
  },
];

const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  { id: 1, name: "São Paulo Capital", cepPrefix: "01,02,03,04,05,06,07,08,09", rate: 25, description: "CEPs 01000-000 a 09999-999" },
  { id: 2, name: "Grande São Paulo", cepPrefix: "06,07,08,09,11,12,13,14,15,16", rate: 40, description: "Região metropolitana de SP" },
  { id: 3, name: "Interior de SP / RJ Capital", cepPrefix: "17,18,19,20,21,22,23,24,25,26,27,28", rate: 60, description: "Interior SP e Rio de Janeiro" },
  { id: 4, name: "Outras capitais / Sul", cepPrefix: "29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99", rate: 80, description: "Demais estados" },
];

function calcShipping(cep: string, zones: ShippingZone[]): number | null {
  const clean = cep.replace(/\D/g, "");
  if (clean.length < 5) return null;
  const prefix2 = clean.slice(0, 2);
  for (const zone of zones) {
    const prefixes = zone.cepPrefix.split(",").map(p => p.trim());
    if (prefixes.includes(prefix2)) return zone.rate;
  }
  return null;
}

function addDays(dateStr: string, days: number): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDateBR(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, day] = isoDate.split("-");
  return `${day}/${m}/${y}`;
}

const CATEGORIES = [
  { id: "cadeiras-de-balanco", name: "Cadeiras de balanço", count: 3, icon: "🪑", color: "bg-amber-50 border-amber-200" },
  { id: "bebes-conforto", name: "Bebês-conforto", count: 1, icon: "🛏️", color: "bg-rose-50 border-rose-200" },
  { id: "cadeirinhas-para-carro", name: "Cadeirinhas para carro", count: 3, icon: "🚗", color: "bg-blue-50 border-blue-200" },
  { id: "cadeiras-de-alimentacao", name: "Cadeiras de alimentação", count: 2, icon: "🍼", color: "bg-green-50 border-green-200" },
  { id: "assentos-de-apoio", name: "Assentos de apoio", count: 0, icon: "🪆", color: "bg-purple-50 border-purple-200" },
  { id: "outros", name: "Outros equipamentos", count: 0, icon: "📦", color: "bg-gray-50 border-gray-200" },
];

const CUSTOMERS: Customer[] = [
  { id: "c001", name: "Ana Clara Ferreira", cpf: "•••.356.•••-84", email: "anaclara@email.com", phone: "(11) 9•••-4521", city: "São Paulo, SP", status: "Ativo", since: "Mar 2024", orders: 3 },
  { id: "c002", name: "Beatriz Oliveira", cpf: "•••.741.•••-20", email: "beatriz.oli@email.com", phone: "(11) 9•••-7834", city: "Guarulhos, SP", status: "Ativo", since: "Jan 2024", orders: 1 },
  { id: "c003", name: "Carla Menezes", cpf: "•••.128.•••-55", email: "carla.m@email.com", phone: "(21) 9•••-3312", city: "Rio de Janeiro, RJ", status: "Ativo", since: "Abr 2024", orders: 2 },
  { id: "c004", name: "Daniela Rocha", cpf: "•••.904.•••-11", email: "daniela.r@email.com", phone: "(11) 9•••-6621", city: "Osasco, SP", status: "Inativo", since: "Dez 2023", orders: 1 },
  { id: "c005", name: "Fernanda Lima", cpf: "•••.512.•••-78", email: "fernanda.l@email.com", phone: "(11) 9•••-2284", city: "Campinas, SP", status: "Ativo", since: "Mai 2024", orders: 4 },
  { id: "c006", name: "Gabriela Santos", cpf: "•••.267.•••-33", email: "gabriela.s@email.com", phone: "(31) 9•••-9945", city: "Belo Horizonte, MG", status: "Ativo", since: "Fev 2024", orders: 2 },
];

const QUOTES_DATA: QuoteRecord[] = [
  { id: "ORC-2024-0041", customer: "Ana Clara Ferreira", products: "MamaRoo 4.0", period: "15 a 30/06/2024", value: "R$ 298,00", status: "Em análise", date: "12/06/2024", updatedAt: "12/06/2024" },
  { id: "ORC-2024-0040", customer: "Beatriz Oliveira", products: "NextFit Sport", period: "01 a 20/07/2024", value: "R$ 399,00", status: "Orçamento enviado", date: "10/06/2024", updatedAt: "11/06/2024" },
  { id: "ORC-2024-0039", customer: "Carla Menezes", products: "MamaRoo Sleep", period: "20/06 a 20/07/2024", value: "R$ 520,00", status: "Aprovado", date: "08/06/2024", updatedAt: "09/06/2024" },
  { id: "ORC-2024-0038", customer: "Daniela Rocha", products: "TurboBooster LX", period: "05 a 12/07/2024", value: "R$ 110,00", status: "Aguardando informações", date: "07/06/2024", updatedAt: "07/06/2024" },
  { id: "ORC-2024-0037", customer: "Fernanda Lima", products: "Boutique Swing + SpaceSaver", period: "01 a 30/07/2024", value: "R$ 529,00", status: "Convertido em reserva", date: "05/06/2024", updatedAt: "06/06/2024" },
  { id: "ORC-2024-0036", customer: "Gabriela Santos", products: "Polly 2 Start", period: "10 a 25/06/2024", value: "R$ 230,00", status: "Recusado", date: "02/06/2024", updatedAt: "03/06/2024" },
  { id: "ORC-2024-0035", customer: "Ana Clara Ferreira", products: "Stages FX", period: "20/06 a 04/07/2024", value: "R$ 330,00", status: "Enviado", date: "01/06/2024", updatedAt: "01/06/2024" },
  { id: "ORC-2024-0034", customer: "Fernanda Lima", products: "MamaRoo 4.0", period: "01 a 14/06/2024", value: "R$ 249,00", status: "Concluído", date: "25/05/2024", updatedAt: "15/06/2024" },
  { id: "ORC-2024-0033", customer: "Beatriz Oliveira", products: "SpaceSaver Chair", period: "15 a 22/06/2024", value: "R$ 89,00", status: "Expirado", date: "20/05/2024", updatedAt: "22/05/2024" },
  { id: "ORC-2024-0032", customer: "Carla Menezes", products: "NextFit Sport", period: "01 a 15/06/2024", value: "R$ 270,00", status: "Cancelado", date: "18/05/2024", updatedAt: "19/05/2024" },
];

const RESERVATIONS: Reservation[] = [
  { id: "RES-2024-0019", customer: "Fernanda Lima", product: "MamaRoo 4.0", unit: "RM-MR40-002", start: "01/07/2024", end: "31/07/2024", status: "Confirmada", address: "R. das Flores, 142 — Campinas, SP", payment: "Aprovado" },
  { id: "RES-2024-0018", customer: "Ana Clara Ferreira", product: "NextFit Sport", unit: "RM-NF01-001", start: "15/06/2024", end: "05/07/2024", status: "Locação ativa", address: "Av. Paulista, 900 — São Paulo, SP", payment: "Aprovado" },
  { id: "RES-2024-0017", customer: "Carla Menezes", product: "MamaRoo Sleep", unit: "RM-MS01-001", start: "20/06/2024", end: "20/07/2024", status: "Em preparação", address: "R. Copacabana, 55 — Rio de Janeiro, RJ", payment: "Aprovado" },
  { id: "RES-2024-0016", customer: "Gabriela Santos", product: "Stages FX", unit: "RM-SF01-002", start: "10/06/2024", end: "24/06/2024", status: "Em higienização", address: "R. dos Caetés, 780 — Belo Horizonte, MG", payment: "Aprovado" },
  { id: "RES-2024-0015", customer: "Fernanda Lima", product: "Boutique Swing", unit: "RM-BS01-001", start: "01/06/2024", end: "30/06/2024", status: "Concluída", address: "R. das Flores, 142 — Campinas, SP", payment: "Aprovado" },
  { id: "RES-2024-0014", customer: "Beatriz Oliveira", product: "Polly 2 Start", unit: "RM-P2S-001", start: "05/06/2024", end: "20/06/2024", status: "Aguardando devolução", address: "R. Guarulhos, 33 — Guarulhos, SP", payment: "Aprovado" },
  { id: "RES-2024-0013", customer: "Daniela Rocha", product: "TurboBooster LX", unit: "RM-TB01-001", start: "01/05/2024", end: "15/05/2024", status: "Concluída", address: "R. dos Andrades, 200 — Osasco, SP", payment: "Aprovado" },
  { id: "RES-2024-0012", customer: "Ana Clara Ferreira", product: "MamaRoo 4.0", unit: "RM-MR40-001", start: "10/04/2024", end: "10/05/2024", status: "Concluída", address: "Av. Paulista, 900 — São Paulo, SP", payment: "Aprovado" },
];

const CHART_MONTHLY = [
  { mes: "Jan", solicitacoes: 42, locacoes: 31 },
  { mes: "Fev", solicitacoes: 38, locacoes: 28 },
  { mes: "Mar", solicitacoes: 55, locacoes: 41 },
  { mes: "Abr", solicitacoes: 71, locacoes: 58 },
  { mes: "Mai", solicitacoes: 89, locacoes: 73 },
  { mes: "Jun", solicitacoes: 94, locacoes: 82 },
];

const CHART_REVENUE = [
  { mes: "Jan", receita: 8420, meta: 9000 },
  { mes: "Fev", receita: 7650, meta: 9000 },
  { mes: "Mar", receita: 10240, meta: 9500 },
  { mes: "Abr", receita: 13820, meta: 11000 },
  { mes: "Mai", receita: 16750, meta: 13000 },
  { mes: "Jun", receita: 19340, meta: 15000 },
];

const CHART_PRODUCTS = [
  { name: "MamaRoo 4.0", value: 34 },
  { name: "NextFit Sport", value: 22 },
  { name: "MamaRoo Sleep", value: 18 },
  { name: "Polly 2 Start", value: 14 },
  { name: "Outros", value: 12 },
];

const TESTIMONIALS = [
  { name: "Ana C.", city: "São Paulo, SP", product: "MamaRoo 4.0", text: "A cadeira chegou higienizada e em perfeito estado. Minha filha adorou os movimentos. Facilitou muito as noites de cólica.", rating: 5 },
  { name: "Beatriz O.", city: "Guarulhos, SP", product: "NextFit Sport", text: "Precisávamos de uma cadeirinha para viagem e alugar foi perfeito. Não precisei gastar com um item que usaria apenas uma vez.", rating: 5 },
  { name: "Carla M.", city: "Rio de Janeiro, RJ", product: "Boutique Swing", text: "Atendimento cuidadoso do início ao fim. A equipe orientou qual modelo era mais indicado para a idade do meu bebê.", rating: 5 },
  { name: "Fernanda L.", city: "Campinas, SP", product: "MamaRoo 4.0 + SpaceSaver", text: "Alugamos dois produtos e foi muito mais econômico do que comprar. Produtos em ótimo estado.", rating: 4 },
  { name: "Gabriela S.", city: "Belo Horizonte, MG", product: "Stages FX", text: "Processo de orçamento simples. Recebemos o retorno rápido da equipe e a entrega foi pontual.", rating: 5 },
];

const FAQ_ITEMS = [
  { q: "Como funciona o aluguel?", a: "Você escolhe o produto, informa o período desejado e envia uma solicitação de orçamento. Nossa equipe analisa a disponibilidade e retorna com a confirmação e o valor final. A reserva é confirmada apenas após essa análise." },
  { q: "Como verifico a disponibilidade?", a: "Selecione o produto desejado, informe as datas e o CEP. A plataforma indicará uma estimativa de disponibilidade. A confirmação final é feita pela equipe Rent4Moms." },
  { q: "Os produtos são higienizados?", a: "Sim. Todos os produtos passam por um processo completo de limpeza, higienização e revisão antes de cada nova locação. Você recebe um produto pronto para uso." },
  { q: "Posso renovar o período?", a: "Sim, desde que o produto esteja disponível. Acesse a área do cliente, selecione sua locação ativa e solicite a renovação. Nossa equipe confirmará a disponibilidade." },
  { q: "Como funciona a entrega?", a: "Realizamos entrega no endereço informado dentro da nossa área de atendimento. Você também pode retirar pessoalmente, conforme disponibilidade. A taxa de entrega varia conforme a região e é informada no orçamento." },
  { q: "O que acontece em caso de avaria?", a: "Ao receber o produto, faça uma conferência. Qualquer avaria preexistente deve ser reportada imediatamente. Danos causados durante a locação são avaliados individualmente pela equipe." },
  { q: "Existe caução?", a: "A necessidade e o valor da caução dependem do produto e do período. Essa informação é detalhada no orçamento e no contrato antes da confirmação da reserva." },
  { q: "Como funciona o cancelamento?", a: "As condições de cancelamento estão descritas na Política de Cancelamento e no contrato de locação. Recomendamos a leitura antes da confirmação." },
  { q: "A reserva é confirmada imediatamente?", a: "Não. O envio da solicitação inicia uma análise por parte da equipe Rent4Moms. A reserva é confirmada apenas após essa validação, que inclui disponibilidade do produto, período e região de atendimento." },
];

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

function Btn({
  children, variant = "primary", size = "md", onClick, disabled, className, type = "button", fullWidth
}: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg"; onClick?: () => void; disabled?: boolean;
  className?: string; type?: "button" | "submit"; fullWidth?: boolean;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-base", lg: "px-7 py-3.5 text-base" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-[#B35C41] active:scale-[0.98] shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-muted border border-border",
    outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:bg-red-700",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(base, sizes[size], variants[variant], fullWidth && "w-full", disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: React.ReactNode }> = {
    "Em análise": { color: "bg-blue-50 text-blue-700 border border-blue-200", icon: <Clock size={11} /> },
    "Orçamento enviado": { color: "bg-amber-50 text-amber-700 border border-amber-200", icon: <FileText size={11} /> },
    "Aprovado": { color: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle size={11} /> },
    "Aguardando informações": { color: "bg-orange-50 text-orange-700 border border-orange-200", icon: <AlertCircle size={11} /> },
    "Convertido em reserva": { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <Check size={11} /> },
    "Concluído": { color: "bg-gray-50 text-gray-600 border border-gray-200", icon: <CheckCircle size={11} /> },
    "Concluída": { color: "bg-gray-50 text-gray-600 border border-gray-200", icon: <CheckCircle size={11} /> },
    "Recusado": { color: "bg-red-50 text-red-700 border border-red-200", icon: <XCircle size={11} /> },
    "Expirado": { color: "bg-gray-50 text-gray-500 border border-gray-200", icon: <Clock size={11} /> },
    "Cancelado": { color: "bg-red-50 text-red-700 border border-red-200", icon: <XCircle size={11} /> },
    "Cancelada": { color: "bg-red-50 text-red-700 border border-red-200", icon: <XCircle size={11} /> },
    "Enviado": { color: "bg-blue-50 text-blue-600 border border-blue-200", icon: <ArrowRight size={11} /> },
    "Confirmada": { color: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle size={11} /> },
    "Locação ativa": { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <Activity size={11} /> },
    "Em preparação": { color: "bg-purple-50 text-purple-700 border border-purple-200", icon: <Package size={11} /> },
    "Em higienização": { color: "bg-cyan-50 text-cyan-700 border border-cyan-200", icon: <Droplets size={11} /> },
    "Aguardando devolução": { color: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock size={11} /> },
    "Ativo": { color: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle size={11} /> },
    "Inativo": { color: "bg-gray-50 text-gray-500 border border-gray-200", icon: <Minus size={11} /> },
  };
  const style = map[status] || { color: "bg-gray-50 text-gray-600 border border-gray-200", icon: <Hash size={11} /> };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", style.color)}>
      {style.icon}{status}
    </span>
  );
}

function AvailabilityBadge({ status }: { status: Product["status"] }) {
  const map = {
    available: { label: "Disponível", cls: "bg-green-100 text-green-700" },
    few_units: { label: "Poucas unidades", cls: "bg-amber-100 text-amber-700" },
    on_demand: { label: "Sob consulta", cls: "bg-gray-100 text-gray-600" },
    unavailable: { label: "Indisponível", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = map[status];
  return <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cls)}>{label}</span>;
}

function Input({ label, placeholder, type = "text", value, onChange, helper, required, icon }: {
  label?: string; placeholder?: string; type?: string; value?: string;
  onChange?: (v: string) => void; helper?: string; required?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}{required && <span className="text-primary ml-0.5">*</span>}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all",
            icon && "pl-10"
          )}
        />
      </div>
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

function Select({ label, options, value, onChange }: {
  label?: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="bg-card">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-secondary transition-colors"
          >
            <span className="font-medium text-foreground">{item.q}</span>
            {open === i ? <ChevronUp size={18} className="text-primary shrink-0" /> : <ChevronDown size={18} className="text-muted-foreground shrink-0" />}
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-muted-foreground leading-relaxed">{item.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
              i < current ? "bg-primary text-white" :
              i === current ? "bg-primary text-white ring-4 ring-primary/20" :
              "bg-muted text-muted-foreground"
            )}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span className={cn("text-xs font-medium hidden sm:block", i === current ? "text-primary" : "text-muted-foreground")}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("flex-1 h-0.5 mx-2 mb-5", i < current ? "bg-primary" : "bg-muted")} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({ product, navigate, onAddToQuote, isInQuote, isComparing, onToggleCompare }: {
  product: Product; navigate: (p: Page, params?: Record<string, string>) => void;
  onAddToQuote: (p: Product) => void; isInQuote: boolean; isComparing: boolean;
  onToggleCompare: (id: string) => void;
}) {
  const [fav, setFav] = useState(false);
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={product.photo}
          alt={product.name}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          <span className="text-xs bg-white/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full font-medium border border-white/50">{product.category}</span>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button
            onClick={() => setFav(!fav)}
            className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-all", fav ? "bg-primary text-white" : "bg-white/90 text-muted-foreground hover:text-primary")}
          >
            <Heart size={14} fill={fav ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <AvailabilityBadge status={product.status} />
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground leading-snug">{product.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{product.brand} · {product.model}</p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>Idade: {product.ageMin}–{product.ageMax}</span>
          <span>Até {product.weightMax}</span>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>
        <div className="mt-auto">
          <p className="text-xs text-muted-foreground">A partir de</p>
          <p className="text-xl font-bold text-foreground">R$ {product.priceWeekly}<span className="text-sm font-normal text-muted-foreground">/semana</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">Valor final calculado conforme o período</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Btn variant="outline" size="sm" onClick={() => navigate("product", { productId: product.id })} className="flex-1">
            <Eye size={14} />Ver produto
          </Btn>
          <Btn
            variant={isInQuote ? "secondary" : "primary"}
            size="sm"
            onClick={() => onAddToQuote(product)}
            className="flex-1"
          >
            {isInQuote ? <><Check size={14} />Adicionado</> : <><Plus size={14} />Orçamento</>}
          </Btn>
        </div>
        <button
          onClick={() => onToggleCompare(product.id)}
          className={cn("text-xs underline text-center transition-colors", isComparing ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground")}
        >
          {isComparing ? "✓ Comparando" : "Comparar produto"}
        </button>
      </div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

function Header({ currentPage, navigate, quoteCount, auth, onLogout }: {
  currentPage: Page; navigate: (p: Page) => void; quoteCount: number;
  auth: AuthState; onLogout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
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
          <button onClick={() => navigate("home")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">R4</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-foreground tracking-tight">
              rent4moms
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-6">
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
                <button onClick={onLogout} className="p-2 text-muted-foreground hover:text-foreground"><LogOut size={16} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Btn variant="ghost" size="sm" onClick={() => navigate("admin")}><Settings size={16} />Admin</Btn>
                <button onClick={onLogout} className="p-2 text-muted-foreground hover:text-foreground"><LogOut size={16} /></button>
              </div>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-muted-foreground">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card">
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

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <footer className="bg-foreground text-[#F5EEE9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="text-white text-xs font-bold">R4</span></div>
              <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-lg text-white">rent4moms</span>
            </div>
            <p className="text-sm text-[#C4AFA6] leading-relaxed mb-4">Aluguel de equipamentos infantis com cuidado, higiene e segurança. Para cada fase do seu bebê.</p>
            <div className="flex gap-3">
              <a href="https://www.instagram.com/rent4moms/" target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={16} />
              </a>
              <a href="https://wa.me/[NUMERO]" target="_blank" rel="noreferrer"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <MessageCircle size={16} />
              </a>
              <a href="mailto:[EMAIL]"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <p className="font-semibold text-white mb-4">Navegação</p>
            <div className="flex flex-col gap-2.5">
              {[["Produtos", "catalog"], ["Como funciona", "how-it-works"], ["Higienização", "hygiene-page"], ["Sobre nós", "about"], ["Dúvidas", "faq"], ["Contato", "contact"]].map(([label, page]) => (
                <button key={page} onClick={() => navigate(page as Page)} className="text-sm text-[#C4AFA6] hover:text-white transition-colors text-left">{label}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-semibold text-white mb-4">Atendimento</p>
            <div className="flex flex-col gap-2.5 text-sm text-[#C4AFA6]">
              <p className="flex items-center gap-2"><Phone size={14} />[TELEFONE]</p>
              <p className="flex items-center gap-2"><Mail size={14} />[EMAIL]</p>
              <p className="flex items-center gap-2"><MapPin size={14} />Área de atendimento: [REGIÃO]</p>
              <a href="https://wa.me/[NUMERO]" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-accent hover:text-white transition-colors font-medium">
                <MessageCircle size={14} />Falar no WhatsApp
              </a>
            </div>
            <p className="mt-4 text-xs text-[#8A7B72]">CNPJ: [CNPJ]</p>
          </div>

          <div>
            <p className="font-semibold text-white mb-4">Legal</p>
            <div className="flex flex-col gap-2.5">
              {["Política de privacidade", "Termos de uso", "Política de cancelamento", "Entrega e retirada", "Contrato de locação", "Preferências de cookies"].map(l => (
                <button key={l} className="text-sm text-[#C4AFA6] hover:text-white transition-colors text-left">{l}</button>
              ))}
            </div>
            <p className="mt-6 text-xs text-[#8A7B72]">© 2024 Rent4Moms. Todos os direitos reservados.</p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-[#8A7B72]">Os textos legais desta plataforma são demonstrativos e necessitam de revisão jurídica antes de uso comercial.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage({ navigate, onAddToQuote, quoteItemIds }: {
  navigate: (p: Page, params?: Record<string, string>) => void;
  onAddToQuote: (p: Product) => void; quoteItemIds: string[];
}) {
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cep, setCep] = useState("");
  const featured = PRODUCTS.filter(p => p.featured);

  return (
    <div className="flex flex-col">
      {/* Info bar */}
      <div className="bg-primary text-white text-center py-2.5 text-sm px-4">
        Equipamentos higienizados e revisados antes de cada locação.{" "}
        <button onClick={() => navigate("hygiene-page")} className="underline font-medium hover:opacity-80 transition-opacity">Conheça nosso processo</button>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
                Mais praticidade para você. Mais conforto para o seu bebê.
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Alugue cadeirinhas e equipamentos infantis pelo período que sua família realmente precisa.
              </p>
              <div className="flex flex-wrap gap-3">
                <Btn variant="primary" size="lg" onClick={() => navigate("catalog")}>
                  <Search size={18} />Encontrar uma cadeirinha
                </Btn>
                <Btn variant="outline" size="lg" onClick={() => navigate("how-it-works")}>
                  Como funciona <ArrowRight size={18} />
                </Btn>
              </div>
            </div>

            {/* Search widget */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
              <p className="font-semibold text-foreground mb-4">Consultar disponibilidade</p>
              <div className="flex flex-col gap-4">
                <Input label="Produto ou categoria" placeholder="Ex: MamaRoo, cadeirinha para carro..." value={searchQuery} onChange={setSearchQuery} icon={<Search size={16} />} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Data de início" type="date" value={startDate} onChange={setStartDate} />
                  <Input label="Data de devolução" type="date" value={endDate} onChange={setEndDate} />
                </div>
                <Input label="CEP" placeholder="00000-000" value={cep} onChange={setCep} icon={<MapPin size={16} />} />
                <Btn variant="primary" fullWidth onClick={() => navigate("catalog")}>
                  <Search size={16} />Buscar disponibilidade
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate("catalog")}
                className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border hover:border-primary hover:shadow-md transition-all text-center group"
              >
                <span className="text-3xl">{cat.icon}</span>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">{cat.name}</p>
                {cat.count > 0 && <p className="text-xs text-muted-foreground">{cat.count} produtos</p>}
              </button>
            ))}
          </div>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(p => (
            <ProductCard
              key={p.id} product={p} navigate={navigate}
              onAddToQuote={onAddToQuote}
              isInQuote={quoteItemIds.includes(p.id)}
              isComparing={compareItems.includes(p.id)}
              onToggleCompare={id => setCompareItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            />
          ))}
        </div>
        <p className="text-center mt-4 text-xs text-muted-foreground">Valores e disponibilidade demonstrativos. Confirme disponibilidade e preços reais ao solicitar o orçamento.</p>
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
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=700&h=500&fit=crop&auto=format"
              alt="Família com bebê"
              className="rounded-3xl w-full object-cover shadow-xl"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-foreground/20 to-transparent" />
          </div>
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

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-2">O que dizem as famílias</h2>
          <p className="text-xs text-muted-foreground">Depoimentos demonstrativos — conteúdo provisório</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={j < t.rating ? "#D4A26A" : "none"} className="text-amber-400" />)}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.city} · {t.product}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-2">Dúvidas frequentes</h2>
          </div>
          <Accordion items={FAQ_ITEMS.slice(0, 6)} />
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
            <a href="https://wa.me/[NUMERO]" target="_blank" rel="noreferrer">
              <Btn variant="outline" size="lg">
                <MessageCircle size={18} />Falar no WhatsApp
              </Btn>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── CATALOG PAGE ─────────────────────────────────────────────────────────────

function CatalogPage({ navigate, onAddToQuote, quoteItemIds }: {
  navigate: (p: Page, params?: Record<string, string>) => void;
  onAddToQuote: (p: Product) => void; quoteItemIds: string[];
}) {
  const [compareItems, setCompareItems] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Mais relevantes");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterCat, setFilterCat] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
    if (filterCat.length) result = result.filter(p => filterCat.includes(p.categorySlug));
    if (filterStatus.length) result = result.filter(p => filterStatus.includes(p.status));
    if (sortBy === "Menor preço estimado") result.sort((a, b) => a.priceWeekly - b.priceWeekly);
    if (sortBy === "Maior preço estimado") result.sort((a, b) => b.priceWeekly - a.priceWeekly);
    if (sortBy === "Melhor avaliados") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [search, filterCat, filterStatus, sortBy]);

  const toggleCat = (slug: string) => setFilterCat(prev => prev.includes(slug) ? prev.filter(x => x !== slug) : [...prev, slug]);

  const FilterPanel = () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-semibold text-foreground mb-3">Categoria</p>
        {CATEGORIES.map(cat => (
          <label key={cat.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input type="checkbox" checked={filterCat.includes(cat.id)} onChange={() => toggleCat(cat.id)} className="accent-primary" />
            <span className="text-sm text-foreground">{cat.name}</span>
          </label>
        ))}
      </div>
      <div>
        <p className="font-semibold text-foreground mb-3">Disponibilidade</p>
        {[["available", "Disponível"], ["few_units", "Poucas unidades"], ["on_demand", "Sob consulta"]].map(([val, label]) => (
          <label key={val} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input type="checkbox" checked={filterStatus.includes(val)} onChange={() => setFilterStatus(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])} className="accent-primary" />
            <span className="text-sm text-foreground">{label}</span>
          </label>
        ))}
      </div>
      {(filterCat.length > 0 || filterStatus.length > 0) && (
        <button onClick={() => { setFilterCat([]); setFilterStatus([]); }} className="text-sm text-primary underline text-left">Limpar filtros</button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-2">Catálogo de produtos</h1>
        <p className="text-muted-foreground">Equipamentos disponíveis para locação</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produtos..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          {["Mais relevantes", "Menor preço estimado", "Maior preço estimado", "Melhor avaliados", "Mais procurados"].map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="px-3 py-2.5 rounded-xl border border-border bg-input-background text-muted-foreground hover:text-foreground transition-colors">
          {viewMode === "grid" ? <List size={18} /> : <Archive size={18} />}
        </button>
        <button onClick={() => setDrawerOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-input-background text-foreground">
          <Filter size={16} />Filtros
        </button>
      </div>

      {(filterCat.length > 0 || filterStatus.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filterCat.map(c => {
            const cat = CATEGORIES.find(x => x.id === c);
            return cat ? (
              <button key={c} onClick={() => toggleCat(c)} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
                {cat.name} <X size={12} />
              </button>
            ) : null;
          })}
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel />
        </aside>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-6">{filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Package size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Nenhum produto encontrado</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou a busca</p>
              <button onClick={() => { setSearch(""); setFilterCat([]); setFilterStatus([]); }} className="mt-4 text-primary underline text-sm">Limpar filtros</button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} navigate={navigate} onAddToQuote={onAddToQuote} isInQuote={quoteItemIds.includes(p.id)} isComparing={compareItems.includes(p.id)} onToggleCompare={id => setCompareItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} />
              ))}
            </div>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-72 bg-card h-full p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="font-semibold text-foreground">Filtros</p>
              <button onClick={() => setDrawerOpen(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT PAGE ─────────────────────────────────────────────────────────────

function ProductPage({ productId, navigate, onAddToQuote, quoteItemIds, shippingZones }: {
  productId: string; navigate: (p: Page, params?: Record<string, string>) => void;
  onAddToQuote: (p: Product) => void; quoteItemIds: string[]; shippingZones: ShippingZone[];
}) {
  const product = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  const [startDate, setStartDate] = useState("");
  const [period, setPeriod] = useState<30 | 60 | 90 | null>(null);
  const [cep, setCep] = useState("");
  const [delivery, setDelivery] = useState("entrega");
  const [activeTab, setActiveTab] = useState("descricao");
  const [qty, setQty] = useState(1);

  const endDate = useMemo(() => period && startDate ? addDays(startDate, period) : "", [startDate, period]);
  const days = period ?? 0;

  const shippingCost = useMemo(() => {
    if (delivery !== "entrega") return null;
    return calcShipping(cep, shippingZones);
  }, [cep, delivery, shippingZones]);

  const priceEstimate = useMemo(() => {
    if (!period) return 0;
    return product.priceMonthly * (period / 30) * qty;
  }, [period, product, qty]);

  const tabs = [
    { id: "descricao", label: "Descrição" },
    { id: "especificacoes", label: "Especificações" },
    { id: "higienizacao", label: "Higienização" },
    { id: "entrega", label: "Entrega e devolução" },
    { id: "avaliacoes", label: "Avaliações" },
  ];

  const related = PRODUCTS.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 3);

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
        {/* Gallery */}
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-secondary mb-4">
            <img src={product.photo} alt={product.name} className="w-full h-96 object-cover" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-accent text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1"><Droplets size={10} />Higienizado</span>
              <span className="bg-primary text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1"><Shield size={10} />Revisado</span>
            </div>
            <div className="absolute top-4 right-4"><AvailabilityBadge status={product.status} /></div>
          </div>
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border cursor-pointer hover:border-primary transition-colors">
                <img src={product.photo} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product info & calculator */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-secondary border border-border px-2 py-0.5 rounded-full text-muted-foreground">{product.category}</span>
              <span className="text-xs text-muted-foreground">Cód. {product.id.toUpperCase()}</span>
            </div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-1">{product.name}</h1>
            <p className="text-muted-foreground">{product.brand} · {product.model}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={j < Math.floor(product.rating) ? "currentColor" : "none"} />)}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} avaliações)</span>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="bg-secondary rounded-xl px-4 py-2 text-center">
              <p className="text-muted-foreground text-xs">Idade</p>
              <p className="font-medium text-foreground">{product.ageMin} – {product.ageMax}</p>
            </div>
            <div className="bg-secondary rounded-xl px-4 py-2 text-center">
              <p className="text-muted-foreground text-xs">Peso máximo</p>
              <p className="font-medium text-foreground">{product.weightMax}</p>
            </div>
            <div className="bg-secondary rounded-xl px-4 py-2 text-center">
              <p className="text-muted-foreground text-xs">Conservação</p>
              <p className="font-medium text-foreground">{product.conservation}</p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Pricing calculator */}
          <div className="bg-secondary rounded-2xl border border-border p-5">
            <p className="font-semibold text-foreground mb-4">Calcular período</p>

            {/* Period selector */}
            <div className="mb-3">
              <label className="text-sm font-medium text-foreground block mb-2">Período de locação <span className="text-primary">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {([30, 60, 90] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(period === p ? null : p)}
                    className={cn(
                      "flex flex-col items-center py-3 px-2 rounded-xl border-2 font-medium text-sm transition-all",
                      period === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-input-background text-foreground hover:border-primary/50"
                    )}
                  >
                    <span className="text-lg font-bold">{p}</span>
                    <span className="text-xs opacity-70">dias</span>
                    <span className="text-xs mt-0.5 font-normal text-muted-foreground">
                      R$ {(product.priceMonthly * (p / 30)).toFixed(0)}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Preço por unidade, estimado</p>
            </div>

            {/* Start date */}
            <div className="mb-3">
              <Input label="Data de início" type="date" value={startDate} onChange={setStartDate} />
              {period && startDate && endDate && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-xl text-sm">
                  <Calendar size={14} className="text-accent shrink-0" />
                  <span className="text-foreground">Devolução prevista: <strong>{formatDateBR(endDate)}</strong></span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">CEP</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={cep}
                    onChange={e => setCep(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Quantidade</label>
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-input-background">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 hover:bg-muted transition-colors"><Minus size={14} /></button>
                  <span className="flex-1 text-center font-medium">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2.5 hover:bg-muted transition-colors"><Plus size={14} /></button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              {[["entrega", "Entrega em casa"], ["retirada", "Retirada no local"]].map(([opt, label]) => (
                <label key={opt} className={cn(
                  "flex-1 flex items-center gap-2 cursor-pointer px-3 py-2.5 rounded-xl border-2 transition-all text-sm",
                  delivery === opt ? "border-primary bg-primary/5 text-primary font-medium" : "border-border text-foreground"
                )}>
                  <input type="radio" name="delivery" value={opt} checked={delivery === opt} onChange={() => setDelivery(opt)} className="accent-primary" />
                  {label}
                </label>
              ))}
            </div>

            {/* Shipping info when CEP entered + entrega */}
            {delivery === "entrega" && cep.replace(/\D/g, "").length >= 5 && (
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm mb-3",
                shippingCost !== null
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              )}>
                <Truck size={16} className="shrink-0" />
                {shippingCost !== null ? (
                  <span>Frete estimado para este CEP: <strong>R$ {shippingCost.toFixed(2)}</strong></span>
                ) : (
                  <span>CEP fora da área de atendimento atual. Verifique com a equipe.</span>
                )}
              </div>
            )}

            {period && (
              <div className="bg-card rounded-xl p-4 mb-4 border border-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Período selecionado</span>
                  <span className="text-foreground font-medium">{period} dias</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Valor do produto</span>
                  <span className="text-foreground">R$ {priceEstimate.toFixed(2)}</span>
                </div>
                {delivery === "entrega" && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-foreground">
                      {shippingCost !== null ? `R$ ${shippingCost.toFixed(2)}` : "A calcular"}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                  <span className="text-foreground">Total estimado</span>
                  <span className="text-primary">
                    R$ {(priceEstimate + (delivery === "entrega" && shippingCost ? shippingCost : 0)).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Estimativa. O valor final é confirmado no orçamento da equipe Rent4Moms.</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Btn variant="primary" fullWidth onClick={() => onAddToQuote(product)} disabled={!period}>
                {quoteItemIds.includes(product.id) ? <><Check size={16} />Adicionado ao orçamento</> : <><ShoppingBag size={16} />Adicionar ao orçamento</>}
              </Btn>
              <a href={`https://wa.me/[NUMERO]?text=Olá, gostaria de saber mais sobre o produto ${product.name} para ${period ? period + ' dias' : 'período a definir'}.`} target="_blank" rel="noreferrer">
                <Btn variant="outline" fullWidth><MessageCircle size={16} />Falar sobre este produto</Btn>
              </a>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <Info size={14} className="inline mr-1" />
            Confira sempre as recomendações do fabricante e as informações de idade e peso antes da utilização.
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mb-16">
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors", activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "descricao" && (
          <div className="prose max-w-none text-foreground leading-relaxed">
            <p>{product.description}</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {["Para quem é indicado", "Itens inclusos", "Como utilizar", "Cuidados e segurança"].map(section => (
                <div key={section} className="bg-secondary rounded-xl p-4 border border-border">
                  <p className="font-semibold text-foreground mb-2">{section}</p>
                  <p className="text-sm text-muted-foreground">Informação detalhada disponível após confirmação do orçamento.</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "especificacoes" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["Categoria", product.category],
              ["Marca", product.brand],
              ["Modelo", product.model],
              ["Faixa etária", `${product.ageMin} – ${product.ageMax}`],
              ["Peso máximo", product.weightMax],
              ["Dimensões", product.specs.dimensions],
              ["Peso do produto", product.specs.productWeight],
              ["Material", product.specs.material],
              ["Cor", product.specs.color],
              ["Alimentação", product.specs.electric],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between py-2 px-4 bg-secondary rounded-xl border border-border text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium text-foreground text-right">{val}</span>
              </div>
            ))}
            <div className="sm:col-span-2 bg-secondary rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground mb-2 font-medium">Itens inclusos:</p>
              <div className="flex flex-wrap gap-2">
                {product.specs.includes.map(item => (
                  <span key={item} className="text-xs bg-card border border-border px-2 py-1 rounded-lg text-foreground">{item}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "higienizacao" && (
          <div className="max-w-2xl">
            <p className="text-muted-foreground leading-relaxed mb-4">Todos os nossos equipamentos passam por um processo cuidadoso de higienização entre cada locação. Você receberá o produto limpo, higienizado e pronto para uso.</p>
            <div className="flex flex-col gap-3">
              {["Inspeção ao receber a devolução", "Desmontagem quando aplicável", "Limpeza adequada ao material", "Higienização de tecidos e superfícies", "Secagem completa", "Revisão de componentes", "Embalagem e preparação"].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-secondary rounded-xl border border-border">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</div>
                  <span className="text-sm text-foreground">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "entrega" && (
          <div className="max-w-2xl text-muted-foreground leading-relaxed">
            <p>A entrega é realizada dentro da nossa área de atendimento, em horários previamente combinados. A taxa de entrega e retirada é calculada conforme a região e informada no orçamento antes da confirmação.</p>
            <p className="mt-4">A devolução deve ser realizada na data acordada no contrato. Em caso de atraso, uma taxa adicional poderá ser aplicada conforme descrito nas condições gerais de locação.</p>
          </div>
        )}

        {activeTab === "avaliacoes" && (
          <div className="max-w-2xl">
            <div className="flex items-center gap-6 mb-8 p-6 bg-secondary rounded-2xl border border-border">
              <div className="text-center">
                <p className="text-5xl font-bold text-foreground">{product.rating}</p>
                <div className="flex gap-0.5 mt-1 justify-center text-amber-400">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={j < Math.floor(product.rating) ? "currentColor" : "none"} />)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{product.reviews} avaliações</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {TESTIMONIALS.filter(t => t.product.includes(product.brand) || true).slice(0, 3).map((t, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex gap-0.5 mb-2 text-amber-400">{[...Array(5)].map((_, j) => <Star key={j} size={12} fill={j < t.rating ? "currentColor" : "none"} />)}</div>
                  <p className="text-sm text-muted-foreground mb-2">"{t.text}"</p>
                  <p className="text-xs font-medium text-foreground">{t.name} · {t.city}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-6">Produtos relacionados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(p => (
              <ProductCard key={p.id} product={p} navigate={navigate} onAddToQuote={onAddToQuote} isInQuote={quoteItemIds.includes(p.id)} isComparing={false} onToggleCompare={() => {}} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QUOTE FLOW ───────────────────────────────────────────────────────────────

function QuotePage({ navigate, quoteItems, onRemoveItem, auth, shippingZones }: {
  navigate: (p: Page) => void; quoteItems: QuoteItem[];
  onRemoveItem: (id: string) => void; auth: AuthState; shippingZones: ShippingZone[];
}) {
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState("entrega");
  const [quotePeriod, setQuotePeriod] = useState<30 | 60 | 90 | null>(null);
  const [quoteStartDate, setQuoteStartDate] = useState("");
  const [address, setAddress] = useState({ cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "" });
  const [client, setClient] = useState({ nome: "", cpf: "", email: "", telefone: "", whatsapp: "" });
  const [info, setInfo] = useState({ motivo: "", observacoes: "", como_conheceu: "" });
  const [accepted, setAccepted] = useState({ termos: false, privacidade: false, contrato: false, novidades: false });

  const steps = ["Produtos", "Entrega", "Dados", "Informações", "Revisão"];
  const total = quoteItems.reduce((acc, item) => acc + (item.days >= 30 ? item.product.priceMonthly : item.days >= 7 ? item.product.priceWeekly : item.product.priceDaily * item.days) * item.qty, 0);

  const canSubmit = accepted.termos && accepted.privacidade && accepted.contrato;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-8">Solicitação de orçamento</h1>
      <div className="mb-10">
        <Stepper steps={steps} current={step} />
      </div>

      {/* Step 0: Products */}
      {step === 0 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Produtos selecionados</h2>
          {quoteItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Seu orçamento está vazio</p>
              <p className="text-sm mt-1">Adicione produtos pelo catálogo</p>
              <Btn variant="primary" className="mt-6" onClick={() => navigate("catalog")}>Ver produtos</Btn>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {quoteItems.map(item => (
                <div key={item.product.id} className="flex gap-4 p-4 bg-card rounded-2xl border border-border">
                  <img src={item.product.photo} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">{item.product.brand}</p>
                    <p className="text-sm text-muted-foreground">Período: {item.days ? `${item.days} dias` : "A definir"} · Qtd: {item.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">R$ {(item.product.priceMonthly * (item.days / 30 || 1)).toFixed(0)}</p>
                    <button onClick={() => onRemoveItem(item.product.id)} className="text-xs text-destructive mt-2 hover:underline">Remover</button>
                  </div>
                </div>
              ))}
              <div className="mt-2 p-4 bg-secondary rounded-xl border border-border flex justify-between">
                <span className="font-medium text-foreground">Total estimado</span>
                <span className="font-bold text-primary text-lg">R$ {total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">Valor estimado. O total final será confirmado no orçamento da equipe Rent4Moms.</p>
            </div>
          )}
        </div>
      )}

      {/* Step 1: Delivery */}
      {step === 1 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Entrega ou retirada</h2>

          {/* Period selector */}
          <div className="mb-6 p-5 bg-secondary rounded-2xl border border-border">
            <p className="font-semibold text-foreground mb-3">Período desejado</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {([30, 60, 90] as const).map(p => (
                <button key={p} onClick={() => setQuotePeriod(quotePeriod === p ? null : p)}
                  className={cn("flex flex-col items-center py-3 rounded-xl border-2 font-medium text-sm transition-all",
                    quotePeriod === p ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/50"
                  )}>
                  <span className="text-xl font-bold">{p}</span>
                  <span className="text-xs opacity-70">dias</span>
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Data de início pretendida" type="date" value={quoteStartDate} onChange={setQuoteStartDate} />
              {quotePeriod && quoteStartDate && (
                <div className="flex flex-col justify-end">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 border border-accent/30 rounded-xl text-sm">
                    <Calendar size={14} className="text-accent" />
                    <span>Devolução: <strong>{formatDateBR(addDays(quoteStartDate, quotePeriod))}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            {[["entrega", "Entrega no endereço", Truck], ["retirada", "Retirada no local", MapPin], ["combinar", "Combinar com atendimento", MessageCircle]].map(([val, label, Icon]) => (
              <label key={val as string} className={cn("flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all", delivery === val ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                <input type="radio" name="delivery" value={val as string} checked={delivery === val} onChange={() => setDelivery(val as string)} className="sr-only" />
                <span className="text-2xl"><Icon size={24} className={delivery === val ? "text-primary" : "text-muted-foreground"} /></span>
                <span className={cn("text-sm font-medium text-center", delivery === val ? "text-primary" : "text-foreground")}>{label as string}</span>
              </label>
            ))}
          </div>
          {delivery === "entrega" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="CEP" placeholder="00000-000" value={address.cep} onChange={v => setAddress({ ...address, cep: v })} required icon={<MapPin size={14} />} />
                {address.cep.replace(/\D/g, "").length >= 5 && (() => {
                  const fee = calcShipping(address.cep, shippingZones);
                  return (
                    <div className={cn("mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm",
                      fee !== null ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"
                    )}>
                      <Truck size={14} className="shrink-0" />
                      {fee !== null ? <span>Frete estimado: <strong>R$ {fee.toFixed(2)}</strong></span> : <span>CEP fora da área de atendimento. Confirme com a equipe.</span>}
                    </div>
                  );
                })()}
              </div>
              <Input label="Rua / Logradouro" placeholder="Nome da rua" value={address.rua} onChange={v => setAddress({ ...address, rua: v })} required />
              <Input label="Rua / Logradouro" placeholder="Nome da rua" value={address.rua} onChange={v => setAddress({ ...address, rua: v })} required />
              <Input label="Número" placeholder="123" value={address.numero} onChange={v => setAddress({ ...address, numero: v })} required />
              <Input label="Bairro" placeholder="Nome do bairro" value={address.bairro} onChange={v => setAddress({ ...address, bairro: v })} />
              <Input label="Cidade" placeholder="Sua cidade" value={address.cidade} onChange={v => setAddress({ ...address, cidade: v })} required />
              <Input label="Estado" placeholder="SP" value={address.estado} onChange={v => setAddress({ ...address, estado: v })} required />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Client data */}
      {step === 2 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Dados pessoais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Nome completo" placeholder="Seu nome completo" value={client.nome} onChange={v => setClient({ ...client, nome: v })} required />
            <Input label="CPF" placeholder="000.000.000-00" value={client.cpf} onChange={v => setClient({ ...client, cpf: v })} required />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={client.email} onChange={v => setClient({ ...client, email: v })} required />
            <Input label="Telefone" placeholder="(11) 00000-0000" value={client.telefone} onChange={v => setClient({ ...client, telefone: v })} required />
            <Input label="WhatsApp" placeholder="(11) 00000-0000" value={client.whatsapp} onChange={v => setClient({ ...client, whatsapp: v })} helper="Usado para envio de confirmações e atualizações" />
          </div>
          <div className="mt-6 p-4 bg-secondary rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground mb-2">Por que solicitamos esses dados?</p>
            <p className="text-sm text-muted-foreground">Utilizamos seus dados apenas para processar sua solicitação, entrar em contato e enviar atualizações sobre o orçamento. Nenhuma informação será compartilhada sem seu consentimento.</p>
          </div>
        </div>
      )}

      {/* Step 3: Additional info */}
      {step === 3 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Informações adicionais</h2>
          <div className="flex flex-col gap-4">
            <Select label="Motivo do aluguel" options={["Selecione...", "Uso temporário", "Testar antes de comprar", "Viagem", "Visita de familiar", "Recém-nascido em casa", "Outro"]} value={info.motivo} onChange={v => setInfo({ ...info, motivo: v })} />
            <Select label="Como conheceu a Rent4Moms?" options={["Selecione...", "Instagram", "Indicação de amiga(o)", "Pesquisa no Google", "Grupo de mães", "Outro"]} value={info.como_conheceu} onChange={v => setInfo({ ...info, como_conheceu: v })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Observações adicionais</label>
              <textarea value={info.observacoes} onChange={e => setInfo({ ...info, observacoes: e.target.value })} placeholder="Alguma informação relevante para a equipe..." rows={4} className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review & submit */}
      {step === 4 && (
        <div>
          <h2 className="font-semibold text-foreground text-xl mb-6">Revisão e envio</h2>
          <div className="flex flex-col gap-4 mb-6">
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="font-medium text-foreground mb-3">Produtos</p>
              {quoteItems.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{item.product.name} (×{item.qty})</span>
                  <span className="text-foreground">R$ {item.product.priceWeekly}/semana</span>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="font-medium text-foreground mb-3">Entrega e dados</p>
              <div className="text-sm text-muted-foreground">
                <p>Método: {delivery === "entrega" ? "Entrega no endereço" : delivery === "retirada" ? "Retirada no local" : "A combinar"}</p>
                {address.rua && <p>Endereço: {address.rua}, {address.numero} — {address.bairro}, {address.cidade}</p>}
                <p>Nome: {client.nome || "—"}</p>
                <p>E-mail: {client.email || "—"}</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-4 flex justify-between font-semibold">
              <span className="text-foreground">Total estimado</span>
              <span className="text-primary text-lg">R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {[
              ["termos", "Li e aceito os Termos de uso"],
              ["privacidade", "Li a Política de privacidade"],
              ["contrato", "Li as Condições gerais de locação"],
              ["novidades", "Desejo receber novidades e promoções (opcional)"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={accepted[key as keyof typeof accepted]} onChange={e => setAccepted({ ...accepted, [key]: e.target.checked })} className="mt-0.5 accent-primary w-4 h-4" />
                <span className="text-sm text-foreground">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        {step > 0 ? (
          <Btn variant="outline" onClick={() => setStep(step - 1)}><ChevronLeft size={16} />Voltar</Btn>
        ) : (
          <Btn variant="ghost" onClick={() => navigate("catalog")}>← Catálogo</Btn>
        )}
        {step < 4 ? (
          <Btn variant="primary" onClick={() => setStep(step + 1)} disabled={step === 0 && quoteItems.length === 0}>
            Continuar <ChevronRight size={16} />
          </Btn>
        ) : (
          <Btn variant="primary" onClick={() => navigate("quote-success")} disabled={!canSubmit}>
            <Check size={16} />Enviar solicitação de orçamento
          </Btn>
        )}
      </div>
    </div>
  );
}

function QuoteSuccessPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-accent" />
      </div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-4">Solicitação recebida!</h1>
      <p className="text-muted-foreground mb-2">Número da solicitação: <span className="font-semibold text-foreground">ORC-2024-0042</span></p>
      <p className="text-muted-foreground leading-relaxed mb-8">
        Recebemos sua solicitação. Nossa equipe verificará os produtos, o período e a região de atendimento antes de confirmar a reserva. Você receberá um retorno em até 24 horas úteis.
      </p>
      <div className="bg-secondary rounded-2xl border border-border p-6 mb-8 text-left">
        <div className="flex items-center gap-3 mb-4">
          <Clock size={18} className="text-primary" />
          <span className="font-medium text-foreground">Status: Em análise</span>
        </div>
        <p className="text-sm text-muted-foreground">Nossa equipe analisará a disponibilidade dos produtos, o período solicitado e a sua região de atendimento. A reserva só é confirmada após essa verificação.</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Btn variant="primary" onClick={() => navigate("account-quotes")}>Acompanhar solicitação</Btn>
        <a href="https://wa.me/[NUMERO]" target="_blank" rel="noreferrer">
          <Btn variant="outline"><MessageCircle size={16} />Falar no WhatsApp</Btn>
        </a>
        <Btn variant="ghost" onClick={() => navigate("catalog")}>Voltar ao catálogo</Btn>
      </div>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────

function LoginPage({ navigate, onLogin }: { navigate: (p: Page) => void; onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold">R4</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground">Bem-vinda de volta</h1>
          <p className="text-muted-foreground mt-1">Entre na sua conta para acompanhar seus orçamentos</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="flex flex-col gap-4 mb-6">
            <Input label="E-mail ou CPF" placeholder="seu@email.com" type="email" value={email} onChange={setEmail} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Senha <span className="text-primary">*</span></label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <Eye size={16} /> : <Lock size={16} />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-primary" />
              <span className="text-sm text-foreground">Lembrar acesso</span>
            </label>
          </div>

          <Btn variant="primary" fullWidth onClick={() => onLogin(email)}>Entrar</Btn>

          <button onClick={() => navigate("forgot-password")} className="w-full text-center text-sm text-primary hover:underline mt-4">Esqueci minha senha</button>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Ainda não tem conta?{" "}
            <button onClick={() => navigate("signup")} className="text-primary font-medium hover:underline">Criar conta</button>
          </p>

          <div className="mt-6 p-3 bg-secondary rounded-xl text-xs text-muted-foreground text-center">
            <strong>Demo:</strong> Use qualquer e-mail com "admin" para acessar o painel, ou qualquer outro e-mail para a área do cliente
          </div>
        </div>
      </div>
    </div>
  );
}

function SignupPage({ navigate, onLogin }: { navigate: (p: Page) => void; onLogin: (email: string) => void }) {
  const [form, setForm] = useState({ nome: "", email: "", cpf: "", telefone: "", senha: "" });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground">Criar sua conta</h1>
          <p className="text-muted-foreground mt-1">Acompanhe seus orçamentos e locações com facilidade</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="flex flex-col gap-4 mb-6">
            <Input label="Nome completo" placeholder="Seu nome" value={form.nome} onChange={v => setForm({ ...form, nome: v })} required />
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={v => setForm({ ...form, email: v })} required />
            <Input label="CPF" placeholder="000.000.000-00" value={form.cpf} onChange={v => setForm({ ...form, cpf: v })} required />
            <Input label="Telefone / WhatsApp" placeholder="(11) 00000-0000" value={form.telefone} onChange={v => setForm({ ...form, telefone: v })} required />
            <Input label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={form.senha} onChange={v => setForm({ ...form, senha: v })} required />
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-0.5 accent-primary" required />
              <span className="text-sm text-muted-foreground">Li e aceito a <button className="text-primary hover:underline">Política de privacidade</button> e os <button className="text-primary hover:underline">Termos de uso</button></span>
            </label>
          </div>
          <Btn variant="primary" fullWidth onClick={() => onLogin(form.email)}>Criar conta</Btn>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Já tem conta?{" "}
            <button onClick={() => navigate("login")} className="text-primary font-medium hover:underline">Entrar</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT AREA ─────────────────────────────────────────────────────────────

function AccountLayout({ currentPage, navigate, children }: { currentPage: Page; navigate: (p: Page) => void; children: React.ReactNode }) {
  const links: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: "account", label: "Visão geral", icon: <Home size={16} /> },
    { page: "account-quotes", label: "Meus orçamentos", icon: <FileText size={16} /> },
    { page: "account-reservations", label: "Minhas locações", icon: <Package size={16} /> },
    { page: "account-contracts", label: "Contratos", icon: <Clipboard size={16} /> },
    { page: "account-profile", label: "Meus dados", icon: <User size={16} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-56 shrink-0">
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">A</div>
              <div>
                <p className="font-medium text-foreground text-sm">Ana Clara</p>
                <p className="text-xs text-muted-foreground">Cliente desde Mar/24</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map(l => (
                <button key={l.page} onClick={() => navigate(l.page)}
                  className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors text-left", currentPage === l.page ? "bg-primary text-white font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                  {l.icon}{l.label}
                </button>
              ))}
              <button onClick={() => navigate("home")} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground mt-2">
                <LogOut size={16} />Sair
              </button>
            </nav>
          </div>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

function AccountDashboard({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-6">Olá, Ana Clara</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Locação ativa", value: "MamaRoo 4.0", sub: "Devolução em 3 dias", color: "text-emerald-600", icon: <Package size={18} className="text-emerald-600" /> },
          { label: "Orçamentos abertos", value: "2", sub: "1 aguardando resposta", color: "text-amber-600", icon: <FileText size={18} className="text-amber-600" /> },
          { label: "Contratos pendentes", value: "1", sub: "Aguardando aceite", color: "text-red-600", icon: <Clipboard size={18} className="text-red-600" /> },
        ].map((c, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-2">{c.icon}<p className="text-sm text-muted-foreground">{c.label}</p></div>
            <p className={cn("text-xl font-bold", c.color)}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="font-semibold text-foreground mb-4">Ações rápidas</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Btn variant="outline" onClick={() => navigate("account-quotes")}>Ver meus orçamentos <ArrowRight size={16} /></Btn>
          <Btn variant="outline" onClick={() => navigate("account-reservations")}>Ver minhas locações <ArrowRight size={16} /></Btn>
          <Btn variant="outline" onClick={() => navigate("catalog")}>Solicitar novo orçamento <ArrowRight size={16} /></Btn>
          <a href="https://wa.me/[NUMERO]" target="_blank" rel="noreferrer">
            <Btn variant="outline" fullWidth><MessageCircle size={16} />Falar com atendimento</Btn>
          </a>
        </div>
      </div>
    </div>
  );
}

function AccountQuotes({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground">Meus orçamentos</h1>
        <Btn variant="primary" size="sm" onClick={() => navigate("catalog")}><Plus size={14} />Novo orçamento</Btn>
      </div>
      <div className="flex flex-col gap-4">
        {QUOTES_DATA.slice(0, 5).map(q => (
          <div key={q.id} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-medium text-foreground">{q.id}</p>
                <p className="text-sm text-muted-foreground">{q.products}</p>
              </div>
              <StatusBadge status={q.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-3">
              <div><p className="text-muted-foreground text-xs">Período</p><p className="text-foreground">{q.period}</p></div>
              <div><p className="text-muted-foreground text-xs">Valor estimado</p><p className="text-foreground font-medium">{q.value}</p></div>
              <div><p className="text-muted-foreground text-xs">Atualizado em</p><p className="text-foreground">{q.updatedAt}</p></div>
            </div>
            <div className="flex gap-2">
              <Btn variant="outline" size="sm"><Eye size={14} />Ver detalhes</Btn>
              {q.status === "Orçamento enviado" && <Btn variant="primary" size="sm"><Check size={14} />Aprovar orçamento</Btn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountReservations({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-6">Minhas locações</h1>
      <div className="flex flex-col gap-4">
        {RESERVATIONS.slice(0, 4).map(r => (
          <div key={r.id} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-medium text-foreground">{r.id}</p>
                <p className="text-sm text-muted-foreground">{r.product} · Unidade {r.unit}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mb-4">
              <div><p className="text-muted-foreground text-xs">Período</p><p className="text-foreground">{r.start} – {r.end}</p></div>
              <div><p className="text-muted-foreground text-xs">Endereço</p><p className="text-foreground text-xs">{r.address}</p></div>
              <div><p className="text-muted-foreground text-xs">Pagamento</p><StatusBadge status={r.payment} /></div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn variant="outline" size="sm"><Eye size={14} />Detalhes</Btn>
              {r.status === "Locação ativa" && <Btn variant="secondary" size="sm"><RefreshCw size={14} />Solicitar renovação</Btn>}
              {r.status === "Locação ativa" && <Btn variant="secondary" size="sm"><MessageCircle size={14} />Suporte</Btn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountProfile({ navigate }: { navigate: (p: Page) => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div>
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-6">Meus dados</h1>
      <div className="bg-card rounded-2xl border border-border p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <p className="font-semibold text-foreground">Dados pessoais</p>
          <Btn variant="ghost" size="sm" onClick={() => setEditing(!editing)}><Edit size={14} />{editing ? "Cancelar" : "Editar"}</Btn>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {editing ? (
            <>
              <Input label="Nome completo" value="Ana Clara Ferreira" />
              <Input label="E-mail" value="anaclara@email.com" type="email" />
              <Input label="CPF" value="•••.356.•••-84" />
              <Input label="Telefone" value="(11) 9•••-4521" />
              <div className="sm:col-span-2 flex justify-end">
                <Btn variant="primary" size="sm" onClick={() => setEditing(false)}>Salvar alterações</Btn>
              </div>
            </>
          ) : (
            <>
              {[["Nome completo", "Ana Clara Ferreira"], ["E-mail", "anaclara@email.com"], ["CPF", "•••.356.•••-84"], ["Telefone", "(11) 9•••-4521"]].map(([k, v]) => (
                <div key={k}><p className="text-xs text-muted-foreground">{k}</p><p className="text-foreground">{v}</p></div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="bg-card rounded-2xl border border-border p-6">
        <p className="font-semibold text-foreground mb-4">Privacidade e dados</p>
        <div className="flex flex-col gap-3">
          {["Exportar meus dados", "Solicitar correção", "Consultar políticas aceitas", "Solicitar exclusão da conta"].map(action => (
            <button key={action} className="flex items-center justify-between py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-border last:border-none">
              <span>{action}</span><ChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SIMPLE PUBLIC PAGES ─────────────────────────────────────────────────────

function HowItWorksPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-4">Como funciona</h1>
      <p className="text-muted-foreground text-lg mb-12">Um processo simples, pensado para facilitar a vida das famílias.</p>
      <div className="flex flex-col gap-12">
        {[
          { num: "01", title: "Escolha o produto", desc: "Navegue pelo catálogo e filtre por categoria, faixa etária ou período. Você pode comparar até 3 produtos antes de decidir.", img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=500&h=350&fit=crop" },
          { num: "02", title: "Informe o período desejado", desc: "Selecione as datas de início e devolução. O sistema calcula uma estimativa de valor. O preço final é confirmado no orçamento.", img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&h=350&fit=crop" },
          { num: "03", title: "Envie a solicitação", desc: "Preencha seus dados e envie o orçamento. Nenhuma cobrança é feita nesta etapa. Nossa equipe entrará em contato.", img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&h=350&fit=crop" },
          { num: "04", title: "Confirme a reserva", desc: "Após a análise, você recebe o orçamento final, assina o contrato e confirma a reserva. A entrega é agendada conforme combinado.", img: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=500&h=350&fit=crop" },
        ].map((s, i) => (
          <div key={i} className={cn("grid lg:grid-cols-2 gap-8 items-center", i % 2 === 1 && "lg:flex-row-reverse")}>
            <div className={i % 2 === 1 ? "lg:order-2" : ""}>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                <span className="text-white font-bold">{s.num}</span>
              </div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
            <img src={s.img} alt={s.title} className={cn("rounded-2xl w-full h-60 object-cover shadow-lg", i % 2 === 1 ? "lg:order-1" : "")} />
          </div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <Btn variant="primary" size="lg" onClick={() => navigate("catalog")}><Search size={18} />Ver produtos disponíveis</Btn>
      </div>
    </div>
  );
}

function HygienePage({ navigate }: { navigate: (p: Page) => void }) {
  const steps = [
    { icon: <Eye size={22} className="text-primary" />, title: "Inspeção inicial", desc: "Ao receber a devolução, inspecionamos cada componente do equipamento." },
    { icon: <Archive size={22} className="text-primary" />, title: "Desmontagem", desc: "Quando aplicável, o produto é desmontado para facilitar a limpeza de todas as peças." },
    { icon: <Droplets size={22} className="text-primary" />, title: "Limpeza", desc: "Cada material recebe tratamento adequado: tecidos, plásticos, metais e acolchoamentos." },
    { icon: <Zap size={22} className="text-primary" />, title: "Secagem", desc: "Secagem completa antes de qualquer embalagem ou armazenamento." },
    { icon: <Wrench size={22} className="text-primary" />, title: "Revisão de componentes", desc: "Verificamos cintos, travas, encaixes e todos os mecanismos de segurança." },
    { icon: <Package size={22} className="text-primary" />, title: "Embalagem e preparo", desc: "O produto é preparado e embalado para a próxima locação." },
    { icon: <CheckCircle size={22} className="text-primary" />, title: "Liberação", desc: "Somente após aprovação interna o produto é marcado como disponível para nova locação." },
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-4">Processo de higienização</h1>
      <p className="text-muted-foreground text-lg mb-12 max-w-2xl">Cada equipamento passa por etapas cuidadosas antes de chegar à sua casa. Você recebe um produto limpo, higienizado e revisado.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {steps.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">{s.icon}</div>
            <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-secondary rounded-2xl border border-border p-6 text-sm text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">Nota importante:</strong> Os procedimentos descritos são demonstrativos. Os processos reais da Rent4Moms podem variar conforme o tipo de produto. Não garantimos esterilização clínica. O processo tem como objetivo entregar os equipamentos em condições de higiene e conservação adequadas para uso doméstico.</p>
      </div>
    </div>
  );
}

function AboutPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-6">Sobre a Rent4Moms</h1>
      <div className="grid lg:grid-cols-2 gap-10 mb-12">
        <div>
          <p className="text-muted-foreground leading-relaxed mb-4">A Rent4Moms nasceu para facilitar a vida das famílias em momentos especiais. Entendemos que cada fase do bebê é única e temporária, e que equipamentos de qualidade não precisam representar um investimento permanente.</p>
          <p className="text-muted-foreground leading-relaxed mb-4">Oferecemos aluguel de cadeirinhas, balanços, bebês-conforto e outros equipamentos infantis com cuidado, higiene e segurança. Nosso compromisso é com a tranquilidade da sua família.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Btn variant="primary" onClick={() => navigate("catalog")}>Ver produtos</Btn>
            <Btn variant="outline" onClick={() => navigate("contact")}>Fale conosco</Btn>
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=500&h=380&fit=crop" alt="Família" className="rounded-2xl w-full object-cover shadow-lg" />
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: <Shield size={28} className="text-primary" />, title: "Segurança", desc: "Produtos revisados e em conformidade com as especificações dos fabricantes" },
          { icon: <Droplets size={28} className="text-primary" />, title: "Higiene", desc: "Processo completo de limpeza e higienização antes de cada entrega" },
          { icon: <Award size={28} className="text-primary" />, title: "Qualidade", desc: "Equipamentos de marcas reconhecidas em bom estado de conservação" },
        ].map((v, i) => (
          <div key={i} className="text-center p-6 bg-secondary rounded-2xl border border-border">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">{v.icon}</div>
            <p className="font-semibold text-foreground mb-2">{v.title}</p>
            <p className="text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQPage({ navigate }: { navigate: (p: Page) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-4">Dúvidas frequentes</h1>
      <p className="text-muted-foreground mb-10">Encontre aqui as respostas para as perguntas mais comuns. Se não encontrar o que precisa, fale com nossa equipe.</p>
      <Accordion items={FAQ_ITEMS} />
      <div className="mt-10 text-center p-8 bg-secondary rounded-2xl border border-border">
        <p className="font-medium text-foreground mb-2">Ainda tem dúvidas?</p>
        <p className="text-sm text-muted-foreground mb-4">Nossa equipe está aqui para ajudar você a encontrar a melhor opção.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a href="https://wa.me/[NUMERO]" target="_blank" rel="noreferrer">
            <Btn variant="primary"><MessageCircle size={16} />Falar no WhatsApp</Btn>
          </a>
          <Btn variant="outline" onClick={() => navigate("contact")}>Enviar mensagem</Btn>
        </div>
      </div>
    </div>
  );
}

function ContactPage({ navigate }: { navigate: (p: Page) => void }) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", assunto: "", mensagem: "" });
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-4xl text-foreground mb-10">Fale conosco</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          {sent ? (
            <div className="text-center py-12">
              <CheckCircle size={48} className="text-accent mx-auto mb-4" />
              <h2 className="font-semibold text-foreground text-xl mb-2">Mensagem enviada!</h2>
              <p className="text-muted-foreground">Recebemos sua mensagem e retornaremos em breve.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <Input label="Nome" placeholder="Seu nome" value={form.nome} onChange={v => setForm({ ...form, nome: v })} required />
              <Input label="E-mail" type="email" placeholder="seu@email.com" value={form.email} onChange={v => setForm({ ...form, email: v })} required />
              <Input label="Telefone" placeholder="(11) 00000-0000" value={form.telefone} onChange={v => setForm({ ...form, telefone: v })} />
              <Select label="Assunto" options={["Selecione...", "Dúvida sobre produto", "Orçamento", "Entrega e retirada", "Suporte", "Outro"]} value={form.assunto} onChange={v => setForm({ ...form, assunto: v })} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Mensagem <span className="text-primary">*</span></label>
                <textarea value={form.mensagem} onChange={e => setForm({ ...form, mensagem: e.target.value })} placeholder="Escreva sua mensagem..." rows={5} className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <Btn variant="primary" fullWidth onClick={() => setSent(true)}>Enviar mensagem</Btn>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <p className="font-semibold text-foreground mb-4">Outras formas de contato</p>
            <div className="flex flex-col gap-4 text-sm">
              <a href="https://wa.me/[NUMERO]" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><MessageCircle size={16} className="text-green-600" /></div>
                <div><p className="font-medium text-foreground">WhatsApp</p><p>[NUMERO]</p></div>
              </a>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center"><Mail size={16} /></div>
                <div><p className="font-medium text-foreground">E-mail</p><p>[EMAIL]</p></div>
              </div>
              <a href="https://www.instagram.com/rent4moms/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center"><Instagram size={16} className="text-pink-600" /></div>
                <div><p className="font-medium text-foreground">Instagram</p><p>@rent4moms</p></div>
              </a>
            </div>
          </div>
          <div className="bg-secondary rounded-2xl border border-border p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">Respondemos mensagens em dias úteis. Para urgências, recomendamos o contato pelo WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN LAYOUT ─────────────────────────────────────────────────────────────

function AdminLayout({ currentPage, navigate, onLogout, children }: {
  currentPage: Page; navigate: (p: Page) => void; onLogout: () => void; children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const menuGroups = [
    {
      label: "Principal",
      items: [
        { page: "admin" as Page, label: "Dashboard", icon: <BarChart2 size={16} /> },
        { page: "admin-products" as Page, label: "Produtos", icon: <Package size={16} /> },
        { page: "admin-quotes" as Page, label: "Orçamentos", icon: <FileText size={16} /> },
        { page: "admin-reservations" as Page, label: "Reservas e Locações", icon: <Layers size={16} /> },
        { page: "admin-clients" as Page, label: "Clientes", icon: <Users size={16} /> },
      ]
    },
    {
      label: "Operações",
      items: [
        { page: "admin-calendar" as Page, label: "Calendário", icon: <Calendar size={16} /> },
        { page: "admin-delivery" as Page, label: "Entregas", icon: <Truck size={16} /> },
        { page: "admin-hygiene" as Page, label: "Higienização", icon: <Droplets size={16} /> },
      ]
    },
    {
      label: "Gestão",
      items: [
        { page: "admin-reports" as Page, label: "Relatórios", icon: <TrendingUp size={16} /> },
        { page: "admin-users" as Page, label: "Usuários", icon: <User size={16} /> },
        { page: "admin-config" as Page, label: "Configurações", icon: <Settings size={16} /> },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F0EB]">
      {/* Sidebar */}
      <aside className={cn("flex flex-col bg-sidebar transition-all duration-300 shrink-0", collapsed ? "w-14" : "w-60")}>
        <div className="flex items-center gap-2 p-4 border-b border-sidebar-border h-16">
          {!collapsed && (
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0"><span className="text-white text-xs font-bold">R4</span></div>
              <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-sidebar-foreground text-sm">rent4moms</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors p-1">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {menuGroups.map(group => (
            <div key={group.label} className="mb-6">
              {!collapsed && <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">{group.label}</p>}
              <div className="flex flex-col gap-0.5">
                {group.items.map(item => (
                  <button
                    key={item.page}
                    onClick={() => navigate(item.page)}
                    className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors", currentPage === item.page ? "bg-primary text-white font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground", collapsed && "justify-center px-2")}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon}
                    {!collapsed && item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-sidebar-accent rounded-full flex items-center justify-center text-sidebar-foreground text-xs font-bold">A</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground">Admin</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">admin@rent4moms.com</p>
              </div>
              <button onClick={onLogout} className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"><LogOut size={14} /></button>
            </div>
          ) : (
            <button onClick={onLogout} className="flex justify-center w-full text-sidebar-foreground/50 hover:text-sidebar-foreground"><LogOut size={16} /></button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 shrink-0">
          <div>
            <p className="font-semibold text-foreground text-sm">Painel Administrativo</p>
            <p className="text-xs text-muted-foreground">Rent4Moms · {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-foreground">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <button onClick={() => navigate("home")} className="text-sm text-muted-foreground hover:text-foreground">Ver site <ArrowRight size={12} className="inline ml-1" /></button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────

function AdminDashboard() {
  const kpis = [
    { label: "Novos leads", value: "12", change: "+4", icon: <Users size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Orçamentos em análise", value: "8", change: "+2", icon: <FileText size={18} />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Reservas confirmadas", value: "15", change: "+3", icon: <CheckCircle size={18} />, color: "text-green-600", bg: "bg-green-50" },
    { label: "Locações ativas", value: "23", change: "=", icon: <Package size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Entregas hoje", value: "4", change: "", icon: <Truck size={18} />, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Devoluções hoje", value: "3", change: "", icon: <ArrowRight size={18} />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Devoluções atrasadas", value: "1", change: "", icon: <AlertCircle size={18} />, color: "text-red-600", bg: "bg-red-50" },
    { label: "Em higienização", value: "5", change: "", icon: <Droplets size={18} />, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Produtos disponíveis", value: "47", change: "-2", icon: <Archive size={18} />, color: "text-gray-600", bg: "bg-gray-50" },
    { label: "Em manutenção", value: "2", change: "", icon: <Wrench size={18} />, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Receita estimada (jun)", value: "R$ 19.340", change: "+15%", icon: <DollarSign size={18} />, color: "text-green-700", bg: "bg-green-50" },
    { label: "Taxa de conversão", value: "87%", change: "+3pp", icon: <TrendingUp size={18} />, color: "text-primary", bg: "bg-primary/5" },
  ];

  const pendencies = [
    { label: "Orçamento ORC-2024-0041 aguardando análise", urgent: true },
    { label: "Entrega RES-2024-0017 agendada para hoje 14h", urgent: true },
    { label: "Contrato de Fernanda Lima aguardando aceite", urgent: false },
    { label: "Unidade RM-MR40-003 com revisão atrasada", urgent: false },
    { label: "3 orçamentos próximos do vencimento", urgent: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Select label="" options={["Junho 2024", "Maio 2024", "Abril 2024"]} value="Junho 2024" onChange={() => {}} />
          <Btn variant="outline" size="sm"><Download size={14} />Exportar</Btn>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", kpi.bg, kpi.color)}>{kpi.icon}</div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{kpi.label}</p>
            {kpi.change && <p className={cn("text-xs font-medium mt-1", kpi.change.startsWith("+") ? "text-green-600" : kpi.change.startsWith("-") ? "text-red-600" : "text-muted-foreground")}>{kpi.change} vs. mês ant.</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Solicitações por período</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CHART_MONTHLY} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#8A7B72" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8A7B72" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #EDE8E0" }} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="solicitacoes" name="Solicitações" fill="#C4674A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="locacoes" name="Locações" fill="#7A9E7E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Receita estimada vs. meta</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_REVENUE}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C4674A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C4674A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#8A7B72" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8A7B72" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #EDE8E0" }} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <Legend iconType="circle" iconSize={8} />
              <Area type="monotone" dataKey="meta" name="Meta" stroke="#EDE8E0" strokeDasharray="5 5" fill="none" />
              <Area type="monotone" dataKey="receita" name="Receita" stroke="#C4674A" fill="url(#colorReceita)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pendencies + Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Pendências</p>
          <div className="flex flex-col gap-3">
            {pendencies.map((p, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-none">
                <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", p.urgent ? "bg-red-500" : "bg-amber-400")} />
                <p className="text-sm text-foreground">{p.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Atividade recente</p>
          <div className="flex flex-col gap-3">
            {[
              { action: "Orçamento ORC-2024-0041 recebido", time: "Há 12 min", icon: <FileText size={14} className="text-blue-500" /> },
              { action: "Reserva RES-2024-0019 confirmada", time: "Há 1 hora", icon: <CheckCircle size={14} className="text-green-500" /> },
              { action: "Higienização RM-SF01-002 concluída", time: "Há 2 horas", icon: <Droplets size={14} className="text-cyan-500" /> },
              { action: "Cliente Fernanda Lima — novo orçamento", time: "Há 3 horas", icon: <Users size={14} className="text-purple-500" /> },
              { action: "Entrega RES-2024-0018 realizada", time: "Há 4 horas", icon: <Truck size={14} className="text-emerald-500" /> },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-none">
                <div className="w-6 h-6 bg-secondary rounded-lg flex items-center justify-center shrink-0">{a.icon}</div>
                <p className="text-sm text-foreground flex-1">{a.action}</p>
                <p className="text-xs text-muted-foreground shrink-0">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN PRODUCTS ───────────────────────────────────────────────────────────

function AdminProducts() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const statusColors: Record<Product["status"], string> = {
    available: "bg-green-50 text-green-700 border-green-200",
    few_units: "bg-amber-50 text-amber-700 border-amber-200",
    on_demand: "bg-gray-50 text-gray-600 border-gray-200",
    unavailable: "bg-red-50 text-red-700 border-red-200",
  };
  const statusLabels: Record<Product["status"], string> = {
    available: "Disponível", few_units: "Poucas unidades", on_demand: "Sob consulta", unavailable: "Indisponível"
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Produtos</h1>
        <Btn variant="primary" size="sm" onClick={() => setModal(true)}><Plus size={14} />Novo produto</Btn>
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar produto..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <Select label="" options={["Todas categorias", ...CATEGORIES.map(c => c.name)]} value="Todas categorias" onChange={() => {}} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {["Produto", "Categoria", "Preço/semana", "Status", "Avaliação", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand} · {p.model}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">R$ {p.priceWeekly}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", statusColors[p.status])}>{statusLabels[p.status]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={12} fill="currentColor" />
                      <span className="text-xs text-foreground">{p.rating}</span>
                      <span className="text-xs text-muted-foreground">({p.reviews})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={14} /></button>
                      <button className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>{filtered.length} produto{filtered.length !== 1 ? "s" : ""}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border border-border hover:bg-secondary transition-colors">Anterior</button>
            <button className="px-3 py-1 rounded-lg bg-primary text-white">1</button>
            <button className="px-3 py-1 rounded-lg border border-border hover:bg-secondary transition-colors">Próxima</button>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground text-lg">Novo produto</h2>
              <button onClick={() => setModal(false)}><X size={20} className="text-muted-foreground" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Nome do produto" placeholder="Ex: MamaRoo 4.0" required />
              <Input label="Marca" placeholder="Ex: 4moms" required />
              <Input label="Modelo" placeholder="Ex: Classic Grey" />
              <Select label="Categoria" options={["Selecione...", ...CATEGORIES.map(c => c.name)]} value="Selecione..." onChange={() => {}} />
              <Input label="Preço por diária (R$)" type="number" placeholder="29" required />
              <Input label="Preço por semana (R$)" type="number" placeholder="149" required />
              <Input label="Preço mensal (R$)" type="number" placeholder="399" />
              <Select label="Status" options={["Disponível", "Poucas unidades", "Sob consulta", "Indisponível"]} value="Disponível" onChange={() => {}} />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Descrição</label>
                <textarea rows={3} placeholder="Descrição do produto..." className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm" />
              </div>
              <Input label="Faixa etária mínima" placeholder="0 meses" />
              <Input label="Faixa etária máxima" placeholder="6 meses" />
              <Input label="Peso máximo (kg)" placeholder="9" />
              <Input label="Duração mínima (dias)" placeholder="7" />
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <Btn variant="outline" onClick={() => setModal(false)}>Cancelar</Btn>
              <Btn variant="secondary">Salvar rascunho</Btn>
              <Btn variant="primary">Publicar produto</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN QUOTES ─────────────────────────────────────────────────────────────

function AdminQuotes() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const statuses = ["Todos", "Em análise", "Orçamento enviado", "Aprovado", "Aguardando informações", "Convertido em reserva", "Recusado", "Expirado", "Cancelado"];
  const filtered = QUOTES_DATA.filter(q =>
    (filterStatus === "Todos" || q.status === filterStatus) &&
    (search === "" || q.customer.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Orçamentos</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Novo orçamento</Btn>
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente ou número..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {["Número", "Cliente", "Produtos", "Período", "Valor", "Status", "Atualizado", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(q => (
                <tr key={q.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">{q.id}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{q.customer}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-32 truncate">{q.products}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{q.period}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{q.value}</td>
                  <td className="px-4 py-3"><StatusBadge status={q.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{q.updatedAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={14} /></button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><MoreHorizontal size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border text-sm text-muted-foreground">
          {filtered.length} orçamento{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN RESERVATIONS ───────────────────────────────────────────────────────

function AdminReservations() {
  const [tab, setTab] = useState("todas");
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Reservas e Locações</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Nova reserva</Btn>
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {[["todas", "Todas"], ["ativas", "Ativas"], ["entrega-hoje", "Entrega hoje"], ["devolucao", "Devolução próxima"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors", tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
          >{label}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {["Número", "Cliente", "Produto", "Unidade", "Período", "Status", "Pagamento", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RESERVATIONS.map(r => (
              <tr key={r.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">{r.id}</td>
                <td className="px-4 py-3 text-sm text-foreground">{r.customer}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.product}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.unit}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{r.start} – {r.end}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3"><StatusBadge status={r.payment} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN CLIENTS ────────────────────────────────────────────────────────────

function AdminClients() {
  const [search, setSearch] = useState("");
  const filtered = CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Clientes</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Novo cliente</Btn>
      </div>

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary border-b border-border">
              <tr>
                {["Cliente", "CPF", "E-mail", "Telefone", "Cidade", "Locações", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">{c.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">Desde {c.since}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{c.cpf}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.city}</td>
                  <td className="px-4 py-3 text-sm text-center text-foreground">{c.orders}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN CALENDAR ───────────────────────────────────────────────────────────

function AdminCalendar() {
  const [viewType, setViewType] = useState("semana");
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const events = [
    { day: 0, title: "Entrega RES-019", time: "09:00", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { day: 0, title: "Entrega RES-018", time: "14:00", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { day: 1, title: "Higienização RM-SF01", time: "10:00", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
    { day: 2, title: "Devolução RES-014", time: "11:00", color: "bg-amber-100 text-amber-700 border-amber-200" },
    { day: 3, title: "Entrega RES-017", time: "13:00", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { day: 4, title: "Manutenção RM-MR40-003", time: "09:30", color: "bg-red-100 text-red-700 border-red-200" },
    { day: 4, title: "Devolução RES-016", time: "15:00", color: "bg-amber-100 text-amber-700 border-amber-200" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Calendário operacional</h1>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border">
            {["dia", "semana", "mes"].map(v => (
              <button key={v} onClick={() => setViewType(v)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors", viewType === v ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground")}>
                {v === "mes" ? "Mês" : v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {days.map(d => (
            <div key={d} className="text-center py-3 text-xs font-semibold text-muted-foreground border-r border-border last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-[400px]">
          {days.map((d, i) => {
            const dayEvents = events.filter(e => e.day === i);
            return (
              <div key={d} className="border-r border-border last:border-r-0 p-2 flex flex-col gap-1.5">
                <p className="text-sm font-medium text-muted-foreground text-center py-1">{10 + i}</p>
                {dayEvents.map((ev, j) => (
                  <div key={j} className={cn("rounded-lg px-2 py-1.5 text-xs border cursor-pointer hover:opacity-80 transition-opacity", ev.color)}>
                    <p className="font-medium leading-snug">{ev.title}</p>
                    <p className="opacity-70">{ev.time}</p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {[["bg-blue-100 text-blue-700 border-blue-200", "Entregas"], ["bg-amber-100 text-amber-700 border-amber-200", "Devoluções"], ["bg-cyan-100 text-cyan-700 border-cyan-200", "Higienização"], ["bg-red-100 text-red-700 border-red-200", "Manutenção"]].map(([cls, label]) => (
          <span key={label} className={cn("text-xs px-3 py-1 rounded-full border font-medium", cls)}>{label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN DELIVERY ───────────────────────────────────────────────────────────

function AdminDelivery() {
  const deliveries = [
    { id: "ENT-2024-0021", res: "RES-2024-0019", customer: "Fernanda Lima", address: "R. das Flores, 142 — Campinas, SP", date: "01/07/2024", time: "09:00–12:00", status: "Agendada", driver: "Carlos M." },
    { id: "ENT-2024-0020", res: "RES-2024-0017", customer: "Carla Menezes", address: "R. Copacabana, 55 — Rio de Janeiro, RJ", date: "30/06/2024", time: "13:00–17:00", status: "Em rota", driver: "João S." },
    { id: "ENT-2024-0019", res: "RES-2024-0018", customer: "Ana Clara Ferreira", address: "Av. Paulista, 900 — São Paulo, SP", date: "15/06/2024", time: "10:00–13:00", status: "Entregue", driver: "Carlos M." },
    { id: "DEV-2024-0015", res: "RES-2024-0014", customer: "Beatriz Oliveira", address: "R. Guarulhos, 33 — Guarulhos, SP", date: "02/07/2024", time: "09:00–12:00", status: "A agendar", driver: "—" },
    { id: "DEV-2024-0014", res: "RES-2024-0016", customer: "Gabriela Santos", address: "R. dos Caetés, 780 — Belo Horizonte, MG", date: "24/06/2024", time: "14:00–17:00", status: "Entregue", driver: "Pedro A." },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Entregas e Retiradas</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Agendar entrega</Btn>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {["ID", "Reserva", "Cliente", "Endereço", "Data", "Janela", "Motorista", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deliveries.map(d => (
              <tr key={d.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{d.id}</td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">{d.res}</td>
                <td className="px-4 py-3 text-sm text-foreground">{d.customer}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-40 truncate">{d.address}</td>
                <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{d.date}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{d.time}</td>
                <td className="px-4 py-3 text-sm text-foreground">{d.driver}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN HYGIENE ────────────────────────────────────────────────────────────

function AdminHygiene() {
  const records = [
    { id: "HIG-2024-0012", unit: "RM-SF01-002", product: "Stages FX", entry: "24/06/2024", responsible: "Equipe Higienização", status: "Aprovada", done: "25/06/2024" },
    { id: "HIG-2024-0011", unit: "RM-MR40-001", product: "MamaRoo 4.0", entry: "10/05/2024", responsible: "Equipe Higienização", status: "Aprovada", done: "11/05/2024" },
    { id: "HIG-2024-0013", unit: "RM-BS01-001", product: "Boutique Swing", entry: "01/07/2024", responsible: "Equipe Higienização", status: "Em andamento", done: "—" },
    { id: "HIG-2024-0014", unit: "RM-P2S-001", product: "Polly 2 Start", entry: "20/06/2024", responsible: "Equipe Higienização", status: "Aguardando secagem", done: "—" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Higienização</h1>
        <Btn variant="primary" size="sm"><Plus size={14} />Novo registro</Btn>
      </div>
      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              {["ID", "Unidade", "Produto", "Entrada", "Responsável", "Status", "Conclusão", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map(r => (
              <tr key={r.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.id}</td>
                <td className="px-4 py-3 text-xs font-mono text-foreground">{r.unit}</td>
                <td className="px-4 py-3 text-sm text-foreground">{r.product}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.entry}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.responsible}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{r.done}</td>
                <td className="px-4 py-3">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN REPORTS ────────────────────────────────────────────────────────────

function AdminReports() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Relatórios</h1>
        <div className="flex gap-2">
          <Btn variant="outline" size="sm"><Download size={14} />Exportar CSV</Btn>
          <Btn variant="outline" size="sm"><Download size={14} />Exportar PDF</Btn>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Produtos mais alugados (Jun/2024)</p>
          <div className="flex flex-col gap-3">
            {CHART_PRODUCTS.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1"><span className="text-foreground">{p.name}</span><span className="text-muted-foreground">{p.value} loc.</span></div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(p.value / 34) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <p className="font-semibold text-foreground mb-4">Receita por mês</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={CHART_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8E0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#8A7B72" }} />
              <YAxis tick={{ fontSize: 12, fill: "#8A7B72" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #EDE8E0" }} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <Line type="monotone" dataKey="receita" name="Receita" stroke="#C4674A" strokeWidth={2} dot={{ fill: "#C4674A" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 lg:col-span-2">
          <p className="font-semibold text-foreground mb-4">Resumo do período</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["Solicitações", "94", "Jun/2024"],
              ["Conversão", "87%", "+3pp"],
              ["Ticket médio", "R$ 238", "+12%"],
              ["Renovações", "14", "+2"],
            ].map(([label, value, sub]) => (
              <div key={label} className="bg-secondary rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
                <p className="text-xs text-accent font-medium mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN GENERIC ────────────────────────────────────────────────────────────

// ─── ADMIN CONFIG ─────────────────────────────────────────────────────────────

function AdminConfig({ shippingZones, setShippingZones }: {
  shippingZones: ShippingZone[];
  setShippingZones: React.Dispatch<React.SetStateAction<ShippingZone[]>>;
}) {
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [tab, setTab] = useState("frete");
  const [saved, setSaved] = useState(false);

  const handleSaveZone = () => {
    if (!editingZone) return;
    setShippingZones(prev =>
      prev.some(z => z.id === editingZone.id)
        ? prev.map(z => z.id === editingZone.id ? editingZone : z)
        : [...prev, editingZone]
    );
    setEditingZone(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteZone = (id: number) => {
    setShippingZones(prev => prev.filter(z => z.id !== id));
  };

  const newZoneId = Math.max(0, ...shippingZones.map(z => z.id)) + 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
        {saved && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
            <CheckCircle size={14} />Salvo com sucesso
          </div>
        )}
      </div>

      <div className="flex gap-1 border-b border-border mb-6">
        {[["frete", "Tabela de frete"], ["geral", "Geral"], ["notificacoes", "Notificações"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors", tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "frete" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-semibold text-foreground">Zonas de frete</p>
              <p className="text-sm text-muted-foreground mt-0.5">Configure as regiões de atendimento e os valores de entrega</p>
            </div>
            <Btn variant="primary" size="sm" onClick={() => setEditingZone({ id: newZoneId, name: "", cepPrefix: "", rate: 0, description: "" })}>
              <Plus size={14} />Nova zona
            </Btn>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden mb-4">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {["Zona", "Prefixos de CEP (2 dígitos)", "Frete (R$)", "Descrição", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shippingZones.map(zone => (
                  <tr key={zone.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{zone.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {zone.cepPrefix.split(",").slice(0, 8).map(p => (
                          <span key={p.trim()} className="text-xs bg-secondary border border-border px-1.5 py-0.5 rounded font-mono">{p.trim()}</span>
                        ))}
                        {zone.cepPrefix.split(",").length > 8 && (
                          <span className="text-xs text-muted-foreground">+{zone.cepPrefix.split(",").length - 8}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">R$ {zone.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{zone.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingZone({ ...zone })} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteZone(zone.id)} className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <Info size={14} className="inline mr-1" />
            Os prefixos são os <strong>2 primeiros dígitos do CEP</strong>, separados por vírgula. Ex: "01,02,03" cobre CEPs de 01000-000 a 03999-999. O sistema usa a <strong>primeira zona correspondente</strong> que encontrar.
          </div>

          {/* Edit modal */}
          {editingZone && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
              <div className="bg-white rounded-2xl border border-border p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-foreground">{editingZone.name || "Nova zona de frete"}</h2>
                  <button onClick={() => setEditingZone(null)}><X size={20} className="text-muted-foreground" /></button>
                </div>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Nome da zona"
                    placeholder="Ex: São Paulo Capital"
                    value={editingZone.name}
                    onChange={v => setEditingZone({ ...editingZone, name: v })}
                    required
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Prefixos de CEP (2 dígitos) <span className="text-primary">*</span></label>
                    <textarea
                      value={editingZone.cepPrefix}
                      onChange={e => setEditingZone({ ...editingZone, cepPrefix: e.target.value })}
                      placeholder="Ex: 01,02,03,04,05"
                      rows={2}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Separe os prefixos por vírgula. Cada prefixo = 2 dígitos do início do CEP.</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-foreground">Valor do frete (R$) <span className="text-primary">*</span></label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={editingZone.rate}
                      onChange={e => setEditingZone({ ...editingZone, rate: Number(e.target.value) })}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Input
                    label="Descrição (opcional)"
                    placeholder="Ex: Região metropolitana de SP"
                    value={editingZone.description}
                    onChange={v => setEditingZone({ ...editingZone, description: v })}
                  />
                </div>
                <div className="flex gap-3 mt-6 justify-end">
                  <Btn variant="outline" onClick={() => setEditingZone(null)}>Cancelar</Btn>
                  <Btn variant="primary" onClick={handleSaveZone}>
                    <Check size={14} />Salvar zona
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {(tab === "geral" || tab === "notificacoes") && (
        <div className="bg-white rounded-xl border border-border p-12 text-center text-muted-foreground">
          <Settings size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">Seção em desenvolvimento</p>
          <p className="text-sm mt-1">Esta área estará disponível em breve.</p>
        </div>
      )}
    </div>
  );
}

function AdminGeneric({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-foreground mb-6">{title}</h1>
      <div className="bg-white rounded-xl border border-border p-12 text-center text-muted-foreground">
        <Archive size={40} className="mx-auto mb-4 opacity-30" />
        <p className="font-medium">Seção em desenvolvimento</p>
        <p className="text-sm mt-1">Esta área estará disponível em breve.</p>
      </div>
    </div>
  );
}

// ─── COOKIE BANNER ────────────────────────────────────────────────────────────

function CookieBanner({ onAccept }: { onAccept: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-0.5">Usamos cookies para melhorar sua experiência</p>
          <p className="text-xs text-muted-foreground">Utilizamos cookies essenciais e, com seu consentimento, cookies analíticos. Consulte nossa <button className="text-primary underline">Política de Privacidade</button>.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onAccept} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg">Apenas essenciais</button>
          <Btn variant="primary" size="sm" onClick={onAccept}>Aceitar todos</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── WHATSAPP FLOAT ───────────────────────────────────────────────────────────

function WhatsAppFloat() {
  return (
    <a
      href="https://wa.me/[NUMERO]"
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-40 w-13 h-13 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
      style={{ width: 52, height: 52 }}
      title="Falar no WhatsApp"
    >
      <MessageCircle size={24} />
    </a>
  );
}

// ─── APP ROUTER ───────────────────────────────────────────────────────────────

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [currentProductId, setCurrentProductId] = useState<string>("mamaroo-40");
  const [auth, setAuth] = useState<AuthState>("guest");
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(DEFAULT_SHIPPING_ZONES);

  const navigate = useCallback((page: Page, params?: Record<string, string>) => {
    setCurrentPage(page);
    if (params?.productId) setCurrentProductId(params.productId);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLogin = useCallback((email: string) => {
    if (email.toLowerCase().includes("admin")) {
      setAuth("admin");
      navigate("admin");
    } else {
      setAuth("client");
      navigate("account");
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    setAuth("guest");
    navigate("home");
  }, [navigate]);

  const handleAddToQuote = useCallback((product: Product) => {
    setQuoteItems(prev => {
      if (prev.some(item => item.product.id === product.id)) return prev;
      return [...prev, { product, days: 7, startDate: "", endDate: "", qty: 1 }];
    });
  }, []);

  const handleRemoveFromQuote = useCallback((productId: string) => {
    setQuoteItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const quoteItemIds = quoteItems.map(i => i.product.id);
  const isAdminPage = currentPage.startsWith("admin");
  const isAccountPage = currentPage.startsWith("account");

  // Auth guard for account pages
  if (isAccountPage && auth === "guest") {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen bg-background">
        <Header currentPage={currentPage} navigate={navigate} quoteCount={quoteItems.length} auth={auth} onLogout={handleLogout} />
        <LoginPage navigate={navigate} onLogin={handleLogin} />
        <Footer navigate={navigate} />
      </div>
    );
  }

  // Admin layout
  if (isAdminPage) {
    if (auth !== "admin") {
      return (
        <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen bg-background">
          <Header currentPage={currentPage} navigate={navigate} quoteCount={quoteItems.length} auth={auth} onLogout={handleLogout} />
          <LoginPage navigate={navigate} onLogin={handleLogin} />
          <Footer navigate={navigate} />
        </div>
      );
    }
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen">
        <AdminLayout currentPage={currentPage} navigate={navigate} onLogout={handleLogout}>
          {currentPage === "admin" && <AdminDashboard />}
          {currentPage === "admin-products" && <AdminProducts />}
          {currentPage === "admin-quotes" && <AdminQuotes />}
          {currentPage === "admin-reservations" && <AdminReservations />}
          {currentPage === "admin-clients" && <AdminClients />}
          {currentPage === "admin-calendar" && <AdminCalendar />}
          {currentPage === "admin-delivery" && <AdminDelivery />}
          {currentPage === "admin-hygiene" && <AdminHygiene />}
          {currentPage === "admin-reports" && <AdminReports />}
          {currentPage === "admin-users" && <AdminGeneric title="Usuários e permissões" />}
          {currentPage === "admin-config" && <AdminConfig shippingZones={shippingZones} setShippingZones={setShippingZones} />}
        </AdminLayout>
      </div>
    );
  }

  // Account layout
  if (isAccountPage) {
    return (
      <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen bg-background">
        <Header currentPage={currentPage} navigate={navigate} quoteCount={quoteItems.length} auth={auth} onLogout={handleLogout} />
        <AccountLayout currentPage={currentPage} navigate={navigate}>
          {currentPage === "account" && <AccountDashboard navigate={navigate} />}
          {currentPage === "account-quotes" && <AccountQuotes navigate={navigate} />}
          {currentPage === "account-reservations" && <AccountReservations navigate={navigate} />}
          {currentPage === "account-contracts" && (
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-6">Contratos</h1>
              <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
                <FileText size={40} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">Nenhum contrato pendente</p>
                <p className="text-sm mt-1">Seus contratos aparecerão aqui após a confirmação da reserva.</p>
              </div>
            </div>
          )}
          {currentPage === "account-profile" && <AccountProfile navigate={navigate} />}
        </AccountLayout>
        <Footer navigate={navigate} />
      </div>
    );
  }

  // Public layout
  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen bg-background">
      <Header currentPage={currentPage} navigate={navigate} quoteCount={quoteItems.length} auth={auth} onLogout={handleLogout} />

      {currentPage === "home" && <HomePage navigate={navigate} onAddToQuote={handleAddToQuote} quoteItemIds={quoteItemIds} />}
      {currentPage === "catalog" && <CatalogPage navigate={navigate} onAddToQuote={handleAddToQuote} quoteItemIds={quoteItemIds} />}
      {currentPage === "product" && <ProductPage productId={currentProductId} navigate={navigate} onAddToQuote={handleAddToQuote} quoteItemIds={quoteItemIds} shippingZones={shippingZones} />}
      {currentPage === "quote" && <QuotePage navigate={navigate} quoteItems={quoteItems} onRemoveItem={handleRemoveFromQuote} auth={auth} shippingZones={shippingZones} />}
      {currentPage === "quote-success" && <QuoteSuccessPage navigate={navigate} />}
      {currentPage === "login" && <LoginPage navigate={navigate} onLogin={handleLogin} />}
      {currentPage === "signup" && <SignupPage navigate={navigate} onLogin={handleLogin} />}
      {currentPage === "forgot-password" && (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-2xl text-foreground mb-4">Recuperar senha</h1>
          <p className="text-muted-foreground mb-6">Informe seu e-mail e enviaremos as instruções de recuperação.</p>
          <Input label="E-mail" type="email" placeholder="seu@email.com" required />
          <Btn variant="primary" fullWidth className="mt-4">Enviar instruções</Btn>
          <button onClick={() => navigate("login")} className="mt-4 text-sm text-primary hover:underline block mx-auto">Voltar para o login</button>
        </div>
      )}
      {currentPage === "how-it-works" && <HowItWorksPage navigate={navigate} />}
      {currentPage === "hygiene-page" && <HygienePage navigate={navigate} />}
      {currentPage === "about" && <AboutPage navigate={navigate} />}
      {currentPage === "faq" && <FAQPage navigate={navigate} />}
      {currentPage === "contact" && <ContactPage navigate={navigate} />}
      {currentPage === "compare" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-3xl text-foreground mb-8">Comparar produtos</h1>
          <div className="grid sm:grid-cols-3 gap-6">
            {PRODUCTS.slice(0, 3).map(p => (
              <div key={p.id} className="bg-card rounded-2xl border border-border p-5">
                <img src={p.photo} alt={p.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                <p className="font-semibold text-foreground mb-2">{p.name}</p>
                {[["Marca", p.brand], ["Idade", `${p.ageMin}–${p.ageMax}`], ["Peso máx.", p.weightMax], ["Preço/semana", `R$ ${p.priceWeekly}`], ["Status", "Disponível"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-t border-border text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground font-medium">{v}</span>
                  </div>
                ))}
                <Btn variant="primary" fullWidth className="mt-4" onClick={() => { handleAddToQuote(p); navigate("quote"); }}>Adicionar ao orçamento</Btn>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer navigate={navigate} />
      <WhatsAppFloat />
      {!cookieDismissed && <CookieBanner onAccept={() => setCookieDismissed(true)} />}
    </div>
  );
}
