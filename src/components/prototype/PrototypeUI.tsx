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
import type { Product } from "../../domain/shared/types";

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Btn({
  children, variant = "primary", size = "md", onClick, disabled, className, type = "button", fullWidth
}: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg"; onClick?: () => void; disabled?: boolean;
  className?: string; type?: "button" | "submit"; fullWidth?: boolean;
}) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-base", lg: "px-7 py-3.5 text-base" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] active:scale-[0.98] shadow-sm",
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

export function StatusBadge({ status }: { status: string }) {
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
    "Disponível": { color: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle size={11} /> },
    "Bloqueada": { color: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock size={11} /> },
    "Reservada": { color: "bg-blue-50 text-blue-700 border border-blue-200", icon: <Lock size={11} /> },
    "Em locação": { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", icon: <Activity size={11} /> },
    "Devolvida": { color: "bg-indigo-50 text-indigo-700 border border-indigo-200", icon: <Archive size={11} /> },
    "Em inspeção": { color: "bg-purple-50 text-purple-700 border border-purple-200", icon: <Eye size={11} /> },
    "Em lavagem": { color: "bg-cyan-50 text-cyan-700 border border-cyan-200", icon: <Droplets size={11} /> },
    "Em manutenção": { color: "bg-orange-50 text-orange-700 border border-orange-200", icon: <Wrench size={11} /> },
    "Indisponível": { color: "bg-red-50 text-red-700 border border-red-200", icon: <XCircle size={11} /> },
    "Baixada": { color: "bg-gray-50 text-gray-500 border border-gray-200", icon: <Archive size={11} /> },
    "Aguardando": { color: "bg-gray-50 text-gray-700 border border-gray-200", icon: <Clock size={11} /> },
    "Em andamento": { color: "bg-blue-50 text-blue-700 border border-blue-200", icon: <Activity size={11} /> },
    "Secagem": { color: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Droplets size={11} /> },
    "Inspeção": { color: "bg-purple-50 text-purple-700 border border-purple-200", icon: <Eye size={11} /> },
    "Aprovada": { color: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle size={11} /> },
    "Reprovada": { color: "bg-red-50 text-red-700 border border-red-200", icon: <XCircle size={11} /> },
    "Aberta": { color: "bg-blue-50 text-blue-700 border border-blue-200", icon: <Wrench size={11} /> },
    "Diagnóstico": { color: "bg-purple-50 text-purple-700 border border-purple-200", icon: <Eye size={11} /> },
    "Aguardando peças": { color: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock size={11} /> },
    "Em reparo": { color: "bg-orange-50 text-orange-700 border border-orange-200", icon: <Wrench size={11} /> },
    "Em teste": { color: "bg-cyan-50 text-cyan-700 border border-cyan-200", icon: <Activity size={11} /> },
    "Sem reparo": { color: "bg-red-50 text-red-700 border border-red-200", icon: <XCircle size={11} /> },
    "Pendente": { color: "bg-gray-50 text-gray-700 border border-gray-200", icon: <Clock size={11} /> },
    "Recebido": { color: "bg-green-50 text-green-700 border border-green-200", icon: <CheckCircle size={11} /> },
    "Parcial": { color: "bg-amber-50 text-amber-700 border border-amber-200", icon: <Clock size={11} /> },
  };
  const style = map[status] || { color: "bg-gray-50 text-gray-600 border border-gray-200", icon: <Hash size={11} /> };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", style.color)}>
      {style.icon}{status}
    </span>
  );
}

export function AvailabilityBadge({ status }: { status: Product["status"] }) {
  const map = {
    available: { label: "Disponível", cls: "bg-green-100 text-green-700" },
    few_units: { label: "Poucas unidades", cls: "bg-amber-100 text-amber-700" },
    on_demand: { label: "Sob consulta", cls: "bg-gray-100 text-gray-600" },
    unavailable: { label: "Indisponível", cls: "bg-red-100 text-red-700" },
  };
  const { label, cls } = map[status];
  return <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cls)}>{label}</span>;
}

export function Input({
  label, placeholder, type = "text", value, onChange, helper, required, icon, error,
  id, name, min, max, maxLength, inputMode, autoComplete, disabled, readOnly, onBlur,
}: {
  label?: string; placeholder?: string; type?: string; value?: string;
  onChange?: (v: string) => void; helper?: string; required?: boolean; icon?: React.ReactNode;
  error?: string; id?: string; name?: string; min?: string | number; max?: string | number;
  maxLength?: number; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string; disabled?: boolean; readOnly?: boolean; onBlur?: () => void;
}) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-foreground">{label}{required && <span className="text-primary ml-0.5">*</span>}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={Boolean(error)}
          aria-describedby={(helper || error) ? descriptionId : undefined}
          className={cn(
            "w-full rounded-xl border bg-input-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all",
            error ? "border-destructive" : "border-border",
            icon && "pl-10",
            disabled && "opacity-60 cursor-not-allowed",
            readOnly && "bg-muted/60",
          )}
        />
      </div>
      {(error || helper) && <p id={descriptionId} className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>{error ?? helper}</p>}
    </div>
  );
}

export function Select({ label, options, value, onChange }: {
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

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
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

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
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

