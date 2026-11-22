# Painel inferior da Visão Geral

Composição idêntica à imagem de referência do Órbita (sem o logotipo do canto superior esquerdo, que já aparece no topo do site), com dados reais do CRM.

## O que cada parte mostra

| Parte | Origem dos dados |
| --- | --- |
| Mensagens enviadas, respostas, negociações e vendas | Eventos confirmados do mês atual; o selo compara com o mês anterior (`novo` quando não há base, `—` sem registros) |
| Cúpula: empresas no radar, em negociação, vendas da semana | Empresas cadastradas, etapas `negociacao`/`proposta`, vendas da semana civil |
| Pinos da ilha | Até 9 empresas (as mais avançadas e recentes); a posição é ilustrativa, não geográfica. Clique abre a empresa |
| Fluxo Comercial | Empresas na etapa atual: Encontradas, Verificadas, Contato, Resposta (inclui demonstração), Negociação (inclui proposta), Venda |
| Ritmo de Prospecção | Mensagens confirmadas por dia da semana civil (segunda a domingo); clique, teclado ou mouse mostram o valor exato |
| Foco da Semana | Prioridade que `montarVisaoGeral()` já calcula; o clique executa a mesma ação |
| Movimentações Recentes | Últimos 4 eventos (mensagem, resposta, demonstração, proposta, venda, entrada em negociação) |
| Ampulheta | Visual: esvazia em exatamente 120 s pelo relógio absoluto, gira em 3,4 s e recomeça; não executa ações |

## Arquivos

- `painel-prospeccao.js` — cálculos (`calcularPainelOrbita`) e montagem; atualiza só os dados a cada mudança de estado.
- `painel-prospeccao.css` — composição. Acima de 980 px o painel repete a referência inteira (pixels da arte 1672 × 941 convertidos por `--k`); abaixo, os módulos se empilham (duas colunas a partir de 640 px).
- `painel/animacoes.js` — laço único: cúpula (feixe, cometas na órbita, brasas, cintilação do lago), funil, esfera (raios, faíscas, ondas), água com ondas no ponteiro. Pausa fora da tela, em aba oculta, com “Pausar ambiente” ou movimento reduzido.
- `painel/ritmo.js` — gráfico animado em canvas.
- `painel/ampulheta.js` — ampulheta, areia por volume e coreografia do giro.
- `ativos/painel/cena.webp` — a arte de referência com textos, números, pinos, gráfico e ampulheta removidos; `cupula-movel.webp` é a cúpula sem balões para o celular.
- `ativos/painel/fontes/` — Inter (licença OFL incluída).
