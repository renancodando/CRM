"""Trilha original, efeitos sonoros e mixagem final do comercial RNC Web.

Tudo é sintetizado aqui (sem samples de terceiros), portanto a trilha é de uso livre.
Lê src/timeline.json (marcos e início de cada fala) e public/audio/narracao/*.wav.
Saída: public/audio/mix.wav (48 kHz, estéreo, -14 LUFS integrados, pico real -1.5 dBTP).

Uso: python3 scripts/gerar_trilha.py
"""
import json
import os
import subprocess
import wave

import numpy as np
from scipy import signal

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(RAIZ, "src", "timeline.json"), encoding="utf-8"))
M = TL["marcos"]
NARR = TL["narracao"]
DUR = TL["duracao"]
SR = 48000
N = int(DUR * SR)
rng = np.random.default_rng(7)

BPM = 96.0
BATIDA = 60.0 / BPM


# ———————————————————————————————————————————————————————————— utilitários
def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def bus():
    return np.zeros((N, 2))


def soma(buf, sig, t0, ganho=1.0, pan=0.0):
    """Soma sinal mono (ou estéreo) em buf a partir de t0 segundos."""
    i0 = int(round(t0 * SR))
    if i0 >= N:
        return
    if sig.ndim == 1:
        a = np.pi / 4 * (pan + 1)
        sig = np.stack([sig * np.cos(a), sig * np.sin(a)], axis=1) * np.sqrt(2)
    if i0 < 0:
        sig = sig[-i0:]
        i0 = 0
    n = min(len(sig), N - i0)
    buf[i0 : i0 + n] += sig[:n] * ganho


def env(n, ataque, soltura, sr=SR):
    e = np.ones(n)
    a = max(1, int(ataque * sr))
    r = max(1, int(soltura * sr))
    e[:a] = np.linspace(0, 1, a) ** 2 if a < n else np.linspace(0, 1, n)[:a] ** 2
    if r < n:
        e[-r:] *= np.linspace(1, 0, r) ** 1.5
    return e


def passa_baixa(x, fc, ordem=4):
    sos = signal.butter(ordem, min(fc, SR / 2 * 0.95), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def passa_alta(x, fc, ordem=4):
    sos = signal.butter(ordem, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def passa_banda(x, f1, f2, ordem=2):
    sos = signal.butter(ordem, [f1, min(f2, SR / 2 * 0.95)], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def serra(f, d, detune_cents=0.0, fase=0.0):
    t = tt(d)
    ff = f * 2 ** (detune_cents / 1200)
    return 2 * ((t * ff + fase) % 1.0) - 1


def ruido(d):
    return rng.standard_normal(int(d * SR))


def reverb_ir(rt60=2.8, pre=0.02, brilho=5000):
    d = rt60 * 1.1
    t = tt(d)
    dec = np.exp(-6.9 * t / rt60)
    ir = np.stack([rng.standard_normal(len(t)) * dec, rng.standard_normal(len(t)) * dec], axis=1)
    ir = passa_baixa(ir, brilho, 2)
    ir[: int(pre * SR)] = 0
    return ir / np.sqrt(np.sum(ir**2) / 2)


IR_GRANDE = reverb_ir(3.2, 0.03, 4200)
IR_SALA = reverb_ir(0.9, 0.01, 6000)


def reverbera(x, ir):
    out = np.zeros_like(x)
    for c in range(2):
        out[:, c] = signal.fftconvolve(x[:, c], ir[:, c])[: len(x)]
    return out


# ———————————————————————————————————————————————————————————— instrumentos
def pad(notas, t0, t1, ganho=0.1, brilho=1400, ataque=0.8, soltura=1.2):
    d = t1 - t0 + soltura
    n = int(d * SR)
    L = np.zeros(n)
    R = np.zeros(n)
    for k, nota in enumerate(notas):
        f = midi(nota)
        for v, dc in enumerate((-9, -3, 4, 10)):
            s = serra(f, d, dc, fase=rng.random())
            if v % 2 == 0:
                L += s
            else:
                R += s
    x = np.stack([L, R], axis=1) / (len(notas) * 2)
    x = passa_baixa(x, brilho, 2)
    # movimento lento do filtro: mistura com versão mais escura
    escuro = passa_baixa(x, brilho * 0.35, 2)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * tt(d) + rng.random() * 6)
    x = x * lfo[:, None] + escuro * (1 - lfo[:, None])
    e = env(n, ataque, soltura)
    return x * e[:, None] * ganho


def sub(nota, t0, t1, ganho=0.2, ataque=0.5, soltura=1.0):
    d = t1 - t0 + soltura
    s = np.sin(2 * np.pi * midi(nota) * tt(d))
    return s * env(len(s), ataque, soltura) * ganho


def sino(nota, ganho=0.1, decai=2.2, razao=3.5, indice=3.0):
    d = decai * 2.5
    t = tt(d)
    fc = midi(nota)
    I = indice * np.exp(-t / 0.35)
    y = np.sin(2 * np.pi * fc * t + I * np.sin(2 * np.pi * fc * razao * t))
    y += 0.3 * np.sin(2 * np.pi * fc * 2.01 * t) * np.exp(-t / (decai * 0.4))
    return y * np.exp(-t / decai) * env(len(t), 0.004, 0.1) * ganho


def dedilhado(nota, ganho=0.08, decai=0.5):
    t = tt(decai * 3)
    f = midi(nota)
    y = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.12) + 0.2 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t / 0.06)
    return y * np.exp(-t / decai) * env(len(t), 0.003, 0.05) * ganho


