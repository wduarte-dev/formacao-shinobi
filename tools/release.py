#!/usr/bin/env python3
"""Valida e prepara uma versão do jogo localmente."""
import argparse
import json
from pathlib import Path
import re
import shlex
import subprocess
import sys
from tempfile import mkdtemp

ROOT = Path(__file__).resolve().parents[1]
NOTES = 'docs/patch-notes.md'
VERSION = 'version.json'
GENERATED = ('js/patch.js', 'js/data.js', VERSION, 'sw.js')
RELEASE_FILES = (NOTES, *GENERATED)


def next_version(current, large):
    if not re.fullmatch(r'[0-9]+\.[0-9]+(?:\.[0-9]+)?', current):
        raise ValueError(f'versão inválida: {current!r}')
    major, minor, *patch = map(int, current.split('.'))
    if large:
        return f'{major}.{minor + 1}'
    return f'{major}.{minor}.{(patch[0] if patch else 0) + 1}'


def git_output(root, *args):
    result = subprocess.run(['git', *args], cwd=root, capture_output=True)
    if result.returncode:
        raise ValueError(result.stderr.decode(errors='replace').strip())
    return result.stdout


def check_notes(root, current):
    committed = json.loads(git_output(root, 'show', f'HEAD:{VERSION}'))['v']
    if committed != current:
        raise ValueError(f'versão local {current} difere da versão em HEAD ({committed})')
    base = git_output(root, 'log', '-1', '--format=%H', '-S', f'"{current}"',
                      '--', VERSION).decode().strip()
    if not base:
        raise ValueError(f'commit da versão {current} não encontrado')
    notes = (root / NOTES).read_bytes()
    if git_output(root, 'ls-tree', '--name-only', base, '--', NOTES):
        if notes == git_output(root, 'show', f'{base}:{NOTES}'):
            raise ValueError(f'{NOTES} sem alterações desde a versão {current}')
    return base


def steps(version, directory, commit, base):
    yield 'qa_diff.py', [sys.executable, 'tools/qa_diff.py', '--base', base]
    yield 'test_battle.py', [sys.executable, 'tools/test_battle.py', '.', str(directory / 'shots'), '--strict']
    yield 'patch_notes.py', [sys.executable, 'tools/patch_notes.py']
    yield 'bump_version.py', [sys.executable, 'tools/bump_version.py', version]
    if commit:
        message = ('Mudou: notas e arquivos de versão gerados.\n'
                   'Testado: qa_diff.py e test_battle.py.\n'
                   'Pendente: publicação remota.')
        yield 'git commit', ['git', 'commit', '-m', f'Publica a versão {version}',
                             '-m', message, '--only', '--', *(path for path in RELEASE_FILES if (ROOT / path).exists())]


def execute(root, version, directory, commit, base):
    previous = {}
    for index, (name, command) in enumerate(steps(version, directory, commit, base), 1):
        log = directory / f'{index:02d}-{name.replace(" ", "-")}.log'
        with log.open('w', encoding='utf-8') as stream:
            stream.write(f'$ {shlex.join(command)}\n')
            stream.flush()
            try:
                if name == 'patch_notes.py':
                    paths = [root / path for path in GENERATED]
                    previous = {path: path.read_bytes() if path.exists() else None for path in paths}
                result = subprocess.run(command, cwd=root, stdout=stream, stderr=subprocess.STDOUT)
                code = result.returncode
            except OSError as error:
                print(error, file=stream)
                code = 1
            if code:
                for path, data in previous.items():
                    try:
                        if data is None:
                            path.unlink(missing_ok=True)
                        elif not path.exists() or path.read_bytes() != data:
                            path.write_bytes(data)
                    except OSError as error:
                        print(f'Falhou restauração de {path}: {error}', file=stream)
        if code:
            print(f'Falhou {name} (código {code}) | log {log}')
            return 1
        print(f'OK {name} | log {log}')
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    kind = parser.add_mutually_exclusive_group(required=True)
    kind.add_argument('--grande', action='store_true')
    kind.add_argument('--pequeno', action='store_true')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--commit', action='store_true')
    args = parser.parse_args()

    try:
        current = json.loads((ROOT / VERSION).read_text(encoding='utf-8'))['v']
        version = next_version(current, args.grande)
    except (OSError, ValueError, KeyError, TypeError) as error:
        message = f'Falhou leitura da versão | {error}'
        if not args.dry_run:
            log = Path(mkdtemp(prefix='shinobi-release-')) / '00-versao.log'
            log.write_text(str(error) + '\n', encoding='utf-8')
            message += f' | log {log}'
        print(message)
        return 1

    print(f'Versão {current} → {version}')
    if args.dry_run:
        print('Pré-verificação de notas desde a versão atual')
        for name, command in steps(version, Path('<logs>'), args.commit, '<commit da versão atual>'):
            print(f'{name} | {shlex.join(command).replace(chr(10), " ")}')
        return 0

    directory = Path(mkdtemp(prefix='shinobi-release-'))
    log = directory / '00-notas.log'
    try:
        base = check_notes(ROOT, current)
    except (OSError, ValueError, KeyError, TypeError) as error:
        log.write_text(str(error) + '\n', encoding='utf-8')
        print(f'Falhou verificação das notas | {str(error).splitlines()[0]} | log {log}')
        return 1
    log.write_text(f'{NOTES} alterado desde a versão {current}\n', encoding='utf-8')
    print(f'OK verificação das notas | log {log}')
    return execute(ROOT, version, directory, args.commit, base)


if __name__ == '__main__':
    raise SystemExit(main())
