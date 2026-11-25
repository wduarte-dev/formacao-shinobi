"""Seleciona verificações do jogo a partir dos arquivos alterados no Git."""
import argparse
from pathlib import Path
import re
import subprocess
import sys
from tempfile import mkdtemp

ROOT = Path(__file__).resolve().parents[1]
ATLAS = re.compile(r'spr/([a-z0-9][a-z0-9_-]*)_(atlas|fx)\.png')
VARIANTS = {'utsushic': 'utsushi', 'yugamir': 'yugami'}
PORTRAITS = {'index.html', 'js/cine.js', 'js/sprites.js', 'js/data.js', 'tools/qa_retratos.py'}
# Módulos de apresentação já conhecidos. Um novo módulo do jogo roda os
# cenários compartilhados até que sua responsabilidade esteja clara.
PRESENTATION = {'js/ambient.js', 'js/audio.js', 'js/patch.js', 'js/screens.js'}
REPLAY_TOOLS = {'index.html', 'tools/qa_anim.py'}
# O jutsu em área cobre um caminho diferente das perseguições.
SCENARIOS = {
    'kaen': [('meteoro', ['--expect-hits', '1']),
             ('meteoro-ko', ['--side', 'e', '--speed', '2', '--ko', '--expect-ko', '--expect-hits', '1'])],
    'utsushi': [(f'rajada-{n}', ['--clones', str(n), '--expect-hits', str(n + 1)])
                for n in range(4)],
    'fuuka': [('tufao', ['--kind', 'jutsu', '--expect-hits', '1'])],
}


def changed_paths(base):
    def paths(*args):
        output = subprocess.check_output(['git', *args], cwd=ROOT)
        return set(filter(None, output.decode('utf-8', errors='surrogateescape').split('\0')))

    return (paths('diff', '--name-only', '-z', '--no-renames', base, '--')
            | paths('ls-files', '--others', '--exclude-standard', '-z'))


def select_tasks(paths):
    tasks = []
    ninjas = set()
    portraits = set()
    scripts = {path for path in paths if path.startswith('js/') and path.endswith('.js')}
    for path in sorted(scripts):
        if (ROOT / path).is_file():
            name = path.replace('/', '-')
            tasks.append((f'sintaxe-{name}', ['node', '--check', path]))
    for path in sorted(paths):
        match = ATLAS.fullmatch(path)
        if match:
            asset, kind = match.groups()
            ninja = VARIANTS.get(asset, asset)
            ninjas.add(ninja)
            if kind == 'atlas':
                portraits.add(ninja)
    all_portraits = bool(paths & PORTRAITS) or any(
        path.startswith('css/') and path.endswith('.css') for path in paths
    )
    if all_portraits or portraits:
        ids = [] if all_portraits else sorted(portraits)
        tasks.append(('retratos', [sys.executable, 'tools/qa_retratos.py', *ids]))
    if scripts - PRESENTATION or paths & REPLAY_TOOLS:
        ninjas.update(SCENARIOS)
    for ninja in sorted(ninjas):
        for name, options in SCENARIOS.get(ninja, [('jutsu', ['--kind', 'jutsu'])]):
            tasks.append((f'{ninja}-{name}', [
                sys.executable, 'tools/qa_anim.py', '--replay', ninja, '--resumo', *options,
            ]))
    return tasks


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', default='HEAD', help='commit de referência para a árvore de trabalho')
    parser.add_argument('--plano', action='store_true', help='lista as verificações sem executá-las')
    args = parser.parse_args()
    try:
        base = subprocess.check_output(
            ['git', 'rev-parse', '--verify', '--end-of-options', args.base + '^{commit}'],
            cwd=ROOT, text=True,
        ).strip()
    except subprocess.CalledProcessError:
        parser.error(f'commit de referência inválido: {args.base}')
    paths = changed_paths(base)
    tasks = select_tasks(paths)
    print(f'{len(paths)} arquivo(s) alterado(s), {len(tasks)} verificação(ões).', flush=True)
    if not tasks:
        print('As mudanças não selecionaram verificações do jogo.')
        return 0
    if args.plano:
        for name, command in tasks:
            print(f'{name} — ' + ' '.join(command[1:] if command[0] == sys.executable else command))
        return 0

    out = Path(mkdtemp(prefix='shinobi-diff-'))
    print(f'Logs e artefatos: {out}', flush=True)
    failures = 0
    for name, command in tasks:
        log = out / f'{name}.log'
        if command[0] == sys.executable:
            command = [*command, '--out', str(out / name)]
        with log.open('w') as stream:
            try:
                code = subprocess.run(command, cwd=ROOT, stdout=stream, stderr=subprocess.STDOUT).returncode
            except OSError as exc:
                print(exc, file=stream)
                code = 1
        if code:
            failures += 1
            print(f'REVISAR {name} — {log}', flush=True)
        else:
            print(f'OK {name}', flush=True)
    return int(bool(failures))


if __name__ == '__main__':
    raise SystemExit(main())
