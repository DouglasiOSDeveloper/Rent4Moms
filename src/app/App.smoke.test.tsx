import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { addDays, formatDateBR, getTomorrowIsoDate } from "../lib/dates";
import App from "./App";

describe("Rent4Moms frontend routing baseline", () => {
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

  async function renderAt(path: string) {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );
    });
  }

  it("renders the home page at the root route", async () => {
    await renderAt("/");
    expect(container.textContent).toContain("Mais praticidade para você. Mais conforto para o seu bebê.");
  });

  it("renders the catalog from its direct URL", async () => {
    await renderAt("/produtos");
    expect(container.textContent).toContain("Catálogo de produtos");
  });

  it("renders a product from a dynamic direct URL", async () => {
    await renderAt("/produtos/mamaroo-40");
    expect(container.textContent).toContain("MamaRoo 4.0");
    expect(container.textContent).toContain("Calcular período");
  });

  it("carries the configured product values into the quote route", async () => {
    await renderAt("/produtos/mamaroo-40");

    const periodButton = [...container.querySelectorAll("button")].find((button) =>
      button.textContent?.replace(/\s/g, "").startsWith("30dias"),
    );
    expect(periodButton).toBeTruthy();
    await act(async () => periodButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    const coverButton = [...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Pano tipo 1"),
    );
    expect(coverButton).toBeTruthy();
    await act(async () => coverButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    const setInputValue = async (input: HTMLInputElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      await act(async () => {
        setter?.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    };

    const dateInput = container.querySelector<HTMLInputElement>('input[type="date"]');
    const cepInput = container.querySelector<HTMLInputElement>('input[placeholder="00000-000"]');
    const slotSelect = container.querySelector<HTMLSelectElement>("#delivery-slot");
    expect(dateInput).toBeTruthy();
    expect(cepInput).toBeTruthy();
    expect(slotSelect).toBeTruthy();
    const startDate = addDays(getTomorrowIsoDate(), 10);
    await setInputValue(dateInput!, startDate);
    await setInputValue(cepInput!, "01001-000");
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
      setter?.call(slotSelect, "10:00");
      slotSelect?.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const addButton = [...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Adicionar ao orçamento"),
    );
    expect(addButton).toBeTruthy();
    await act(async () => addButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    const quoteButton = [...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("Fazer orçamento"),
    );
    expect(quoteButton).toBeTruthy();
    await act(async () => quoteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    expect(container.textContent).toContain("Solicitação de orçamento");
    expect(container.textContent).toContain("Período: 30 dias");
    expect(container.textContent).toContain(`${formatDateBR(startDate)} a ${formatDateBR(addDays(startDate, 30))}`);
    expect(container.textContent?.replace(/\u00a0/g, " ")).toContain("R$ 424,00");
  });

  it("opens the secure order-linking signup flow from an order code", async () => {
    await renderAt("/criar-conta?pedido=ORC-2030-ABCDEF12");
    expect(container.textContent).toContain("Crie sua conta pelo pedido");
    expect(container.textContent).toContain("Recupere os dados já informados");
    expect(container.querySelector<HTMLInputElement>('input[value="ORC-2030-ABCDEF12"]')).toBeTruthy();
  });

  it("redirects a guest away from protected account routes", async () => {
    await renderAt("/minha-conta");
    expect(container.textContent).toContain("Entre na sua conta");
  });
});
