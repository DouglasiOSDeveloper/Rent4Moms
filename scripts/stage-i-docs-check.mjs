import { readFile } from "node:fs/promises";

const required = [
  ["docs/STAGE_I.md", ["Central de ajuda operacional", "npm run stage:i:verify"]],
  ["docs/OPERATIONS_GUIDE.md", ["Mapa de módulos", "Onde cadastrar cada foto", "Ciclo completo do pedido"]],
  ["docs/STATUS_GLOSSARY.md", ["Unidades físicas", "Higienização", "Manutenção"]],
  ["docs/RUNBOOKS.md", ["Publicar produto configurável", "Processar pedido até a devolução", "API indisponível"]],
  ["src/features/admin/help/adminHelpContent.ts", ["MEDIA_LOCATIONS", "QUOTE_LIFECYCLE", "PERMISSION_GUIDE", "RUNBOOKS"]],
];

for (const [file, markers] of required) {
  const contents = await readFile(file, "utf8");
  for (const marker of markers) {
    if (!contents.includes(marker)) throw new Error(`${file}: marcador obrigatório ausente: ${marker}`);
  }
  if (/\b(mock|placeholder)\b/i.test(contents) && !contents.includes("não cria dados")) {
    throw new Error(`${file}: referência ambígua a mock/placeholder na documentação operacional.`);
  }
}

console.log("Etapa I: documentação, ajuda contextual, fotos, status, permissões e runbooks presentes.");
