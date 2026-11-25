#!/usr/bin/env python3
"""Gera pela API do ElevenLabs os sons de UM ninja novo (golpes, esquiva, vozes) e do elemento dele, se ainda não existirem.
Uso: python3 tools/gen_ninja_sfx.py <id>   (ex.: yugami)  -> WAV em tools/audio/src/sfx/ ; depois: python3 tools/audio/convert_sfx.py
Pra ninja novo: acrescentar uma entrada em NINJAS abaixo (e ligar os nomes em js/audio.js). Regra do dono (22/11/2026): ninja/mecânica nova
já pode gerar os sons pela API sem pedir. Chave: o proxy da nuvem injeta; local, exporte ELEVEN_KEY."""
import os, sys, json, subprocess, time
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools/audio/src/sfx")
BASE = ", crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly {d} seconds long, cuts off cleanly at the end"
VOZ = ", crisp, dry, no reverb tail, no music, no words, no speech, game sound effect, anime action style, exactly {d} seconds long, cuts off cleanly at the end"
V = {"jutsu": (1.0, "{v} ninja powerful battle shout releasing a special jutsu, 0.0-0.1s: sharp breath intake, 0.1-0.8s: one strong confident yell, 0.8-1.0s: cut off"),
     "golpe": (0.6, "{v} ninja short attack grunt while striking, one sharp effort exhale with a vocal push, no yelling"),
     "dor":   (0.6, "{v} ninja short grunt of pain when hit, 0.0-0.3s: sharp pained exhale, 0.3-0.6s: breathy groan"),
     "queda": (1.2, "{v} ninja defeated, 0.0-0.4s: painful cry, 0.4-1.2s: weak breathy groan fading as the body drops")}
NINJAS = {
 "keshin": {"timbre": "energetic, confident young adult male",
  "sfx": [
   ("keshin-atk", .5, "quick hand-to-hand contact, dry compact thump with a short cloth snap and softly fading warm electric crackle"),
   ("keshin-chase", .7, "heavy ground slam, first frame low thud and sharp ground crack, then pebbles scattering and a short expanding air ring"),
   ("esq-keshin", .5, "quick sidestep by an agile fighter, sharp cloth rustle with a light sandal skid and a short airy tail")]},
 "iwao": {"timbre": "deep heavy calm adult male",   # só o Forte novo (Punho de Pedra, 1.5); as vozes já existem e são puladas
  "sfx": [("iwao-forte", 1.0, "massive stone fist punch, 0.0-0.25s: heavy grinding wind-up of rock gauntlets, 0.25-0.45s: huge crunching rock impact thump, 0.45-1.0s: pebbles scattering and a deep rumble decay")]},
 "yugami": {"timbre": "calm slightly mischievous young male",
  "sfx": [  # (nome, duração, texto)
   ("yugami-atk", .5, "spatial slash, 0.0-0.1s: thin whooshing air tear, 0.1-0.5s: short crackling rip closing with a soft glitchy pop"),
   ("yugami-forte", 1.0, "double dimensional rift punch, 0.0-0.3s: two quick space-tearing zips, 0.3-0.6s: heavy thud through a portal, 0.6-1.0s: crackling glitch decay"),
   ("yugami-chase", 1.0, "teleport blink strike, 0.0-0.3s: sharp warp whoosh vanishing, 0.3-0.5s: fast double hit from behind, 0.5-1.0s: ringing glitch crackle decay"),
   ("esq-yugami", .4, "ninja dodge, instant space-fold blink, a tiny glitchy warp pop and whoosh"),
   ("selos-space", .9, "space hand seals, rapid cloth rustle with finger snaps and a rising warped digital hum"),
   ("impacto-space", .6, "space impact burst, 0.0-0.1s: punchy sub thump, 0.1-0.6s: crackling glitchy shatter of dimensional shards"),
   ("proj-space", .5, "space projectile shot, a spinning shard of torn space whirring past with a warbling glitch tone"),
   ("jutsu-espaco", 1.8, "space seal breaking jutsu, 0.0-0.4s: deep rumbling pressure building, 0.4-0.7s: loud shattering crack like a seal snapping, 0.7-1.8s: expanding ringing shockwave with crackling glitchy golden energy")]}}
nome = sys.argv[1]; N = NINJAS[nome]; os.makedirs(OUT, exist_ok=True)
itens = [(n, d, t + BASE.format(d=d)) for n, d, t in N["sfx"]]
for t, (d, tx) in V.items():
    for i in (1, 2): itens.append((f"voz-{nome}-{t}_{i}", d, tx.format(v=N["timbre"]) + VOZ.format(d=d)))
ok = 0
for n, d, txt in itens:
    dest = os.path.join(OUT, n + ".wav")
    if os.path.exists(dest) and os.path.getsize(dest) > 1000: continue
    body = json.dumps({"text": txt, "duration_seconds": max(.5, d), "prompt_influence": 1.0})
    hdr = ["-H", "xi-api-key: " + os.environ["ELEVEN_KEY"]] if os.environ.get("ELEVEN_KEY") else []
    for tent in range(3):
        r = subprocess.run(["curl", "-s", "-o", dest + ".tmp", "-w", "%{http_code}", "-X", "POST", "https://api.elevenlabs.io/v1/sound-generation?output_format=wav_44100",
            "-H", "Content-Type: application/json", *hdr, "-d", body], capture_output=True, text=True)
        c = r.stdout.strip()
        if c == "200": os.replace(dest + ".tmp", dest); ok += 1; print("ok", n, flush=True); break
        err = open(dest + ".tmp", errors="ignore").read()[:160] if os.path.exists(dest + ".tmp") else ""
        if os.path.exists(dest + ".tmp"): os.remove(dest + ".tmp")
        print(n, "HTTP", c, err, flush=True)
        if c in ("401", "402", "403", "422"): print("PAROU:", c); sys.exit(1)
        time.sleep(3 * (tent + 1))
print("fim:", ok, "gerados")
