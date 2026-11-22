# Áudio (efeitos, ambiente e música)

## Fluxo dos efeitos sonoros
1. **Prompts:** `docs/prompts-sfx.md` (gerado por script; cada prompt começa com 20 caracteres únicos, que viram o nome do arquivo quando baixado à mão no site).
2. **Gerar:** `python3 tools/gen_sfx.py [limite]` chama a API do ElevenLabs (`/v1/sound-generation`, WAV 44.1k, influência 100%) e salva em `tools/audio/src/sfx/<id>.wav`, pulando o que já existe. A API aceita duração de 0,5 a 30s (pedidos menores saem com 0,5 e o conversor corta). Na nuvem a chave é injetada pelo proxy (header `xi-api-key`); local, exporte `ELEVEN_KEY`. Custo observado: ~30 créditos por som pela API (no site, 80 por clique com 4 versões).
3. **Converter:** `python3 tools/audio/convert_sfx.py` → `audio/sfx/<id>.ogg`: apara silêncio, corta no tempo pedido, fade no fim, pico em -3 dBFS, e os ambientes (`amb-*`) ganham crossfade de 1,5s pra emendar o loop. 34MB de WAV viram ~3,4MB de OGG.
4. **Tocar:** `js/audio.js`. `SFILES` lista os arquivos carregados; `sfx.<evento>(...)` toca o arquivo (sorteando entre variações `_1/_2/_3`, com leve variação de tom) e, se ele não existir ou não carregou, cai no som sintetizado (`SYN`). Por `file://` (sem fetch) usa `<audio>` direto.

## Onde cada som toca
| Evento | Arquivo | Onde |
|---|---|---|
| básico / Forte | `<ninja>-atk`, `<ninja>-forte` (senão `hit_*`) | `doSkill` |
| selos do jutsu | `selos-<elemento>` | `cine` |
| jutsu | `jutsu-<elemento>` + `impacto-<elemento>` + `heavy_*` | `doSkill` |
| projétil (básico à distância) | `proj-<elemento>` | `doSkill` |
| perseguição | `chase-pronta` ao entrar, `<ninja>-chase` no golpe, `combo-1..4` no rótulo | `chain`, `comboLine` |
| estados | `knock-D/L/R`, `parede-racha` (Repelido bate na borda), `thud` | `knock` |
| esquiva | `esq-<ninja>` | `evade` |
| veneno/queimadura | `aplic-*` ao aplicar, `dot-burn`/`dot-poison` por rodada | `doSkill`, `run` |
| escudo | `shield`, `escudo-absorve`, `escudo-quebra` | `doSkill`, `hurt` |
| morte, vida < 25%, último ninja | `ninja-derrota`, `vida-baixa`, `sting-ultimo` | `hurt` |
| rodada | `rodada-inicio` + `chakra-ganho` | `run` |
| início/fim/resultado | `start`, `end`, `win`/`lose`, `ui-desbloqueio` | `intro`, `run` |
| interface | `ui-titulo/clique/cancela/confirma/missao/pegar/soltar` | `screens.js` |
| ambiente | `amb-<cenário>` em loop (volume .35) | `startBattle` → `ambSndStart` |

Gerados e ainda sem uso (dá pra ligar quando a mecânica existir): `dot-bleed/frost/shock`, `chase-inicio`, `dash`, `shunshin`, `pouso`, `kunai-madeira`, `shuriken-ricochete`, `papel-explosivo`, `fumaca-sumir`, `sting-chefe/missao/perfeito`, `ui-estrela-*`, `ui-recompensa`, `ui-hover/invalido/trocar/pergaminho/auto/2x`, `voz-*`.

## Música
`MUSF` em `js/audio.js` (índice da missão → `audio/music/<nome>.ogg`). Vazio = música sintetizada (`musTick`). As faixas do ElevenLabs estão no Drive dele em WAV (~34MB cada, grande demais pro repo e pro conector do Drive). Pra entrar: converter no PC e commitar o OGG (~3MB):
```bash
ffmpeg -i "Shinobi Showdown.wav" -c:a libvorbis -q:a 5 audio/music/batalha1.ogg
```
Depois listar em `MUSF` (ex.: `['batalha1','batalha1','batalha1','batalha2','batalha2']`). Toca em `<audio loop>` (volume .45), respeitando o botão de som (`sndApply`).
