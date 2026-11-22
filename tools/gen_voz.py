#!/usr/bin/env python3
"""Vozes sem palavras por ninja (kiai de jutsu, grito de golpe, dor, queda), 2 variações cada.
Uso: python3 tools/gen_voz.py [limite]  -> WAV em tools/audio/src/sfx/voz-<ninja>-<tipo>_<n>.wav (pula o que já existe).
Depois: python3 tools/audio/convert_sfx.py. Mesma chave/proxy do gen_sfx.py."""
import os, sys, json, subprocess, time
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools/audio/src/sfx")
SUF = ", crisp, dry, no reverb tail, no music, no words, no speech, game sound effect, anime action style, exactly {d} seconds long, cuts off cleanly at the end"
VOZ = {  # ninja: (timbre, [jutsu, golpe, dor, queda])
 "kaen":   ("young hot-blooded male", None),
 "raiden": ("calm sharp young male", None),
 "iwao":   ("deep gruff heavy male", None),
 "doku":   ("low raspy sinister male", None),
 "mizuha": ("gentle young female", None),
 "fuuka":  ("energetic sporty young female", None),
 "mayoi":  ("soft mysterious young female", None),
 "hiyori": ("cool composed young female", None),
}
TIPOS = {  # tipo: (duração, texto com {v} = timbre)
 "jutsu": (1.0, "{v} ninja powerful battle shout releasing a special jutsu, 0.0-0.1s: sharp breath intake, 0.1-0.8s: one strong confident yell, 0.8-1.0s: cut off"),
 "golpe": (0.6, "{v} ninja short attack grunt while striking, one sharp effort exhale with a vocal push, no yelling"),
 "dor":   (0.6, "{v} ninja short grunt of pain when hit, 0.0-0.3s: sharp pained exhale, 0.3-0.6s: breathy groan"),
 "queda": (1.2, "{v} ninja defeated, 0.0-0.4s: painful cry, 0.4-1.2s: weak breathy groan fading as the body drops"),
}
POKO = {
 "jutsu": (1.0, "giant mantis insect sharp stridulating screech, high pitched vibrating shriek, 0.0-0.1s: click, 0.1-0.8s: piercing buzzing screech, 0.8-1.0s: cut off"),
 "golpe": (0.6, "giant mantis insect short aggressive chittering click and rattle"),
 "dor":   (0.6, "giant mantis insect pained hissing squeal, short"),
 "queda": (1.2, "giant mantis insect dying rattle, weak fading buzzing wing flutter and clicks"),
}
itens = [(f"voz-{n}-{t}", d, tx.format(v=v)) for n, (v, _) in VOZ.items() for t, (d, tx) in TIPOS.items()] + [(f"voz-poko-{t}", d, tx) for t, (d, tx) in POKO.items()]
lim = int(sys.argv[1]) if len(sys.argv) > 1 else 999
os.makedirs(OUT, exist_ok=True); n = 0
for nome, d, txt in itens:
    for i in (1, 2):
        dest = os.path.join(OUT, f"{nome}_{i}.wav")
        if os.path.exists(dest) and os.path.getsize(dest) > 1000: continue
        if n >= lim: print("limite", lim); sys.exit(0)
        body = json.dumps({"text": txt + SUF.format(d=d), "duration_seconds": max(.5, d), "prompt_influence": 1.0})
        for tent in range(3):
            r = subprocess.run(["curl", "-s", "-o", dest + ".tmp", "-w", "%{http_code}", "-X", "POST",
                "https://api.elevenlabs.io/v1/sound-generation?output_format=wav_44100", "-H", "Content-Type: application/json", "-d", body], capture_output=True, text=True)
            c = r.stdout.strip()
            if c == "200": os.replace(dest + ".tmp", dest); n += 1; print("ok", nome, i, flush=True); break
            err = open(dest + ".tmp", errors="ignore").read()[:160] if os.path.exists(dest + ".tmp") else ""
            if os.path.exists(dest + ".tmp"): os.remove(dest + ".tmp")
            print(nome, i, "HTTP", c, err, flush=True)
            if c in ("401", "402", "403", "422"): print("PAROU"); sys.exit(1)
            time.sleep(3 * (tent + 1))
        time.sleep(.3)
print("fim:", n, "gerados")
