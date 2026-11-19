"""Gera a narração (uma faixa por fala) com voz neural pt-BR via edge-tts.
Uso: python3 scripts/gerar_narracao.py
Saída: public/audio/narracao/<id>.wav e scripts/narracao_duracoes.json
"""
import asyncio, json, os, subprocess, sys
import certifi
CA = os.environ.get("CA_BUNDLE", "/root/.ccr/ca-bundle.crt")
if os.path.exists(CA):
    certifi.where = lambda: CA  # ambiente com proxy TLS
import edge_tts

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALVO = os.environ.get("NARRACAO", "scripts/narracao.json")
CFG = json.load(open(os.path.join(RAIZ, ALVO), encoding="utf-8"))
SAIDA = os.path.join(RAIZ, "public", "audio", os.environ.get("NARRACAO_DIR", "narracao"))
os.makedirs(SAIDA, exist_ok=True)

async def gerar(fala):
    mp3 = os.path.join(SAIDA, fala["id"] + ".mp3")
    wav = os.path.join(SAIDA, fala["id"] + ".wav")
    c = edge_tts.Communicate(fala["texto"], CFG["voz"], rate=fala.get("velocidade", CFG["velocidade"]), pitch=fala.get("tom", CFG["tom"]))
    await c.save(mp3)
    # remove silêncio inicial/final e padroniza 48 kHz mono
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-af",
        "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
        "-ar", "48000", "-ac", "1", wav], check=True)
    os.remove(mp3)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).decode())
    return fala["id"], round(d, 3)

async def main():
    duracoes = {}
    for f in CFG["falas"]:
        i, d = await gerar(f)
        duracoes[i] = d
        print(f"{i}: {d:.2f}s  {f['texto']}")
    json.dump(duracoes, open(os.path.join(SAIDA, "duracoes.json"), "w"), indent=2)
    print("total falado:", round(sum(duracoes.values()), 2))

asyncio.run(main())
