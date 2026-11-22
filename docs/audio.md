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

## Vozes por ninja (sem palavras)
`tools/gen_voz.py` gera 4 tipos × 2 variações por ninja (`voz-<ninja>-jutsu|golpe|dor|queda_<n>`): 4 timbres masculinos (Kaen, Raiden, Iwao, Doku), 4 femininos (Mizuha, Fuuka, Mayoi, Hiyori) e o Poko com chiado de inseto. `sfx.voz(u,tipo,chance)` em `js/audio.js`: kiai em todo jutsu, grito de golpe em 30% dos básicos / 70% dos Fortes / 60% das perseguições, grunhido de dor em 30% dos golpes que não matam, gemido ao cair em 100%. Nunca duas ao mesmo tempo (350ms). Pra desligar tudo, comente a linha `voz,` no objeto `sfx`. `voz-kiai/dor/esforco/vitoria` (os genéricos de teste) ficam sem uso.

## Música
Faixas do ElevenLabs em `audio/music/` (OGG, ~2,3MB cada): `menu` (hub/mapa/formação/galeria, `musMenu`, volume .35, não reinicia ao trocar de tela) e uma por missão em `MUSF` (`js/audio.js`): 1 `batalha1`, 2 `batalha2`, 3 `batalha3`, 4 `batalha4`, 5 `batalhaepica`. Toca com `xloop` (dois `<audio>` com crossfade de 3s no fim, que esconde o corte seco das faixas do ElevenLabs), volume .45, e respeita o botão de som. Sem a faixa, cai na música sintetizada (`musTick`). As faixas foram aparadas do silêncio no começo e no fim (vinham com até 10s sobrando); faixa nova: `ffmpeg -i x.ogg -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse" -c:a libvorbis -q:a 5 y.ogg`.
Guardadas sem uso: `overture.ogg` (o menu antigo, Shadow Blade Overture) e `funny.ogg` (pra alguma ocasião futura).
Cortar trecho (início, fim, fade) de qualquer áudio: `tools/audio/cortar.sh` (pergunta por arquivo, gera `<nome>_corte.ogg`).
Converter WAV novo: `tools/audio/converter.sh` (roda na pasta dos WAV, pergunta o nome de cada um; Enter mantém o nome).

## Variações
`VAR` em `js/audio.js` diz quantas versões cada som base tem (`swing` 11, `hit` 7, `heavy` 6, `cast` 8, `heal` 5, `shield` 5, `chase` 3): as geradas pela API + as que ele baixou à mão no site. Som novo de variação: WAV em `tools/audio/src/sfx/<nome>_<n>.wav`, rodar `convert_sfx.py` (só converte o que mudou) e subir o número em `VAR`.

## Skill
`tools/skills/audio-jogo-web.skill` guarda esses aprendizados (prompts, API, conversão, integração) pra reusar em outros jogos; instalar em claude.ai > Configurações > Skills.
