# Painel inferior da Visão Geral

Composição idêntica à imagem de referência do Órbita (sem o logotipo do canto superior esquerdo, que já aparece no topo do site), com dados reais do CRM.

## O que cada parte mostra

| Parte | Origem dos dados |
| --- | --- |
| Mensagens enviadas, respostas, negociações e vendas | Eventos confirmados do mês atual; o selo (cápsula da arte) mostra a variação em % sobre o mês anterior, ou `↑ +N` quando o mês anterior não teve registros |
| Cúpula: empresas no radar, em negociação, vendas da semana | Empresas cadastradas, etapas `negociacao`/`proposta`, vendas da semana civil |
| Pinos da ilha | Até 9 empresas (as mais avançadas e recentes); a posição é ilustrativa, não geográfica. Clique abre a empresa |
| Fluxo Comercial | Empresas na etapa atual: Encontradas, Verificadas, Contato, Resposta (inclui demonstração), Negociação (inclui proposta), Venda |
| Ritmo de Prospecção | Mensagens confirmadas por dia da semana civil (segunda a domingo); clique, teclado ou mouse mostram o valor exato |
| Foco da Semana | Prioridade que `montarVisaoGeral()` já calcula; o clique executa a mesma ação |
| Ampulheta | Visual: vidro, tampas e areia vêm da arte; esvazia em exatamente 120 s pelo relógio absoluto, faz o giro de 7,6 s (filigrana de luz, levitação, anéis orbitais, giro, clarão, pouso, impacto) e recomeça; não executa ações |

## Arquivos

- `painel-prospeccao.js` — cálculos (`calcularPainelOrbita`) e montagem; atualiza só os dados a cada mudança de estado.
- `painel-prospeccao.css` — composição. Acima de 980 px o painel repete a referência inteira (pixels da arte 1672 × 941 convertidos por `--k`); abaixo, os módulos se empilham (duas colunas a partir de 640 px).
- `painel/animacoes.js` — laço único: cúpula (feixe, cometas na órbita, brasas, cintilação do lago), funil, esfera (raios, faíscas, ondas), água com ondas no ponteiro. Pausa fora da tela, em aba oculta, com “Pausar ambiente” ou movimento reduzido.
- `painel/ritmo.js` — gráfico: a arte da referência (`ritmo-base.webp`, `ritmo-laranja.webp`) é esticada coluna a coluna para a curva real; o brilho de cobre vai para o dia de maior volume.
- `painel/ampulheta.js` — ampulheta (`ampulheta-*.webp`), areia remapeada pelo volume e coreografia do giro.
- `ativos/painel/cena.webp` — a arte de referência com textos, números, pinos, gráfico e ampulheta removidos; `cupula-movel.webp` é a cúpula sem balões para o celular.
- `ativos/painel/fontes/` — Inter (licença OFL incluída).