def baixo_pulso(nota, ganho=0.12, dur=0.22):
    t = tt(dur + 0.05)
    y = np.tanh(2.5 * np.sin(2 * np.pi * midi(nota) * t))
    y = passa_baixa(y, 420, 2)
    return y * np.exp(-t / (dur * 0.6)) * env(len(t), 0.004, 0.04) * ganho


def bumbo(ganho=0.5):
    t = tt(0.6)
    f = 44 + 90 * np.exp(-t / 0.035)
    fase = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(fase) * np.exp(-t / 0.22)
    clique = passa_banda(ruido(0.6), 1500, 5000) * np.exp(-t / 0.004) * 0.15
    return (y + clique) * ganho


def chimbal(ganho=0.06, decai=0.028):
    t = tt(0.15)
    y = passa_baixa(passa_alta(ruido(0.15), 6500), 13000) * np.exp(-t / decai)
    return y * ganho


def impacto(ganho=0.9, grave=1.0):
    t = tt(4.0)
    f = 28 + 60 * np.exp(-t / 0.18)
    fase = 2 * np.pi * np.cumsum(f) / SR
    boom = np.sin(fase) * np.exp(-t / 1.1) * grave
    corpo = passa_baixa(ruido(4.0), 260, 2) * np.exp(-t / 0.35) * 0.9
    estalo = passa_banda(ruido(4.0), 1800, 7000) * np.exp(-t / 0.03) * 0.35
    return (boom + corpo + estalo) * env(len(t), 0.002, 0.5) * ganho


def sopro(d=0.8, ganho=0.25, f1=300, f2=5000, pan_de=-0.7, pan_ate=0.7):
    """Whoosh: ruído filtrado com envelope em sino e panorâmica móvel."""
    n = int(d * SR)
    t = np.linspace(0, 1, n)
    base = ruido(d)
    lento = passa_banda(base, f1, f1 * 4)
    rapido = passa_banda(base, f2 * 0.3, f2)
    k = t**1.2
    y = lento * (1 - k) + rapido * k * 0.7
    e = np.sin(np.pi * t) ** 2.2
    y = y * e * ganho
    pan = pan_de + (pan_ate - pan_de) * t
    a = np.pi / 4 * (pan + 1)
    return np.stack([y * np.cos(a), y * np.sin(a)], axis=1) * np.sqrt(2)


