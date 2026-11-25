# Prompts de efeitos sonoros (ElevenLabs SFX)

Como usar: cada bloco é um prompt pronto (sufixo e duração já embutidos). **Influência = 100%** e o **controle de duração = o número do prompt** (ex.: `0.5` segundos). O ElevenLabs gera 4 por prompt: salve todos (o nome do arquivo vira os 20 primeiros caracteres do prompt, por isso cada um começa diferente) e o jogo sorteia entre as variações. Se um som usar só metade do tempo, suba a duração do controle e eu corto no ajuste.

Já baixados à mão (não estão aqui): swing, hit, heavy, chase, cast, heal, shield. Este arquivo é o resto, incluindo os 9 jutsus e os 9 sons base que faltavam (**140 prompts**, ~560 sons).


## 0. Base e jutsus que faltam (prioridade máxima)

**shoot** · 0.5s
```
fast kunai throw whistling zip, 0.0-0.1s: sharp release snap, 0.1-0.5s: whistling projectile zipping away, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**state** · 0.4s
```
short electric status sting, 0.0-0.1s: quick electric zap, 0.1-0.4s: bright metallic ping, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**arm** · 0.3s
```
very subtle bright ready ping, tiny rising blip, power-up tick, soft and discreet, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.3 seconds long, cuts off cleanly at the end
```

