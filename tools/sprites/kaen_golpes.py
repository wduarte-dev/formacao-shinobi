#!/usr/bin/env python3
"""Monta os golpes do Kaen a partir do lote preparado e da receita aprovada."""
import json
from pathlib import Path

import numpy as np
from PIL import Image

from atlas_registry import AX, AY, CH, CW, registry
from kaen_lote import OUT, R, key


ROOT = Path(R)
LOT = Path(OUT)
PALETTES = {
    'fire': [(42, 13, 8), (122, 42, 18), (232, 116, 42), (255, 199, 102), (255, 244, 207)],
    'steel': [(22, 30, 44), (70, 92, 120), (150, 176, 204), (222, 234, 246), (255, 255, 255)],
}
GRADIENT_STOPS = [0, .35, .65, .9, 1]


def main():
    atlas_path = ROOT / 'spr/kaen_atlas.png'
    atlas_spec = registry((ROOT / 'js/sprites.js').read_text())['kaen']
    recipe = json.loads((ROOT / 'tools/receitas/kaen_golpes.json').read_text())
    specs = [atlas_spec.animations[name] for name in ('attack', 'strong')]
    cols = atlas_spec.columns
    rows = max(spec.row + (spec.frames + cols - 1) // cols for spec in specs)
    atlas = Image.new('RGBA', (cols * CW, rows * CH))
    with Image.open(atlas_path) as old:
        atlas.paste(old.crop((0, 0, cols * CW, specs[0].row * CH)), (0, 0))

    kit_rows = {}
    strikes = {}
    for move, spec, recipe_move in zip(('atk1', 'atk3'), specs, recipe['golpes'], strict=True):
        name = recipe_move['anim']
        info = json.loads((LOT / f'{name}.json').read_text())
        size, source_cols = info['cell'], info['cols']
        anchor = size // 2, info['quadros'][0]['b'] + 1
        scale = recipe_move['corpo_px'] / (anchor[1] - info['quadros'][0]['t'])
        assert (info['n'], recipe_move['fps']) == (spec.frames, spec.fps)
        with Image.open(LOT / f'{name}.png') as sheet:
            for i, geo in enumerate(info['quadros']):
                x, y = (i % source_cols) * size, (i // source_cols) * size
                frame = sheet.crop((x, y, x + size, y + size))
                # Mapeia a âncora de origem para os pés do atlas em todos os quadros.
                frame = frame.transform(
                    (CW, CH), Image.Transform.AFFINE,
                    (1 / scale, 0, anchor[0] - AX / scale, 0, 1 / scale, anchor[1] - AY / scale),
                    Image.Resampling.NEAREST,
                )
                left, top, right, bottom = frame.getbbox()
                if min(left, top, CW - right, CH - bottom) < 2 or geo['corta']:
                    raise ValueError(f'{name}: quadro {i} encosta na borda')
                atlas.paste(frame, ((i % cols) * CW, (spec.row + i // cols) * CH))
        contacts = []
        for c in recipe_move['contatos']:
            index = round(c['pose'] * info['mult'])
            geo = info['quadros'][index]
            blade = [(geo['r'] - anchor[0]) * scale, (geo['ty'] - anchor[1]) * scale]
            effects = []
            for e in c['efeitos']:
                row = kit_rows.setdefault((e['linha'], e['pal']), len(kit_rows))
                x, y = blade if e['ancora'] == 'ponta' else (0, 0)
                dx, dy = e['dx'], e['dy']
                if e['ancora'] == 'corpo' and e['linha'] in (2, 3):
                    # A lâmina do corte descendente chega perto do chão no atlas do jogo.
                    x, y = blade
                    dx, dy = dx - 84, 0
                effects.append(dict(row=row, frame=round(index + e['inicio'] * spec.fps),
                                    x=round(x + dx, 2), y=round(y + dy, 2),
                                    fps=e['fps'], scale=e['esc'], rotation=e.get('rot', 0),
                                    flipY=e.get('sy', 1) < 0, arc=e['linha'] == 0))
            contacts.append(dict(frame=index, stop=c['hitstop'], recoil=c['flinch'],
                                 squash=c.get('squash', False), textX=c.get('dano_dx', 0),
                                 textY=c.get('dano_dy', 0) * .65,
                                 textMs=round(c.get('dano_vida', .9) * 1000), effects=effects))
        strikes[move] = contacts

    kit = Image.open(ROOT / 'sprites_usados/kit_efeitos/kitC_golpes.png').convert('RGB')
    pixels = key(np.array(kit))
    cell = 256
    tinted = Image.new('RGBA', (6 * cell, len(kit_rows) * cell))
    for (row, palette), dest in kit_rows.items():
        strip = pixels[row * cell:(row + 1) * cell, :6 * cell].copy()
        luminance = (strip[..., :3] @ [.3, .59, .11]) / 255
        for channel, values in enumerate(zip(*PALETTES[palette])):
            strip[..., channel] = np.interp(luminance, GRADIENT_STOPS, values).round()
        tinted.paste(Image.fromarray(strip), (0, dest * cell))
    atlas.save(atlas_path)
    tinted.save(ROOT / 'spr/kaen_golpes.png')
    data = ',\n'.join(f'  {name}: {json.dumps(contacts, separators=(",", ":"))}'
                      for name, contacts in strikes.items())
    (ROOT / 'js/kaen-golpes.js').write_text(
        '// Gerado por tools/sprites/kaen_golpes.py a partir da receita aprovada.\n'
        f'const KAEN_STRIKES={{\n{data}\n}};\n',
    )


if __name__ == '__main__':
    main()
