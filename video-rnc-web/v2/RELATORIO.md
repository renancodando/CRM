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

## Revisão crítica (versão A, assistida quadro a quadro)

| Critério | Nota | Evidência / o que ainda pode melhorar |
|---|---|---|
| Originalidade | 8 | Abertura colada no 3D real ("Parece animação." → "Mas é um site.") e planta baixa como menu. O carrossel de telas lembra o filme 1 de propósito |
| Qualidade dos sites | 8 | Reparo Fino é um trabalho real e forte. Vão e Brasa têm identidade própria. Lustro é o mais simples dos três |
| Complexidade das interações | 7 | Rolagem real com 3D, menu-planta, medidor, reserva completa. As interações conceituais são roteirizadas, não clicáveis |
| Direção de arte | 8 | Palco preto e prata coerente, cada site com tipografia e paleta próprias, sem fotos falsas |
| Cinematografia | 7 | Recuo da abertura, travellings e telas em 3D. Faltam movimentos de câmera mais ousados entre os sites |
| Animação | 7 | Fluida no geral. A captura real foi feita a 10 fps e interpolada, o que deixa um leve "fantasma" no texto do site durante a rolagem rápida |
| Montagem e ritmo | 8 | Nova descoberta a cada 5–7 s, pausa antes do preço, nada repetido |
| Som | 7 | Trilha original com progressão e assinatura sonora; voz neural natural. Uma trilha gravada por músicos soaria mais rica |
| Legibilidade no celular | 8 | Textos grandes dentro da zona segura e legendas em pastilha. Os textos internos dos sites conceituais ficam pequenos nas telas reduzidas |
| Clareza da oferta | 9 | R$ 968 riscado, R$ 600, validade, itens incluídos e nota de escopo |
| Confiança | 8 | Site real identificado como real e conceitos identificados como conceito |
| Força da chamada | 8 | "Peça sua demonstração pelo WhatsApp", mas sem o número (preencher `config.contato`) |

**Próximos ajustes sugeridos:** recapturar o Reparo Fino a 30 fps reais (cerca de 1 h de render) para eliminar o fantasma da interpolação; preencher o WhatsApp no `config.ts`; trocar a voz por locutor ou licença comercial antes de impulsionar com anúncio pago.
