import type {
  AssemblyAngle,
  AssemblyImage,
  AssemblyVariant,
  BallSet,
  Category,
  ChairModel,
  ComponentCompatibility,
  Cover,
  Product,
  Reducer,
} from "../../domain/catalog/types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "mamaroo-40", name: "MamaRoo 4.0", brand: "4moms", model: "Classic Grey",
    categoryIds: ["cadeiras-de-balanco"],
    ageMin: "0 meses", ageMax: "6 meses", weightMax: "9 kg",
    priceDaily: 29, priceWeekly: 149, priceMonthly: 399,
    status: "available", conservation: "Muito bom",
    description: "Cadeira de balanço eletrônica com 5 movimentos únicos inspirados nos pais. Conexão Bluetooth e sons naturais. Um dos modelos mais procurados pelas famílias.",
    rating: 4.9, reviews: 31, featured: true, minDays: 7,
    photo: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=450&fit=crop&auto=format",
    tags: ["eletrônica", "bluetooth", "5 movimentos", "sons naturais"],
    specs: { dimensions: "73×56×96 cm", productWeight: "5,5 kg", material: "Plástico ABS + tecido removível", color: "Cinza clássico", electric: "Bateria ou adaptador AC", includes: ["Cadeira MamaRoo", "Adaptador AC", "Manual"] },
  },
  {
    id: "chicco-nextfit", name: "NextFit Sport", brand: "Chicco", model: "NextFit Sport Black",
    categoryIds: ["cadeirinhas-para-carro"],
    ageMin: "0 meses", ageMax: "4 anos", weightMax: "27 kg",
    priceDaily: 35, priceWeekly: 189, priceMonthly: 499,
    status: "available", conservation: "Bom",
    description: "Cadeirinha conversível com 9 posições de recline. Aprovada pelos principais testes de segurança. Ideal para bebês recém-nascidos até crianças maiores.",
    rating: 4.7, reviews: 18, featured: true, minDays: 7,
    photo: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=450&fit=crop&auto=format",
    tags: ["conversível", "recline", "isofix", "segurança"],
    specs: { dimensions: "44×68×64 cm", productWeight: "8,2 kg", material: "Aço + espuma EPS + tecido", color: "Preto", electric: "Não", includes: ["Cadeirinha", "Capa de proteção", "Manual"] },
  },
  {
    id: "graco-turbobooster", name: "TurboBooster LX", brand: "Graco", model: "TurboBooster LX",
    categoryIds: ["cadeirinhas-para-carro"],
    ageMin: "3 anos", ageMax: "10 anos", weightMax: "54 kg",
    priceDaily: 22, priceWeekly: 110, priceMonthly: 290,
    status: "few_units", conservation: "Bom",
    description: "Assento de elevação com apoio lateral de proteção. Encosto removível para uso como booster simples. Ótimo custo-benefício para crianças maiores.",
    rating: 4.5, reviews: 12, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&h=450&fit=crop&auto=format",
    tags: ["booster", "encosto removível", "proteção lateral"],
    specs: { dimensions: "40×46×66 cm", productWeight: "4,1 kg", material: "Polipropileno + tecido", color: "Cinza e azul", electric: "Não", includes: ["Assento", "Encosto", "Manual"] },
  },
  {
    id: "fisher-highchair", name: "SpaceSaver High Chair", brand: "Fisher-Price", model: "SpaceSaver Deluxe",
    categoryIds: ["cadeiras-de-alimentacao"],
    ageMin: "6 meses", ageMax: "3 anos", weightMax: "18 kg",
    priceDaily: 18, priceWeekly: 89, priceMonthly: 230,
    status: "available", conservation: "Muito bom",
    description: "Cadeira de alimentação compacta que encaixa em uma cadeira comum. Bandeja removível e lavável. Perfeita para apartamentos e espaços menores.",
    rating: 4.6, reviews: 24, featured: true, minDays: 5,
    photo: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=450&fit=crop&auto=format",
    tags: ["compacta", "bandeja lavável", "para apartamento"],
    specs: { dimensions: "35×40×30 cm (na cadeira)", productWeight: "2,3 kg", material: "Plástico + tecido acolchoado", color: "Bege", electric: "Não", includes: ["Assento", "Bandeja", "Cinto 5 pontos", "Manual"] },
  },
  {
    id: "ingenuity-boutique", name: "Boutique Collection Swing", brand: "Ingenuity", model: "Boutique Collection 2-in-1",
    categoryIds: ["cadeiras-de-balanco"],
    ageMin: "0 meses", ageMax: "9 meses", weightMax: "11 kg",
    priceDaily: 25, priceWeekly: 119, priceMonthly: 299,
    status: "available", conservation: "Muito bom",
    description: "Balanço 2 em 1 que converte em cadeira vibratória portátil. 6 velocidades e músicas embutidas. Dobrável para facilitar o transporte.",
    rating: 4.4, reviews: 15, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&h=450&fit=crop&auto=format",
    tags: ["2 em 1", "vibratória", "dobrável", "músicas"],
    specs: { dimensions: "58×80×98 cm", productWeight: "6,3 kg", material: "Plástico + tecido lavável", color: "Cinza e nude", electric: "Bateria (4 D)", includes: ["Balanço", "Brinquedos removíveis", "Manual"] },
  },
  {
    id: "mamaroo-sleep", name: "MamaRoo Sleep", brand: "4moms", model: "MamaRoo Sleep Bassinet",
    categoryIds: ["bebes-conforto"],
    ageMin: "0 meses", ageMax: "6 meses", weightMax: "9 kg",
    priceDaily: 39, priceWeekly: 199, priceMonthly: 520,
    status: "on_demand", conservation: "Excelente",
    description: "Berço inteligente com movimentos naturais que reproduzem o colo dos pais. 5 movimentos, ruído branco integrado e monitoramento via app.",
    rating: 4.8, reviews: 9, featured: true, minDays: 14,
    photo: "https://images.unsplash.com/photo-1548544027-7c9c78b58a0d?w=600&h=450&fit=crop&auto=format",
    tags: ["berço inteligente", "ruído branco", "app", "premium"],
    specs: { dimensions: "84×58×92 cm", productWeight: "9,1 kg", material: "Alumínio + tecido respirável", color: "Cinza", electric: "Sim (bivolt)", includes: ["Berço", "Lençol", "Adaptador", "Manual"] },
  },
  {
    id: "chicco-artsana", name: "Polly 2 Start", brand: "Chicco", model: "Polly 2 Start",
    categoryIds: ["cadeiras-de-alimentacao"],
    ageMin: "0 meses", ageMax: "3 anos", weightMax: "15 kg",
    priceDaily: 20, priceWeekly: 98, priceMonthly: 259,
    status: "available", conservation: "Bom",
    description: "Cadeira de alimentação evolutiva que acompanha o bebê do nascimento aos 3 anos. 7 posições de recline, bandeja bipartida e pés antiderrapantes.",
    rating: 4.6, reviews: 20, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=450&fit=crop&auto=format",
    tags: ["evolutiva", "recline", "bandeja bipartida"],
    specs: { dimensions: "52×78×98 cm", productWeight: "7,5 kg", material: "Plástico + tecido", color: "Rosa nude", electric: "Não", includes: ["Cadeira", "Bandeja", "Redutor recém-nascido", "Manual"] },
  },
  {
    id: "joie-stages", name: "Stages FX", brand: "Joie", model: "Stages FX ISOFIX",
    categoryIds: ["cadeirinhas-para-carro"],
    ageMin: "0 meses", ageMax: "7 anos", weightMax: "25 kg",
    priceDaily: 32, priceWeekly: 165, priceMonthly: 429,
    status: "few_units", conservation: "Muito bom",
    description: "Cadeirinha 3 em 1 com ISOFIX que cresce com a criança. Posição rearfacing para recém-nascidos, conversível e booster. Testada para múltiplos impactos.",
    rating: 4.7, reviews: 14, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1617952547479-0f8b6cc45dc3?w=600&h=450&fit=crop&auto=format",
    tags: ["3 em 1", "isofix", "rearfacing", "evolutiva"],
    specs: { dimensions: "46×65×75 cm", productWeight: "9,8 kg", material: "Aço + EPS + tecido", color: "Grafite", electric: "Não", includes: ["Cadeirinha", "Redutor", "Manual"] },
  },
  {
    id: "mamaroo-30", name: "MamaRoo 3.0", brand: "4moms", model: "3.0",
    categoryIds: ["cadeiras-de-balanco"],
    ageMin: "0 meses", ageMax: "6 meses", weightMax: "9 kg",
    priceDaily: 26, priceWeekly: 139, priceMonthly: 369,
    status: "available", conservation: "Muito bom",
    description: "Modelo MamaRoo 3.0 com movimentos eletrônicos e estrutura compatível com panos e redutores selecionados para esta versão.",
    rating: 4.8, reviews: 19, featured: true, minDays: 7,
    photo: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=450&fit=crop&auto=format",
    tags: ["eletrônica", "movimentos", "4moms"],
    specs: { dimensions: "73×56×96 cm", productWeight: "5,5 kg", material: "Plástico ABS + tecido removível", color: "Configurável", electric: "Adaptador AC", includes: ["Cadeira MamaRoo 3.0", "Adaptador AC", "Conjunto de bolinhas 3.0", "Manual"] },
  },
  {
    id: "mamaroo-20", name: "MamaRoo 2.0", brand: "4moms", model: "2.0",
    categoryIds: ["cadeiras-de-balanco"],
    ageMin: "0 meses", ageMax: "6 meses", weightMax: "9 kg",
    priceDaily: 23, priceWeekly: 125, priceMonthly: 329,
    status: "few_units", conservation: "Bom",
    description: "Modelo MamaRoo 2.0 com conjunto visual próprio, panos exclusivos desta geração e redutor específico quando selecionado.",
    rating: 4.6, reviews: 11, featured: false, minDays: 7,
    photo: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=450&fit=crop&auto=format",
    tags: ["eletrônica", "4moms", "modelo 2.0"],
    specs: { dimensions: "73×56×96 cm", productWeight: "5,5 kg", material: "Plástico ABS + tecido removível", color: "Configurável", electric: "Adaptador AC", includes: ["Cadeira MamaRoo 2.0", "Adaptador AC", "Conjunto de bolinhas 2.0", "Manual"] },
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: "cadeiras-de-balanco", name: "Cadeiras de balanço", description: "Balanços e cadeiras eletrônicas para acolher o bebê.", icon: "🪑", color: "bg-amber-50 border-amber-200", isActive: true, sortOrder: 1 },
  { id: "bebes-conforto", name: "Bebês-conforto", description: "Equipamentos de apoio e descanso para os primeiros meses.", icon: "🛏️", color: "bg-rose-50 border-rose-200", isActive: true, sortOrder: 2 },
  { id: "cadeirinhas-para-carro", name: "Cadeirinhas para carro", description: "Cadeirinhas e boosters para diferentes fases da criança.", icon: "🚗", color: "bg-blue-50 border-blue-200", isActive: true, sortOrder: 3 },
  { id: "cadeiras-de-alimentacao", name: "Cadeiras de alimentação", description: "Assentos e cadeiras para refeições com mais praticidade.", icon: "🍼", color: "bg-green-50 border-green-200", isActive: true, sortOrder: 4 },
  { id: "assentos-de-apoio", name: "Assentos de apoio", description: "Assentos auxiliares para diferentes momentos da rotina.", icon: "🪆", color: "bg-purple-50 border-purple-200", isActive: true, sortOrder: 5 },
  { id: "outros", name: "Outros equipamentos", description: "Outros itens infantis disponíveis para locação.", icon: "📦", color: "bg-gray-50 border-gray-200", isActive: true, sortOrder: 6 },
];


