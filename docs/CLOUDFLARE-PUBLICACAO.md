# Publicação automática no Cloudflare Pages

## O que acontece ao clicar em "Publicar no Cloudflare"
1. O Estúdio valida os campos (os mesmos de "Gerar projeto") e gera o pacote do site.
2. O Órbita prepara o pacote: remove arquivos de outras hospedagens (`vercel.json`, `netlify.toml`, `LEIA-ME.md`), força `noindex`, `robots.txt` bloqueando, cabeçalhos `X-Robots-Tag` e um aviso discreto "Demonstração criada por … · não é o site oficial da empresa". Se o acompanhamento estiver ativo, injeta o script de medição.
3. **Auditoria de privacidade** (bloqueia a publicação se houver erro): credenciais/variáveis secretas, referências ao CRM, termos de estratégia comercial (margem, preço mínimo…), texto das notas/histórico da ficha, contatos de outras empresas, recursos externos, links quebrados, licenças, arquivos acima de 25 MiB.
4. Confirmação sua (a menos que você tenha ativado a publicação sem pedir confirmação em Integrações).
5. A ponte serverless (Vercel, `api/connect.js`, mesma sessão GitHub e CSRF do Connect) cria ou reutiliza o projeto na Cloudflare, recebe os arquivos em lotes (gzip no navegador; no máximo ~4 MB por requisição), calcula os hashes no servidor, envia só os assets que a Cloudflare ainda não tem, registra os hashes, cria o deployment e acompanha até concluir.
6. O Órbita verifica, pelo servidor, se o link responde. **O endereço mostrado é o devolvido pela Cloudflare** (`subdomain` do projeto), nunca presumido. A demonstração só recebe o link e `publicacaoVerificada=true` depois dessa verificação.

Republicar reaproveita o mesmo projeto (mesmo endereço) e só envia o que mudou. Se algo falhar no meio, tentar de novo não reenvia o que já subiu.

## Configuração (uma vez)
1. Cloudflare → *Manage Account* → *Account API tokens* (ou *My Profile → API Tokens*) → criar token **customizado** com a permissão *Account → Cloudflare Pages → Edit*, restrito à sua conta.
2. Copie o *Account ID* (32 caracteres hexadecimais).
3. Na Vercel (Settings → Environment Variables, escopo Production, marcar como sensível):

| Variável | Valor |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta |
| `CLOUDFLARE_API_TOKEN` | token do passo 1 |
| `ORBITA_PAGES_PREFIX` | (opcional) ex.: `demo-`; só projetos com esse prefixo podem ser listados, enviados ou excluídos |

4. Faça um novo deploy na Vercel. No Órbita: **Publicações → Integrações → Testar conexão**.

Os tokens nunca aparecem em JavaScript público, HTML, LocalStorage, IndexedDB, ZIP, URLs ou commits. A ponte só aceita a sessão do proprietário GitHub configurado (`ORBITA_OWNER_GITHUB_ID`), exige `Origin` e `X-Orbita-CSRF` em POST, limita requisições por minuto e valida todos os caminhos/nomes (anti path traversal e anti-SSRF na verificação de links).

## Limites (conferir no plano atual da sua conta)
Direct Upload: até 20.000 arquivos por deploy e 25 MiB por arquivo; quantidade de projetos e de deploys por mês variam por plano. Custos: Pages é gratuito no plano free dentro desses limites. A função serverless da Vercel está configurada com `maxDuration` de 60 s; cada requisição de upload é limitada a ~4,4 MB.

## ⚠ O que NÃO foi validado
- **Nenhuma publicação real foi executada** durante o desenvolvimento: não havia credenciais da Cloudflare no ambiente. Todos os testes usam Cloudflare **simulada** (mock explícito).
- A documentação oficial da Cloudflare não pôde ser aberta pelo ambiente de desenvolvimento. O fluxo (upload-token JWT → `check-missing` → `upload` → `upsert-hashes` → deployment com `manifest`) foi confirmado pela referência de API encontrada por busca, mas **o algoritmo de hash dos assets** (BLAKE3 de `base64(conteúdo)+extensão`, 32 caracteres hexadecimais — comportamento do `wrangler`) veio de fontes secundárias. Se o primeiro deploy real falhar com assets 404 ou hash recusado, o ajuste está isolado em `api/_lib/cloudflare.js` → `hashAsset`. O BLAKE3 em si foi validado contra os vetores oficiais.
- Restaurar versão usa o *rollback* da Cloudflare, que só vale para deploys de produção anteriores.

## Alternativa sempre disponível
O botão **Exportar ZIP** continua funcionando; a publicação manual (Vercel/Netlify/Cloudflare) segue possível.

## Solução de problemas
| Mensagem | O que fazer |
|---|---|
| "Cloudflare ainda não está configurada" | Definir as variáveis na Vercel e redeployar |
| "Token sem permissão" | Recriar o token com *Cloudflare Pages: Edit* na conta correta |
| "Nome já usado por outra conta" | Os nomes de projeto são globais; altere o nome da empresa/cidade no projeto |
| "Limite de projetos atingido" | Excluir demonstrações antigas (Publicações → Excluir) |
| Link "publicada, sem verificação" | Aguardar a propagação e usar **Verificar disponibilidade** |
