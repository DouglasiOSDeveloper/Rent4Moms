import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Bell, LoaderCircle, RefreshCw } from "lucide-react";
import type { AdminNotification, AdminNotificationTarget } from "../../../domain/admin/types";
import type { Page } from "../../../domain/shared/types";
import { listAdminNotifications } from "../../../services/admin/adminApi";
import { cn } from "../../../components/prototype/PrototypeUI";

const TARGET_PAGES: Record<AdminNotificationTarget, Page> = {
  quotes: "admin-quotes",
  reservations: "admin-reservations",
  inventory: "admin-inventory",
  delivery: "admin-delivery",
  hygiene: "admin-hygiene",
  maintenance: "admin-maintenance",
  users: "admin-users",
};

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function severityClass(notification: AdminNotification): string {
  if (notification.severity === "critical") return "bg-destructive";
  if (notification.severity === "warning") return "bg-amber-500";
  return "bg-primary";
}

export function AdminNotifications({ navigate }: { navigate: (page: Page) => void }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await listAdminNotifications();
      setNotifications(response.notifications);
      setStatus("ready");
    } catch {
      setNotifications([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openTarget = (notification: AdminNotification) => {
    setOpen(false);
    navigate(TARGET_PAGES[notification.target]);
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={notifications.length > 0 ? `Notificações: ${notifications.length} pendência(s)` : "Notificações"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="relative p-2 text-muted-foreground hover:text-foreground"
      >
        <Bell size={18} />
        {notifications.length > 0 && <span className="absolute top-1 right-1 min-w-2 h-2 rounded-full bg-primary" />}
      </button>

      {open && (
        <section className="absolute right-0 top-11 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Pendências reais</p>
              <p className="text-xs text-muted-foreground">Geradas a partir do banco e das filas operacionais.</p>
            </div>
            <button type="button" aria-label="Atualizar notificações" onClick={() => void load()} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><RefreshCw size={14} /></button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {status === "loading" ? (
              <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground"><LoaderCircle size={18} className="animate-spin" />Carregando...</div>
            ) : status === "error" ? (
              <div className="p-6 text-center"><AlertCircle size={24} className="mx-auto mb-2 text-destructive" /><p className="text-sm font-medium">Não foi possível carregar as notificações.</p><button type="button" onClick={() => void load()} className="mt-3 text-sm font-medium text-primary">Tentar novamente</button></div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center"><Bell size={24} className="mx-auto mb-2 text-muted-foreground/50" /><p className="text-sm font-medium text-foreground">Nenhuma pendência no momento</p><p className="mt-1 text-xs text-muted-foreground">O sino não exibe alertas fictícios.</p></div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <button key={notification.id} type="button" onClick={() => openTarget(notification)} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-secondary/60">
                    <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", severityClass(notification))} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{notification.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{notification.description}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground/80">{formatDateTime(notification.occurredAt)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
