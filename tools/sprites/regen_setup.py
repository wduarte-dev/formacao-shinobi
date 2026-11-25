#!/usr/bin/env python3
"""Recorte das REGERAÇÕES (sheets em sprites_novos/ que corrigem anims de ninjas já integrados).
Uso (de dentro de tools/sprites/):  python3 regen_setup.py            -> escreve config/<ninja>_regen.json
                                    python3 regen_setup.py cut        -> roda shinobi_atlas.py em cada um (out/<ninja>_regen_*)
Depois: python3 merge_regen.py <ninja>  (cola as linhas novas no atlas atual e escreve a linha do V2 em staging/).
Os sheets ficam em sprites_novos/ (--src); color_ref aponta pro sheet ORIGINAL em src/<ninja>/ pra igualar a cor."""
import json, os, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__))
def sh(file, rows, anims, ref, orig, **kw):
    d = dict(file=file, rows=rows, cols=8, anims=anims, color_ref=f'../tools/sprites/src/{orig[0]}/{orig[1]}', outline=0.35)
    if ref: d['ref'] = ref
    d.update(kw); return d
J = {
 'kaen': [sh('E_KAEN.png', 3, [dict(name='rise', fps=16, loop=0, anchor='feet'), dict(name='meteor', fps=16, loop=0, anchor='feet'), dict(name='landing', fps=12, loop=0)], ['landing:5'], ('kaen', 'A1.jpg')),
          sh('FORTE_KAEN.png', 1, ['strong'], ['strong:0'], ('kaen', 'A1.jpg')),
          sh('KAEN_SELOS.png', 1, ['seals'], None, ('kaen', 'A1.jpg'))],
 'iwao': [sh('FORTE_IWAOI.png', 1, ['strong'], ['strong:0'], ('iwao', 'A.jpg')),
          sh('IWAO_REGEN.png', 3, ['attack', 'jutsu', 'chase'], ['attack:5'], ('iwao', 'A.jpg'))],
 'raiden': [sh('RAIDEN_REGERA.png', 2, ['attack', 'strong'], ['attack:7'], ('raiden', 'A.jpg'))],
 'yugami': [sh('YUGAMI_CHASE.png', 1, ['chase'], ['chase:0'], ('yugami', 'A1.jpg'))],
 'fuuka': [sh('REGEN_FUUKA.png', 3, ['seals', 'jutsu', 'chase'], None, ('fuuka', 'A1.png'))],
 'mayoi': [sh('REGEN_HIYORY.png', 2, ['strong', 'hurt'], ['strong:0', 'hurt:0'], ('mayoi', 'A1.png'))],   # arquivo com nome trocado: é a MAYOI
 'hiyori': [sh('REGEN_HYORIREAL.png', 2, ['attack', 'jutsu'], ['attack:7', 'jutsu:0'], ('hiyori', 'A1.png'))],
 'mizuha': [sh('REGEN_MIZUHA.png', 2, ['seals', 'jutsu'], ['jutsu:0'], ('mizuha', 'A.jpg'))],
 'poko': [sh('REGEN_POKO.png', 2, ['seals', 'jutsu'], None, ('poko', 'A1.png'))],
}
if __name__ == '__main__':
    for n, sheets in J.items():
        json.dump(dict(name=n + '_regen', body_h=115, sheets=sheets), open(f'{H}/config/{n}_regen.json', 'w'), indent=1, ensure_ascii=False)
    print('configs ok:', ', '.join(J))
    if 'cut' in sys.argv:
        for n in (sys.argv[2:] or J):
            if n == 'cut': continue
            print('==', n); subprocess.run([sys.executable, 'shinobi_atlas.py', f'config/{n}_regen.json', '--src', '../../sprites_novos', '--no-fx'], cwd=H)