def subida(d, ganho=0.2):
    """Riser: ruído que abre + tom ascendente, termina seco."""
    t = tt(d)
    k = t / d
    r = passa_baixa(passa_alta(ruido(d), 900), 9000) * (k**2.5)
    f = 180 * 2 ** (k * 2.6)
    tom = np.sin(2 * np.pi * np.cumsum(f) / SR) * (k**2) * 0.35
    trem = 0.75 + 0.25 * np.sin(2 * np.pi * (3 + 18 * k) * t)
    return (r * 0.5 + tom) * trem * ganho


def respiro_reverso(d=1.0, ganho=0.3):
    """Swell reverso que suga para o impacto."""
    x = np.zeros((int((d + 0.2) * SR), 2))
    x[: int(0.05 * SR), :] = rng.standard_normal((int(0.05 * SR), 2))
    x = reverbera(x, IR_GRANDE)
    x = passa_banda(x, 200, 6000)
    x = x[::-1][-int(d * SR) :]
    x = x / (np.max(np.abs(x)) + 1e-9)
    return x * ganho


def brilho_luz(d=0.8, ganho=0.12, f0=2400, f1=7200):
    """Shimmer agudo para o feixe de luz e reflexos metálicos."""
    t = tt(d)
    k = t / d
    f = f0 + (f1 - f0) * k
    y = np.zeros(len(t))
    for h, a in ((1, 1), (1.5, 0.4), (2, 0.25)):
        y += a * np.sin(2 * np.pi * np.cumsum(f * h) / SR)
    ar = passa_baixa(passa_alta(ruido(d), 5000), 11000) * 0.05
    return (y + ar) * np.sin(np.pi * k) ** 1.5 * ganho


def tecla(ganho=0.05):
    t = tt(0.06)
    y = passa_banda(ruido(0.06), 1800, 6500) * np.exp(-t / 0.006)
    y += np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.012) * 0.6
    return y * ganho * (0.7 + 0.6 * rng.random())


def clique_ui(ganho=0.12, tom=1400):
    t = tt(0.12)
    y = np.sin(2 * np.pi * tom * t) * np.exp(-t / 0.018)
    y += passa_banda(ruido(0.12), 2000, 8000) * np.exp(-t / 0.004) * 0.5
    return y * ganho


def bolha(ganho=0.12):
    """Notificação suave de mensagem (duas notas)."""
    a = sino(84, 1.0, 0.35, razao=2.0, indice=1.0)
    b = sino(91, 1.0, 0.45, razao=2.0, indice=1.0)
    y = np.zeros(int(0.9 * SR))
    y[: len(a)] += a[: len(y)]
    o = int(0.09 * SR)
    y[o:] += b[: len(y) - o]
    return y * ganho


# ———————————————————————————————————————————————————————————— composição
musica = bus()  # vai ao reverb grande, sofre ducking
ritmo = bus()  # percussão (ducking mais leve)
sfx = bus()  # efeitos sincronizados (pouco ducking)
envio = bus()  # envio extra para reverb grande

# — CENA 1: gancho (tensão, pulso de relógio)
soma(sfx, brilho_luz(0.85, 0.1, 1800, 6400), 0.0, pan=-0.4)
soma(musica, sub(33, 0.15, M["impacto"] - 0.15, 0.22, ataque=1.2, soltura=0.15), 0.15)
soma(musica, pad([45, 52, 57], 0.3, M["impacto"] - 0.12, 0.06, brilho=700, ataque=2.5, soltura=0.12), 0.3)
eerie = np.sin(2 * np.pi * midi(81) * tt(5.5)) * (0.5 + 0.5 * np.sin(2 * np.pi * 5.5 * tt(5.5))) * 0.012
soma(musica, eerie * env(len(eerie), 2.0, 0.1), 0.4, pan=0.3)

# teclas da digitação
chars = len("assistência técnica perto de mim")
for i in range(chars):
    tk = M["digitacaoInicio"] + (M["digitacaoFim"] - M["digitacaoInicio"]) * i / chars + rng.normal(0, 0.008)
    soma(sfx, tecla(0.06), tk, pan=rng.uniform(-0.2, 0.2))
