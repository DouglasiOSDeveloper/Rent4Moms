import { describe, expect, it } from "vitest";
import {
  INITIAL_ASSEMBLY_VARIANTS,
  INITIAL_BALL_SETS,
  INITIAL_CHAIR_MODELS,
  INITIAL_COMPATIBILITIES,
  INITIAL_COVERS,
  INITIAL_REDUCERS,
} from "../../test/fixtures/catalogFixture";
import {
  composeConfigurationDescription,
  getAssemblyVariant,
  getCompatibleCovers,
  getCompatibleReducers,
  getConfigurationAvailableQuantity,
  isAssemblyVariantComplete,
  sumRentalRates,
} from "./configurator";

const catalog = {
  chairModels: INITIAL_CHAIR_MODELS,
  covers: INITIAL_COVERS,
  reducers: INITIAL_REDUCERS,
  ballSets: INITIAL_BALL_SETS,
  compatibilities: INITIAL_COMPATIBILITIES,
  assemblyVariants: INITIAL_ASSEMBLY_VARIANTS,
};

describe("configurador 4moms", () => {
  it("aceita variantes com uma, duas ou três angulações visíveis sem exigir SUP", () => {
    const base = INITIAL_ASSEMBLY_VARIANTS[0]!;
    const oneAngle = { ...base, images: base.images.slice(0, 1) };
    const twoAngles = { ...base, images: base.images.slice(0, 2) };
    const threeAngles = { ...base, images: base.images.slice(0, 3) };

    expect(INITIAL_ASSEMBLY_VARIANTS).toHaveLength(48);
    expect(INITIAL_ASSEMBLY_VARIANTS.flatMap((variant) => variant.images)).toHaveLength(144);
    expect(INITIAL_ASSEMBLY_VARIANTS.flatMap((variant) => variant.images).some((image) => image.angle === "SUP")).toBe(false);
    expect([oneAngle, twoAngles, threeAngles].every(isAssemblyVariantComplete)).toBe(true);
    expect(isAssemblyVariantComplete({ ...base, images: [] })).toBe(false);
  });

  it("limita panos e redutores pela compatibilidade do modelo", () => {
    expect(getCompatibleCovers(catalog, "chair-model-40")).toHaveLength(7);
    expect(getCompatibleReducers(catalog, "chair-model-40")).toHaveLength(3);
    expect(getCompatibleCovers(catalog, "chair-model-20").map((cover) => cover.name))
      .toEqual(["Pano tipo 8", "Pano tipo 9", "Pano tipo 10", "Pano tipo 11"]);
    expect(getCompatibleReducers(catalog, "chair-model-20").map((reducer) => reducer.name))
      .toEqual(["Redutor tipo 4"]);
  });

  it("encontra a variante exata e não mistura as bolinhas do modelo", () => {
    const variant = getAssemblyVariant(catalog, "chair-model-40", "cover-07", "reducer-01");

    expect(variant?.id).toBe("4.0-026");
    expect(variant?.ballSetId).toBe("ball-set-40");
    expect(variant?.prefix).toBe("m40_p07_r01_b40");
  });

  it("acumula descrição e preço da cadeira, pano e redutor", () => {
    const description = composeConfigurationDescription("Cadeira.", "Pano.", "Redutor.");
    const rates = sumRentalRates(
      { daily: 29, weekly: 149, monthly: 399 },
      { daily: 1, weekly: 5, monthly: 20 },
      { daily: 2, weekly: 8, monthly: 30 },
    );

    expect(description).toBe("Cadeira. Pano. Redutor.");
    expect(rates).toEqual({ daily: 32, weekly: 162, monthly: 449 });
  });

  it("calcula disponibilidade pelo componente mais restritivo", () => {
    expect(getConfigurationAvailableQuantity({
      chairModel: { ...INITIAL_CHAIR_MODELS[0], availableQuantity: 4 },
      cover: { ...INITIAL_COVERS[0], availableQuantity: 2 },
      reducer: { ...INITIAL_REDUCERS[0], availableQuantity: 1 },
      ballSet: { ...INITIAL_BALL_SETS[0], availableQuantity: 3 },
    })).toBe(1);
  });
});
