# Órbita Conversão

## O que é
Um módulo para conduzir conversas comerciais com pequenas empresas de forma honesta, mensurável e respeitosa. Tudo é regra determinística explicável, sem API de IA paga e sem banco remoto; os dados ficam no IndexedDB do navegador (chave raiz `conversao` do estado).

## Princípios (não negociáveis)
- Nada é enviado automaticamente; **gerar ou copiar não é enviar**. O envio só entra no CRM pelo botão "Confirmo que enviei".
- "Venda fechada" nunca é inferida de texto: só por confirmação explícita (fluxo já existente de proposta/venda).
- Sem urgência/escassez falsa, sem avaliações ou resultados inventados, sem promessa de faturamento, posição no Google ou retorno.
- Recusa clara ou "pare" = encerrar e bloquear. Não há resposta de "contorno".
- Número publicado na internet **não é consentimento**; o consentimento é registrado por canal, com origem, e pode ser revogado.
- Sem envio em massa, sem raspagem, sem evasão de bloqueios; respeite a política do WhatsApp Business: https://business.whatsapp.com/policy
- Os números que você estimou (100+ contatos, ~90 sem resposta etc.) são guardados apenas como **hipótese informada** e nunca entram nas métricas reais.

## Como usar
1. **Fila**: empresas elegíveis ordenadas por nota × confiança. Abra "Por que esta posição?" para ver cada fator (conhecido, desconhecido, verificado).
2. **Conversa**: escolha a empresa; veja estado, abordagem recomendada (e por quê), as seis abordagens e a auditoria de linguagem enquanto edita. Copie, abra o WhatsApp (não registra) e, **depois de enviar**, clique em "Confirmo que enviei".
3. **Respostas**: cole a resposta; o Órbita interpreta como hipótese, lista o que não sabe, sugere respostas (principal/curta/direta) e só registra no CRM quando você mandar.
4. **Valor e Estúdio**: benefícios só dos recursos entregues; modelo sugerido com justificativa (ou "sem sinal"); feedback do cliente vira ajustes.
5. **Laboratório**: crie um experimento (hipótese, critério, mínimo por variante); sorteie as empresas elegíveis; use a abordagem sorteada; acompanhe resultado, desvios e análises planejadas.
6. **Funil / Memória / Treino / Evidências / Consentimento**: ver abas.

## Estatística usada
Intervalos de Wilson por variante; teste exato de Fisher (2 variantes) com Holm (3+); intervalo de Newcombe para a diferença; h de Cohen; limiar α/(análises planejadas) para controlar olhadas repetidas; mínimo de mensagens enviadas por variante antes de qualquer veredito; denominador = mensagens **confirmadas como enviadas**; sucesso ≠ venda (o painel alerta quando a melhor taxa não gera mais vendas ou gera mais recusas). A memória usa encolhimento em direção à média geral (K=10) e só aprende com ≥20 envios totais e ≥15 por abordagem.

## Limites científicos (leia)
- A biblioteca de evidências tem poucos estudos e **nenhum é evidência direta** para "primeira mensagem de WhatsApp de um desenvolvedor para uma pequena empresa". A maior parte é indireta (e-mail de marketing, reatância em comunicação persuasiva, teoria da confiança) ou hipótese. Técnicas como "reverse psychology"/BYAF têm evidência **insuficiente** e só entram como autonomia respeitosa, não como truque.
- O campo `verificacao` indica quais referências foram confirmadas em fonte online na construção (DOI de Shi & Li confirmado por título/veículo, não por abertura do artigo) e quais vêm de conhecimento não reverificado: confira antes de citar externamente.
- As pontuações de qualificação e as recomendações são heurísticas explicáveis, não modelos preditivos validados. A recomendação "aprendida" é associação observada, não prova de causa.
- O diagnóstico do funil aponta a maior queda observada e hipóteses alternativas; não prova causa.
- O treino usa regras simples de pontuação; não prevê desempenho real.
- Com poucas mensagens, **o resultado correto é "amostra insuficiente"**. Com ~100 contatos por semana ainda levará semanas para comparar duas abordagens com confiança.

## Depende de dados reais
Pesos e limiares só se calibram com os seus envios confirmados. Sem eles, o módulo usa regras fixas e diz isso.

## Primeiros experimentos sugeridos
1. **A (direta) vs B (consultiva)**, critério "resposta positiva", mínimo 20 por variante, mesma nicho, 3 análises planejadas.
2. **Com vs sem observação verificável** (D vs A) em empresas sem site com evidência registrada.
3. **Prévia oferecida (E) vs prévia enviada (C)**, critério "demonstração aceita".
Registre cada envio no horário real; mantenha o mesmo horário/dia da semana entre variantes.

## Connect
Novas operações (protocolo continua 1.x, compatível): `conversao.rascunho_mensagem`, `conversao.objecao_registrada`, `conversao.consentimento` (sensível), `conversao.experimento_criar`. Respeitam os 4 níveis de autonomia, idempotência, auditoria e reversão. Nenhuma envia mensagem nem sorteia empresas. Esquemas em `esquemas/`.

## Arquivos
`nucleo/conversao/{evidencias,dominio,linguagem,abordagens,laboratorio}.js`, `modulos/conversao.js`, testes `testes/conversao-*.{mjs,cjs}`.