soma(sfx, clique_ui(0.12, 900), M["enter"], pan=0)
soma(envio, clique_ui(0.06, 900), M["enter"])

# pulso de relógio: colcheias, crescendo
t0 = 0.62
k = 0
while t0 < M["impacto"] - 0.3:
    prog = t0 / M["impacto"]
    g = 0.025 + 0.06 * prog
    soma(ritmo, chimbal(g * (1.0 if k % 2 == 0 else 0.6)), t0, pan=0.25 if k % 2 else -0.25)
    t0 += BATIDA / 2
    k += 1
# batidas graves como coração a partir da pergunta
t0 = M["pergunta"]
while t0 < M["impacto"] - 0.4:
    soma(ritmo, bumbo(0.22), t0)
    soma(ritmo, bumbo(0.12), t0 + 0.22)
    t0 += BATIDA * 2
# clique no concorrente
soma(sfx, clique_ui(0.09, 1100), 5.05, pan=0.2)
# subida + respiro reverso até o impacto (com 0,1 s de silêncio antes)
d = M["impacto"] - 0.1 - 4.1
soma(sfx, subida(d, 0.16), 4.1)
rv = respiro_reverso(1.1, 0.22)
soma(sfx, rv, M["impacto"] - 0.1 - len(rv) / SR)

# — impacto: "Sua empresa merece ser vista."
soma(sfx, impacto(0.85), M["impacto"])
soma(envio, impacto(0.35), M["impacto"])
soma(musica, pad([45, 52, 59, 60, 64], M["impacto"], M["travessia"], 0.09, brilho=1800, ataque=0.05, soltura=0.6), M["impacto"])
soma(musica, sub(33, M["impacto"], M["travessia"], 0.2, ataque=0.02, soltura=0.4), M["impacto"])
for j, nota in enumerate((69, 76, 83)):
    soma(musica, sino(nota, 0.035, 2.5), M["impacto"] + 0.35 + j * 0.16, pan=-0.4 + j * 0.4)

# — CENA 2: travessia + logotipo
soma(sfx, sopro(0.9, 0.32, 250, 6000, -0.6, 0.6), M["travessia"] - 0.35)
soma(sfx, impacto(0.45, grave=0.7), M["logo"])
soma(envio, impacto(0.25, grave=0.5), M["logo"])
soma(musica, pad([41, 48, 52, 55, 57, 64], M["logo"], CENAS_FIM := TL["cenas"]["logo"][1], 0.085, brilho=1600, ataque=0.15, soltura=0.8), M["logo"])
soma(musica, sub(29, M["logo"], CENAS_FIM, 0.18, ataque=0.05, soltura=0.6), M["logo"])
for j, nota in enumerate((81, 88, 93, 95)):
    soma(musica, sino(nota, 0.03, 2.8), M["logo"] + 0.25 + j * 0.11, pan=-0.6 + j * 0.4)
soma(sfx, brilho_luz(1.0, 0.07, 3000, 9000), M["brilhoLogo"], pan=0.3)

# — CENAS 3 e 4: groove sofisticado
g_ini = TL["cenas"]["vitrine"][0] - 0.1
g_fim = M["silencio"]
acordes = [
    (g_ini, 14.3, [45, 52, 55, 59, 60], 33),
    (14.3, 16.7, [41, 48, 52, 55, 57], 29),
    (16.7, 19.0, [48, 55, 62, 64], 36),
    (19.0, g_fim, [43, 50, 59, 64], 31),
]
for a, b, notas, raiz in acordes:
    soma(musica, pad(notas, a, b, 0.075, brilho=1500, ataque=0.25, soltura=0.5 if b < g_fim else 0.35), a)
    soma(musica, sub(raiz, a, b, 0.14, ataque=0.08, soltura=0.3), a)
    # baixo pulsado em colcheias
    t0 = a
    while t0 < b - 0.05:
        soma(ritmo, baixo_pulso(raiz + 12, 0.13), t0)
        t0 += BATIDA / 2
    # arpejo dedilhado em semicolcheias alternadas, com eco
    t0 = a
    k = 0
    seq = [notas[1] + 12, notas[2] + 12, notas[3] + 12, notas[2] + 12]
    while t0 < b - 0.05:
        if k % 3 != 2:
            nota = seq[k % len(seq)]
            soma(musica, dedilhado(nota, 0.035, 0.35), t0, pan=-0.35 if k % 2 else 0.35)
            soma(musica, dedilhado(nota, 0.012, 0.35), t0 + BATIDA * 0.75, pan=0.5 if k % 2 else -0.5)
        t0 += BATIDA / 2
        k += 1
