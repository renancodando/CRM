# RNC Web — Kit de publicação (Filme 2)

## Arquivos

| Arquivo | Uso |
|---|---|
| `out/v2/rnc-web-A-cinematografica.mp4` | Reels/TikTok principal e destaque fixado no perfil |
| `out/v2/rnc-web-B1-surpresa.mp4` | Teste de abertura 1 (surpresa: site real em 3D) |
| `out/v2/rnc-web-B2-curiosidade.mp4` | Teste de abertura 2 (curiosidade: site "simples" que se revela) |
| `out/v2/rnc-web-B3-desejo.mp4` | Teste de abertura 3 (desejo: "Seu site mostra isso?") |
| `out/v2/rnc-web-C-impacto.mp4` | Anúncio curto, Stories e status do WhatsApp |
| `out/v2/aberturas/*.mp4` | Os primeiros 5 s de cada abertura, isolados |
| `out/v2/capa-reels.png` | Capa do Reels (texto central, dentro do corte 4:5 do feed) |
| `public/audio/v2/stems/` | Trilha, efeitos e voz separados por versão |

> **Música nas plataformas:** a trilha embutida foi composta por código para este filme e pode ser usada comercialmente sem restrição. Se quiser usar um áudio em alta do Instagram ou do TikTok, use os stems de voz e efeitos e escolha a música **dentro do app**, na biblioteca licenciada para contas comerciais. Não exporte o vídeo com uma música da biblioteca de outro lugar.

## Instagram (Reels)

**Legenda:**

> Isso não é um vídeo de animação. São sites.
>
> O primeiro é o Reparo Fino, um site real: ao rolar a página, o celular é desmontado e consertado na bancada, peça por peça. Os outros são conceitos criados para mostrar o que dá para fazer quando o site é pensado para o negócio: uma planta baixa que vira menu, o brilho da pintura medido antes e depois, uma reserva de mesa em três toques.
>
> Mas nem todo site precisa de 3D. O que todo negócio precisa é de uma presença digital que organize os serviços, passe confiança e deixe o contato a um toque.
>
> 🎄 Oferta de fim de ano: site institucional ou landing page de R$ 968 por R$ 600, até 20/12/2026 (modalidade básica, escopo definido em proposta; recursos avançados têm orçamento à parte).
>
> Peça sua demonstração pelo WhatsApp: link no perfil.

**Hashtags (no fim da legenda):** `#criacaodesites #sitesprofissionais #landingpage #presencadigital #pequenasempresas #empreendedorismo #marketingdigital #sitesinstitucionais`

**Comentário fixado:**

> Quem perguntou: sim, o Reparo Fino é um site de verdade, feito em three.js, e funciona no celular e no computador. Os outros três são conceitos criados para este vídeo. Quer ver como ficaria o seu? Me chama no WhatsApp (link no perfil) e eu preparo uma demonstração.

## TikTok

**Descrição (curta: o TikTok mostra pouco texto):**

> Parece animação. É um site. 👀 Qual dos quatro você usaria no seu negócio? Site institucional ou landing page de R$ 968 por R$ 600 até 20/12. #criacaodesites #empreendedor #pequenonegocio #landingpage #sitesprofissionais

**Ajustes recomendados para o TikTok:**
- Publique as versões **B** (30 s) e **C** (16 s). A versão A funciona melhor no Instagram.
- Ative as legendas automáticas do TikTok. As legendas do vídeo já cobrem as falas, mas a automática ajuda na busca.
- Responda a comentários técnicos com vídeo, gravando a tela do Reparo Fino ao vivo.

## WhatsApp

**Frase de chamada (status ou mensagem de lista):**

> Seu negócio merece uma presença digital à altura. Até 20/12, site institucional ou landing page de R$ 968 por R$ 600. Quer ver uma demonstração com o nome da sua empresa? Me responda aqui.

**Mensagem pronta para quem chegar pelo link (`wa.me/<número>?text=`):**

> Olá! Vi o vídeo da RNC Web e quero uma demonstração do site para o meu negócio.

## Duas chamadas comerciais para testar

- **CTA 1 (convite):** "Seu negócio merece uma presença digital à altura. Peça sua demonstração."
- **CTA 2 (concreto):** "Mande o nome da sua empresa no WhatsApp e receba uma demonstração do seu site."

Use a CTA 1 no vídeo e na legenda de metade das publicações e a CTA 2 na outra metade. Compare as mensagens recebidas por publicação (veja `PLANO-DE-TESTES.md`).

## Boas práticas
- Publique entre 11h e 13h ou entre 18h e 21h. Compare os horários nos seus próprios dados antes de fixar um padrão.
- Use a capa `capa-reels.png` e confira no app se o texto fica centralizado no recorte 4:5.
- Não peça curtidas nem compartilhamentos no vídeo ou na legenda.
- Antes de publicar, preencha o contato em `src/config.ts` (`contato.whatsapp` / `contato.instagram`) e renderize de novo, ou mantenha "link no perfil".
