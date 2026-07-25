import React, { useState } from "react";
import { BookOpen, HelpCircle, X } from "lucide-react";
import type { Page } from "../../../domain/shared/types";
import { Btn } from "../../../components/prototype/PrototypeUI";
import { getAdminHelpTopic } from "./adminHelpContent";

export function AdminContextHelp({ currentPage, navigate }: { currentPage: Page; navigate: (page: Page) => void }) {
  const [open, setOpen] = useState(false);
  const topic = getAdminHelpTopic(currentPage);

  return <>
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
      aria-label={`Ajuda desta tela: ${topic.title}`}
    >
      <HelpCircle size={15} />
      <span className="hidden md:inline">Ajuda desta tela</span>
    </button>
    {open && <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="admin-context-help-title" className="w-full max-w-xl rounded-2xl border border-border bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Ajuda contextual</p><h2 id="admin-context-help-title" className="mt-1 text-lg font-semibold text-foreground">{topic.title}</h2></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar ajuda" className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="space-y-5 p-5 text-sm">
          <p className="leading-relaxed text-muted-foreground">{topic.purpose}</p>
          <div><h3 className="font-semibold text-foreground">Fonte e ação principal</h3><ul className="mt-2 space-y-1.5 text-muted-foreground">{topic.actions.map((item) => <li key={item}>• {item}</li>)}</ul></div>
          <div><h3 className="font-semibold text-foreground">Efeitos importantes</h3><ul className="mt-2 space-y-1.5 text-muted-foreground">{topic.effects.map((item) => <li key={item}>• {item}</li>)}</ul></div>
          <div><h3 className="font-semibold text-foreground">Consulte também</h3><p className="mt-2 text-muted-foreground">{topic.relatedSections.join(" · ")}</p></div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border p-4">
          <Btn variant="outline" size="sm" onClick={() => setOpen(false)}>Fechar</Btn>
          <Btn variant="primary" size="sm" onClick={() => { setOpen(false); navigate("admin-help"); }}><BookOpen size={14} />Abrir central de ajuda</Btn>
        </div>
      </section>
    </div>}
  </>;
}
