import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { ErrorBoundary } from "./ErrorBoundary";

function BrokenComponent(): React.ReactNode {
  throw new Error("render failed");
}

describe("ErrorBoundary", () => {
  let container: HTMLDivElement;
  let root: Root;
  let consoleError: ReturnType<typeof vi.spyOn>;
  const preventWindowError = (event: ErrorEvent) => event.preventDefault();

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 202 })));
    window.addEventListener("error", preventWindowError);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    window.removeEventListener("error", preventWindowError);
    consoleError.mockRestore();
    vi.unstubAllGlobals();
  });

  it("shows a recoverable fallback when a page crashes", async () => {
    await act(async () => {
      root.render(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>,
      );
    });

    expect(container.textContent).toContain("Não foi possível exibir esta página");
    expect(container.querySelector("#main-content")).toBeTruthy();
    expect(fetch).toHaveBeenCalledOnce();
  });
});
