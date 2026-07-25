import React, { useCallback } from "react";
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router";
import { CookieBanner } from "../components/layout/CookieBanner";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { WhatsAppFloat } from "../components/layout/WhatsAppFloat";
import { SkipLink } from "../components/layout/SkipLink";
import { AccountDashboard, AccountLayout, AccountOrderDetail, AccountProfile, AccountQuotes, AccountReservations } from "../features/account/AccountPages";
import { AdminLayout } from "../features/admin/AdminLayout";
import { AdminHelp } from "../features/admin/help/AdminHelp";
import { AdminCategories } from "../features/admin/categories/AdminCategories";
import { AdminConfigurator } from "../features/admin/configurator/AdminConfigurator";
import { AdminInventory } from "../features/admin/inventory/AdminInventory";
import { AdminCustomerExperience } from "../features/admin/customerExperience/AdminCustomerExperience";
import { AdminContent } from "../features/admin/content/AdminContent";
import { AdminOrderDetail, AdminOrdersList } from "../features/admin/operations/AdminOrders";
import { AdminDeliveryOperations, AdminHygieneOperations, AdminMaintenanceOperations } from "../features/admin/operations/AdminOperationQueues";
import {
  AdminCalendar,
  AdminClients,
  AdminConfig,
  AdminDashboard,
  AdminUsers,
  AdminProducts,
  AdminReports,
} from "../features/admin/AdminPages";
import { LoginPage, SignupPage } from "../features/auth/pages/AuthPages";
import { CatalogPage } from "../features/catalog/pages/CatalogPage";
import { HomePage } from "../features/home/pages/HomePage";
import { ProductPage } from "../features/product/pages/ProductPage";
import { AboutPage, ContactPage, FAQPage, HowItWorksPage, HygienePage } from "../features/public/pages/PublicPages";
import { LegalPage } from "../features/public/pages/LegalPage";
import { AccountContractsPage, ComparePage, ForgotPasswordPage } from "../features/public/pages/UtilityPages";
import { QuotePage, QuoteSuccessPage } from "../features/quote/pages/QuotePages";
import type { AuthState } from "../domain/shared/types";
import { RequireRole } from "./guards/RequireRole";
import { pageFromPathname, pagePath, type NavigateToPage } from "./navigation";
import { useAppState } from "./providers";
import { useQuote } from "../stores/quote/QuoteProvider";

function PublicShell({
  currentPage,
  navigate,
  onLogout,
}: {
  currentPage: ReturnType<typeof pageFromPathname>;
  navigate: NavigateToPage;
  onLogout: () => void;
}) {
  const { auth, cookieDismissed, dismissCookie } = useAppState();
  const { draft } = useQuote();

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen bg-background">
      <SkipLink />
      <Header currentPage={currentPage} navigate={navigate} quoteCount={draft.items.length} auth={auth} onLogout={onLogout} />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer navigate={navigate} />
      <WhatsAppFloat />
      {!cookieDismissed && <CookieBanner onAccept={dismissCookie} onManage={() => { dismissCookie(); navigate("cookie-preferences"); }} />}
    </div>
  );
}

function AccountShell({
  currentPage,
  navigate,
  onLogout,
}: {
  currentPage: ReturnType<typeof pageFromPathname>;
  navigate: NavigateToPage;
  onLogout: () => void;
}) {
  const { auth, user } = useAppState();
  const { draft } = useQuote();

  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen bg-background">
      <SkipLink />
      <Header currentPage={currentPage} navigate={navigate} quoteCount={draft.items.length} auth={auth} onLogout={onLogout} />
      <AccountLayout currentPage={currentPage} navigate={navigate} onLogout={onLogout} userName={user?.name ?? "Cliente"}>
        <Outlet />
      </AccountLayout>
      <Footer navigate={navigate} />
    </div>
  );
}

function AdminShell({ currentPage, navigate, onLogout }: {
  currentPage: ReturnType<typeof pageFromPathname>;
  navigate: NavigateToPage;
  onLogout: () => void;
}) {
  const { user } = useAppState();
  return (
    <div style={{ fontFamily: "'Manrope', sans-serif" }} className="min-h-screen">
      <SkipLink />
      <AdminLayout currentPage={currentPage} navigate={navigate} onLogout={onLogout} userName={user?.name} userEmail={user?.email}>
        <Outlet />
      </AdminLayout>
    </div>
  );
}

function ProductRoute({ navigate }: { navigate: NavigateToPage }) {
  const { productId = "mamaroo-40" } = useParams();
  const { deliverySettings } = useAppState();
  const { draft, addProduct, quoteItemIds } = useQuote();

  return (
    <ProductPage
      productId={productId}
      navigate={navigate}
      onAddToQuote={addProduct}
      quoteItemIds={quoteItemIds}
      deliverySettings={deliverySettings}
      existingItem={draft.items.find((item) => item.productId === productId)}
      initialFulfillment={draft.fulfillment}
      initialCep={draft.address.cep}
      initialDeliverySlot={draft.deliverySlot}
    />
  );
}

function DynamicLegalRoute() {
  const { slug = "" } = useParams();
  return <LegalPage slug={slug} />;
}

