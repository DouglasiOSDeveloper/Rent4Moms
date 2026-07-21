# Etapa 6 — integração com backend, sessão e persistência

## Alterações

- Login e cadastro reais pela API privada.
- Sessão restaurada por cookie HttpOnly após atualização da página.
- Guards aguardam a verificação da sessão antes de redirecionar.
- Catálogo carregado do backend e persistido remotamente por administradores.
- Configurações de entrega e zonas de frete carregadas e salvas na API.
- Solicitações de orçamento são gravadas no backend e recebem código real.
- Área do cliente lista os pedidos vinculados à conta autenticada.
- Administração lista os pedidos persistidos.
- Mocks locais permanecem como fallback de desenvolvimento quando a API estiver fora do ar.

## Desenvolvimento

Inicie o backend na porta 3000 e depois execute:

```bash
npm ci
npm run dev
```

O Vite encaminha `/api` para `http://localhost:3000`. Em produção, configure `VITE_API_BASE_URL`.

## Limites desta etapa

- Pedido anônimo ainda não é reivindicado posteriormente por CPF; isso pertence à Etapa 8.
- Estoque físico e reserva transacional pertencem à Etapa 7.
- Upload de fotos operacionais pertence à Etapa 9.
