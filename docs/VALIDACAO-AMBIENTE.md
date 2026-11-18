# Validação do ambiente inferior

Verificações executadas em 18/11/2026, com Chromium headless, Playwright e WebGL2 por SwiftShader no ambiente de desenvolvimento.

## Preservação da parte superior

Antes da edição foram registradas a estrutura HTML e as caixas de posição da marca, lateral, cabeçalho, apresentação, introdução, palco do globo, indicadores, cabeçalho do painel, KPIs e meta. A comparação posterior passou em **320, 375, 390, 430, 768, 1024, 1440 e 1920 pixels**, com tolerância geométrica inferior a 0,1 px. Os atributos internos de resolução do canvas foram desconsiderados, pois o próprio renderizador original os ajusta.

As somas SHA-256 de `index.html`, `estilos.css`, `flow.css` e `universo.js` permaneceram idênticas. `interface.js`, a navegação, o armazenamento, os módulos comerciais, as APIs e o Estúdio de Sites não foram modificados.

## Lógica

| Verificação | Resultado |
| --- | --- |
| `node testes/ambiente.mjs` | Aprovado: 180 segundos exatos, duração da inversão, paridade, retomada após longos intervalos, datas e períodos, valores zerados, foco contextual e curva sem ultrapassar os valores registrados |
| Continuidade dos grãos | Aprovada nos 5.200 grãos: diferença máxima aproximada de 0,0000053 unidade entre o fim da inversão e o próximo ciclo |
| `node testes/painel-prospeccao.mjs` | Aprovado após corrigir a expectativa preexistente da semana anterior; a função original de contagem foi preservada |
| `node testes/visao-geral.mjs` | Aprovado: prioridades, bloqueios, navegação, valores e estado vazio |
| `node testes/metricas.mjs` | Nove verificações aprovadas |
| Sintaxe dos módulos e `git diff --check` | Sem erros |

## Navegador

- Sem rolagem horizontal indesejada ou controles fora da região nas oito larguras solicitadas.
- Inspeção de capturas em desktop, tablet e celular, incluindo a ampulheta durante a inversão e no ciclo seguinte.
- Abertura de etapas do funil, prioridade contextual e histórico pelos eventos existentes do CRM.
- Edição da meta sem perder o foco nem recriar o canvas. Foi corrigida uma atualização de DOM que disparava novamente o evento de alteração do campo.
- Seleção dos cinco períodos, exploração dos dias com foco e teclas e tooltip com valores reais.
- Estado de teste isolado com envios confirmados, evento revertido e resposta: contagens, prioridade e histórico refletiram esse estado. Esses registros não foram adicionados ao CRM ou aos dados publicados.
- Relógio controlado no navegador: `03:00` → `00:01` → inversão em 180.000 ms → novo ciclo; conferência adicional após 21 ciclos.
- Auditoria axe-core da região nova com regras WCAG 2 A/AA e WCAG 2.1 AA: **nenhuma violação encontrada**.
- Interceptação das chamadas WebGL confirmou a chegada das perturbações de mouse, clique e toque aos uniformes do shader.
- Contagem de chamadas WebGL confirmou desenho contínuo com movimento ativo e suspensão quando pausado ou fora da tela.
- Nenhum erro de JavaScript ou de compilação dos shaders observado nos fluxos executados.

O teste de navegador reutilizável está em `testes/ambiente-ui.cjs`. Os dados de teste são descartáveis e locais ao navegador de validação.

## Limites da verificação

SwiftShader usa CPU; este ambiente não comprova 60 FPS em GPUs físicas. A qualidade se adapta ao renderizador e ao tempo dos quadros. Não foram utilizados aparelhos físicos, Safari ou Firefox nesta verificação.

A auditoria automática de acessibilidade complementa os testes de teclado; não substitui uma avaliação com todos os leitores de tela. A equivalência verificada da parte superior é estrutural e geométrica. A composição inferior é uma reconstrução interativa orientada pela referência, não uma garantia de igualdade pixel a pixel.
