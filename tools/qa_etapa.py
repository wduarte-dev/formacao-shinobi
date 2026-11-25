"""Testa uma etapa e guarda os detalhes por tarefa. Uso: python tools/qa_etapa.py kaen [--kind chase]."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('ninja')
    parser.add_argument('--kind', choices=['basico','forte','chase','jutsu'])
    parser.add_argument('--secs', type=int, default=90, help='duração da gravação de animações')
    parser.add_argument('--team', help='quatro ninjas para o QA de animações, separados por vírgula')
    parser.add_argument('--jobs', type=int, choices=range(1,8), default=3)
    args = parser.parse_args()
    if args.secs < 1:
        parser.error('--secs deve ser positivo')
    team = (args.team.split(',') if args.team else
            list(dict.fromkeys([args.ninja, 'iwao', 'raiden', 'mizuha', 'kaen']))[:4])
    if len(team) != 4 or len(set(team)) != 4 or args.ninja not in team:
        parser.error('--team precisa de quatro ninjas diferentes, incluindo o ninja testado')

    out = Path(tempfile.mkdtemp(prefix='shinobi-etapa-'))
    print(f'Logs, prints e tiras: {out}', flush=True)
    for script in sorted((ROOT/'js').glob('*.js')):
        subprocess.run(['node','--check',str(script)], check=True)
    tasks = [(f'missao-{i+1}', ['tools/test_battle.py','.',out/f'missao-{i+1}',str(i),'--strict']) for i in range(5)]
    anim = ['tools/qa_anim.py','--team',','.join(team),'--only',args.ninja+':p','--secs',str(args.secs),'--resumo','--out',out/'anim']
    if args.kind:
        anim.extend(['--kind',args.kind])
    tasks.extend([('anim',anim), ('retratos',['tools/qa_retratos.py',args.ninja,'--out',out/'retratos'])])

    def run(task):
        name, command = task
        log = out/f'{name}.log'
        with log.open('w') as stream:
            result = subprocess.run([sys.executable,*command], cwd=ROOT, stdout=stream, stderr=subprocess.STDOUT)
        lines = log.read_text().splitlines()
        if result.returncode:
            print(f'{name}: REVISAR ({log})', flush=True)
        else:
            print(f'{name}: '+ ' | '.join(lines[-3:]), flush=True)
        return result.returncode

    with ThreadPoolExecutor(max_workers=args.jobs) as pool:
        codes = list(pool.map(run,tasks))
    return int(any(codes))


if __name__ == '__main__':
    raise SystemExit(main())