**dot** · 0.5s
```
small sizzling poison and burning tick, 0.0-0.15s: short sizzle pulse, 0.15-0.5s: faint bubbling crackle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**thud** · 0.8s
```
heavy body falling hard on the ground, 0.0-0.1s: dull heavy thump, 0.1-0.5s: scraping slide and dust, 0.5-0.8s: small settling bounce, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.8 seconds long, cuts off cleanly at the end
```

**start** · 2s
```
deep taiko drum hit with a rising gong swell, 0.0-0.3s: powerful taiko strike, 0.3-1.7s: gong swell rising with tension, 1.7-2.0s: swell peaks and cuts off, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 2 seconds long, cuts off cleanly at the end
```

**end** · 2s
```
final taiko drum hit with a low gong fading, 0.0-0.3s: heavy final taiko strike, 0.3-1.7s: low gong resonating and decaying, 1.7-2.0s: gong ends, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 2 seconds long, cuts off cleanly at the end
```

**win** · 4s
```
triumphant short victory fanfare, 0.0-1.0s: bold taiko hits and shamisen rising phrase, 1.0-3.0s: bright heroic flute and strings melody, 3.0-4.0s: final triumphant chord and cymbal, game sound effect, slightly stylized anime action, exactly 4 seconds long, ends cleanly
```

**lose** · 4s
```
somber defeat sting, 0.0-1.0s: heavy single drum hit, 1.0-3.0s: low descending shamisen and cello notes, 3.0-4.0s: dying low gong, game sound effect, slightly stylized anime action, exactly 4 seconds long, ends cleanly
```

**jutsu-fogo** · 2s
```
roaring fire dragon jutsu, 0.0-0.4s: sharp ignition whoosh, 0.4-1.6s: roaring flame stream with crackling embers, 1.6-2.0s: fiery burst, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 2 seconds long, cuts off cleanly at the end
```

**jutsu-agua** · 2s
```
gentle healing rain shower jutsu, 0.0-0.5s: soft water swell, 0.5-1.5s: gentle rain pattering with soft sparkling chimes, 1.5-2.0s: calm droplets, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 2 seconds long, cuts off cleanly at the end
```

**jutsu-raio** · 1.5s
```
sharp lightning blade jutsu, 0.0-0.2s: crackling charge, 0.2-0.5s: violent thunder slash crack, 0.5-1.5s: electric arcs sizzling and fading, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.5 seconds long, cuts off cleanly at the end
```

**jutsu-terra** · 2s
```
massive stone wall erupting from the ground, 0.0-0.3s: deep rumble, 0.3-1.2s: heavy rocks grinding and rising, 1.2-1.6s: huge stone impact slam, 1.6-2.0s: settling pebbles, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 2 seconds long, cuts off cleanly at the end
```

**jutsu-vento** · 2s
```
violent cutting wind tornado jutsu, 0.0-0.4s: rising howl, 0.4-1.6s: fierce spinning wind with sharp slicing blade swishes, 1.6-2.0s: wind bursts, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 2 seconds long, cuts off cleanly at the end
```

**jutsu-nevoa** · 2.5s
```
eerie dark mist rolling in, 0.0-0.8s: low airy hush rising, 0.8-2.0s: ghostly whispering wind and soft eerie drone swelling, 2.0-2.5s: hushed fade, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 2.5 seconds long, cuts off cleanly at the end
```

**jutsu-gelo** · 1.8s
```
ice prison freezing, 0.0-0.4s: icy whoosh swirl, 0.4-1.2s: rapid crackling ice forming and crystals growing, 1.2-1.5s: sharp glassy freeze snap, 1.5-1.8s: faint tinkling, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.8 seconds long, cuts off cleanly at the end
```

**jutsu-veneno** · 2s
```
bubbling toxic gas hiss, 0.0-0.4s: sharp hissing release, 0.4-1.6s: bubbling acid and sickly sizzling gas cloud, 1.6-2.0s: lingering wet crackle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 2 seconds long, cuts off cleanly at the end
```

**jutsu-som** · 1.8s
```
piercing ear-splitting buzz jutsu, 0.0-0.3s: sharp sonic burst, 0.3-1.5s: intense vibrating high-pitched buzzing with warbling resonance, 1.5-1.8s: abrupt cutoff, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.8 seconds long, cuts off cleanly at the end
```


## 1. Golpe básico por ninja (atk1)

**kaen-atk** · 0.5s
```
fiery punch impact, 0.0-0.1s: knuckle crunch with a burst of flame, 0.1-0.5s: short ember crackle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**mizuha-atk** · 0.5s
```
wet water slap impact, 0.0-0.1s: sharp splashing smack, 0.1-0.5s: droplets scattering, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**raiden-atk** · 0.5s
```
electric slash impact, 0.0-0.1s: sharp blade crack with a zap, 0.1-0.5s: fading static sizzle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**iwao-atk** · 0.5s
```
stone fist impact, 0.0-0.1s: heavy rocky thud, 0.1-0.5s: gravel crumbling, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**fuuka-atk** · 0.5s
```
wind-blade slice impact, 0.0-0.1s: sharp airy cut, 0.1-0.5s: fading gust, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**mayoi-atk** · 0.5s
```
misty ghost strike, 0.0-0.1s: soft hollow thump, 0.1-0.5s: airy whispering hiss, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**hiyori-atk** · 0.5s
```
icy shard strike, 0.0-0.1s: sharp glassy crack, 0.1-0.5s: tiny tinkling ice bits, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**doku-atk** · 0.5s
```
venom needle jab, 0.0-0.1s: quick thin stab, 0.1-0.5s: wet sickly sizzle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**poko-atk** · 0.5s
```
sonic pulse punch, 0.0-0.1s: tight concussive pop, 0.1-0.5s: ringing vibrating decay, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```


## 2. Golpe Forte (strong)

**iwao-forte** · 1.0s
```
massive stone fist punch, 0.0-0.25s: heavy grinding wind-up of rock gauntlets, 0.25-0.45s: huge crunching rock impact thump, 0.45-1.0s: pebbles scattering and a deep rumble decay, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.0 seconds long, cuts off cleanly at the end
```

**fuuka-forte** · 0.9s
```
spinning wind blade finisher, 0.0-0.5s: whirling slashes building up, 0.5-0.9s: one sharp final cut, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**mayoi-forte** · 0.9s
```
rolling mist shockwave blast, 0.0-0.2s: soft deep whoomph, 0.2-0.9s: ghostly hiss expanding outward, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**hiyori-forte** · 0.9s
```
freezing touch strike, 0.0-0.2s: icy snap, 0.2-0.9s: rapid frost crackle spreading, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**doku-forte** · 0.9s
```
rapid poison needles volley, 0.0-0.6s: quick thin whistling thunks, 0.6-0.9s: wet sizzle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**poko-forte** · 1s
```
shrill stridulation sonic screech, 0.0-0.3s: high pitched piercing burst, 0.3-1.0s: vibrating shockwave decay, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1 seconds long, cuts off cleanly at the end
```


## 3. Perseguições (chase) por ninja

**kaen-chase** · 1.6s
```
meteor kick dive, 0.0-0.7s: rising flame whoosh, 0.7-1.2s: falling fireball roar, 1.2-1.6s: heavy fiery crash, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.6 seconds long, cuts off cleanly at the end
```

**mizuha-chase** · 1.4s
```
crashing wave strike, 0.0-0.7s: water surge swelling, 0.7-1.0s: huge slamming splash, 1.0-1.4s: water draining, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.4 seconds long, cuts off cleanly at the end
```

**raiden-chase** · 1.2s
```
lightning hook strike, 0.0-0.6s: thunder crackle zapping across distance, 0.6-0.9s: stunning punch crack, 0.9-1.2s: static fizz, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.2 seconds long, cuts off cleanly at the end
```

**iwao-chase** · 1.5s
```
stone body slam, 0.0-0.7s: heavy leap whoosh rising, 0.7-1.0s: ground-shaking crash, 1.0-1.5s: rock debris falling, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.5 seconds long, cuts off cleanly at the end
```

**fuuka-chase** · 1.2s
```
whirlwind spin kick, 0.0-0.7s: spinning gust building, 0.7-1.2s: sharp slicing burst, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.2 seconds long, cuts off cleanly at the end
```

**mayoi-chase** · 1.5s
```
swarm of moths storm, 0.0-1.0s: fluttering wings swelling with papery rustle, 1.0-1.5s: soft burst scattering, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.5 seconds long, cuts off cleanly at the end
```

**hiyori-chase** · 1.3s
```
ice pillar eruption, 0.0-0.6s: sharp crackling ice rising, 0.6-0.9s: loud glassy shatter, 0.9-1.3s: falling shards, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.3 seconds long, cuts off cleanly at the end
```

**doku-chase** · 1s
```
venomous stinger strike, 0.0-0.3s: quick sharp stab, 0.3-1.0s: wet sizzling poison squirt, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1 seconds long, cuts off cleanly at the end
```

**poko-chase** · 1s
```
lightning scythe slash, 0.0-0.4s: rapid sonic whoosh, 0.4-0.6s: high crack of a blade, 0.6-1.0s: ringing decay, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1 seconds long, cuts off cleanly at the end
```


## 4. Selos de mão por elemento (antes do jutsu)

**selos-fire** · 0.9s
```
fire hand seals, rapid cloth rustle with finger snaps and a low ember swell, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**selos-water** · 0.9s
```
water hand seals, rapid cloth rustle with finger snaps and rippling water swell, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**selos-lightning** · 0.9s
```
lightning hand seals, rapid cloth rustle with finger snaps and building static crackle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**selos-earth** · 0.9s
```
earth hand seals, rapid cloth rustle with finger snaps and a deep rumble rising, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**selos-wind** · 0.9s
```
wind hand seals, rapid cloth rustle with finger snaps and a rising airy gust, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**selos-mist** · 0.9s
```
mist hand seals, rapid cloth rustle with finger snaps and a ghostly hush rising, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**selos-ice** · 0.9s
```
ice hand seals, rapid cloth rustle with finger snaps and a frosty crackle building, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**selos-poison** · 0.9s
```
poison hand seals, rapid cloth rustle with finger snaps and a sickly bubbling hiss, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**selos-sound** · 0.9s
```
sound hand seals, rapid cloth rustle with finger snaps and a rising high-pitched hum, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```


## 5. Camada de impacto por elemento

**impacto-fire** · 0.6s
```
fire impact burst, 0.0-0.1s: whoomph burst, 0.1-0.6s: crackling embers, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**impacto-water** · 0.6s
```
water impact burst, 0.0-0.1s: heavy splash slam, 0.1-0.6s: droplets raining, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**impacto-lightning** · 0.6s
```
lightning impact burst, 0.0-0.1s: thunder crack, 0.1-0.6s: electric arcs fizzing, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**impacto-earth** · 0.6s
```
earth impact burst, 0.0-0.1s: boulder crash, 0.1-0.6s: rocks tumbling, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**impacto-wind** · 0.6s
```
wind impact burst, 0.0-0.1s: explosive gust burst, 0.1-0.6s: fading whistling wind, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**impacto-mist** · 0.6s
```
mist impact burst, 0.0-0.1s: soft hollow boom, 0.1-0.6s: hissing mist dispersing, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**impacto-ice** · 0.6s
```
ice impact burst, 0.0-0.1s: loud glassy shatter, 0.1-0.6s: tinkling ice shards, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**impacto-poison** · 0.6s
```
poison impact burst, 0.0-0.1s: wet splat, 0.1-0.6s: bubbling acid fizz, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**impacto-sound** · 0.6s
```
sound impact burst, 0.0-0.1s: concussive sonic boom, 0.1-0.6s: ringing reverberating buzz, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```


## 6. Projétil por elemento (shoot)

**proj-fire** · 0.5s
```
fire projectile shot, small fireball whooshing with a crackling trail, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**proj-water** · 0.5s
```
water projectile shot, water bullet zipping with a wet whistle, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**proj-lightning** · 0.5s
```
lightning projectile shot, electric bolt zapping with a sharp crack, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**proj-earth** · 0.5s
```
earth projectile shot, rock shard flying with a heavy whoosh, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**proj-wind** · 0.5s
```
wind projectile shot, wind blade slicing past with a thin whistle, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**proj-mist** · 0.5s
```
mist projectile shot, ghostly orb gliding with a soft airy hush, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**proj-ice** · 0.5s
```
ice projectile shot, ice spear whizzing with a glassy whistle, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**proj-poison** · 0.5s
```
poison projectile shot, poison dart flying with a wet hiss, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**proj-sound** · 0.5s
```
sound projectile shot, sonic ring pulsing outward with a high warble, cuts off at the end, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```


## 7. Esquiva por ninja

**esq-kaen** · 0.4s
```
fire ninja dodge, quick whoosh with a brief flame flicker afterimage, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**esq-mizuha** · 0.4s
```
water ninja dodge, splashy water ripple swish, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**esq-raiden** · 0.4s
```
lightning ninja dodge, blink of an electric zip, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**esq-iwao** · 0.4s
```
stone ninja dodge, heavy short sidestep with gravel scrape, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**esq-fuuka** · 0.4s
```
wind ninja dodge, light gust whirl, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**esq-mayoi** · 0.4s
```
mist ninja dodge, ghostly airy vanish hush, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**esq-hiyori** · 0.4s
```
ice ninja dodge, tiny frost chime slide, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**esq-doku** · 0.4s
```
poison ninja dodge, slippery hiss slide, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**esq-poko** · 0.4s
```
sound ninja dodge, ultra fast sonic blip whoosh, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```


## 8. Dano contínuo e estados aplicados

**dot-burn** · 0.5s
```
burning damage tick, short flame flicker with a sizzle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**dot-poison** · 0.5s
```
poison damage tick, wet bubbling pulse, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**dot-bleed** · 0.5s
```
bleeding damage tick, small sharp slice with a drip, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**dot-frost** · 0.5s
```
frostbite damage tick, brittle icy crackle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**dot-shock** · 0.5s
```
shock damage tick, tiny electric zap pulse, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**aplic-stun** · 0.7s
```
stun applied, dizzy electric buzz with a sharp ding, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.7 seconds long, cuts off cleanly at the end
```

