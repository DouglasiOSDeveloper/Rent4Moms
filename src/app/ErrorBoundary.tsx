import React from "react";
import { reportClientError } from "../services/observability/errorReporter";

interface State {
  failed: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error): void {
    reportClientError({ message: error.message, stack: error.stack, source: "react" });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="min-h-screen bg-background px-4 py-16" id="main-content" tabIndex={-1}>
        <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium text-primary">Rent4Moms</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Não foi possível exibir esta página</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            O erro foi registrado sem incluir os dados dos formulários. Recarregue a página para tentar novamente.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-white"
          >
            Recarregar página
          </button>
        </div>
      </main>
    );
  }
}
