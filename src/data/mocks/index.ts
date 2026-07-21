import type { Customer, QuoteRecord, Reservation, ShippingZone } from "../../domain/shared/types";

export const DEFAULT_SHIPPING_ZONES: ShippingZone[] = [
  { id: 1, name: "São Paulo Capital", cepPrefix: "01,02,03,04,05,06,07,08,09", rate: 25, description: "CEPs 01000-000 a 09999-999" },
  { id: 2, name: "Grande São Paulo", cepPrefix: "06,07,08,09,11,12,13,14,15,16", rate: 40, description: "Região metropolitana de SP" },
  { id: 3, name: "Interior de SP / RJ Capital", cepPrefix: "17,18,19,20,21,22,23,24,25,26,27,28", rate: 60, description: "Interior SP e Rio de Janeiro" },
  { id: 4, name: "Outras capitais / Sul", cepPrefix: "29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99", rate: 80, description: "Demais estados" },
];
export const CUSTOMERS: Customer[] = [
  { id: "c001", name: "Ana Clara Ferreira", cpf: "•••.356.•••-84", email: "anaclara@email.com", phone: "(11) 9•••-4521", city: "São Paulo, SP", status: "Ativo", since: "Mar 2024", orders: 3 },
  { id: "c002", name: "Beatriz Oliveira", cpf: "•••.741.•••-20", email: "beatriz.oli@email.com", phone: "(11) 9•••-7834", city: "Guarulhos, SP", status: "Ativo", since: "Jan 2024", orders: 1 },
  { id: "c003", name: "Carla Menezes", cpf: "•••.128.•••-55", email: "carla.m@email.com", phone: "(21) 9•••-3312", city: "Rio de Janeiro, RJ", status: "Ativo", since: "Abr 2024", orders: 2 },
  { id: "c004", name: "Daniela Rocha", cpf: "•••.904.•••-11", email: "daniela.r@email.com", phone: "(11) 9•••-6621", city: "Osasco, SP", status: "Inativo", since: "Dez 2023", orders: 1 },
  { id: "c005", name: "Fernanda Lima", cpf: "•••.512.•••-78", email: "fernanda.l@email.com", phone: "(11) 9•••-2284", city: "Campinas, SP", status: "Ativo", since: "Mai 2024", orders: 4 },
  { id: "c006", name: "Gabriela Santos", cpf: "•••.267.•••-33", email: "gabriela.s@email.com", phone: "(31) 9•••-9945", city: "Belo Horizonte, MG", status: "Ativo", since: "Fev 2024", orders: 2 },
];

export const QUOTES_DATA: QuoteRecord[] = [
  { id: "ORC-2024-0041", customer: "Ana Clara Ferreira", products: "MamaRoo 4.0", period: "15 a 30/06/2024", value: "R$ 298,00", status: "Em análise", date: "12/06/2024", updatedAt: "12/06/2024" },
  { id: "ORC-2024-0040", customer: "Beatriz Oliveira", products: "NextFit Sport", period: "01 a 20/07/2024", value: "R$ 399,00", status: "Orçamento enviado", date: "10/06/2024", updatedAt: "11/06/2024" },
  { id: "ORC-2024-0039", customer: "Carla Menezes", products: "MamaRoo Sleep", period: "20/06 a 20/07/2024", value: "R$ 520,00", status: "Aprovado", date: "08/06/2024", updatedAt: "09/06/2024" },
  { id: "ORC-2024-0038", customer: "Daniela Rocha", products: "TurboBooster LX", period: "05 a 12/07/2024", value: "R$ 110,00", status: "Aguardando informações", date: "07/06/2024", updatedAt: "07/06/2024" },
  { id: "ORC-2024-0037", customer: "Fernanda Lima", products: "Boutique Swing + SpaceSaver", period: "01 a 30/07/2024", value: "R$ 529,00", status: "Convertido em reserva", date: "05/06/2024", updatedAt: "06/06/2024" },
  { id: "ORC-2024-0036", customer: "Gabriela Santos", products: "Polly 2 Start", period: "10 a 25/06/2024", value: "R$ 230,00", status: "Recusado", date: "02/06/2024", updatedAt: "03/06/2024" },
  { id: "ORC-2024-0035", customer: "Ana Clara Ferreira", products: "Stages FX", period: "20/06 a 04/07/2024", value: "R$ 330,00", status: "Enviado", date: "01/06/2024", updatedAt: "01/06/2024" },
  { id: "ORC-2024-0034", customer: "Fernanda Lima", products: "MamaRoo 4.0", period: "01 a 14/06/2024", value: "R$ 249,00", status: "Concluído", date: "25/05/2024", updatedAt: "15/06/2024" },
  { id: "ORC-2024-0033", customer: "Beatriz Oliveira", products: "SpaceSaver Chair", period: "15 a 22/06/2024", value: "R$ 89,00", status: "Expirado", date: "20/05/2024", updatedAt: "22/05/2024" },
  { id: "ORC-2024-0032", customer: "Carla Menezes", products: "NextFit Sport", period: "01 a 15/06/2024", value: "R$ 270,00", status: "Cancelado", date: "18/05/2024", updatedAt: "19/05/2024" },
];

