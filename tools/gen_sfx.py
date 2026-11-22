#!/usr/bin/env python3
"""Gera os efeitos de docs/prompts-sfx.md pela API do ElevenLabs (1 versão por prompt).
Uso: python3 tools/gen_sfx.py [limite]   -> salva em audio/sfx/<id>.wav (pula o que já existe).
A chave vai no header xi-api-key (na nuvem o proxy injeta; local: exporte ELEVEN_KEY)."""
import re, os, sys, json, time, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD, OUT = os.path.join(ROOT, "docs/prompts-sfx.md"), os.path.join(ROOT, "audio/sfx")
ORDEM = [0, 1, 2, 3, 9, 7, 5, 4, 8, 10, 11, 12, 6, 13, 14]   # prioridade das seções
LIMITE = int(sys.argv[1]) if len(sys.argv) > 1 else 100
os.makedirs(OUT, exist_ok=True)
secs = {}
for m in re.finditer(r"^## (\d+)\.|^\*\*(\S+)\*\* · ([\d.]+)s\n```\n(.+?)\n```", open(MD).read(), re.M):
    if m.group(1): cur = int(m.group(1)); secs[cur] = []
    else: secs[cur].append((m.group(2), float(m.group(3)), m.group(4)))
fila = [it for s in ORDEM for it in secs.get(s, [])][:LIMITE]
hdr = ["-H", "xi-api-key: " + os.environ["ELEVEN_KEY"]] if os.environ.get("ELEVEN_KEY") else []
ok = pulou = 0
for i, (nome, dur, txt) in enumerate(fila, 1):
    dest = os.path.join(OUT, nome + ".wav")
    if os.path.exists(dest) and os.path.getsize(dest) > 1000: pulou += 1; continue
    body = json.dumps({"text": txt, "duration_seconds": max(0.5, dur), "prompt_influence": 1.0})
    for tent in range(3):
        r = subprocess.run(["curl", "-s", "-o", dest + ".tmp", "-w", "%{http_code}", "-X", "POST",
            "https://api.elevenlabs.io/v1/sound-generation?output_format=wav_44100",
            "-H", "Content-Type: application/json", *hdr, "-d", body], capture_output=True, text=True)
        code = r.stdout.strip()
        if code == "200": os.replace(dest + ".tmp", dest); ok += 1; print(f"[{i}/{len(fila)}] ok {nome}", flush=True); break
        err = open(dest + ".tmp", errors="ignore").read()[:200] if os.path.exists(dest + ".tmp") else ""
        if os.path.exists(dest + ".tmp"): os.remove(dest + ".tmp")
        print(f"[{i}/{len(fila)}] {nome} HTTP {code} {err}", flush=True)
        if code in ("401", "402", "403", "422"): print("PAROU:", code); sys.exit(1)
        time.sleep(3 * (tent + 1))
    else: print("falhou:", nome)
    time.sleep(0.3)
print(f"fim: {ok} gerados, {pulou} já existiam")