# bateria
t0 = g_ini
k = 0
while t0 < g_fim - 0.05:
    if k % 4 == 0:
        soma(ritmo, bumbo(0.42), t0)
    if k % 4 == 2:
        soma(ritmo, bumbo(0.18), t0)
    soma(ritmo, chimbal(0.045 if k % 2 else 0.028, 0.03), t0 + (0.012 if k % 2 else 0), pan=0.3)
    t0 += BATIDA / 2
    k += 1
# transições entre sites e morph
for tm in (M["site2"], M["site3"]):
    soma(sfx, sopro(0.75, 0.2, 300, 5000, 0.6, -0.6), tm - 0.5)
soma(sfx, sopro(1.0, 0.18, 200, 3500, -0.3, 0.3), M["morph"] - 0.1)
soma(sfx, clique_ui(0.1, 1600), M["toqueWhats"], pan=-0.1)
soma(sfx, bolha(0.11), M["mensagem"], pan=-0.35)
soma(sfx, clique_ui(0.05, 2200), M["mapa"] + 0.1, pan=0.35)

# — pausa dramática antes do preço
soma(sfx, respiro_reverso(1.2, 0.1), M["silencio"] - 0.2)
soma(musica, sub(36, M["silencio"], M["preco"] - 0.1, 0.1, ataque=0.6, soltura=0.1), M["silencio"])
soma(sfx, brilho_luz(0.75, 0.13, 1500, 7000), M["linhaLuz"], pan=-0.2)
soma(musica, sino(72, 0.03, 1.6, razao=2.0, indice=1.2), M["precoRotulo"], pan=0)
rv = respiro_reverso(0.8, 0.16)
soma(sfx, rv, M["preco"] - 0.05 - len(rv) / SR)

# — preço: impacto quente e brilho
soma(sfx, impacto(0.8), M["preco"])
soma(envio, impacto(0.3), M["preco"])
soma(musica, pad([36, 43, 52, 59, 62, 64], M["preco"], TL["cenas"]["preco"][1], 0.1, brilho=2200, ataque=0.04, soltura=0.7), M["preco"])
soma(musica, sub(24, M["preco"], TL["cenas"]["preco"][1], 0.2, ataque=0.02, soltura=0.6), M["preco"])
for j, nota in enumerate((84, 88, 91, 95, 98)):
    soma(musica, sino(nota, 0.028, 3.0), M["preco"] + 0.12 + j * 0.09, pan=-0.6 + j * 0.3)
soma(sfx, brilho_luz(1.0, 0.08, 3200, 9500), M["brilhoPreco"], pan=0.25)

# — preço anterior riscado e validade
if "risco" in M:
    _t = tt(0.45)
    _r = passa_banda(ruido(0.45), 2500, 9000) * (0.3 + 0.7 * np.sin(np.pi * _t / 0.45)) * 0.5
    soma(sfx, _r * 0.4, M["risco"], pan=0.1)
if "validade" in M:
    soma(sfx, clique_ui(0.08, 1800), M["validade"], pan=-0.1)

