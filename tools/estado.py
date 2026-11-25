#!/usr/bin/env python3
"""Gera docs/ESTADO.md com fatos da cópia de trabalho e do histórico Git."""
import json
from pathlib import Path
import re
import subprocess
from tempfile import mkdtemp

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path('docs/ESTADO.md')
MAX_LINES = 60
PENDING = re.compile(r'^\s*(?:[-*+]\s+)?(?:\*\*)?Pendente:(?:\*\*)?\s*(.*)$')


def ninja_rows(root, source):
    block = re.search(r'^const N\s*=\s*\{(.*?)^\};', source, re.M | re.S)
    if not block:
        raise ValueError('elenco N ausente em js/data.js')
    fields = re.compile(r"""\b(name|el|role)\s*:\s*(['"])((?:\\.|(?!\2).)*)\2""")
    sounds = {path.stem for path in (root / 'audio/sfx').glob('*.ogg') if path.is_file()}
    rows = []
    for ninja, header in re.findall(r'^\s*(\w+)\s*:\s*\{([^\n]*)', block[1], re.M):
        values = {key: value.replace('\\' + quote, quote)
                  for key, quote, value in fields.findall(header)}
        if 'el' not in values and 'role' not in values:
            continue
        assets = [(root / f'spr/{ninja}_{kind}.png').is_file() for kind in ('atlas', 'fx')]
        assets.append(any(sound.startswith((f'{ninja}-', f'voz-{ninja}-')) for sound in sounds))
        cells = [values[key].replace('|', r'\|') for key in ('name', 'el', 'role')]
        cells.extend('Sim' if present else 'Não' for present in assets)
        rows.append('| ' + ' | '.join(cells) + ' |')
    return rows


def recent_commits(root):
    result = subprocess.run(['git', 'log', '-20', '-z', '--format=%h%x00%s%x00%b'],
                            cwd=root, capture_output=True, check=True)
    fields = result.stdout.decode().split('\0')[:-1]
    return list(zip(fields[::3], fields[1::3], fields[2::3]))


def pendings(root, commits):
    for commit, subject, body in commits:
        for line in [subject, *body.splitlines()]:
            if match := PENDING.match(line):
                yield f'- `{commit}` Pendente: {match[1].rstrip()}'.rstrip()
    for path in sorted((root / 'docs').rglob('*')):
        if path.is_symlink() or not path.is_file() or path == root / OUTPUT:
            continue
        try:
            lines = path.read_text(encoding='utf-8').splitlines()
        except UnicodeDecodeError:
            continue
        for number, line in enumerate(lines, 1):
            if match := PENDING.match(line):
                yield f'- `{path.relative_to(root)}:{number}` Pendente: {match[1].rstrip()}'.rstrip()


def render(root):
    source = (root / 'js/data.js').read_text(encoding='utf-8')
    js = re.search(r"""\bconst VERSION\s*=\s*\{\s*v:\s*'([^']+)'\s*,\s*d:\s*'([^']+)'""", source)
    if not js:
        raise ValueError('versão ausente em js/data.js')
    version = json.loads((root / 'version.json').read_text(encoding='utf-8'))
    rows = ninja_rows(root, source)
    commits = recent_commits(root)
    pending = list(pendings(root, commits))

    header = [
        '# Estado do repositório', '',
        f'- `js/data.js` {js[1]} · {js[2]}',
        f'- `version.json` {version["v"]} · {version["d"]}', '',
        '## Ninjas', '',
        '| Nome | Elemento | Papel | Atlas | FX | Sons |',
        '|---|---|---|---|---|---|',
    ]
    history = ['', '## Últimos 10 commits', '']
    history.extend(f'- `{commit}` {subject}' for commit, subject, _ in commits[:10])
    history.extend(['', f'## Pendências ({len(pending)})', ''])
    capacity = MAX_LINES - len(header) - len(history) - 1
    if len(rows) > capacity:
        omitted = len(rows) - capacity + 1
        rows = [*rows[:capacity - 1], f'| {omitted} ninjas fora do limite de linhas | | | | | |']
    lines = [*header, *rows, *history]
    remaining = MAX_LINES - len(lines)
    if len(pending) > remaining:
        lines.extend(pending[:remaining - 1])
        lines.append(f'- {len(pending) - remaining + 1} pendências fora do limite de linhas.')
    else:
        lines.extend(pending)
    return '\n'.join(lines).rstrip() + '\n', len(pending)


def generate(root):
    content, count = render(root)
    output = root / OUTPUT
    if output.is_symlink():
        raise ValueError(f'{OUTPUT} é um link simbólico')
    data = content.encode('utf-8')
    if not output.exists() or output.read_bytes() != data:
        output.write_bytes(data)
    return output, count


def main():
    try:
        output, count = generate(ROOT)
    except (OSError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        log = Path(mkdtemp(prefix='shinobi-estado-')) / 'erro.txt'
        detail = error.stderr.decode(errors='replace') if isinstance(error, subprocess.CalledProcessError) else str(error)
        log.write_text(detail + '\n', encoding='utf-8')
        print(log)
        return 1
    print(f'{output} | {count} pendências')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
