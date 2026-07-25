import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthStatus, AuthUser, RegistrationInput } from "../domain/auth/types";
import { UNCONFIGURED_DELIVERY_SETTINGS } from "../domain/delivery/slots";
import type { DeliverySettings } from "../domain/delivery/types";
import type { AuthState } from "../domain/shared/types";
import type { ShippingSettings } from "../domain/shipping/types";
import { getSession, loginSession, logoutSession, registerSession } from "../services/auth/authApi";
import { completeOrderClaim, type OrderClaimCompleteResponse } from "../services/auth/orderClaimApi";
import { loadRemoteDeliverySettings, saveRemoteDeliverySettings, type RouteProviderStatus } from "../services/settings/settingsApi";
import { CatalogProvider } from "../stores/catalog/CatalogProvider";
import { QuoteProvider } from "../stores/quote/QuoteProvider";
import { SiteContentProvider } from "../stores/content/SiteContentProvider";

interface AppStateContextValue {
  auth: AuthState;
  authStatus: AuthStatus;
  user: AuthUser | null;
  cookieDismissed: boolean;
  shippingSettings: ShippingSettings | null;
  deliverySettings: DeliverySettings;
  settingsStatus: "loading" | "ready" | "empty" | "dirty" | "saving" | "error";
  routeProviderStatus: RouteProviderStatus;
  login: (identifier: string, password: string) => Promise<AuthState>;
  register: (input: RegistrationInput) => Promise<AuthState>;
  completeClaim: (claimToken: string, password: string) => Promise<OrderClaimCompleteResponse>;
  logout: () => Promise<void>;
  dismissCookie: () => void;
  updateShippingSettings: (settings: ShippingSettings | null) => void;
  updateDeliverySettings: (patch: Partial<DeliverySettings>) => void;
  saveDeliverySettingsNow: (override?: { shippingSettings: ShippingSettings | null; deliverySettings: DeliverySettings }) => Promise<void>;
  refreshDeliverySettings: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings | null>(null);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(UNCONFIGURED_DELIVERY_SETTINGS);
  const [settingsStatus, setSettingsStatus] = useState<AppStateContextValue["settingsStatus"]>("loading");
  const [routeProviderStatus, setRouteProviderStatus] = useState<RouteProviderStatus>({ name: "disabled", configured: false });
  const [settingsWritable, setSettingsWritable] = useState(false);
  const auth: AuthState = user?.role ?? "guest";

  useEffect(() => {
    let active = true;
    getSession()
      .then((sessionUser) => { if (active) setUser(sessionUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setAuthStatus("ready"); });
    return () => { active = false; };
  }, []);

  const refreshDeliverySettings = useCallback(async () => {
    setSettingsWritable(false);
    setSettingsStatus("loading");
    try {
      const response = await loadRemoteDeliverySettings(auth === "admin");
      const document = response.settings;
      if (response.routeProvider) setRouteProviderStatus(response.routeProvider);
      if (!document) {
        setDeliverySettings(UNCONFIGURED_DELIVERY_SETTINGS);
        setShippingSettings(null);
        setSettingsWritable(true);
        setSettingsStatus("empty");
        return;
      }
      setDeliverySettings(document.deliverySettings);
      setShippingSettings(document.shipping ?? null);
      setSettingsWritable(true);
      setSettingsStatus("ready");
    } catch {
      setDeliverySettings(UNCONFIGURED_DELIVERY_SETTINGS);
      setShippingSettings(null);
      setSettingsWritable(false);
      setSettingsStatus("error");
    }
  }, [auth]);

  useEffect(() => {
    void refreshDeliverySettings();
  }, [refreshDeliverySettings]);

  const saveDeliverySettingsNow = useCallback(async (override?: { shippingSettings: ShippingSettings | null; deliverySettings: DeliverySettings }) => {
    if (!settingsWritable || auth !== "admin") throw new Error("As configurações ainda não estão disponíveis para edição.");
    const nextShipping = override ? override.shippingSettings : shippingSettings;
    const nextDelivery = override ? override.deliverySettings : deliverySettings;
    setSettingsStatus("saving");
    try {
      const response = await saveRemoteDeliverySettings({
        deliverySettings: nextDelivery,
        shipping: nextShipping,
        updatedAt: new Date().toISOString(),
      });
      if (response.settings) {
        setDeliverySettings(response.settings.deliverySettings);
        setShippingSettings(response.settings.shipping ?? null);
      } else {
        setDeliverySettings(nextDelivery);
        setShippingSettings(nextShipping);
      }
      if (response.routeProvider) setRouteProviderStatus(response.routeProvider);
      setSettingsStatus(!nextShipping && nextDelivery.startTime === "00:00" ? "empty" : "ready");
    } catch (error) {
      setSettingsStatus("error");
      throw error;
    }
  }, [auth, deliverySettings, settingsWritable, shippingSettings]);


  const login = useCallback(async (identifier: string, password: string): Promise<AuthState> => {
    const authenticatedUser = await loginSession(identifier, password);
    setUser(authenticatedUser);
    setAuthStatus("ready");
    return authenticatedUser.role;
  }, []);

  const register = useCallback(async (input: RegistrationInput): Promise<AuthState> => {
    const authenticatedUser = await registerSession(input);
    setUser(authenticatedUser);
    setAuthStatus("ready");
    return authenticatedUser.role;
  }, []);

  const completeClaim = useCallback(async (claimToken: string, password: string): Promise<OrderClaimCompleteResponse> => {
    const result = await completeOrderClaim(claimToken, password);
    if ("user" in result) {
      setUser(result.user);
      setAuthStatus("ready");
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutSession();
    } finally {
      setUser(null);
      setAuthStatus("ready");
    }
  }, []);

  const updateShippingSettings = useCallback((settings: ShippingSettings | null) => {
    setShippingSettings(settings);
    if (settingsWritable && auth === "admin") setSettingsStatus("dirty");
  }, [auth, settingsWritable]);

  const updateDeliverySettings = useCallback((patch: Partial<DeliverySettings>) => {
    setDeliverySettings((current) => ({ ...current, ...patch, slotMinutes: 30 }));
    if (settingsWritable && auth === "admin") setSettingsStatus("dirty");
  }, [auth, settingsWritable]);

  const value = useMemo<AppStateContextValue>(() => ({
    auth,
    authStatus,
    user,
    cookieDismissed,
    shippingSettings,
    deliverySettings,
    settingsStatus,
    routeProviderStatus,
    login,
    register,
    completeClaim,
    logout,
    dismissCookie: () => setCookieDismissed(true),
    updateShippingSettings,
    updateDeliverySettings,
    saveDeliverySettingsNow,
    refreshDeliverySettings,
  }), [auth, authStatus, user, cookieDismissed, shippingSettings, deliverySettings, settingsStatus, routeProviderStatus, login, register, completeClaim, logout, updateShippingSettings, updateDeliverySettings, saveDeliverySettingsNow, refreshDeliverySettings]);

  return (
    <AppStateContext.Provider value={value}>
      <SiteContentProvider>
        <CatalogProvider canPersistRemote={auth === "admin"}>
          <QuoteProvider>{children}</QuoteProvider>
        </CatalogProvider>
      </SiteContentProvider>
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error("useAppState must be used within AppProviders");
  return value;
}