**aplic-poison** · 0.6s
```
poison applied, wet bubbling splat with a sickly hiss, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**aplic-burn** · 0.6s
```
burning applied, whoomph of ignition with crackle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**aplic-freeze** · 0.6s
```
freeze applied, quick icy crackle ending in a glass snap, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```


## 9. Estados D / L / R, escudo e mecânica

**knock-D** · 0.9s
```
knocked down tumble, 0.0-0.2s: body hitting dirt, 0.2-0.9s: rolling with a dust puff, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**knock-L** · 0.9s
```
launched into the air, 0.0-0.3s: sharp upward whoosh, 0.3-0.9s: spinning fluttering rise, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.9 seconds long, cuts off cleanly at the end
```

**knock-R** · 1.2s
```
repelled blast flying to the edge, 0.0-0.6s: long horizontal whoosh, 0.6-0.8s: stone wall crack, 0.8-1.2s: rubble falling, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.2 seconds long, cuts off cleanly at the end
```

**parede-racha** · 0.8s
```
stone wall cracking from a heavy impact, sharp crack then falling rubble, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.8 seconds long, cuts off cleanly at the end
```

**escudo-quebra** · 0.8s
```
energy shield shattering, glassy crack then falling shards, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.8 seconds long, cuts off cleanly at the end
```

**escudo-absorve** · 0.5s
```
attack absorbed by a barrier, dull thump with a crystalline ring, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**chakra-ganho** · 0.6s
```
chakra gain, soft rising whoosh with a light sparkle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**combo-1** · 0.4s
```
first combo tick, crisp low-pitched metallic tick, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**combo-2** · 0.4s
```
second combo tick, crisp medium-pitched metallic tick with a small shimmer, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**combo-3** · 0.4s
```
third combo tick, crisp higher-pitched metallic tick with a shimmer, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**combo-4** · 0.5s
```
fourth or higher combo tick, bright high-pitched ting with a sparkling flourish, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.5 seconds long, cuts off cleanly at the end
```

