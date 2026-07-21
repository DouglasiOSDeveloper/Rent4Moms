import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import App from "./App";

describe("accessibility shell", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it("provides landmarks, a skip link and accessible navigation controls", async () => {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>,
      );
    });

    const skipLink = container.querySelector<HTMLAnchorElement>('a[href="#main-content"]');
    const main = container.querySelector<HTMLElement>("#main-content");
    expect(skipLink?.textContent).toContain("Pular para o conteúdo principal");
    expect(main?.tagName).toBe("MAIN");
    expect(main?.getAttribute("tabindex")).toBe("-1");
    expect(container.querySelector('nav[aria-label="Navegação principal"]')).toBeTruthy();
    expect(container.querySelector('button[aria-label^="Abrir orçamento"]')).toBeTruthy();
    expect(container.querySelector('button[aria-controls="mobile-navigation"]')).toBeTruthy();
    expect(document.title).toBe("Início | Rent4Moms");
  });
});