const ZERO_RATES = { daily: 0, weekly: 0, monthly: 0 };

export const INITIAL_CHAIR_MODELS: ChairModel[] = [
  {
    id: "chair-model-40",
    productId: "mamaroo-40",
    version: "4.0",
    technicalCode: "m40",
    name: "MamaRoo 4.0",
    description: "Cadeira de balanço eletrônica MamaRoo 4.0 com cinco movimentos inspirados no colo dos pais, conexão Bluetooth e sons naturais.",
    ballSetId: "ball-set-40",
    isActive: true,
    availableQuantity: 4,
    defaultImage: INITIAL_PRODUCTS.find((product) => product.id === "mamaroo-40")?.photo ?? "",
  },
  {
    id: "chair-model-30",
    productId: "mamaroo-30",
    version: "3.0",
    technicalCode: "m30",
    name: "MamaRoo 3.0",
    description: "Cadeira de balanço eletrônica MamaRoo 3.0, com estrutura compartilhada com a 4.0 e painel e bolinhas próprios desta geração.",
    ballSetId: "ball-set-30",
    isActive: true,
    availableQuantity: 3,
    defaultImage: INITIAL_PRODUCTS.find((product) => product.id === "mamaroo-30")?.photo ?? "",
  },
  {
    id: "chair-model-20",
    productId: "mamaroo-20",
    version: "2.0",
    technicalCode: "m20",
    name: "MamaRoo 2.0",
    description: "Cadeira de balanço eletrônica MamaRoo 2.0 com panos, redutor e conjunto de bolinhas próprios desta geração.",
    ballSetId: "ball-set-20",
    isActive: true,
    availableQuantity: 2,
    defaultImage: INITIAL_PRODUCTS.find((product) => product.id === "mamaroo-20")?.photo ?? "",
  },
  {
    id: "chair-model-50",
    productId: null,
    version: "5.0",
    technicalCode: "m50",
    name: "MamaRoo 5.0",
    description: "Estrutura reservada para o futuro cadastro da MamaRoo 5.0.",
    ballSetId: "ball-set-50",
    isActive: false,
    availableQuantity: 0,
    defaultImage: "",
  },
];

