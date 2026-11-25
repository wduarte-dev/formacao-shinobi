#!/usr/bin/env python3
"""Compara as linhas do atlas registradas no V2 entre o Git e a cópia de trabalho."""
import argparse
from dataclasses import dataclass
from io import BytesIO
from math import dist, isfinite
from pathlib import Path
import subprocess
from tempfile import mkdtemp

from PIL import Image, ImageDraw

from qa_diff import ATLAS, changed_paths
from sprites.atlas_registry import AX, AY, CH, CW, registry

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = 'js/sprites.js'
TOLERANCE = 3
DEFAULT_JUMP = 24
THUMB_HEIGHT = CH // 3


def git(root, *args):
    result = subprocess.run(['git', *args], cwd=root, capture_output=True)
    if result.returncode:
        raise ValueError(result.stderr.decode(errors='replace').strip())
    return result.stdout


def changed_atlases(root, base):
    return sorted(match[1] for path in changed_paths(base, root)
                  if (match := ATLAS.fullmatch(path)) and match[2] == 'atlas')


def load_image(source):
    with Image.open(source) as image:
        return image.convert('RGBA')


def atlas_row(image, atlas, animation):
    if image is None or animation is None:
        return None
    y = animation.row * CH
    return image.crop((0, y, atlas.columns * CW, y + CH))


@dataclass
class Measurements:
    offsets: dict[int, tuple[float, int]]
    empty: list[int]
    jump: float

    def exceeds(self, limit, new_atlas=False):
        return bool(self.empty or any(abs(dx) > TOLERANCE or abs(dy) > TOLERANCE
                                      for dx, dy in self.offsets.values())
                    or (not new_atlas and self.jump > limit))


