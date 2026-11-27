#!/usr/bin/env python3
"""Integra o lote 'outros' do Kaen (KAEN_outros_16: guard, selos, voo, caído, defeat, victory) no atlas.
Rode depois de `python3 tools/sprites/kaen_lote.py` (precisa de scipy). Mesma escala dos golpes (corpo 108 px sobre 203)
e chão fixo em todos os quadros (a célula já vem alinhada pelo torso/chão). hurt reaproveita o quadro do guard.
Poses (0-based): 0 guard, 1 selos, 2-3 voo, 4-5 caído, 6-10 defeat, 11-15 victory."""
import json
from pathlib import Path
from PIL import Image

from atlas_registry import AX, AY, CH, CW, registry
from kaen_lote import OUT, R

ROOT = Path(R)
SCALE = 108 / 203
GROUND = 421   # chão da célula de origem (base dos pés das poses de pé = 420)
# animação do atlas -> poses do sheet
MAP = {'guard': [0], 'seals': [1], 'launched': [2, 3], 'knockback': [2, 3], 'knockdown': [4, 5],
       'defeat': [6, 7, 8, 9, 10], 'victory': [11, 12, 13, 14, 15]}


def main():
    atlas_path = ROOT / 'spr/kaen_atlas.png'
    spec = registry((ROOT / 'js/sprites.js').read_text())['kaen']
    info = json.loads((Path(OUT) / 'outros.json').read_text())
    size, scols = info['cell'], info['cols']
    sheet = Image.open(Path(OUT) / 'outros.png')
    atlas = Image.open(atlas_path).convert('RGBA')
    for name, poses in MAP.items():
        row = spec.animations[name].row
        atlas.paste(Image.new('RGBA', (spec.columns * CW, CH)), (0, row * CH))
        for i, p in enumerate(poses):
            assert not info['quadros'][p]['corta'], f'{name}: pose {p} corta'
            x, y = (p % scols) * size, (p // scols) * size
            g = info['quadros'][p]
            # poses largas (caído, voo) não cabem na célula do atlas se o corpo ficar fora do centro: centra na caixa
            ax = (g['l'] + g['r']) // 2 if (g['r'] - g['l']) * SCALE > 110 else size // 2
            fr = sheet.crop((x, y, x + size, y + size)).transform(
                (CW, CH), Image.Transform.AFFINE,
                (1 / SCALE, 0, ax - AX / SCALE, 0, 1 / SCALE, GROUND - AY / SCALE),
                Image.Resampling.NEAREST)
            l, t, r, b = fr.getbbox()
            assert min(l, t, CW - r, CH - b) >= 1, f'{name}: pose {p} encosta na borda do atlas'
            atlas.paste(fr, (i * CW, row * CH))
    # a linha antiga do hurt (6) ficou sem uso: hurt aponta pra linha do guard
    OLD_HURT_ROW = 6   # linha do hurt antigo (a anim hurt agora aponta pra linha do guard: não limpar a dela)
    atlas.paste(Image.new('RGBA', (spec.columns * CW, CH)), (0, OLD_HURT_ROW * CH))
    atlas.save(atlas_path)
    print('ok:', ', '.join(MAP))


if __name__ == '__main__':
    main()
