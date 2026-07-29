import React, { useState } from "react";
import { MessageCircle, ChevronRight, ChevronLeft, Calendar, User, Settings, LogOut, Package, FileText, Truck, Wrench, BarChart2, Users, TrendingUp, ArrowRight, Tag, Archive, Layers, Droplets, BookOpen, CircleHelp } from "lucide-react";
import type { Page } from "../../domain/shared/types";
import { cn } from "../../components/prototype/PrototypeUI";
import { AdminNotifications } from "./notifications/AdminNotifications";
import { AdminContextHelp } from "./help/AdminContextHelp";

export function AdminLayout({ currentPage, navigate, onLogout, children, userName, userEmail }: {
  currentPage: Page; navigate: (p: Page) => void; onLogout: () => void; children: React.ReactNode;
  userName?: string | undefined; userEmail?: string | undefined;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const menuGroups = [
    {
      label: "Principal",
      items: [
        { page: "admin" as Page, label: "Dashboard", icon: <BarChart2 size={16} /> },
        { page: "admin-products" as Page, label: "Produtos", icon: <Package size={16} /> },
        { page: "admin-configurator" as Page, label: "Montagem 4moms", icon: <Layers size={16} /> },
        { page: "admin-categories" as Page, label: "Categorias", icon: <Tag size={16} /> },
        { page: "admin-quotes" as Page, label: "Orçamentos", icon: <FileText size={16} /> },
        { page: "admin-reservations" as Page, label: "Reservas e Locações", icon: <Layers size={16} /> },
        { page: "admin-inventory" as Page, label: "Estoque físico", icon: <Archive size={16} /> },
        { page: "admin-clients" as Page, label: "Clientes", icon: <Users size={16} /> },
      ]
    },
    {
      label: "Operações",
      items: [
        { page: "admin-calendar" as Page, label: "Calendário", icon: <Calendar size={16} /> },
        { page: "admin-delivery" as Page, label: "Entregas", icon: <Truck size={16} /> },
        { page: "admin-hygiene" as Page, label: "Higienização", icon: <Droplets size={16} /> },
        { page: "admin-maintenance" as Page, label: "Manutenção", icon: <Wrench size={16} /> },
      ]
    },
    {
      label: "Gestão",
      items: [
        { page: "admin-customer-experience" as Page, label: "Atendimento", icon: <MessageCircle size={16} /> },
        { page: "admin-reports" as Page, label: "Relatórios", icon: <TrendingUp size={16} /> },
        { page: "admin-users" as Page, label: "Usuários", icon: <User size={16} /> },
        { page: "admin-content" as Page, label: "Conteúdo do site", icon: <BookOpen size={16} /> },
        { page: "admin-config" as Page, label: "Configurações", icon: <Settings size={16} /> },
        { page: "admin-help" as Page, label: "Ajuda operacional", icon: <CircleHelp size={16} /> },
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
          <button type="button" aria-label={collapsed ? "Expandir menu administrativo" : "Recolher menu administrativo"} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors p-1">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav aria-label="Navegação administrativa" className="flex-1 overflow-y-auto py-4 px-2">
          {menuGroups.map(group => (
            <div key={group.label} className="mb-6">
              {!collapsed && <p className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">{group.label}</p>}
              <div className="flex flex-col gap-0.5">
                {group.items.map(item => (
                  <button
                    key={item.page}
                    onClick={() => navigate(item.page)}
                    className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors", (currentPage === item.page || (currentPage === "admin-order" && item.page === "admin-quotes")) ? "bg-primary text-white font-medium" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground", collapsed && "justify-center px-2")}
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
                <p className="text-xs font-medium text-sidebar-foreground">{userName || "Administrador"}</p>
                {userEmail && <p className="text-xs text-sidebar-foreground/50 truncate">{userEmail}</p>}
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
            <AdminContextHelp currentPage={currentPage} navigate={navigate} />
            <AdminNotifications navigate={navigate} />
            <button onClick={() => navigate("home")} className="text-sm text-muted-foreground hover:text-foreground">Ver site <ArrowRight size={12} className="inline ml-1" /></button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

