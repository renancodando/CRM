# Relatório técnico: Filme 2

## O que é real, o que é conceito e como foi feito

| Demonstração | Natureza | Como aparece no filme | Código |
|---|---|---|---|
| **Reparo Fino** (assistência técnica) | **Site real e funcional** (repositório `renancodando/tecnica`, publicado em `tecnica-alpha.vercel.app`) | **Captura da execução real** no Chromium: o site foi compilado e servido localmente e rolado quadro a quadro (`scripts/capturar_site.mjs`). O 3D, o pós-processamento e os textos são do próprio site. Versões de celular (390 px) e desktop (1440 px) | `renancodando/tecnica` (three.js + postprocessing) |
| **Vão Arquitetura** | Projeto **conceitual** criado para o filme | Página móvel desenhada em código (React, 390 px) com tipografia variável animada, planta baixa como menu, transição em que o ambiente tocado vira a página e corte técnico com estudo de luz | `src/v2/sites/Vao.tsx` |
| **Lustro Estética Automotiva** | Projeto **conceitual** | Faixas de luz de estúdio, medidor de brilho antes e depois (medição ilustrativa), carrossel de serviços com seleção | `src/v2/sites/Lustro.tsx` |
| **Brasa Restaurante** | Projeto **conceitual** | Menu degustação tipográfico, fluxo de reserva (calendário, horário, pessoas) e confirmação | `src/v2/sites/Brasa.tsx` |
| **Duarte Climatização** | Exemplo de **site básico** (negócio fictício) | As mesmas informações passam de soltas a organizadas. Representa o escopo da oferta | `src/v2/sites/Duarte.tsx` |

**Sobre "funcional":** só o Reparo Fino é um site completo e navegável. Os sites conceituais são **componentes de interface feitos em código** (HTML e CSS via React), animados por uma linha do tempo determinística. As interações (toques, rolagem, seleção) são **roteirizadas** para o vídeo: não há um site publicado que responda a cliques reais. Transformá-los em sites navegáveis exige implementar o estado e os eventos, que hoje são simulados pela linha do tempo.

**O que não foi usado:** nenhuma foto, imagem de banco, ilustração figurativa em CSS ou modelo 3D procedural. A primeira tentativa usava modelos three.js próprios e foi descartada por sua avaliação. A segunda usava "fotos" desenhadas em CSS e também foi descartada. Agora a força visual vem do site real, da tipografia e de interfaces de verdade.

## Pipeline

1. **Site real** → `vite build` → `vite preview` → Playwright rola e fotografa cada quadro (canvas WebGL em SwiftShader) → ffmpeg `minterpolate` gera 30 fps.
2. **Filme** → Remotion (React/TypeScript). Uma montagem por versão é declarada em `src/v2/filme/roteiros.json` (cenas, tempos e falas). O mesmo arquivo alimenta a trilha.
3. **Narração** → `scripts/gerar_narracao.py` (voz neural pt-BR Antonio). A marca **não é pronunciada**: aparece escrita.
4. **Trilha** → `scripts/gerar_trilha_v2.py`. É sintetizada do zero: progressão em Ré menor que resolve em Ré maior, camadas que entram a cada cena, silêncio antes do preço e **assinatura sonora RNC** (respiro reverso → grave → Ré, Lá e Mi em vidro). Sai com ducking sob a voz, −14 LUFS, −1,5 dBTP e stems separados.
5. **Finalização** → `scripts/finalizar.sh` gera H.264 High, yuv420p, BT.709 e faststart.

## Como renderizar de novo

```bash
cd video-rnc-web
npm install
# (opcional) recapturar o site real
#   git clone https://github.com/renancodando/tecnica && cd tecnica && npm i && npx vite build && npx vite preview --port 4173
#   node scripts/capturar_site.mjs "http://localhost:4173/?still" /tmp/cap/mobile 390 693 2 12 10
NARRACAO=v2/audio/narracao.json NARRACAO_DIR=narracao-v2 python3 scripts/gerar_narracao.py
python3 scripts/gerar_trilha_v2.py
bash scripts/render_v2.sh
```

## Avaliação

Veja a seção "Revisão crítica" ao final deste arquivo. Ela é preenchida depois de assistir aos vídeos renderizados.
