# Etapa D - Estoque alinhado ao catálogo

- Quantidades de modelo, pano, redutor e bolinhas são somente leitura no catálogo.
- O número exibido vem da API e corresponde às unidades físicas com status `available`.
- Criação, edição operacional e baixa de peças ficam no módulo **Estoque físico**.
- Uma unidade nova só pode selecionar item ativo do catálogo.
- Itens com unidades não baixadas não podem ser arquivados; a interface orienta a baixar as peças primeiro.
- Referências ausentes ou inativas são sinalizadas no inventário, permanecem visíveis para conferência e baixa e não entram na disponibilidade pública.

Validação:

```powershell
npm run stage:d:verify
```
