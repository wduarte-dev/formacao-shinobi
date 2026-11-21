# Pipeline de sprites (v2)

```
cd tools/sprites
python3 shinobi_atlas.py config/<ninja>.json          # lê src/<ninja>/, escreve out/
```
Saída em `out/` (ignorada pelo git): `<ninja>_atlas.png/.json`, `_fx.png/.json`, `_preview.png`, `_fx_preview.png`. Conferir a prévia (linha verde = chão y=150, tique vermelho = x=96). O log avisa contagem diferente, frames descartados e clipping. Na integração, copiar `_atlas.png`/`_fx.png` pra `spr/` e registrar em `SH` (`js/sprites.js`) a partir do JSON.

Dependências: `pip install numpy pillow scipy`.

## O que ele faz sozinho
- Chroma key (fundo = puxa pro verde E perto do verde do próprio sheet; aceita JPG e células de verde diferente). Apaga linhas de grade e o rótulo "NINJA - LOTE X".
- Corta a grade N x M no mínimo da projeção; maior componente = corpo, pedaços próximos (anéis, cabelo, brilho) entram junto. Descarta frames fantasma (< 35% da mediana da linha) e speckles.
- Despill; `teal_fix` opcional puxa turquesa pra azul-gelo.
- Normaliza escala pela altura do boneco nas linhas `ref` → `body_h` 115 px.
- Pés: anims no chão alinham pé em x=96; `cell` (dash, strong, dodge, defeat, knockback, launched, knockdown, chase) mantêm deslocamento; aéreas usam o pé mais baixo da linha.
- Idle parado → respiração automática. Ampliação ganha UnsharpMask. Lote D: alpha suave, célula 288x192.

## Ajustes que exigem olho (no config)
- **`ref` por sheet** quando não há pose de pé limpa (lote C!): frames retos, ex. `["launched:0,1"]`, `["knockdown:5,6,7","chase:0,7"]`. Pose agachada como ref = boneco gigante.
- `use` / `drop` por anim (índices dos frames detectados), `scale_mul` por sheet, `fps`/`loop`/`anchor`/`air`/`breathe` por anim, `fx.use_cols`, `key_t` (padrão 38), `teal_fix`.

Configs validados (um por ninja): `config/<ninja>.json` dos 9 (o do Kaen inclui o lote E aéreo). Poko: rodar `clean_labels.py` antes (legendas que a IA escreveu nas células → `src/poko/clean/`).
- `ghost` por sheet (padrão 0.35): fração da mediana abaixo da qual o frame é descartado; baixe (0.05) quando a anim tem frames só de partículas (dodge da Mayoi).
- `cols_out` no config: colunas do atlas de saída (padrão 8). Use quando o sheet tem mais frames por linha (ex.: lote E do Kaen, 10).
- Rótulo numa faixa escura da largura toda (Raiden) também é apagado.
- Integração: copiar `out/<ninja>_atlas.png` pra `spr/` e colar a linha do ninja no objeto `V2` de `js/sprites.js` (`nome:[linha, quadros, fps, loop, pingpong]`, gerado do JSON). Nomes do pipeline viram nomes do jogo via `V2MAP` (dash→move, attack→atk1, jutsu→atk2, strong→atk3, seals→cast, defeat→die). Os sheets antigos (fundo xadrez, Dark Ninja) foram removidos do repo.
- **Correções de 21/11/2026 (acabamento de sprites):** detector de linha de grade só apaga linha **fina e contínua** (antes apagava colunas que atravessavam corpos empilhados: Doku cortado, jutsu da Fuuka partido, esquiva da Mizuha picotada); nos efeitos (`key_soft`) segue o critério antigo. Faixa fina encostada no topo da célula (moldura) é apagada. Pedaço solto que atravessa a divisa da célula (sobra do frame vizinho) é descartado.
- `erase` por sheet: `[[x0,y0,x1,y1], ...]` em px do sheet de origem, apaga lixo que a IA desenhou (cabeça flutuante na vitória e borrão no dano do Raiden).
- `color_ref` por sheet (ex.: `"A1.jpg"`): iguala a cor (média/desvio em Lab, só nos pixels do personagem) ao sheet de referência. Usado no Kaen (B2, C), Hiyori (B2, C) e Poko (A2…C). `color_amt` (0–1) suaviza.
- `outline` por sheet (ex.: `0.35`): escurece o anel de 1px da borda do sprite já redimensionado; devolve o contorno de pixel art a sheets que vieram de imagem pequena/sem contorno (Hiyori B2/C, Poko A2…C).
- `breathe: "first"` (idle): usa só o 1º frame e aplica a respiração vertical (metade de cima sobe 3 px). Usar quando o idle gerado balança de lado (Mizuha e Iwao usam).
