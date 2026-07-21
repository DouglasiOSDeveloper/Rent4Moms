import React from "react";
import { Btn } from "../prototype/PrototypeUI";

export function CookieBanner({ onAccept, onManage }: { onAccept: () => void; onManage: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-0.5">Usamos cookies para melhorar sua experiência</p>
          <p className="text-xs text-muted-foreground">Cookies essenciais mantêm a sessão e o orçamento. Consulte e revise as opções na <button onClick={onManage} className="text-primary underline">central de preferências</button>.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={onAccept} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg">Apenas essenciais</button>
          <Btn variant="primary" size="sm" onClick={onAccept}>Aceitar todos</Btn>
        </div>
      </div>
    </div>
  );
}
