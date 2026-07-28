import { act } from "react";
import { vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router";
import { addDays, formatDateBR, getTomorrowIsoDate } from "../lib/dates";
import App from "./App";
import {
  INITIAL_ASSEMBLY_VARIANTS,
  INITIAL_BALL_SETS,
  INITIAL_CATEGORIES,
  INITIAL_CHAIR_MODELS,
  INITIAL_COMPATIBILITIES,
  INITIAL_COVERS,
  INITIAL_PRODUCTS,
  INITIAL_REDUCERS,
} from "../test/fixtures/catalogFixture";
import { DEFAULT_PUBLIC_LEGAL_PAGES, DEFAULT_SITE_SETTINGS } from "../test/fixtures/contentFixture";
import { DEFAULT_DELIVERY_SETTINGS } from "../domain/delivery/slots";

describe("Rent4Moms frontend routing baseline", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/auth/session")) return new Response(JSON.stringify({ error: "AUTH_REQUIRED" }), { status: 401, headers: { "content-type": "application/json" } });
      if (url.includes("/catalog")) {
        return new Response(JSON.stringify({ catalog: {
          version: 2,
          products: INITIAL_PRODUCTS,
          categories: INITIAL_CATEGORIES,
          chairModels: INITIAL_CHAIR_MODELS,
          covers: INITIAL_COVERS,
          reducers: INITIAL_REDUCERS,
          ballSets: INITIAL_BALL_SETS,
          compatibilities: INITIAL_COMPATIBILITIES,
          assemblyVariants: INITIAL_ASSEMBLY_VARIANTS,
          updatedAt: new Date(0).toISOString(),
        } }), { status: 200, headers: { "content-type": "application/json" } });
      }
      if (url.includes("/content/site")) return new Response(JSON.stringify({ siteSettings: DEFAULT_SITE_SETTINGS, legalPages: DEFAULT_PUBLIC_LEGAL_PAGES }), { status: 200, headers: { "content-type": "application/json" } });
      if (url.includes("/settings/delivery")) return new Response(JSON.stringify({ settings: { deliverySettings: DEFAULT_DELIVERY_SETTINGS, shipping: { enabled: true, originLabel: "Estoque de teste", originAddress: { cep: "01001-000", street: "Praça da Sé", number: "1", complement: "", district: "Sé", city: "São Paulo", state: "SP" }, fuelPriceCentsPerLiter: 600, consumptionKmPerLiter: 10, multiplier: 1, minimumFeeCents: 2500, roundTrip: true, maxDistanceKm: 50 }, updatedAt: new Date(0).toISOString() } }), { status: 200, headers: { "content-type": "application/json" } });
      if (url.includes("/shipping/estimate")) return new Response(JSON.stringify({ shippingQuote: { status: "calculated", amountCents: 2500, cep: "01001-000", provider: "test_routes", formulaVersion: "distance-fuel-v1", originLabel: "Estoque de teste", oneWayDistanceKm: 5, chargedDistanceKm: 10, durationSeconds: 900, fuelLiters: 1, parameters: { fuelPriceCentsPerLiter: 600, consumptionKmPerLiter: 10, multiplier: 1, minimumFeeCents: 2500, roundTrip: true, maxDistanceKm: 50 }, calculatedAt: new Date(0).toISOString() } }), { status: 200, headers: { "content-type": "application/json" } });
      if (url.includes("viacep.com.br/ws/01001000/json/")) return new Response(JSON.stringify({ cep: "01001-000", logradouro: "Praça da Sé", complemento: "", bairro: "Sé", localidade: "São Paulo", uf: "SP" }), { status: 200, headers: { "content-type": "application/json" } });
      return new Response(JSON.stringify({}), { status: 200, headers: { "content-type": "application/json" } });
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
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
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 450)); });
    const numberInput = container.querySelector<HTMLInputElement>('input[placeholder="123"]');
    expect(numberInput).toBeTruthy();
    await setInputValue(numberInput!, "1");
    await act(async () => { await new Promise((resolve) => window.setTimeout(resolve, 450)); });
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
    expect(container.textContent?.replace(/\u00a0/g, " ")).toContain("R$ 399,00");
    expect(container.textContent?.replace(/\u00a0/g, " ")).not.toContain("R$ 424,00");
  });


  it("does not show a fictional catalog when the API is offline", async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("offline"));
    await renderAt("/produtos");
    expect(container.textContent).toContain("Não foi possível carregar os produtos");
    expect(container.textContent).not.toContain("MamaRoo 4.0");
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
