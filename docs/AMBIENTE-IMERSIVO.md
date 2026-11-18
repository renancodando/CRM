# Ambiente inferior do Órbita

A experiência fica na **Visão Geral, abaixo da Meta de prospecção**. O globo principal, a apresentação, os indicadores superiores, o cabeçalho, a navegação e o pipeline original continuam com seus arquivos e posições anteriores.

## Como funciona

- **Ampulheta:** objeto Three.js com vidro, aros metálicos e 5.200 ou 9.000 grãos. A transferência dura exatamente **180.000 ms**. A inversão ocupa mais 4.600 ms; então começa outra transferência de três minutos. A orientação da areia acompanha a gravidade durante o giro. As posições de saída e entrada dos ciclos coincidem, evitando um corte no reinício.
- **Relógio:** começa quando o ambiente é visto pela primeira vez. Usa o tempo absoluto transcorrido, não soma quadros nem intervalos. Abas suspensas não atrasam o ciclo. Nenhuma ação comercial é disparada pela ampulheta.
- **Água:** shader procedural com ondas em diferentes escalas, normais de superfície, reflexos de luz e dos objetos 3D. Mouse, clique e toque produzem perturbações amortecidas que se sobrepõem. Os painéis compartilham uma superfície contínua.
- **Foco da Semana:** abre a prioridade que `montarVisaoGeral()` já calcula para o estado atual. Não cria metas, negócios ou compromissos.
- **Ritmo de Prospecção:** semanas civis de segunda a domingo, semana anterior, mês atual, mês anterior e histórico completo. Conta somente eventos `mensagem-enviada` válidos, confirmados, não revertidos e até o instante atual. Hover, botões dos dias e controle de teclado mostram os valores exatos. A interpolação é monotônica e os efeitos de luz não alteram os pontos da série.
- **Fluxo Comercial e movimentações:** continuam abrindo as etapas, empresas e o histórico pelos eventos existentes do CRM.

A composição inferior foi adaptada à estrutura aprovada do CRM. A referência orienta os materiais e a disposição; a implementação não substitui a região superior pelo cenário da imagem.

## Organização dos arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| `painel-prospeccao.js` | Integração com o estado e atualização dos indicadores, preservando a instância gráfica e o campo de meta |
| `painel-prospeccao.css` | Importa a folha de estilos isolada do ambiente |
| `ambiente/componente.js` | Componentes HTML, acessibilidade, prioridade, histórico e ciclo de vida |
| `ambiente/dados.js` | Séries de mensagens por período e prioridade contextual |
| `ambiente/tempo.js` | Duração, fase, orientação e formatação do ciclo |
| `ambiente/cena.js` | Renderizador compartilhado, luzes, reflexos, qualidade e interações |
| `ambiente/ampulheta.js` | Vidro, peças metálicas e distribuição dos grãos |
| `ambiente/agua.js` | Shader da superfície e perturbações |
| `ambiente/foco.js` | Objeto central, materiais e suporte |
| `ambiente/ritmo.js` | Gráfico SVG, transição de séries, tooltips e teclado |
| `ambiente/ambiente.css` | Composição responsiva e microinterações, limitadas à área nova |

## Execução

O projeto continua sem etapa de build. Na raiz:

```sh
python3 -m http.server 3111
```

Abra `http://localhost:3111` e role até a região abaixo da meta. Não abra o HTML por `file://`, pois o navegador precisa servir os módulos JavaScript.

As opções existentes de **Preferências → Qualidade gráfica**, **Pausar ambiente** e `prefers-reduced-motion` também controlam a região nova. A qualidade leva em conta resolução, memória informada pelo navegador, núcleos, renderização por software e duração dos quadros. A cena suspende os desenhos quando está fora da tela, em uma aba oculta ou atrás de um painel modal.

## Verificações

```sh
node testes/ambiente.mjs
node testes/painel-prospeccao.mjs
node testes/visao-geral.mjs
node testes/metricas.mjs
NODE_PATH=/caminho/dos/node_modules CHROMIUM_PATH=/caminho/do/chromium node testes/ambiente-ui.cjs
```

O teste de navegador precisa de Playwright instalado no ambiente de desenvolvimento e do servidor em `:3111`; `ORBITA_URL` permite outro endereço. A auditoria WCAG adicional usa `@axe-core/playwright` quando disponível. Essas ferramentas não são dependências do CRM publicado.

O teste da areia também verifica a continuidade das posições dos 5.200 grãos na passagem da inversão para o próximo ciclo. O teste antigo do painel tinha a expectativa de zero envios na semana anterior apesar de conter um envio em 10/11; a expectativa foi corrigida para um, sem mudar a função de contagem original.

O relatório das verificações executadas está em `docs/VALIDACAO-AMBIENTE.md`.

## Limites gráficos

A areia é uma simulação visual de distribuição volumétrica orientada pela gravidade, com partículas de queda; não é um solucionador de colisões entre milhares de grãos. A água usa um campo procedural de ondas e reflexos renderizados, não dinâmica de fluidos volumétrica. Essas escolhas mantêm a experiência compatível com um CRM no navegador.

A taxa de quadros depende da GPU. Em renderizadores por software, a resolução dos efeitos é reduzida; textos e controles HTML mantêm a nitidez. Sem WebGL2, permanecem os controles, o gráfico, o relógio e uma representação CSS da ampulheta; a superfície WebGL fica indisponível. Com movimento reduzido ou ambiente pausado, a decoração fica estática e o relógio textual continua correto.

Não há novos serviços, bibliotecas, backend, armazenamento comercial ou integrações. O Three.js já existente é reutilizado.