export const RESERVATIONS: Reservation[] = [
  { id: "RES-2024-0019", customer: "Fernanda Lima", product: "MamaRoo 4.0", unit: "RM-MR40-002", start: "01/07/2024", end: "31/07/2024", status: "Confirmada", address: "R. das Flores, 142 — Campinas, SP", payment: "Aprovado" },
  { id: "RES-2024-0018", customer: "Ana Clara Ferreira", product: "NextFit Sport", unit: "RM-NF01-001", start: "15/06/2024", end: "05/07/2024", status: "Locação ativa", address: "Av. Paulista, 900 — São Paulo, SP", payment: "Aprovado" },
  { id: "RES-2024-0017", customer: "Carla Menezes", product: "MamaRoo Sleep", unit: "RM-MS01-001", start: "20/06/2024", end: "20/07/2024", status: "Em preparação", address: "R. Copacabana, 55 — Rio de Janeiro, RJ", payment: "Aprovado" },
  { id: "RES-2024-0016", customer: "Gabriela Santos", product: "Stages FX", unit: "RM-SF01-002", start: "10/06/2024", end: "24/06/2024", status: "Em higienização", address: "R. dos Caetés, 780 — Belo Horizonte, MG", payment: "Aprovado" },
  { id: "RES-2024-0015", customer: "Fernanda Lima", product: "Boutique Swing", unit: "RM-BS01-001", start: "01/06/2024", end: "30/06/2024", status: "Concluída", address: "R. das Flores, 142 — Campinas, SP", payment: "Aprovado" },
  { id: "RES-2024-0014", customer: "Beatriz Oliveira", product: "Polly 2 Start", unit: "RM-P2S-001", start: "05/06/2024", end: "20/06/2024", status: "Aguardando devolução", address: "R. Guarulhos, 33 — Guarulhos, SP", payment: "Aprovado" },
  { id: "RES-2024-0013", customer: "Daniela Rocha", product: "TurboBooster LX", unit: "RM-TB01-001", start: "01/05/2024", end: "15/05/2024", status: "Concluída", address: "R. dos Andrades, 200 — Osasco, SP", payment: "Aprovado" },
  { id: "RES-2024-0012", customer: "Ana Clara Ferreira", product: "MamaRoo 4.0", unit: "RM-MR40-001", start: "10/04/2024", end: "10/05/2024", status: "Concluída", address: "Av. Paulista, 900 — São Paulo, SP", payment: "Aprovado" },
];

export const CHART_MONTHLY = [
  { mes: "Jan", solicitacoes: 42, locacoes: 31 },
  { mes: "Fev", solicitacoes: 38, locacoes: 28 },
  { mes: "Mar", solicitacoes: 55, locacoes: 41 },
  { mes: "Abr", solicitacoes: 71, locacoes: 58 },
  { mes: "Mai", solicitacoes: 89, locacoes: 73 },
  { mes: "Jun", solicitacoes: 94, locacoes: 82 },
];