export function AppRouter() {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const currentPage = pageFromPathname(location.pathname);
  const {
    auth,
    authStatus,
    shippingSettings,
    updateShippingSettings,
    deliverySettings,
    updateDeliverySettings,
    settingsStatus,
    routeProviderStatus,
    saveDeliverySettingsNow,
    refreshDeliverySettings,
    login,
    register,
    completeClaim,
    logout,
  } = useAppState();
  const { addProduct, quoteItemIds } = useQuote();

  const navigate = useCallback<NavigateToPage>((page, params) => {
    routerNavigate(pagePath(page, params));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [routerNavigate]);

  const pendingOrderCode = new URLSearchParams(location.search).get("pedido")?.trim() ?? "";

  const handleLogin = useCallback(async (identifier: string, password: string) => {
    const nextAuth: AuthState = await login(identifier, password);
    navigate(nextAuth === "admin" ? "admin" : pendingOrderCode ? "account-quotes" : "account");
  }, [login, navigate, pendingOrderCode]);

  const handleRegister = useCallback(async (input: Parameters<typeof register>[0]) => {
    const nextAuth = await register(input);
    navigate(nextAuth === "admin" ? "admin" : "account");
  }, [register, navigate]);

  const handleClaimComplete = useCallback(async (claimToken: string, password: string) => {
    return await completeClaim(claimToken, password);
  }, [completeClaim]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("home");
  }, [logout, navigate]);

  return (
    <Routes>
      <Route element={<PublicShell currentPage={currentPage} navigate={navigate} onLogout={handleLogout} />}>
        <Route path="/" element={<HomePage navigate={navigate} onAddToQuote={addProduct} quoteItemIds={quoteItemIds} />} />
        <Route path="/produtos" element={<CatalogPage navigate={navigate} onAddToQuote={addProduct} quoteItemIds={quoteItemIds} />} />
        <Route path="/produtos/:productId" element={<ProductRoute navigate={navigate} />} />
        <Route path="/comparar" element={<ComparePage navigate={navigate} onAddToQuote={addProduct} />} />
        <Route path="/orcamento" element={<QuotePage navigate={navigate} deliverySettings={deliverySettings} />} />
        <Route path="/orcamento/sucesso" element={<QuoteSuccessPage navigate={navigate} />} />
        <Route path="/entrar" element={<LoginPage navigate={navigate} onLogin={handleLogin} />} />
        <Route path="/criar-conta" element={<SignupPage navigate={navigate} onRegister={handleRegister} onClaimComplete={handleClaimComplete} />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage navigate={navigate} />} />
        <Route path="/como-funciona" element={<HowItWorksPage navigate={navigate} />} />
        <Route path="/higienizacao" element={<HygienePage navigate={navigate} />} />
        <Route path="/sobre" element={<AboutPage navigate={navigate} />} />
        <Route path="/duvidas" element={<FAQPage navigate={navigate} />} />
        <Route path="/contato" element={<ContactPage navigate={navigate} />} />
        <Route path="/politica-de-privacidade" element={<LegalPage slug="politica-de-privacidade" />} />
        <Route path="/termos-de-uso" element={<LegalPage slug="termos-de-uso" />} />
        <Route path="/politica-de-cancelamento" element={<LegalPage slug="politica-de-cancelamento" />} />
        <Route path="/entrega-e-retirada" element={<LegalPage slug="entrega-e-retirada" />} />
        <Route path="/contrato-de-locacao" element={<LegalPage slug="contrato-de-locacao" />} />
        <Route path="/preferencias-de-cookies" element={<LegalPage slug="preferencias-de-cookies" />} />
        <Route path="/legal/:slug" element={<DynamicLegalRoute />} />
      </Route>

      <Route element={<RequireRole auth={auth} authStatus={authStatus} role="client" />}>
        <Route element={<AccountShell currentPage={currentPage} navigate={navigate} onLogout={handleLogout} />}>
          <Route path="/minha-conta" element={<AccountDashboard navigate={navigate} />} />
          <Route path="/minha-conta/orcamentos" element={<AccountQuotes navigate={navigate} />} />
          <Route path="/minha-conta/reservas" element={<AccountReservations navigate={navigate} />} />
          <Route path="/minha-conta/pedidos/:quoteId" element={<AccountOrderDetail />} />
          <Route path="/minha-conta/contratos" element={<AccountContractsPage />} />
          <Route path="/minha-conta/dados" element={<AccountProfile />} />
        </Route>
      </Route>

      <Route element={<RequireRole auth={auth} authStatus={authStatus} role="admin" />}>
        <Route element={<AdminShell currentPage={currentPage} navigate={navigate} onLogout={handleLogout} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/produtos" element={<AdminProducts />} />
          <Route path="/admin/categorias" element={<AdminCategories />} />
          <Route path="/admin/montagem-4moms" element={<AdminConfigurator />} />
          <Route path="/admin/orcamentos" element={<AdminOrdersList />} />
          <Route path="/admin/orcamentos/:quoteId" element={<AdminOrderDetail />} />
          <Route path="/admin/reservas" element={<AdminOrdersList reservationsOnly />} />
          <Route path="/admin/estoque" element={<AdminInventory />} />
          <Route path="/admin/clientes" element={<AdminClients />} />
          <Route path="/admin/agenda" element={<AdminCalendar />} />
          <Route path="/admin/entregas" element={<AdminDeliveryOperations />} />
          <Route path="/admin/higienizacao" element={<AdminHygieneOperations />} />
          <Route path="/admin/manutencao" element={<AdminMaintenanceOperations />} />
          <Route path="/admin/experiencia-cliente" element={<AdminCustomerExperience />} />
          <Route path="/admin/conteudo" element={<AdminContent />} />
          <Route path="/admin/relatorios" element={<AdminReports />} />
          <Route path="/admin/usuarios" element={<AdminUsers />} />
          <Route path="/admin/configuracoes" element={<AdminConfig shippingSettings={shippingSettings} updateShippingSettings={updateShippingSettings} deliverySettings={deliverySettings} updateDeliverySettings={updateDeliverySettings} saveDeliverySettingsNow={saveDeliverySettingsNow} routeProviderStatus={routeProviderStatus} settingsStatus={settingsStatus} refreshDeliverySettings={refreshDeliverySettings} />} />
          <Route path="/admin/ajuda" element={<AdminHelp />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
