# GitHub Pages e domínio Rent4Moms

## Arquitetura

- Site público e painel: `https://rent4moms.com.br` (GitHub Pages).
- API: `https://api.rent4moms.com.br/api/v1` (servidor Node separado).
- `www.rent4moms.com.br` redireciona para o domínio principal.

O workflow `.github/workflows/pages.yml` valida o frontend, gera `dist`, cria o fallback `404.html` para o React Router e publica pelo GitHub Actions.

## Ativação no GitHub

1. Envie os arquivos atualizados para a branch `main`.
2. Abra `Settings > Pages`.
3. Em `Build and deployment > Source`, selecione **GitHub Actions**.
4. Aguarde o workflow **Deploy GitHub Pages** concluir.
5. Em `Custom domain`, informe `rent4moms.com.br` e salve.
6. Ative **Enforce HTTPS** quando o certificado ficar disponível.

## DNS na Hostinger

Remova o registro A antigo do domínio raiz apenas quando a API e o backup de produção estiverem prontos. Crie quatro registros A para `@`:

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

Mantenha/crie:

- CNAME `www` → `DouglasiOSDeveloper.github.io`
- A `api` → IP público do servidor da API

Não altere registros MX, SPF, DKIM, DMARC, `autodiscover`, `autoconfig` ou os registros de e-mail. Eles serão usados na etapa do Brevo e do e-mail da Hostinger.

## Validação no Windows

```powershell
Resolve-DnsName rent4moms.com.br -Type A
Resolve-DnsName www.rent4moms.com.br -Type CNAME
Resolve-DnsName api.rent4moms.com.br -Type A
```

Depois valide Home, URL direta de produto, login, painel, upload, orçamento e cálculo de frete.