function cover(
  number: number,
  description: string,
  monthlyAdjustment: number,
  availableQuantity: number,
): Cover {
  return {
    id: `cover-${number.toString().padStart(2, "0")}`,
    code: `p${number.toString().padStart(2, "0")}`,
    name: `Pano tipo ${number}`,
    description,
    priceAdjustment: monthlyAdjustment === 0
      ? ZERO_RATES
      : {
          daily: Math.round((monthlyAdjustment / 30) * 100) / 100,
          weekly: Math.round((monthlyAdjustment / 4) * 100) / 100,
          monthly: monthlyAdjustment,
        },
    isActive: true,
    availableQuantity,
    kind: "cover",
  };
}

export const INITIAL_COVERS: Cover[] = [
  cover(1, "Pano tipo 1 em acabamento cinza clássico, preferencial para a cadeira 4.0.", 0, 3),
  cover(2, "Pano tipo 2 em tonalidade neutra e tecido removível, preferencial para a cadeira 4.0.", 0, 2),
  cover(3, "Pano tipo 3 com acabamento macio e visual claro, preferencial para a cadeira 4.0.", 15, 2),
  cover(4, "Pano tipo 4 com acabamento diferenciado para composições da cadeira 4.0.", 20, 1),
  cover(5, "Pano tipo 5 compatível com as cadeiras 4.0 e 3.0.", 10, 3),
  cover(6, "Pano tipo 6 compatível com as cadeiras 4.0 e 3.0.", 10, 2),
  cover(7, "Pano tipo 7 preferencial para a cadeira 3.0 e também compatível com a 4.0.", 5, 2),
  cover(8, "Pano tipo 8 exclusivo para a estrutura da cadeira 2.0.", 0, 2),
  cover(9, "Pano tipo 9 exclusivo para a estrutura da cadeira 2.0.", 5, 1),
  cover(10, "Pano tipo 10 exclusivo para a estrutura da cadeira 2.0.", 10, 2),
  cover(11, "Pano tipo 11 exclusivo para a estrutura da cadeira 2.0.", 15, 1),
];

