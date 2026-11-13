# Publicação automática no Cloudflare Pages

## O que acontece ao clicar em "Publicar no Cloudflare"
1. O Estúdio valida os campos (os mesmos de "Gerar projeto") e gera o pacote do site.
2. O Órbita prepara o pacote: remove arquivos de outras hospedagens (`vercel.json`, `netlify.toml`, `LEIA-ME.md`), força `noindex`, `robots.txt` bloqueando, cabeçalhos `X-Robots-Tag` e um aviso discreto "Demonstração criada por … · não é o site oficial da empresa". Se o acompanhamento estiver ativo, injeta o script de medição.
3. **Auditoria de privacidade** (bloqueia a publicação se houver erro): credenciais/variáveis secretas, referências ao CRM, termos de estratégia comercial (margem, preço mínimo…), texto das notas/histórico da ficha, contatos de outras empresas, recursos externos, links quebrados, licenças, arquivos acima de 25 MiB.
4. Confirmação sua (a menos que você tenha ativado a publicação sem pedir confirmação em Integrações).
5. A ponte serverless (Vercel, `api/connect.js`, mesma sessão GitHub e CSRF do Connect) cria ou reutiliza o projeto na Cloudflare, recebe os arquivos em lotes (gzip no navegador; no máximo ~4 MB por requisição), calcula os hashes no servidor, envia só os assets que a Cloudflare ainda não tem, registra os hashes, cria o deployment e acompanha até concluir.
6. O Órbita verifica, pelo servidor, se o link responde. **O endereço mostrado é o devolvido pela Cloudflare** (`subdomain` do projeto), nunca presumido. A demonstração só recebe o link e `publicacaoVerificada=true` depois dessa verificação.

Republicar reaproveita o mesmo projeto (mesmo endereço) e só envia o que mudou. Se algo falhar no meio, tentar de novo não reenvia o que já subiu.

## Cache incremental e recuperação de falhas
- **Identidade do pacote = conteúdo.** Antes de enviar, o navegador calcula o SHA-256 de cada arquivo do pacote **já preparado** (HTML, CSS, JS, script de acompanhamento) e dos cabeçalhos (`_headers`), e guarda por arquivo o hash da Cloudflare. Só é reenviado o que mudou: ativar/desativar o acompanhamento ou trocar o modo altera `index.html` e/ou `js/orbita-rastreio.js` e apenas eles sobem. Pacote idêntico não reenvia nada nem cria outro deploy. A versão do Estúdio **não** é usada como chave.
- **O cache se valida sozinho:** antes de criar o deploy, o Órbita confere na Cloudflare (só por hash, sem enviar bytes) se os arquivos reaproveitados ainda existem e reenvia apenas os que sumiram. Como segurança extra, se a criação do deploy falhar com erro 400/404/409/422, reenvia tudo e tenta uma vez mais (nunca para 429/5xx).
- A chave do deploy cobre o pacote inteiro (arquivos + cabeçalhos): mudar só `_headers` também gera um novo deploy. **Restaurar** uma versão (rollback) invalida o deploy salvo, para que republicar depois crie um deploy novo em vez de reportar o antigo como ativo.
- Quando o deploy demora, o registro da publicação guarda a etapa e o estado reais devolvidos pela Cloudflare (diagnóstico do primeiro deploy real).
- **Estados do deploy:** *pendente* (retomado com o mesmo id, sem criar outro), *concluído* (reaproveitado se o conteúdo for o mesmo) e *falho* (`failure`, `canceled` ou etapa com falha). Ao falhar, os identificadores são invalidados (`deployId`, `deployManifestoHash`), o id fica em `deploysFalhos` e a próxima tentativa **cria um novo deploy** no mesmo projeto/endereço, sem reenviar assets. Deploy que sumiu (404) também é descartado.

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

## ⚠ O que foi (e o que NÃO foi) validado
- **Nenhuma publicação real foi executada**: não havia credenciais da Cloudflare no ambiente. Todos os testes usam Cloudflare **simulada** (mock explícito). O primeiro deploy real é o teste de verdade: faça-o com uma demonstração de teste.
- A documentação oficial (developers.cloudflare.com) não pôde ser aberta pelo ambiente. Em vez disso, o fluxo foi **conferido no código aberto do Wrangler** (`cloudflare/workers-sdk`): `GET …/upload-token` → JWT; `POST /pages/assets/check-missing` `{hashes}`; `POST /pages/assets/upload` `[{key,value(base64),metadata:{contentType},base64:true}]`; `POST /pages/assets/upsert-hashes`; `POST …/deployments` em multipart com `manifest` (`{"/caminho":"hash"}`), `branch`, `commit_message` e `_headers`. O **hash** é `BLAKE3(base64(conteúdo)+extensão)` truncado a 32 hex, **sem alterar a caixa da extensão**, idêntico a `hashFile` do Wrangler; o BLAKE3 em si foi validado contra os vetores oficiais. Limites do Wrangler: 20.000 arquivos e 25 MiB por arquivo.
- Pontos que o código aberto não garante e que a Cloudflare pode mudar: formato exato de erros, limites por plano, comportamento de *rollback* (só vale para deploys de produção anteriores). Se algo falhar, a mensagem da Cloudflare aparece em Publicações → registro de operações.

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