**chase-pronta** · 0.6s
```
chase opportunity alert, sharp bright glint with a quick whoosh, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**chase-inicio** · 1s
```
chase cinematic slow-motion, deep whoomph with a time-slowing hum, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1 seconds long, cuts off cleanly at the end
```

**ninja-derrota** · 1.2s
```
ninja defeated, short low thump of a body falling followed by a soft puff, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.2 seconds long, cuts off cleanly at the end
```

**fumaca-sumir** · 0.8s
```
smoke puff vanish, soft poof with a hissing fade and cloth flutter, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.8 seconds long, cuts off cleanly at the end
```

**vida-baixa** · 1.2s
```
low health warning, two deep heartbeat thumps pulsing, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1.2 seconds long, cuts off cleanly at the end
```

**rodada-inicio** · 1s
```
new round banner swoosh, 0.0-0.3s: wooden drum hit, 0.3-1.0s: brush whoosh, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1 seconds long, cuts off cleanly at the end
```


## 10. Movimento e itens

**dash** · 0.4s
```
ninja dash whoosh, quick cloth rush with a short wind streak, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**shunshin** · 0.6s
```
body flicker teleport, quick whoosh into a soft smoke puff, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**pouso** · 0.4s
```
ninja landing from a jump, soft light thud with a little dust, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**kunai-madeira** · 0.4s
```
kunai sticking into wood, sharp thunk with a short metallic vibration, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**shuriken-ricochete** · 0.6s
```
shuriken ricochet, metallic ting bounce with a spinning whir, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**papel-explosivo** · 1s
```
explosive paper tag, 0.0-0.3s: short fizzing fuse, 0.3-0.6s: sharp explosion, 0.6-1.0s: debris pattering, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1 seconds long, cuts off cleanly at the end
```


