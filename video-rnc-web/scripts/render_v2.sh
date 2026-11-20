#!/usr/bin/env bash
# Renderiza todas as versões do Filme 2, as aberturas isoladas e a capa.
# Uso: bash scripts/render_v2.sh [A B1 B2 B3 C]
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/v2/aberturas
BR=${CHROME_PATH:+--browser-executable=$CHROME_PATH}
declare -A NOME=([A]=A-cinematografica [B1]=B1-surpresa [B2]=B2-curiosidade [B3]=B3-desejo [C]=C-impacto)
VERS=${*:-A B1 B2 B3 C}
for v in $VERS; do
  npx remotion render src/v2/index.ts "Filme-$v" "out/v2/bruto-$v.mp4" --props="{\"id\":\"$v\",\"audio\":true}" --concurrency=2 $BR --log=error
  bash scripts/finalizar.sh "out/v2/bruto-$v.mp4" "out/v2/rnc-web-${NOME[$v]}.mp4"
  rm "out/v2/bruto-$v.mp4"
done
for v in B1 B2 B3; do
  if [ -f "out/v2/rnc-web-${NOME[$v]}.mp4" ]; then
    ffmpeg -y -loglevel error -i "out/v2/rnc-web-${NOME[$v]}.mp4" -t 5.5 -c:v libx264 -crf 15 -c:a aac -b:a 256k -movflags +faststart "out/v2/aberturas/abertura-${NOME[$v]#B?-}.mp4"
  fi
done
npx remotion still src/v2/index.ts Capa out/v2/capa-reels.png $BR --log=error
echo "ok"
