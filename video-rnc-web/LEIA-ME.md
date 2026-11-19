# Comercial RNC Web

Comercial publicitário de 31,5 s, renderizado de forma programática com **Remotion (React + TypeScript)**, trilha e efeitos sonoros sintetizados em Python e narração neural em português brasileiro.

| Arquivo | Formato | Uso |
|---|---|---|
| `out/rnc-web-comercial-9x16.mp4` | 1080×1920, 30 fps, H.264 + AAC | Reels, Stories, TikTok, WhatsApp |
| `out/rnc-web-comercial-16x9.mp4` | 1920×1080, 30 fps, H.264 + AAC | YouTube, site, apresentações |

Áudio masterizado em −14 LUFS e pico real de −1,5 dBTP, o padrão das redes sociais.

## Roteiro e estratégia de retenção

| Tempo | Cena | Ideia |
|---|---|---|
| 0–5,9 s | **Gancho** | Um feixe de luz desenha uma barra de busca e alguém digita *"assistência técnica perto de mim"*. Ao fundo, outras buscas flutuam ("clínica odontológica", "pet shop", "advogado"…) para que cada espectador reconheça o próprio nicho. Os resultados carregam e um cursor clica no primeiro, que é o concorrente. Narração: *"Agora mesmo, alguém está procurando o que você oferece. Vai encontrar você… ou o seu concorrente?"* |
| 5,9–7,9 s | Impacto | Antes do impacto há 0,1 s de silêncio. As linhas montam a estrutura 3D de um site e surge *"Sua empresa merece ser vista."* |
| 7,9–11,8 s | Marca | A câmera atravessa a estrutura e revela o logotipo metálico com reflexo, seguido de *"Sites profissionais. Identidades únicas."* |
| 11,8–16,7 s | Vitrine | Um carrossel 3D apresenta três sites demonstrativos com rolagem e microinterações: estética automotiva, empório e assistência técnica. |
| 16,7–21,5 s | Responsivo | O site do computador se transforma em celular. Toque no botão de WhatsApp, a mensagem do cliente chega e um mapa com "Aberto agora" salta da tela. |
| 21,5–25,5 s | Oferta | A música para ("E cabe no seu orçamento"), uma linha de luz cruza a tela e **R$ 600** nasce dela. |
| 25,5–31,5 s | Fechamento | Logotipo, *"O próximo passo do seu negócio começa aqui."*, clique em **Solicite sua demonstração** e a assinatura final. |

Gatilhos usados com moderação:
- **Autorreferência**: o espectador vê o próprio tipo de negócio sendo buscado.
- **Lacuna de curiosidade**: a cena abre com uma pergunta.
- **Aversão à perda**: o clique vai para o concorrente.
- **Antecipação**: a pausa antes do preço.
- **Prova visual**: sites reais, legíveis e funcionando.

O vídeo não promete resultado comercial em nenhum momento.

## Alterar textos, preço, logotipo e contato

Tudo fica em **`src/config.ts`**:

- `oferta.valor`: o preço (`'600'`). `oferta.rotulo` e `oferta.detalhe` são os textos ao redor.
- `marca.nome` / `marca.complemento`: o logotipo tipográfico ("RNC" + "WEB").
- `marca.imagem`: para usar um logotipo em imagem, coloque o arquivo em `public/` (ex.: `public/logo.png`) e escreva `'logo.png'`.
- `contato.whatsapp`, `contato.instagram` e `contato.site` estão **vazios de propósito**. Quando forem preenchidos, aparecem no encerramento abaixo do botão. Ex.: `whatsapp: '(11) 90000-0000'`, `instagram: '@rncweb'`.
- Os textos de todas as cenas, inclusive as buscas que flutuam ao fundo.

A **narração** fica em `scripts/narracao.json`, com o texto de cada fala, a voz e a velocidade. Os **tempos** (início de cada fala e de cada efeito) ficam em `src/timeline.json`. Esse arquivo é lido tanto pelo vídeo quanto pela trilha, o que mantém imagem e som sincronizados.

> Se mudar o preço, atualize também a fala `n8` em `scripts/narracao.json` (ex.: "Sites a partir de quinhentos reais.") e rode `npm run audio`.

## Renderizar novamente

Requisitos: Node 18+, Python 3.10+, FFmpeg e um Chrome/Chromium (o Remotion baixa um sozinho se `CHROME_PATH` não estiver definido).

```bash
cd video-rnc-web
npm install
pip install numpy scipy edge-tts
```

```bash
npm run audio      # (opcional) gera a narração e a trilha → public/audio/mix.wav
npm run render     # gera os dois MP4 em out/
```

Outros comandos:

```bash
npm run estudio                     # abre o Remotion Studio para ajustar ao vivo
npm run render:vertical             # só o 9:16
npm run quadros RNCWeb-9x16 /tmp 5.9 23.4   # quadros de verificação em segundos
```

A narração e a trilha já geradas estão versionadas em `public/audio/`. Por isso `npm run render` funciona sem internet e sem Python. O render do 9:16 leva cerca de 3 minutos em 4 núcleos.

## Estrutura

```
src/
  config.ts          ← textos, preço, logotipo, contato
  timeline.json      ← tempos das cenas, falas e efeitos (compartilhado com o áudio)
  Comercial.tsx      ← composição principal (camadas + áudio)
  cenas/             ← Gancho, Marca, Vitrine, Responsivo, Oferta, Encerramento
  sites/             ← os sites demonstrativos (desktop 1440 px e mobile 390 px)
  componentes/       ← atmosfera, logotipo, molduras, tipografia animada, ícones
scripts/
  gerar_narracao.py  ← narração neural pt-BR (edge-tts)
  gerar_trilha.py    ← trilha, efeitos, ducking e masterização
  finalizar.sh       ← conversão final H.264 yuv420p BT.709 + faststart
  quadros.mjs        ← renderiza quadros avulsos para revisão
public/fonts/        ← Inter, Instrument Serif, JetBrains Mono (licença OFL)
public/audio/        ← narração e mixagem final
```

## Licenças e observações

- **Trilha e efeitos**: sintetizados do zero por `scripts/gerar_trilha.py`, sem samples de terceiros. São de uso livre.
- **Fontes**: Inter, Instrument Serif e JetBrains Mono, todas sob a SIL Open Font License.
- **Narração**: gerada com a voz neural *pt-BR-AntonioNeural* pelo serviço de leitura em voz alta do Microsoft Edge (biblioteca `edge-tts`). Para **anúncios pagos**, prefira regravar com uma licença comercial (Azure Speech com a mesma voz, ElevenLabs ou um locutor). Basta substituir os arquivos `public/audio/narracao/n1…n9.wav`, mantendo os nomes, e rodar `npm run trilha`.
- **Remotion**: gratuito para pessoas físicas e empresas com até 3 funcionários. Acima disso, exige licença da empresa (remotion.dev/license).
- Os sites exibidos (Impacto Car Care, Empório Aurora e Precision Cell) são **demonstrações fictícias** baseadas nos modelos do Estúdio de Sites deste repositório. O endereço exibido é genérico (`www.suaempresa.com.br`).