## 11. Interface

**ui-clique** · 0.2s
```
wooden button click, crisp short tap on wood, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.2 seconds long, cuts off cleanly at the end
```

**ui-hover** · 0.15s
```
soft paper rustle tick, tiny light touch, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.15 seconds long, cuts off cleanly at the end
```

**ui-confirma** · 0.4s
```
confirm accept, bright bamboo clack with a soft chime, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**ui-cancela** · 0.3s
```
cancel back, low wooden knock with a downward tick, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.3 seconds long, cuts off cleanly at the end
```

**ui-invalido** · 0.3s
```
invalid action buzz, short dull wooden thunk with a dissonant blip, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.3 seconds long, cuts off cleanly at the end
```

**ui-pegar** · 0.3s
```
picking up a ninja card, soft paper lift swish, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.3 seconds long, cuts off cleanly at the end
```

**ui-soltar** · 0.3s
```
placing a ninja card on a formation slot, firm wood tap with a small click, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.3 seconds long, cuts off cleanly at the end
```

**ui-trocar** · 0.4s
```
swapping two ninja cards, quick double paper swish, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.4 seconds long, cuts off cleanly at the end
```

**ui-desbloqueio** · 1.5s
```
ninja unlocked reveal, shimmering chime rising with a deep taiko hit, game sound effect, slightly stylized anime action, exactly 1.5 seconds long, ends cleanly
```

**ui-missao** · 0.6s
```
map node selected, soft gong tap with a scroll rustle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**ui-pergaminho** · 0.7s
```
opening a scroll menu, paper unrolling swish, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.7 seconds long, cuts off cleanly at the end
```

**ui-auto** · 0.3s
```
auto mode toggle on, short mechanical click with a rising blip, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.3 seconds long, cuts off cleanly at the end
```

**ui-2x** · 0.3s
```
speed up toggle, quick fast-forward whoosh blip, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.3 seconds long, cuts off cleanly at the end
```

**ui-estrela-1** · 0.8s
```
star earned one, bright glinting chime at low pitch, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.8 seconds long, cuts off cleanly at the end
```

**ui-estrela-2** · 0.8s
```
star earned two, bright glinting chime at medium pitch, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 0.8 seconds long, cuts off cleanly at the end
```

**ui-estrela-3** · 1s
```
star earned three, bright glinting chime at high pitch with a sparkle, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1 seconds long, cuts off cleanly at the end
```

