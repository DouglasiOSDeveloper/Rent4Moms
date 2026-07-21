import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_SHIPPING_ZONES } from "../data/mocks";
import type { AuthStatus, AuthUser, RegistrationInput } from "../domain/auth/types";
import type { DeliverySettings } from "../domain/delivery/types";
import type { AuthState, ShippingZone } from "../domain/shared/types";
import { getSession, loginSession, logoutSession, registerSession } from "../services/auth/authApi";
import { completeOrderClaim, type OrderClaimCompleteResponse } from "../services/auth/orderClaimApi";
import { loadRemoteDeliverySettings, saveRemoteDeliverySettings } from "../services/settings/settingsApi";
import { CatalogProvider } from "../stores/catalog/CatalogProvider";
import { QuoteProvider } from "../stores/quote/QuoteProvider";
import { SiteContentProvider } from "../stores/content/SiteContentProvider";
import { loadDeliverySettings, saveDeliverySettings } from "../stores/settings/deliverySettingsPersistence";

interface AppStateContextValue {
  auth: AuthState;
  authStatus: AuthStatus;
  user: AuthUser | null;
  cookieDismissed: boolean;
  shippingZones: ShippingZone[];
  deliverySettings: DeliverySettings;
  login: (identifier: string, password: string) => Promise<AuthState>;
  register: (input: RegistrationInput) => Promise<AuthState>;
  completeClaim: (claimToken: string, password: string) => Promise<OrderClaimCompleteResponse>;
  logout: () => Promise<void>;
  dismissCookie: () => void;
  setShippingZones: React.Dispatch<React.SetStateAction<ShippingZone[]>>;
  updateDeliverySettings: (patch: Partial<DeliverySettings>) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [cookieDismissed, setCookieDismissed] = useState(false);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>(DEFAULT_SHIPPING_ZONES);
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>(() => loadDeliverySettings());
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const auth: AuthState = user?.role ?? "guest";

  useEffect(() => {
    let active = true;
    getSession()
      .then((sessionUser) => { if (active) setUser(sessionUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setAuthStatus("ready"); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    loadRemoteDeliverySettings()
      .then((document) => {
        if (!active) return;
        setDeliverySettings(document.deliverySettings);
        setShippingZones(document.shippingZones);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setSettingsHydrated(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    saveDeliverySettings(deliverySettings);
  }, [deliverySettings]);

  useEffect(() => {
    if (!settingsHydrated || auth !== "admin") return;
    const timer = window.setTimeout(() => {
      void saveRemoteDeliverySettings({
        deliverySettings,
        shippingZones,
        updatedAt: new Date().toISOString(),
      }).catch(() => undefined);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [auth, deliverySettings, settingsHydrated, shippingZones]);

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

  const updateDeliverySettings = useCallback((patch: Partial<DeliverySettings>) => {
    setDeliverySettings((current) => ({ ...current, ...patch, slotMinutes: 30 }));
  }, []);

  const value = useMemo<AppStateContextValue>(() => ({
    auth,
    authStatus,
    user,
    cookieDismissed,
    shippingZones,
    deliverySettings,
    login,
    register,
    completeClaim,
    logout,
    dismissCookie: () => setCookieDismissed(true),
    setShippingZones,
    updateDeliverySettings,
  }), [auth, authStatus, user, cookieDismissed, shippingZones, deliverySettings, login, register, completeClaim, logout, updateDeliverySettings]);

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
