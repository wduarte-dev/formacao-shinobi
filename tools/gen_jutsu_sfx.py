#!/usr/bin/env python3
"""Gera pela API do ElevenLabs o som PRÓPRIO de cada jutsu (jutsux-<ninja>) e sons especiais de mecânica (capuz do Yugami).
Pedido dele (22/11/2026): som por elemento + kiai em todo jutsu ficava sem sentido (Iwao gemendo ao erguer o Gigante de Pedra).
Uso: python3 tools/gen_jutsu_sfx.py [nome...]  -> WAV em tools/audio/src/sfx/ ; depois: python3 tools/audio/convert_sfx.py
Ninja novo: acrescentar ("jutsux-<id>", duração, descrição) em SONS e ligar em js/audio.js (lista JX). Prompts espelhados em docs/prompts-sfx.md, seção 15."""
import os, sys, json, subprocess, time
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools/audio/src/sfx")
BASE = ", crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly {d} seconds long, cuts off cleanly at the end"
SONS = [
 ("jutsux-kaen", 2.0, "fire dragon jutsu, 0.0-0.3s: deep whoosh of flames igniting, 0.3-1.4s: roaring blaze rushing forward like a dragon breath with crackling embers, 1.4-2.0s: fiery burst fading into crackles"),
 ("jutsux-mizuha", 2.0, "gentle healing rain jutsu, 0.0-0.4s: soft water chime shimmer, 0.4-1.6s: calm light raindrops pattering with a warm magical sparkle, 1.6-2.0s: soft glittering fade"),
 ("jutsux-raiden", 1.6, "lightning blade jutsu, 0.0-0.3s: electric charge crackle rising, 0.3-0.6s: sharp thunder slash crack, 0.6-1.6s: buzzing electric sparks and zaps fading"),
 ("jutsux-iwao", 2.5, "summoning a giant stone golem, 0.0-0.6s: deep earth rumble and ground cracking, 0.6-1.6s: massive boulders grinding and rising from the ground, 1.6-2.5s: heavy stone body settling with a powerful low thud and falling pebbles"),
 ("jutsux-fuuka", 1.8, "cutting typhoon jutsu, 0.0-0.3s: sharp wind gust rising, 0.3-1.4s: violent spinning tornado howl with slicing air whistles, 1.4-1.8s: wind dissipating whoosh"),
 ("jutsux-mayoi", 2.2, "mystic night fog jutsu, 0.0-0.5s: low eerie airy swell, 0.5-1.8s: thick mist spreading with soft fluttering moth wings and a mysterious shimmer, 1.8-2.2s: hushed airy fade"),
 ("jutsux-hiyori", 1.6, "ice prison jutsu, 0.0-0.4s: freezing frost crackle spreading fast, 0.4-0.8s: sharp ice crystals snapping shut, 0.8-1.6s: glassy ice creaking and tinkling shimmer"),
 ("jutsux-doku", 1.8, "toxic fog jutsu, 0.0-0.3s: wet bubbling hiss, 0.3-1.4s: thick poisonous gas spraying and spreading with sizzling acid bubbles, 1.4-1.8s: lingering gurgle"),
 ("jutsux-yugami", 2.0, "dark seal breaking with digital glitch, 0.0-0.3s: cloth hood pulled back swish, 0.3-0.6s: sharp seal shattering crack, 0.6-1.6s: intense glitch distortion, bitcrushed stutter and warped static surge, 1.6-2.0s: low unstable dimensional hum"),
 ("jutsux-poko", 1.8, "deafening insect buzz jutsu, 0.0-0.3s: rapid wing flutter building up, 0.3-1.5s: piercing loud cicada screech with a pulsing sonic shockwave, 1.5-1.8s: ringing ear tinnitus fade"),
 ("jutsux-utsushi", 1.3, "wind gathering from the ground then branching into three swirling wisps"),
 ("jutsux-keshin", 1.3, "lightning aura igniting around a fighter, 0.0-0.2s: sharp grounded electric pop, 0.2-0.7s: bolts climb and crackle with a strong bass pulse, 0.7-1.3s: quick warm fizz trailing off"),
 ("yugami-rehood", 1.6, "unstable glitch powering down, 0.0-0.6s: stuttering digital glitch static and warped tones, 0.6-1.1s: energy being sucked back in reverse whoosh, 1.1-1.6s: soft cloth hood rustle and a quiet sealing click"),
]
pedidos = set(sys.argv[1:]); os.makedirs(OUT, exist_ok=True); ok = 0
for n, d, t in SONS:
    if pedidos and n not in pedidos: continue
    dest = os.path.join(OUT, n + ".wav")
    if os.path.exists(dest) and os.path.getsize(dest) > 1000: continue
    body = json.dumps({"text": t + BASE.format(d=d), "duration_seconds": d, "prompt_influence": 0.8})
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