**ui-recompensa** · 1s
```
reward counter ticking, rapid light coin-like ticks, crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly 1 seconds long, cuts off cleanly at the end
```

**ui-titulo** · 1.5s
```
game start button press, deep taiko with a sparkling gong, game sound effect, slightly stylized anime action, exactly 1.5 seconds long, ends cleanly
```


## 12. Stingers (música curta permitida)

**sting-chefe** · 2.5s
```
boss appearing sting, ominous low taiko roll rising into a deep brass hit, game sound effect, slightly stylized anime action, exactly 2.5 seconds long, ends cleanly
```

**sting-ultimo** · 2s
```
last ninja standing sting, tense single shamisen note over a slow heartbeat drum, game sound effect, slightly stylized anime action, exactly 2 seconds long, ends cleanly
```

**sting-perfeito** · 3s
```
perfect victory sting, bright shamisen and bells flourish, game sound effect, slightly stylized anime action, exactly 3 seconds long, ends cleanly
```

**sting-missao** · 2s
```
mission title card reveal, brush stroke whoosh then a deep gong, game sound effect, slightly stylized anime action, exactly 2 seconds long, ends cleanly
```


## 13. Ambientes em loop (um por cenário)

**amb-sakura** · 15s
```
gentle spring breeze through cherry blossoms, soft leaves rustling, distant birds, seamless loop, steady, no sudden loud events, no music, no voice, game ambience, 15 seconds long
```

**amb-santuario** · 15s
```
quiet shrine courtyard, faint wind chimes ringing, distant temple bell, light breeze, seamless loop, steady, no sudden loud events, no music, no voice, game ambience, 15 seconds long
```

**amb-noite** · 15s
```
night forest, crickets chirping, soft owl hoots, quiet wind, seamless loop, steady, no sudden loud events, no music, no voice, game ambience, 15 seconds long
```

**amb-floresta** · 15s
```
dense bamboo forest, wind through bamboo creaking, birds calling, seamless loop, steady, no sudden loud events, no music, no voice, game ambience, 15 seconds long
```

**amb-cinzas** · 15s
```
burning ashen wasteland, embers crackling, low wind howl, distant rumble, seamless loop, steady, no sudden loud events, no music, no voice, game ambience, 15 seconds long
```


## 14. Vozes sem palavras (teste)

**voz-kiai** · 0.8s
```
short powerful male ninja battle shout, 0.0-0.1s: sharp breath intake, 0.1-0.6s: one aggressive kiai yell, 0.6-0.8s: abrupt cutoff, crisp, dry, no reverb tail, no music, no words, game sound effect, slightly stylized anime action, exactly 0.8 seconds long, cuts off cleanly at the end
```

