"""Leitura do registro V2, sem executar o JavaScript do jogo."""
import json
import re
from dataclasses import dataclass

CW, CH = 192, 160
AX, AY = 96, 150


@dataclass(frozen=True)
class Animation:
    row: int
    frames: int
    fps: int
    loop: int
    pingpong: int
    sequence: tuple[int, ...] = ()


@dataclass(frozen=True)
class Atlas:
    columns: int
    animations: dict[str, Animation]


def registry(source):
    block = re.search(r'^\s*const V2\s*=\s*\{(.*?)^\s*\};', source, re.M | re.S)
    if not block:
        raise ValueError('registro V2 ausente em js/sprites.js')
    atlases = {}
    for entry in re.finditer(r'^\s*(\w+)\s*:\s*\{([^{}]*?)\ba\s*:\s*\{([^{}]*)\}\s*\}',
                             block[1], re.M):
        ninja, fields, animations = entry.groups()
        width = re.search(r'\bW\s*:\s*(\d+)', fields)
        atlases[ninja] = Atlas(
            int(width[1]) // CW if width else 8,
            {name: Animation(*values[:5], tuple(values[5]) if len(values) > 5 else ())
             for name, array in re.findall(r'(\w+)\s*:\s*(\[(?:[^\[\]]|\[[^\[\]]*\])*\])', animations)
             for values in [json.loads(array)]},
        )
    if not atlases or any(not atlas.animations for atlas in atlases.values()):
        raise ValueError('registro V2 sem animações')
    return atlases
