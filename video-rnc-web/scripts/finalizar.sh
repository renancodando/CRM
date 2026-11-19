#!/usr/bin/env bash
# Converte o render bruto em MP4 de máxima compatibilidade (Reels, TikTok, WhatsApp):
# H.264 High, yuv420p, faixa de vídeo padrão (tv), BT.709, AAC, faststart.
# Uso: scripts/finalizar.sh entrada.mp4 saida.mp4
set -euo pipefail
ffmpeg -y -loglevel error -i "$1" \
  -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p" \
  -c:v libx264 -preset slow -crf 15 -profile:v high -level 4.2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart "$2"
