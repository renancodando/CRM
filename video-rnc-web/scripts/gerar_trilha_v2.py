"""Filme 2 — trilha original, assinatura sonora RNC, efeitos e mixagem por versão.

Tudo é sintetizado aqui (nenhum sample de terceiros): uso comercial livre.
Lê src/v2/filme/roteiros.json e public/audio/narracao-v2/*.wav.
Saída por versão: public/audio/v2/mix-<ID>.wav (-14 LUFS, -1,5 dBTP)
           e stems: public/audio/v2/stems/<ID>-{trilha,efeitos,voz}.wav

Uso: python3 scripts/gerar_trilha_v2.py [A B1 B2 B3 C]
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np
from scipy import signal

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROT = json.load(open(os.path.join(RAIZ, "src", "v2", "filme", "roteiros.json"), encoding="utf-8"))
NARR_DIR = os.path.join(RAIZ, "public", "audio", "narracao-v2")
SAIDA = os.path.join(RAIZ, "public", "audio", "v2")
os.makedirs(os.path.join(SAIDA, "stems"), exist_ok=True)
SR = 48000
BPM = 100.0
B = 60.0 / BPM


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tt(d):
    return np.arange(int(max(d, 0.001) * SR)) / SR


def env(n, a, r):
    e = np.ones(n)
    ai = max(1, min(n, int(a * SR)))
    ri = max(1, min(n, int(r * SR)))
    e[:ai] = np.linspace(0, 1, ai) ** 2
    e[-ri:] *= np.linspace(1, 0, ri) ** 1.6
    return e


def pb(x, fc, o=4):
    return signal.sosfilt(signal.butter(o, min(fc, SR * 0.47), "low", fs=SR, output="sos"), x, axis=0)


def pa(x, fc, o=4):
    return signal.sosfilt(signal.butter(o, fc, "high", fs=SR, output="sos"), x, axis=0)


def pbanda(x, f1, f2, o=2):
    return signal.sosfilt(signal.butter(o, [f1, min(f2, SR * 0.47)], "band", fs=SR, output="sos"), x, axis=0)


class Mix:
    def __init__(self, dur, seed):
        self.N = int(dur * SR)
        self.rng = np.random.default_rng(seed)
        self.mus = np.zeros((self.N, 2))
        self.rit = np.zeros((self.N, 2))
        self.sfx = np.zeros((self.N, 2))
        self.env = np.zeros((self.N, 2))  # envio ao reverb grande
        self.voz = np.zeros((self.N, 2))

    def ruido(self, d):
        return self.rng.standard_normal(int(max(d, 0.001) * SR))

    def soma(self, buf, sig, t0, g=1.0, pan=0.0):
        i0 = int(round(t0 * SR))
        if i0 >= self.N:
            return
        if sig.ndim == 1:
            a = np.pi / 4 * (pan + 1)
            sig = np.stack([sig * np.cos(a), sig * np.sin(a)], axis=1) * np.sqrt(2)
        if i0 < 0:
            sig = sig[-i0:]
            i0 = 0
        n = min(len(sig), self.N - i0)
        buf[i0 : i0 + n] += sig[:n] * g

    # ——— instrumentos
    def pad(self, notas, d, brilho=1500, ataque=0.6, soltura=1.0):
        n = int((d + soltura) * SR)
        t = np.arange(n) / SR
        L = np.zeros(n)
        R = np.zeros(n)
        for nota in notas:
            f = midi(nota)
            for v, dc in enumerate((-8, -3, 3, 8)):
                fase = self.rng.random()
                s = 2 * ((t * f * 2 ** (dc / 1200) + fase) % 1) - 1
                (L if v % 2 == 0 else R)[:] += s
        x = np.stack([L, R], 1) / (len(notas) * 2)
        x = pb(x, brilho, 2)
        lfo = 0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * t + self.rng.random() * 6)
        x = x * lfo[:, None] + pb(x, brilho * 0.35, 2) * (1 - lfo[:, None])
        return x * env(n, ataque, soltura)[:, None]

    def sub(self, nota, d, a=0.3, r=0.6):
        s = np.sin(2 * np.pi * midi(nota) * tt(d + r))
        return s * env(len(s), a, r)

    def sino(self, nota, decai=2.4, razao=3.5, ind=2.6):
        t = tt(decai * 2.6)
        fc = midi(nota)
        y = np.sin(2 * np.pi * fc * t + ind * np.exp(-t / 0.3) * np.sin(2 * np.pi * fc * razao * t))
        y += 0.25 * np.sin(2 * np.pi * fc * 2.002 * t) * np.exp(-t / (decai * 0.35))
        return y * np.exp(-t / decai) * env(len(t), 0.003, 0.1)

    def piano(self, nota, decai=1.6):
        t = tt(decai * 2.5)
        f = midi(nota)
        y = sum(a * np.sin(2 * np.pi * f * h * (1 + 0.0004 * h * h) * t) * np.exp(-t * (0.7 + h * 0.9) / decai) for h, a in ((1, 1), (2, 0.42), (3, 0.2), (4, 0.11), (5, 0.06)))
        y += pbanda(self.ruido(t[-1] + 1 / SR), 1500, 5000)[: len(t)] * np.exp(-t / 0.008) * 0.08
        return y * env(len(t), 0.002, 0.1)

    def dedilhado(self, nota, decai=0.32):
        t = tt(decai * 3)
        f = midi(nota)
        y = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.08)
        return y * np.exp(-t / decai) * env(len(t), 0.002, 0.04)

    def baixo(self, nota, dur=0.2):
        t = tt(dur + 0.05)
        y = pb(np.tanh(2.6 * np.sin(2 * np.pi * midi(nota) * t)), 380, 2)
        return y * np.exp(-t / (dur * 0.6)) * env(len(t), 0.003, 0.03)

    def bumbo(self):
        t = tt(0.55)
        f = 45 + 95 * np.exp(-t / 0.032)
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
        return y + pbanda(self.ruido(0.55), 1500, 5000) * np.exp(-t / 0.004) * 0.12

    def palma(self):
        t = tt(0.3)
        y = np.zeros(len(t))
        for k, o in enumerate((0, 0.011, 0.023)):
            i = int(o * SR)
            y[i:] += pbanda(self.ruido(0.3), 900, 4000)[: len(t) - i] * np.exp(-t[: len(t) - i] / (0.012 if k < 2 else 0.11))
        return y * 0.5

    def chimbal(self, decai=0.03):
        t = tt(0.15)
        return pb(pa(self.ruido(0.15), 6500), 13000) * np.exp(-t / decai)

    def impacto(self, grave=1.0):
        t = tt(4.0)
        f = 27 + 62 * np.exp(-t / 0.18)
        boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.1) * grave
        corpo = pb(self.ruido(4.0), 240, 2) * np.exp(-t / 0.33) * 0.9
        estalo = pbanda(self.ruido(4.0), 1800, 7000) * np.exp(-t / 0.028) * 0.3
        return (boom + corpo + estalo) * env(len(t), 0.002, 0.5)

    def sopro(self, d=0.8, f1=300, f2=5000, de=-0.7, ate=0.7):
        n = int(d * SR)
        k = np.linspace(0, 1, n)
        base = self.ruido(d)
        y = pbanda(base, f1, f1 * 4) * (1 - k) + pbanda(base, f2 * 0.3, f2) * k * 0.7
        y = y * np.sin(np.pi * k) ** 2.2
        a = np.pi / 4 * (de + (ate - de) * k + 1)
        return np.stack([y * np.cos(a), y * np.sin(a)], 1) * np.sqrt(2)

    def subida(self, d):
        t = tt(d)
        k = t / d
        r = pb(pa(self.ruido(d), 900), 9000) * k**2.5
        tom = np.sin(2 * np.pi * np.cumsum(170 * 2 ** (k * 2.6)) / SR) * k**2 * 0.35
        return (r * 0.5 + tom) * (0.75 + 0.25 * np.sin(2 * np.pi * (3 + 18 * k) * t))

    def reverso(self, d=1.0):
        x = np.zeros((int((d + 0.2) * SR), 2))
        x[: int(0.05 * SR)] = self.rng.standard_normal((int(0.05 * SR), 2))
        x = pbanda(reverb(x, IR_G), 200, 6000)[::-1][-int(d * SR) :]
        return x / (np.max(np.abs(x)) + 1e-9)

    def brilho(self, d=0.8, f0=2400, f1=7200):
        t = tt(d)
        k = t / d
        f = f0 + (f1 - f0) * k
        y = sum(a * np.sin(2 * np.pi * np.cumsum(f * h) / SR) for h, a in ((1, 1), (1.5, 0.35), (2, 0.2)))
        return (y + pb(pa(self.ruido(d), 5000), 11000) * 0.05) * np.sin(np.pi * k) ** 1.5

    def tic(self, tom=1400, g=1.0):
        t = tt(0.12)
        y = np.sin(2 * np.pi * tom * t) * np.exp(-t / 0.016) + pbanda(self.ruido(0.12), 2000, 8000) * np.exp(-t / 0.004) * 0.5
        return y * g

    def encaixe(self):
        """som de peça encaixando (papel/plástico) para a transformação"""
        t = tt(0.09)
        y = pbanda(self.ruido(0.09), 1200, 4500) * np.exp(-t / 0.01) + np.sin(2 * np.pi * 620 * t) * np.exp(-t / 0.02) * 0.4
        return y

    def risco(self, d=0.5):
        t = tt(d)
        k = t / d
        y = pbanda(self.ruido(d), 2500, 9000) * (0.3 + 0.7 * np.sin(np.pi * k)) * (0.8 + 0.2 * np.sin(2 * np.pi * 38 * t))
        return y * 0.5


def reverb_ir(rt60, pre, brilho, seed):
    r = np.random.default_rng(seed)
    t = tt(rt60 * 1.1)
    dec = np.exp(-6.9 * t / rt60)
    ir = np.stack([r.standard_normal(len(t)) * dec, r.standard_normal(len(t)) * dec], 1)
    ir = pb(ir, brilho, 2)
    ir[: int(pre * SR)] = 0
    return ir / np.sqrt(np.sum(ir**2) / 2)


IR_G = reverb_ir(3.0, 0.03, 4500, 1)
IR_S = reverb_ir(0.8, 0.01, 6500, 2)


def reverb(x, ir):
    out = np.zeros_like(x)
    for c in range(2):
        out[:, c] = signal.fftconvolve(x[:, c], ir[:, c])[: len(x)]
    return out


# progressão (Ré menor → Ré maior no final)
GROOVE = [([38 + 12, 45 + 12, 52 + 12, 53 + 12, 57 + 12], 26), ([46, 53, 57, 60, 62], 22), ([41, 48, 52, 55, 57], 29), ([48, 55, 57, 60, 64], 24)]


def assinatura(m, t0, g=1.0):
    """Assinatura sonora RNC: respiro reverso → grave → Ré, Lá, Mi em vidro"""
    rv = m.reverso(0.9)
    m.soma(m.sfx, rv * 0.18 * g, t0 - len(rv) / SR)
    m.soma(m.sfx, m.impacto(0.8) * 0.55 * g, t0)
    m.soma(m.env, m.impacto(0.6) * 0.25 * g, t0)
    m.soma(m.mus, m.sub(26, 2.0, 0.01, 1.2) * 0.22 * g, t0)
    for j, nota in enumerate((74, 81, 88)):
        m.soma(m.mus, m.sino(nota, 3.2) * 0.05 * g, t0 + 0.08 + j * 0.13, pan=-0.45 + j * 0.45)
        m.soma(m.env, m.sino(nota, 3.2) * 0.03 * g, t0 + 0.08 + j * 0.13)


def groove(m, a, b, camada):
    """camada 0..3: cada cena adiciona uma camada (progressão de intensidade)"""
    t0 = a
    i = 0
    while t0 < b - 0.05:
        notas, raiz = GROOVE[(i // 2) % 4]
        fim = min(b, t0 + B * 4)
        m.soma(m.mus, m.pad(notas, fim - t0, brilho=1300 + camada * 250, ataque=0.08, soltura=0.4) * (0.055 + camada * 0.006), t0)
        m.soma(m.mus, m.sub(raiz, fim - t0, 0.04, 0.3) * 0.13, t0)
        k = 0
        tt0 = t0
        while tt0 < fim - 0.02:
            if camada >= 0:
                m.soma(m.rit, m.baixo(raiz + 12) * 0.12, tt0)
            if camada >= 1 and k % 2 == 0:
                seq = [notas[1] + 12, notas[2] + 12, notas[3] + 12, notas[2] + 12]
                nota = seq[(k // 2) % 4]
                m.soma(m.mus, m.dedilhado(nota) * 0.035, tt0, pan=-0.35 if k % 4 else 0.35)
                m.soma(m.mus, m.dedilhado(nota) * 0.012, tt0 + B * 0.75, pan=0.5)
            if camada >= 2:
                if k % 4 == 0:
                    m.soma(m.rit, m.bumbo() * 0.42, tt0)
                m.soma(m.rit, m.chimbal() * (0.04 if k % 2 else 0.022), tt0 + (0.012 if k % 2 else 0), pan=0.3)
            if camada >= 3 and k % 8 == 4:
                m.soma(m.rit, m.palma() * 0.16, tt0, pan=-0.1)
            tt0 += B / 2
            k += 1
        t0 = fim
        i += 1


def gerar(idv):
    r = ROT[idv]
    cenas = r["cenas"]
    dur = max(c["de"] + c["dur"] for c in cenas)
    m = Mix(dur, seed=len(idv) * 7 + ord(idv[0]))
    camada = 0
    for i, c in enumerate(cenas):
        a = c["de"]
        b = a + c["dur"]
        tipo = c["tipo"]
        P = c.get("props", {})
        if tipo in ("gancho", "curiosidade", "desejo"):
            rev = a + (P.get("recuo", 2.3) if tipo == "gancho" else 1.9 if tipo == "curiosidade" else 2.4)
            m.soma(m.mus, m.sub(26, rev - a, 1.0, 0.2) * 0.2, a + 0.05)
            m.soma(m.mus, m.pad([50, 57, 62], rev - a, brilho=700, ataque=1.6, soltura=0.2) * 0.06, a + 0.05)
            m.soma(m.sfx, m.brilho(0.9, 1800, 6200) * 0.08, a, pan=-0.3)
            tk = a + 0.45
            k = 0
            while tk < rev - 0.15:
                m.soma(m.rit, m.chimbal() * (0.02 + 0.05 * (tk - a) / (rev - a)) * (1 if k % 2 == 0 else 0.6), tk, pan=0.25 if k % 2 else -0.25)
                tk += B / 2
                k += 1
            sd = max(0.6, rev - a - 0.9)
            m.soma(m.sfx, m.subida(sd) * 0.13, rev - 0.08 - sd)
            # revelação: silêncio curto + impacto + começa o groove
            m.soma(m.sfx, m.impacto(0.9) * 0.8, rev)
            m.soma(m.env, m.impacto(0.7) * 0.3, rev)
            for j, nota in enumerate((62, 69, 76)):
                m.soma(m.mus, m.sino(nota, 2.6) * 0.03, rev + 0.3 + j * 0.15, pan=-0.4 + j * 0.4)
            groove(m, rev + 0.4, b, 0)
        elif tipo in ("reparo", "site", "leque"):
            camada = min(3, camada + 1)
            m.soma(m.sfx, m.sopro(0.85, 250, 5200, -0.6 if i % 2 else 0.6, 0.6 if i % 2 else -0.6) * 0.22, a - 0.45)
            groove(m, a, b, camada)
            if tipo == "site":
                m.soma(m.sfx, m.tic(1500, 0.07), a + 1.2, pan=0.2)
        elif tipo == "transformacao":
            T = P.get("T", {})
            m.soma(m.sfx, m.sopro(0.8, 200, 3000, 0.4, -0.4) * 0.15, a - 0.4)
            # respiro: piano e pad suave
            m.soma(m.mus, m.pad([50, 57, 60, 65], b - a, brilho=900, ataque=0.3, soltura=0.6) * 0.05, a)
            for j, nota in enumerate((62, 65, 69, 72, 69, 65)):
                m.soma(m.mus, m.piano(nota) * 0.07, a + 0.2 + j * B, pan=-0.2 + 0.08 * j)
            k0, k1 = a + T.get("k0", 1.5), a + T.get("k1", 3.4)
            for j in range(9):
                m.soma(m.sfx, m.encaixe() * 0.12, k0 + (k1 - k0) * (0.15 + j * 0.09), pan=-0.4 + j * 0.1)
            if T.get("outra", 99) < c["dur"]:
                m.soma(m.mus, m.sino(74, 2.8) * 0.04, a + T["outra"] + 0.2)
                m.soma(m.mus, m.piano(66) * 0.08, a + T["outra"] + 0.2)
            m.soma(m.sfx, m.tic(1300, 0.11), a + T.get("toque", 4.5))
        elif tipo == "oferta":
            T = P["T"]
            m.soma(m.sfx, m.reverso(1.0) * 0.1, a - 1.0)
            m.soma(m.mus, m.sub(26, b - a, 0.6, 0.4) * 0.09, a)
            m.soma(m.sfx, m.brilho(0.75, 1500, 7000) * 0.11, a + T["linha"], pan=-0.2)
            m.soma(m.sfx, m.risco(0.5) * 0.35, a + T["risco"], pan=0.1)
            rv = m.reverso(0.7)
            m.soma(m.sfx, rv * 0.14, a + T["preco"] - len(rv) / SR)
            m.soma(m.sfx, m.impacto(1.0) * 0.75, a + T["preco"])
            m.soma(m.env, m.impacto(0.8) * 0.3, a + T["preco"])
            m.soma(m.mus, m.pad([38, 45, 54, 57, 61, 64], b - a - T["preco"], brilho=2200, ataque=0.05, soltura=0.6) * 0.075, a + T["preco"])
            for j, nota in enumerate((74, 78, 81, 85, 88)):
                m.soma(m.mus, m.sino(nota, 3.0) * 0.022, a + T["preco"] + 0.1 + j * 0.08, pan=-0.6 + j * 0.3)
            # pulso discreto depois do preço
            tk = a + T["preco"] + B * 2
            k = 0
            while tk < b - 0.2:
                m.soma(m.rit, m.baixo(38) * 0.08, tk)
                if k % 2 == 0:
                    m.soma(m.rit, m.chimbal() * 0.018, tk + B / 2, pan=0.3)
                tk += B
                k += 1
            for j in range(5):
                m.soma(m.sfx, m.tic(2000 + j * 120, 0.03), a + T["itens"] + j * 0.1, pan=-0.3 + j * 0.15)
        elif tipo == "final":
            T = P["T"]
            m.soma(m.sfx, m.sopro(1.2, 200, 6000, -0.5, 0.5) * 0.2, a + T["conv"] - 0.9)
            m.soma(m.mus, m.pad([50, 57, 62, 66, 69], T["conv"] + 0.3, brilho=1400, ataque=0.4, soltura=0.4) * 0.06, a)
            assinatura(m, a + T["conv"] + 0.4)
            m.soma(m.mus, m.pad([38, 50, 54, 57, 61, 64], b - a - T["conv"], brilho=2000, ataque=0.3, soltura=0.01) * 0.07, a + T["conv"] + 0.4)
            m.soma(m.mus, m.sub(26, b - a - T["conv"], 0.1, 0.01) * 0.13, a + T["conv"] + 0.4)
            m.soma(m.sfx, m.tic(1250, 0.13), a + T["clique"], pan=0.15)
            for j, nota in enumerate((78, 81, 85)):
                m.soma(m.mus, m.sino(nota, 2.6) * 0.02, a + T["clique"] + 0.1 + j * 0.12)

    # ——— narração
    for f in r["falas"]:
        with wave.open(os.path.join(NARR_DIR, f["id"] + ".wav")) as w:
            x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        x = pa(x, 85, 2)
        rms = np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2))
        m.soma(m.voz, x * (0.13 / rms), f["ini"])
    voz = m.voz + reverb(m.voz, IR_S) * 0.06

    nivel = np.abs(m.voz[:, 0])
    at = np.exp(-1 / (0.03 * SR))
    so = np.exp(-1 / (0.35 * SR))
    ev = signal.lfilter([1 - so], [1, -so], signal.lfilter([1 - at], [1, -at], nivel))
    ev = np.clip(ev / (np.percentile(ev[ev > 1e-4], 90) + 1e-9), 0, 1)

    trilha = (m.mus + reverb(m.mus + m.env, IR_G) * 0.3) * (1 - 0.5 * ev)[:, None] + m.rit * (1 - 0.3 * ev)[:, None]
    efeitos = (m.sfx + reverb(m.sfx, IR_G) * 0.12) * (1 - 0.15 * ev)[:, None]
    mix = trilha + efeitos + voz
    mix = pa(mix, 25, 2)
    fade = int(0.3 * SR)
    for x in (mix, trilha, efeitos, voz):
        x[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2

    def grava(caminho, x, norm=True):
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.7 if norm else x
        with wave.open(caminho, "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())

    escala = 0.7 / (np.max(np.abs(mix)) + 1e-9)
    bruto = os.path.join(SAIDA, f"bruto-{idv}.wav")
    grava(bruto, mix)
    for nome, x in (("trilha", trilha), ("efeitos", efeitos), ("voz", voz)):
        grava(os.path.join(SAIDA, "stems", f"{idv}-{nome}.wav"), x * escala, norm=False)
    med = subprocess.run(["ffmpeg", "-hide_banner", "-i", bruto, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    j = json.loads(med[med.rindex("{") : med.rindex("}") + 1])
    filtro = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", bruto, "-af", filtro, "-ar", str(SR), "-c:a", "pcm_s16le", os.path.join(SAIDA, f"mix-{idv}.wav")], check=True)
    os.remove(bruto)
    print(f"{idv}: {dur:.1f}s")


for idv in sys.argv[1:] or list(ROT.keys()):
    gerar(idv)
