import React from "react";
import { AlertCircle, Inbox, LoaderCircle, RefreshCw } from "lucide-react";
import { Btn } from "../prototype/PrototypeUI";

interface StateProps {
  title: string;
  description?: string | undefined;
  compact?: boolean | undefined;
}

function StateShell({ children, compact = false }: { children: React.ReactNode; compact?: boolean | undefined }) {
  return (
    <div className={`rounded-2xl border border-border bg-card text-center ${compact ? "px-4 py-8" : "px-6 py-12"}`}>
      {children}
    </div>
  );
}

export function LoadingState({ title = "Carregando dados...", description, compact }: Partial<StateProps>) {
  return (
    <StateShell compact={Boolean(compact)}>
      <LoaderCircle className="mx-auto mb-3 animate-spin text-primary" size={28} />
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </StateShell>
  );
}

export function EmptyState({ title, description, compact, actionLabel, onAction }: StateProps & { actionLabel?: string | undefined; onAction?: (() => void) | undefined }) {
  return (
    <StateShell compact={Boolean(compact)}>
      <Inbox className="mx-auto mb-3 text-muted-foreground/50" size={30} />
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && <Btn variant="outline" size="sm" className="mt-4" onClick={onAction}>{actionLabel}</Btn>}
    </StateShell>
  );
}

export function ErrorState({
  title = "Não foi possível carregar os dados",
  description,
  compact,
  onRetry,
}: Partial<StateProps> & { onRetry?: (() => void) | undefined }) {
  return (
    <StateShell compact={Boolean(compact)}>
      <AlertCircle className="mx-auto mb-3 text-destructive" size={30} />
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {onRetry && <Btn variant="outline" size="sm" className="mt-4" onClick={onRetry}><RefreshCw size={14} />Tentar novamente</Btn>}
    </StateShell>
  );
}