function reducer(number: number, description: string, monthlyAdjustment: number, availableQuantity: number): Reducer {
  return {
    id: `reducer-${number.toString().padStart(2, "0")}`,
    code: `r${number.toString().padStart(2, "0")}`,
    name: `Redutor tipo ${number}`,
    description,
    priceAdjustment: {
      daily: Math.round((monthlyAdjustment / 30) * 100) / 100,
      weekly: Math.round((monthlyAdjustment / 4) * 100) / 100,
      monthly: monthlyAdjustment,
    },
    isActive: true,
    availableQuantity,
    kind: "reducer",
  };
}

export const INITIAL_REDUCERS: Reducer[] = [
  reducer(1, "Redutor tipo 1, preferencial para a cadeira 4.0 e compatível com a estrutura 3.0.", 35, 2),
  reducer(2, "Redutor tipo 2, preferencial para a cadeira 3.0 e compatível com a estrutura 4.0.", 30, 3),
  reducer(3, "Redutor tipo 3, preferencial para a cadeira 3.0 e compatível com a estrutura 4.0.", 30, 2),
  reducer(4, "Redutor tipo 4 exclusivo para a cadeira 2.0.", 25, 2),
];

export const INITIAL_BALL_SETS: BallSet[] = [
  { id: "ball-set-40", code: "b40", name: "Conjunto de bolinhas 4.0", modelId: "chair-model-40", description: "Conjunto de bolinhas exclusivo da cadeira 4.0.", isActive: true, availableQuantity: 4 },
  { id: "ball-set-30", code: "b30", name: "Conjunto de bolinhas 3.0", modelId: "chair-model-30", description: "Conjunto de bolinhas exclusivo da cadeira 3.0.", isActive: true, availableQuantity: 3 },
  { id: "ball-set-20", code: "b20", name: "Conjunto de bolinhas 2.0", modelId: "chair-model-20", description: "Conjunto de bolinhas exclusivo da cadeira 2.0.", isActive: true, availableQuantity: 2 },
  { id: "ball-set-50", code: "b50", name: "Conjunto de bolinhas 5.0", modelId: "chair-model-50", description: "Cadastro reservado para a futura cadeira 5.0.", isActive: false, availableQuantity: 0 },
];

