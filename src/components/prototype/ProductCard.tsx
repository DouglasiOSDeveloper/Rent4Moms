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
import type { Page, Product } from "../../domain/shared/types";
import { AvailabilityBadge, Btn, cn } from "./PrototypeUI";
import { calculateRentalPrice } from "../../domain/pricing/pricingEngine";
import { formatMoneyFromCents } from "../../lib/money";

export function ProductCard({ product, categoryNames, navigate, onAddToQuote, isInQuote, isComparing, onToggleCompare, actionsMode = "full" }: {
  product: Product; categoryNames: string[]; navigate: (p: Page, params?: Record<string, string>) => void;
  onAddToQuote: (p: Product) => void; isInQuote: boolean; isComparing: boolean;
  onToggleCompare: (id: string) => void;
  actionsMode?: "full" | "details-only";
}) {
  const [fav, setFav] = useState(false);
  const monthlyPrice = calculateRentalPrice({
    rates: { daily: product.priceDaily, weekly: product.priceWeekly, monthly: product.priceMonthly },
    days: 30,
  });
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col">
      <div className="relative overflow-hidden">
        <img
          src={product.photo}
          alt={product.name}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap pr-12">
          {(categoryNames.length ? categoryNames : ["Sem categoria"]).slice(0, 2).map((categoryName) => (
            <span key={categoryName} className="text-xs bg-white/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded-full font-medium border border-white/50">{categoryName}</span>
          ))}
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
          <p className="text-xl font-bold text-foreground">{formatMoneyFromCents(monthlyPrice.totalCents)}<span className="text-sm font-normal text-muted-foreground"> / 30 dias</span></p>
          <p className="text-xs text-muted-foreground mt-0.5">Valor final calculado conforme o período</p>
        </div>
        <div className="flex gap-2 mt-2">
          <Btn variant="outline" size="sm" onClick={() => navigate("product", { productId: product.id })} className="flex-1">
            <Eye size={14} />Ver produto
          </Btn>
          {actionsMode === "full" && (
            <Btn
              variant={isInQuote ? "secondary" : "primary"}
              size="sm"
              onClick={() => onAddToQuote(product)}
              className="flex-1"
            >
              {isInQuote ? <><Check size={14} />Adicionado</> : <><Plus size={14} />Orçamento</>}
            </Btn>
          )}
        </div>
        {actionsMode === "full" && (
          <button
            onClick={() => onToggleCompare(product.id)}
            className={cn("text-xs underline text-center transition-colors", isComparing ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground")}
          >
            {isComparing ? "✓ Comparando" : "Comparar produto"}
          </button>
        )}
      </div>
    </div>
  );
}