def measure(row, animation):
    offsets, centers, empty = {}, {}, []
    for frame in range(animation.frames):
        alpha = row.crop((frame * CW, 0, (frame + 1) * CW, CH)).getchannel('A')
        box = alpha.getbbox()
        if box is None:
            empty.append(frame + 1)
            continue
        left, top, right, bottom = box
        centers[frame] = ((left + right) / 2, (top + bottom) / 2)
        foot_x = (left + right) / 2
        if bottom - top >= (right - left) * 0.9:
            # Faixa inferior de 10%, com pelo menos 3 px, como no pipeline.
            sole = alpha.crop((left, bottom - max(3, (bottom - top) // 10), right, bottom))
            xs = [left + i % sole.width for i, value in enumerate(sole.tobytes()) if value]
            foot_x = sum(xs) / len(xs)
        offsets[frame + 1] = (foot_x - AX, bottom - AY)
    order = animation.sequence or range(animation.frames)
    jump = max((dist(centers[a], centers[b]) for a, b in zip(order, order[1:])
                if a in centers and b in centers), default=0)
    return Measurements(offsets, empty, jump)


def describe(label, animation, stats, new_atlas):
    dx, dy = (max(values, key=abs, default=0) for values in
              (tuple(v[axis] for v in stats.offsets.values()) for axis in (0, 1)))
    frames = ','.join(map(str, stats.empty)) or 'nenhum'
    suffix = '' if new_atlas else f' | salto {stats.jump:.1f} px'
    pivot = f'({dx:+.1f},{dy:+.0f}) px' if stats.offsets else 'indisponível'
    return (f'{label} L{animation.row} {animation.frames}q {animation.fps}fps | '
            f'pivô {pivot} | vazios {frames}{suffix}')


def save_board(path, rows):
    width = max(image.width // 3 for _, before, after in rows
                for image in (before, after) if image is not None)
    height = THUMB_HEIGHT + 17
    board = Image.new('RGBA', (width, height * 2 * len(rows)), '#252630')
    draw = ImageDraw.Draw(board)
    for index, (name, before, after) in enumerate(rows):
        for offset, (label, image) in enumerate((('antes', before), ('depois', after))):
            y = (index * 2 + offset) * height
            draw.text((4, y + 2), f'{name} / {label}', fill='white')
            if image is not None:
                thumb = image.resize((image.width // 3, THUMB_HEIGHT), Image.Resampling.NEAREST)
                board.alpha_composite(thumb, (0, y + 17))
    board.save(path)


def compare(root, base, current, old, ninja, limit, directory):
    path = f'spr/{ninja}_atlas.png'
    old_spec, spec = old.get(ninja), current.get(ninja)
    local = root / path
    if local.is_file() and spec is None:
        raise ValueError(f'{path} sem registro V2 atual')
    previous = git(root, 'ls-tree', '--name-only', base, '--', path)
    if previous and old_spec is None:
        raise ValueError(f'{path} sem registro V2 na base')
    before = load_image(BytesIO(git(root, 'show', f'{base}:{path}'))) if previous else None
    after = load_image(local) if local.is_file() else None
    if after is None and before is None:
        raise ValueError(f'{path} ausente')
    old_animations = old_spec.animations if before is not None else {}
    animations = spec.animations if after is not None else {}
    lines, details, rows = [], [], []
    failed = after is None
    for name in dict.fromkeys([*animations, *old_animations]):
        prev, anim = old_animations.get(name), animations.get(name)
        old_row = atlas_row(before, old_spec, prev)
        row = atlas_row(after, spec, anim)
        if anim == prev and old_row.size == row.size and old_row.tobytes() == row.tobytes():
            continue
        if before is not None:
            rows.append((name, old_row, row))
        label = f'{ninja}/{name}'
        if anim is None:
            lines.append(f'{label} L{prev.row} removida')
            continue
        stats = measure(row, anim)
        lines.append(describe(label, anim, stats, before is None))
        details.append(f'{label} | pivô por quadro {stats.offsets}')
        failed |= stats.exceeds(limit, new_atlas=before is None)
    if rows:
        save_board(directory / f'{ninja}.png', rows)
    return lines, details, failed


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('ninja', nargs='?')
    parser.add_argument('--base', default='HEAD~1')
    parser.add_argument('--salto', type=float, default=DEFAULT_JUMP, metavar='PX')
    args = parser.parse_args()
    directory = Path(mkdtemp(prefix='qa-atlas-'))
    lines, details, failed = [], [], False
    try:
        if not isfinite(args.salto) or args.salto < 0:
            raise ValueError('--salto deve ser finito e não negativo')
        if args.ninja and not ATLAS.fullmatch(f'spr/{args.ninja}_atlas.png'):
            raise ValueError('ID de ninja inválido')
        base = git(ROOT, 'rev-parse', '--verify', '--end-of-options', f'{args.base}^{{commit}}').decode().strip()
        ninjas = [args.ninja] if args.ninja else changed_atlases(ROOT, base)
        current = registry((ROOT / REGISTRY).read_text(encoding='utf-8'))
        old = registry(git(ROOT, 'show', f'{base}:{REGISTRY}').decode()) if git(
            ROOT, 'ls-tree', '--name-only', base, '--', REGISTRY) else {}
        for ninja in ninjas:
            try:
                summaries, per_frame, error = compare(ROOT, base, current, old, ninja, args.salto, directory)
                lines.extend(summaries)
                details.extend(per_frame)
                failed |= error
            except (OSError, ValueError) as error:
                lines.append(f'{ninja}: {str(error).splitlines()[0]}')
                details.append(str(error))
                failed = True
    except (OSError, ValueError) as error:
        lines.append(str(error).splitlines()[0])
        details.append(str(error))
        failed = True
    header = f'Limiar de salto {args.salto:g} px | tolerância do pivô ±{TOLERANCE} px'
    (directory / 'relatorio.txt').write_text('\n'.join([header, *lines, *details]) + '\n', encoding='utf-8')
    print(header)
    print('\n'.join(lines[:12]) if lines else 'Nenhuma linha alterada')
    if len(lines) > 12:
        print(f'{len(lines) - 12} linhas adicionais no relatório')
    print(f'Relatório e pranchas em {directory}')
    return int(failed)


if __name__ == '__main__':
    raise SystemExit(main())