function compatibility(
  modelId: string,
  componentType: "cover" | "reducer",
  componentId: string,
  isPreferred: boolean,
): ComponentCompatibility {
  return {
    id: `${modelId}:${componentType}:${componentId}`,
    modelId,
    componentType,
    componentId,
    isPreferred,
    isActive: true,
  };
}

export const INITIAL_COMPATIBILITIES: ComponentCompatibility[] = [
  ...[1, 2, 3, 4, 5, 6, 7].map((number) => compatibility("chair-model-40", "cover", `cover-${number.toString().padStart(2, "0")}`, number <= 6)),
  ...[1, 2, 3].map((number) => compatibility("chair-model-40", "reducer", `reducer-${number.toString().padStart(2, "0")}`, number === 1)),
  ...[7, 5, 6].map((number) => compatibility("chair-model-30", "cover", `cover-${number.toString().padStart(2, "0")}`, number === 7)),
  ...[1, 2, 3].map((number) => compatibility("chair-model-30", "reducer", `reducer-${number.toString().padStart(2, "0")}`, number === 2 || number === 3)),
  ...[8, 9, 10, 11].map((number) => compatibility("chair-model-20", "cover", `cover-${number.toString().padStart(2, "0")}`, true)),
  compatibility("chair-model-20", "reducer", "reducer-04", true),
];

const ANGLES: AssemblyAngle[] = ["FRT", "DIR", "ESQ", "SUP"];

function imagesFor(prefix: string, modelVersion: string, coverName: string, reducerName: string): AssemblyImage[] {
  return ANGLES.map((angle) => ({
    angle,
    assetKey: `${prefix}_${angle}`,
    alt: `${modelVersion} com ${coverName}${reducerName ? ` e ${reducerName}` : " sem redutor"} — ${angle}`,
    isPlaceholder: true,
  }));
}

function createVariants(
  modelId: string,
  modelVersion: string,
  ballSetId: string,
  ballCode: string,
  coverNumbers: number[],
  reducerNumbers: Array<number | null>,
): AssemblyVariant[] {
  let sequence = 1;
  const variants: AssemblyVariant[] = [];

  for (const coverNumber of coverNumbers) {
    for (const reducerNumber of reducerNumbers) {
      const coverCode = `p${coverNumber.toString().padStart(2, "0")}`;
      const reducerCode = reducerNumber === null ? "r00" : `r${reducerNumber.toString().padStart(2, "0")}`;
      const prefix = `${modelVersion.replace(".", "") === "40" ? "m40" : modelVersion.replace(".", "") === "30" ? "m30" : "m20"}_${coverCode}_${reducerCode}_${ballCode}`;
      const coverName = `Pano tipo ${coverNumber}`;
      const reducerName = reducerNumber === null ? "" : `Redutor tipo ${reducerNumber}`;

      variants.push({
        id: `${modelVersion}-${sequence.toString().padStart(3, "0")}`,
        modelId,
        coverId: `cover-${coverNumber.toString().padStart(2, "0")}`,
        reducerId: reducerNumber === null ? null : `reducer-${reducerNumber.toString().padStart(2, "0")}`,
        ballSetId,
        prefix,
        isActive: true,
        publicationStatus: "published",
        images: imagesFor(prefix, modelVersion, coverName, reducerName),
      });
      sequence += 1;
    }
  }

  return variants;
}

export const INITIAL_ASSEMBLY_VARIANTS: AssemblyVariant[] = [
  ...createVariants("chair-model-40", "4.0", "ball-set-40", "b40", [1, 2, 3, 4, 5, 6, 7], [null, 1, 2, 3]),
  ...createVariants("chair-model-30", "3.0", "ball-set-30", "b30", [7, 5, 6], [null, 2, 3, 1]),
  ...createVariants("chair-model-20", "2.0", "ball-set-20", "b20", [8, 9, 10, 11], [null, 4]),
];
