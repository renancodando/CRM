# Coletor de acompanhamento das demonstrações

Cloudflare Worker + R2 que recebe eventos **anônimos** dos sites de demonstração publicados pelo Órbita. O CRM (empresas, negociações, valores) continua só no navegador; aqui chegam apenas um identificador opaco da demonstração e eventos mínimos.

## O que é recebido e guardado
`pagina`, `secao`, `botao`, `servico`, `faq`, `ancora`, `whatsapp`, `telefone`, `tempo`, `consentimento` + dispositivo (celular/tablet/computador) e origem em categorias amplas (direto, whatsapp, instagram, busca, interno, outro). Um identificador de sessão aleatório por aba (`sessionStorage`) **somente se o visitante aceitou**. **Não** são guardados IP, país, user-agent, cookies, texto digitado, impressão digital do navegador, geolocalização ou dados do CRM.

## Implantação
```sh
cd rastreio
npx wrangler r2 bucket create orbita-rastreio
npx wrangler secret put SEGREDO          # string aleatória longa (assina as chaves das demonstrações)
npx wrangler secret put TOKEN_LEITURA    # outra string aleatória longa (leitura/exclusão pelo Órbita)
npx wrangler deploy
```
Na Vercel defina `RASTREIO_URL` (endereço do Worker, https), `RASTREIO_SEGREDO` (= `SEGREDO`) e `RASTREIO_TOKEN_LEITURA` (= `TOKEN_LEITURA`) e faça novo deploy. No Órbita: Publicações → Integrações → ative "Acompanhar acessos" → **Testar coletor**.

## Visualização e consentimento
- A visualização inicial é contada **uma única vez** por carregamento da página. No modo `agregado` ela é anônima (sem sessão) até o aceite; ao aceitar, o evento `sessao` liga essa mesma visualização à sessão (sem contar duas vezes). No modo `consentimento` nada é enviado antes do aceite; ao aceitar, a visualização é contada na hora, sem precisar recarregar.
- Recusar ou revogar descarta tudo que ainda não foi enviado, para o envio e esquece a sessão; aceitar de novo não recontabiliza a visualização.
- Seções já visíveis no momento do aceite passam a ser registradas (são reobservadas).

## Garantias e limites das proteções
- **Chave por demonstração**: cada site recebe `HMAC(SEGREDO, demo)`; eventos com chave inválida são recusados. Quem ler o código-fonte do site pode ver a chave e forjar eventos *daquela* demonstração: isso impede fabricação em massa para demos inexistentes, não um atacante determinado.
- **Deduplicação** por id de evento na leitura; **limite de taxa** por demonstração/IP em memória do isolate (melhor esforço, não é global); tamanho máximo 8 KB e 40 eventos por lote; timestamps fora de ±24 h são descartados.
- **Robôs**: filtro por user-agent no cliente e no servidor + `navigator.webdriver`; robôs que se disfarçam passam. Previews de links (WhatsApp, Facebook) são ignorados por user-agent.
- **Retenção**: `RETENCAO_DIAS` (padrão 90) com limpeza diária por cron; exclusão imediata por demonstração em Publicações → Acompanhamento → "Excluir dados".
- **Consentimento**: o site mostra um aviso com Aceitar/Recusar; revogar é possível pela API `window.orbitaAcompanhamento.revogar()`. Modo `agregado` conta apenas visualizações anônimas sem aceite; interações, tempo e sessões exigem aceite. Modo `consentimento` não mede nada sem aceite. **Consulte um profissional sobre LGPD para o seu caso.**
- Sessões e visitantes são **estimativas por navegador**, não pessoas; o link pode ter sido encaminhado.

## Custos e adequação
Cada lote de eventos gera 1 escrita no R2 (~1 por visita). Para dezenas de demonstrações e centenas de visitas por mês, o volume fica muito abaixo dos limites gratuitos do Workers (100 mil requisições/dia) e do R2 (10 GB e 1 milhão de operações de escrita por mês) — confira os valores atuais na Cloudflare. Alternativas simples avaliadas: *Workers Analytics Engine* (agregações prontas, porém consulta em SQL e retenção fixa) e *D1* (banco; desnecessário para este volume). Foi mantido R2 por ser o pedido, barato e sem esquema.

## Não validado
O Worker foi testado localmente com um R2 simulado; **nenhuma implantação real** foi feita.