**voz-dor** · 0.6s
```
short male grunt of pain when hit, 0.0-0.3s: sharp pained exhale, 0.3-0.6s: breathy groan, crisp, dry, no reverb tail, no music, no words, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**voz-esforco** · 0.6s
```
short female ninja effort grunt while striking, one sharp exhale with a light vocal push, crisp, dry, no reverb tail, no music, no words, game sound effect, slightly stylized anime action, exactly 0.6 seconds long, cuts off cleanly at the end
```

**voz-vitoria** · 1.2s
```
heroic victory shout, short, 0.0-0.2s: breath, 0.2-1.0s: heroic confident cheer without words, 1.0-1.2s: cutoff, crisp, dry, no reverb tail, no music, no words, game sound effect, slightly stylized anime action, exactly 1.2 seconds long, cuts off cleanly at the end
```


## 15. Jutsu próprio de cada ninja e capuz do Yugami (`tools/gen_jutsu_sfx.py`)

**jutsux-kaen** · 2.0s
```
fire dragon jutsu, 0.0-0.3s: deep whoosh of flames igniting, 0.3-1.4s: roaring blaze rushing forward like a dragon breath with crackling embers, 1.4-2.0s: fiery burst fading into crackles, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 2.0 seconds long, cuts off cleanly at the end
```

**jutsux-mizuha** · 2.0s
```
gentle healing rain jutsu, 0.0-0.4s: soft water chime shimmer, 0.4-1.6s: calm light raindrops pattering with a warm magical sparkle, 1.6-2.0s: soft glittering fade, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 2.0 seconds long, cuts off cleanly at the end
```

**jutsux-raiden** · 1.6s
```
lightning blade jutsu, 0.0-0.3s: electric charge crackle rising, 0.3-0.6s: sharp thunder slash crack, 0.6-1.6s: buzzing electric sparks and zaps fading, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 1.6 seconds long, cuts off cleanly at the end
```

**jutsux-iwao** · 2.5s
```
summoning a giant stone golem, 0.0-0.6s: deep earth rumble and ground cracking, 0.6-1.6s: massive boulders grinding and rising from the ground, 1.6-2.5s: heavy stone body settling with a powerful low thud and falling pebbles, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 2.5 seconds long, cuts off cleanly at the end
```

**jutsux-fuuka** · 1.8s
```
cutting typhoon jutsu, 0.0-0.3s: sharp wind gust rising, 0.3-1.4s: violent spinning tornado howl with slicing air whistles, 1.4-1.8s: wind dissipating whoosh, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 1.8 seconds long, cuts off cleanly at the end
```

**jutsux-mayoi** · 2.2s
```
mystic night fog jutsu, 0.0-0.5s: low eerie airy swell, 0.5-1.8s: thick mist spreading with soft fluttering moth wings and a mysterious shimmer, 1.8-2.2s: hushed airy fade, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 2.2 seconds long, cuts off cleanly at the end
```

**jutsux-hiyori** · 1.6s
```
ice prison jutsu, 0.0-0.4s: freezing frost crackle spreading fast, 0.4-0.8s: sharp ice crystals snapping shut, 0.8-1.6s: glassy ice creaking and tinkling shimmer, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 1.6 seconds long, cuts off cleanly at the end
```

**jutsux-doku** · 1.8s
```
toxic fog jutsu, 0.0-0.3s: wet bubbling hiss, 0.3-1.4s: thick poisonous gas spraying and spreading with sizzling acid bubbles, 1.4-1.8s: lingering gurgle, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 1.8 seconds long, cuts off cleanly at the end
```

**jutsux-yugami** · 2.0s
```
dark seal breaking with digital glitch, 0.0-0.3s: cloth hood pulled back swish, 0.3-0.6s: sharp seal shattering crack, 0.6-1.6s: intense glitch distortion, bitcrushed stutter and warped static surge, 1.6-2.0s: low unstable dimensional hum, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 2.0 seconds long, cuts off cleanly at the end
```

**jutsux-poko** · 1.8s
```
deafening insect buzz jutsu, 0.0-0.3s: rapid wing flutter building up, 0.3-1.5s: piercing loud cicada screech with a pulsing sonic shockwave, 1.5-1.8s: ringing ear tinnitus fade, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 1.8 seconds long, cuts off cleanly at the end
```

**yugami-rehood** · 1.6s
```
unstable glitch powering down, 0.0-0.6s: stuttering digital glitch static and warped tones, 0.6-1.1s: energy being sucked back in reverse whoosh, 1.1-1.6s: soft cloth hood rustle and a quiet sealing click, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 1.6 seconds long, cuts off cleanly at the end
```

**jutsux-keshin** · 1.3s
```
lightning aura igniting around a fighter, 0.0-0.2s: sharp grounded electric pop, 0.2-0.7s: bolts climb and crackle with a strong bass pulse, 0.7-1.3s: quick warm fizz trailing off, crisp, punchy, no music, no voice, no speech, game sound effect, stylized anime action, exactly 1.3 seconds long, cuts off cleanly at the end
```

## 15. Kazan — forja de lava

**kazan-pour** · 0.75s
```
Thick molten lava pouring from an iron crucible onto a warm stone anvil, low viscous gurgle followed by three hot sparks and a brief sizzling release, no music or voices, dry game sound.
```

**jutsux-kazan** · 1.35s
```
Blacksmith furnace opening: layered low cracking iron, fluid hot lava spreading over stone, then rising cinders with a quickly fading furnace breath, no music or voices, dry game sound.
```

**kazan-dragon** · 1.55s
```
Lava erupts in a column, then a forged iron eastern dragon roars like a great blast furnace breathing through resonant metal plates, low fiery swoop, sudden cutoff before the eventual landing, no music or words.
```

**kazan-fireball** · 0.65s
```
Short anvil clang followed by four fast diverging fiery whooshes and crackling orange embers, percussive and clear, no music or voice, dry game sound.
```

**kazan-guard** · 0.55s
```
A glowing slab of volcanic rock rises and cracks against a sudden blow, short low rocky thud then a bright split and falling hard sparks, dry, no music or voice.
```
