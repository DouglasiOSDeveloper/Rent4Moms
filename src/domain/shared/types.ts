export type Page =
  | "home" | "catalog" | "product" | "compare"
  | "quote" | "quote-success"
  | "login" | "signup" | "forgot-password"
  | "account" | "account-quotes" | "account-reservations" | "account-order" | "account-contracts" | "account-profile"
  | "how-it-works" | "hygiene-page" | "about" | "faq" | "contact"
  | "privacy-policy" | "terms-of-use" | "cancellation-policy" | "delivery-policy" | "rental-contract" | "cookie-preferences"
  | "admin" | "admin-products" | "admin-quotes" | "admin-order" | "admin-reservations"
  | "admin-clients" | "admin-inventory" | "admin-calendar" | "admin-delivery" | "admin-hygiene" | "admin-maintenance"
  | "admin-reports" | "admin-users" | "admin-categories" | "admin-configurator" | "admin-customer-experience" | "admin-content" | "admin-config";

export type AuthState = "guest" | "client" | "admin";

export type { Product } from "../catalog/types";


export interface Customer { id: string; name: string; cpf: string; email: string; phone: string; city: string; status: string; since: string; orders: number }
export interface QuoteRecord { id: string; customer: string; products: string; period: string; value: string; status: string; date: string; updatedAt: string }
export interface Reservation { id: string; customer: string; product: string; unit: string; start: string; end: string; status: string; address: string; payment: string }

export interface ShippingZone {
  id: number; name: string; cepPrefix: string; rate: number; description: string;
}