export const CHART_REVENUE = [
  { mes: "Jan", receita: 8420, meta: 9000 },
  { mes: "Fev", receita: 7650, meta: 9000 },
  { mes: "Mar", receita: 10240, meta: 9500 },
  { mes: "Abr", receita: 13820, meta: 11000 },
  { mes: "Mai", receita: 16750, meta: 13000 },
  { mes: "Jun", receita: 19340, meta: 15000 },
];

export const CHART_PRODUCTS = [
  { name: "MamaRoo 4.0", value: 34 },
  { name: "NextFit Sport", value: 22 },
  { name: "MamaRoo Sleep", value: 18 },
  { name: "Polly 2 Start", value: 14 },
  { name: "Outros", value: 12 },
];

export const TESTIMONIALS = [
  { name: "Ana C.", city: "São Paulo, SP", product: "MamaRoo 4.0", text: "A cadeira chegou higienizada e em perfeito estado. Minha filha adorou os movimentos. Facilitou muito as noites de cólica.", rating: 5 },
  { name: "Beatriz O.", city: "Guarulhos, SP", product: "NextFit Sport", text: "Precisávamos de uma cadeirinha para viagem e alugar foi perfeito. Não precisei gastar com um item que usaria apenas uma vez.", rating: 5 },
  { name: "Carla M.", city: "Rio de Janeiro, RJ", product: "Boutique Swing", text: "Atendimento cuidadoso do início ao fim. A equipe orientou qual modelo era mais indicado para a idade do meu bebê.", rating: 5 },
  { name: "Fernanda L.", city: "Campinas, SP", product: "MamaRoo 4.0 + SpaceSaver", text: "Alugamos dois produtos e foi muito mais econômico do que comprar. Produtos em ótimo estado.", rating: 4 },
  { name: "Gabriela S.", city: "Belo Horizonte, MG", product: "Stages FX", text: "Processo de orçamento simples. Recebemos o retorno rápido da equipe e a entrega foi pontual.", rating: 5 },
];

export const FAQ_ITEMS = [
  { q: "Como funciona o aluguel?", a: "Você escolhe o produto, informa o período desejado e envia uma solicitação de orçamento. Nossa equipe analisa a disponibilidade e retorna com a confirmação e o valor final. A reserva é confirmada apenas após essa análise." },
  { q: "Como verifico a disponibilidade?", a: "Selecione o produto desejado, informe as datas e o CEP. A plataforma indicará uma estimativa de disponibilidade. A confirmação final é feita pela equipe Rent4Moms." },
  { q: "Os produtos são higienizados?", a: "Sim. Todos os produtos passam por um processo completo de limpeza, higienização e revisão antes de cada nova locação. Você recebe um produto pronto para uso." },
  { q: "Posso renovar o período?", a: "Sim, desde que o produto esteja disponível. Acesse a área do cliente, selecione sua locação ativa e solicite a renovação. Nossa equipe confirmará a disponibilidade." },
  { q: "Como funciona a entrega?", a: "Realizamos entrega no endereço informado dentro da nossa área de atendimento. Você também pode retirar pessoalmente, conforme disponibilidade. A taxa de entrega varia conforme a região e é informada no orçamento." },
  { q: "O que acontece em caso de avaria?", a: "Ao receber o produto, faça uma conferência. Qualquer avaria preexistente deve ser reportada imediatamente. Danos causados durante a locação são avaliados individualmente pela equipe." },
  { q: "Existe caução?", a: "A necessidade e o valor da caução dependem do produto e do período. Essa informação é detalhada no orçamento e no contrato antes da confirmação da reserva." },
  { q: "Como funciona o cancelamento?", a: "As condições de cancelamento estão descritas na Política de Cancelamento e no contrato de locação. Recomendamos a leitura antes da confirmação." },
  { q: "A reserva é confirmada imediatamente?", a: "Não. O envio da solicitação inicia uma análise por parte da equipe Rent4Moms. A reserva é confirmada apenas após essa validação, que inclui disponibilidade do produto, período e região de atendimento." },
];
