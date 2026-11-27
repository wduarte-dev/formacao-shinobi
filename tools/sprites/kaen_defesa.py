#!/usr/bin/env python3
"""Troca a defesa (guard) do Kaen pela pose nova do lote 'outros' (pose 1 do KAEN_outros_16).
Rode depois de `python3 tools/sprites/kaen_lote.py`. A pose cai na linha do `guard` do atlas (1 quadro, âncora dos pés
igual à dos golpes) e o `hurt` passa a reaproveitar o mesmo quadro (decisão do dono: hurt = guard + tranco em código)."""
import json
from PIL import Image

from atlas_registry import AX, AY, CH, CW, registry
from kaen_lote import OUT, R
from pathlib import Path

ROOT = Path(R)
SCALE = 108 / 203   # o mesmo dos golpes: corpo_px 108 sobre o corpo de 203 px do quadro 0 do ataque


def main():
    atlas_path = ROOT / 'spr/kaen_atlas.png'
    spec = registry((ROOT / 'js/sprites.js').read_text())['kaen']
    rows = {spec.animations[n].row for n in ('guard', 'hurt')}
    guard_row = spec.animations['guard'].row
    info = json.loads((Path(OUT) / 'outros.json').read_text())
    size, cols = info['cell'], info['cols']
    geo = info['quadros'][0]
    assert not geo['corta']
    anchor = size // 2, geo['b'] + 1
    with Image.open(Path(OUT) / 'outros.png') as sheet:
        frame = sheet.crop((0, 0, size, size))
    frame = frame.transform((CW, CH), Image.Transform.AFFINE,
                            (1 / SCALE, 0, anchor[0] - AX / SCALE, 0, 1 / SCALE, anchor[1] - AY / SCALE),
                            Image.Resampling.NEAREST)
    left, top, right, bottom = frame.getbbox()
    assert min(left, top, CW - right, CH - bottom) >= 2, 'guard encosta na borda'
    atlas = Image.open(atlas_path).convert('RGBA')
    clear = Image.new('RGBA', (spec.columns * CW, CH))
    for r in rows:
        atlas.paste(clear, (0, r * CH))
    atlas.paste(frame, (0, guard_row * CH))
    atlas.save(atlas_path)
    print('guard no atlas: caixa', frame.getbbox(), 'linhas limpas', sorted(rows))


if __name__ == '__main__':
    main()
