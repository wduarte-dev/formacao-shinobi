# Prompts de cenário (fundos de batalha)

Ref de estilo: `docs/refs/cenario_ref_sakura.png` (anexar em TODOS; são derivados dela).
Saída vira `bg/<nome>.png` (16:9, redimensionado pra 1152x648). Trocar `bg:` em `FOES` (`js/data.js`).

## Bloco comum (colar no começo de todos)
Use the attached image as STYLE REFERENCE ONLY (same pixel-art look, same palette softness, same camera, same composition). Do NOT copy its content. 16:9, 1376x768, 2D pixel art side-view battle background for a turn-based game. COMPOSITION RULE: the horizon line sits exactly at the vertical middle; the TOP HALF is the scenery (sky, background, buildings/trees at the sides, an open space in the center); the BOTTOM HALF is a flat, empty, slightly textured ground plane with only a few tiny pebbles/grass tufts at the very edges, a thin dark line at the horizon. No characters, no text, no UI, no frame, no watermark, no big objects on the ground.

## Santuário (missão 2, Esquadrão Trovão)
Ruined mountain shrine at dusk under a heavy storm sky: dark purple-grey clouds with a faint lightning glow, broken stone torii gate and mossy stone lanterns at the left and right edges, a cracked temple with a curved roof far in the center, thin rain streaks. Ground: wet grey flagstone dirt with faint puddle reflections. Palette: cold violet, slate, a touch of electric yellow.

## Noite (missão 3, Irmandade do Gelo)
Frozen village at night: huge pale moon, deep blue starry sky with aurora hint, snow-covered pine trees and small wooden houses with warm lit windows at the sides, distant icy mountains, falling snowflakes. Ground: flat packed snow with soft blue shadows. Palette: navy, ice cyan, white, warm orange windows.

## Floresta (missão 4, Guarda Sombria)
Dense dark bamboo forest at twilight: tall thick bamboo stalks framing both sides, fog between the trunks, a narrow dim path vanishing into the center, fireflies, deep green and teal light fading to near black at the top. Ground: dark mossy earth, flat. Palette: deep green, teal, muted yellow-green highlights.

## Cinzas (missão 5, Mestres das Cinzas)
Scorched wasteland: burnt dead trees and collapsed charred ruins at the sides, a distant erupting volcano with glowing lava, sky red-orange with drifting ash and embers. Ground: flat dark grey ash with faint ember specks. Palette: charcoal, ember orange, dull red.

## Dicas
- Se a IA fizer chão com detalhe demais, acrescentar: "ground must stay plain and uniform so sprites stand out".
- Mandar 1 por vez; eu redimensiono, ligo na missão e confiro nos prints.