# — encerramento: resolução harmônica
f_ini = TL["cenas"]["final"][0]
soma(sfx, sopro(0.9, 0.14, 200, 3000, 0.4, -0.4), f_ini - 0.4)
fim_acordes = [
    (f_ini, f_ini + 2.4, [41, 48, 52, 55, 57], 29),
    (f_ini + 2.4, M["cliqueCta"], [43, 50, 57, 59, 62], 31),
    (M["cliqueCta"], DUR, [36, 43, 52, 59, 62], 24),
]
for a, b, notas, raiz in fim_acordes:
    ultimo = b >= DUR
    soma(musica, pad(notas, a, b, 0.08, brilho=1500, ataque=0.3, soltura=0.4 if not ultimo else 0.01), a)
    soma(musica, sub(raiz, a, b, 0.14, ataque=0.1, soltura=0.3 if not ultimo else 0.01), a)
    t0 = a
    while t0 < b - 0.05 and not ultimo:
        soma(ritmo, baixo_pulso(raiz + 12, 0.08), t0)
        t0 += BATIDA
soma(sfx, impacto(0.3, grave=0.6), M["logoFinal"])
for j, nota in enumerate((76, 81, 88)):
    soma(musica, sino(nota, 0.025, 2.5), M["logoFinal"] + 0.3 + j * 0.13, pan=-0.4 + j * 0.4)
soma(sfx, clique_ui(0.13, 1250), M["cliqueCta"], pan=0.15)
soma(sfx, impacto(0.35, grave=0.6), M["encerramento"])
for j, nota in enumerate((72, 79, 84, 88, 91)):
    soma(musica, sino(nota, 0.03, 3.5), M["encerramento"] + 0.05 + j * 0.1, pan=-0.5 + j * 0.25)
soma(sfx, brilho_luz(1.0, 0.06, 3000, 9000), M["encerramento"] + 0.2, pan=-0.2)

# ———————————————————————————————————————————————————————————— narração
voz = bus()
for fid, inicio in NARR.items():
    caminho = os.path.join(RAIZ, "public", "audio", "narracao", f"{fid}.wav")
    with wave.open(caminho) as w:
        assert w.getframerate() == SR, "narração deve estar em 48 kHz"
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    x = passa_alta(x, 85, 2)
    rms = np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2))
    x = x * (0.13 / rms)
    soma(voz, x, inicio)
voz_sala = reverbera(voz, IR_SALA) * 0.07
voz_total = voz + voz_sala

# ducking: envelope da voz
nivel = np.abs(voz[:, 0])
ataque = np.exp(-1 / (0.03 * SR))
soltura = np.exp(-1 / (0.35 * SR))
envv = signal.lfilter([1 - soltura], [1, -soltura], signal.lfilter([1 - ataque], [1, -ataque], nivel))
envv = np.clip(envv / (np.percentile(envv[envv > 1e-4], 90) + 1e-9), 0, 1)
duck_mus = 1 - 0.5 * envv
duck_rit = 1 - 0.3 * envv
duck_sfx = 1 - 0.15 * envv

musica_wet = reverbera(musica + envio, IR_GRANDE) * 0.32
sfx_wet = reverbera(sfx, IR_GRANDE) * 0.12
mix = (
    (musica * 0.95 + musica_wet) * duck_mus[:, None]
    + ritmo * duck_rit[:, None]
    + (sfx + sfx_wet) * duck_sfx[:, None]
    + voz_total
)

# fade final curto e corte de DC
mix = passa_alta(mix, 25, 2)
fade = int(0.35 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
mix[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))[:, None]

bruto = os.path.join(RAIZ, "public", "audio", "mix-bruto.wav")
saida = os.path.join(RAIZ, "public", "audio", "mix.wav")
pico = np.max(np.abs(mix))
mix = mix / pico * 0.7
with wave.open(bruto, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())

# masterização: loudnorm em duas passagens (-14 LUFS, -1.5 dBTP)
med = subprocess.run(
    ["ffmpeg", "-hide_banner", "-i", bruto, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
    capture_output=True,
    text=True,
).stderr
j = json.loads(med[med.rindex("{") : med.rindex("}") + 1])
filtro = (
    f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
    f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", bruto, "-af", filtro, "-ar", str(SR), "-ac", "2", "-c:a", "pcm_s16le", saida], check=True)
os.remove(bruto)
print("trilha:", saida, f"({DUR}s) — medido antes:", j["input_i"], "LUFS")
