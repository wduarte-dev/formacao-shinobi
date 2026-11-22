#!/usr/bin/env python3
"""WAV do ElevenLabs (tools/audio/src/sfx) -> OGG do jogo (audio/sfx).
Apara silêncio, corta no tempo pedido (a API só gera >= 0.5s), fade no fim,
normaliza o pico em -3 dBFS e faz loop sem emenda nos ambientes (amb-*).
Uso: python3 tools/audio/convert_sfx.py [nome ...] [--all]   (precisa de ffmpeg e numpy)
Sem nomes: converte só os WAV que ainda não têm OGG (data de arquivo não vale: num clone novo os WAV saem "mais novos"
e reconverteria tudo). Com nomes: reconverte esses. --all: reconverte todos."""
import sys
import os, re, glob, subprocess, numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC, OUT = os.path.join(ROOT, "tools/audio/src/sfx"), os.path.join(ROOT, "audio/sfx")
SR = 44100
os.makedirs(OUT, exist_ok=True)
dur = {m.group(1): float(m.group(2)) for m in re.finditer(r"^\*\*(\S+)\*\* · ([\d.]+)s", open(os.path.join(ROOT, "docs/prompts-sfx.md")).read(), re.M)}
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
def save(a, p):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", "-c:a", "libvorbis", "-q:a", "4", p], input=a.astype(np.float32).tobytes())
def fade(a, ms):
    n = min(len(a), int(SR * ms / 1000));
    if n: a[-n:] *= np.linspace(1, 0, n)[:, None]
    return a
for p in sorted(glob.glob(os.path.join(SRC, "*.wav"))):
    nome = os.path.basename(p)[:-4]; dst = os.path.join(OUT, nome + ".ogg")
    pedidos = [a for a in sys.argv[1:] if not a.startswith("--")]
    if pedidos and nome not in pedidos: continue
    if not pedidos and "--all" not in sys.argv and os.path.exists(dst): continue   # já convertido
    a = load(p)
    if not len(a): print("vazio:", nome); continue
    env = np.abs(a).max(1); pk = env.max() or 1
    if nome.startswith("amb-"):   # loop: o fim (1,5s) entra em crossfade com o começo
        x = int(SR * 1.5); tail, a = a[-x:].copy(), a[:-x].copy(); w = np.linspace(0, 1, x)[:, None]
        a[:x] = a[:x] * w + tail * (1 - w)
    else:
        on = np.where(env > pk * 10 ** (-45 / 20))[0]
        a = a[max(0, on[0] - int(SR * .004)):on[-1] + 1] if len(on) else a
        base = re.sub(r"_\d+$", "", nome); t = dur.get(base)
        if t and t < .5 and len(a) > SR * t: a = fade(a[:int(SR * t)], 40)
        a = fade(a, 15)
    a *= 0.708 / (np.abs(a).max() or 1)
    save(a, dst)
print(len(glob.glob(os.path.join(OUT, "*.ogg"))), "ogg em audio/sfx")
