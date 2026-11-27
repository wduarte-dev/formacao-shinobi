#!/usr/bin/env python3
"""Arquiva sprites já usados/processados: tira de sprites_novos/ e guarda em sprites_usados/<grupo>/ (git mv, histórico preservado).
Regra do dono (27/11/2026): sprites_novos/ só pode ter o que ainda NÃO foi processado, senão confunde a longo prazo.
  python3 tools/sprites/arquivar_usados.py --dry     # só mostra pra onde cada arquivo iria
  python3 tools/sprites/arquivar_usados.py           # move de verdade
  python3 tools/sprites/arquivar_usados.py --manter "Nome do arquivo.png"   # (repetível) deixa esse em sprites_novos/
Grupos (por nome): kit_efeitos, kaen_regen (Kaen regerado com Bitmapflow, processado, aguardando integração), kaen_antigos,
ninjas_integrados (atlas já em spr/), nomes_aleatorios (hash do GitHub: conferir antes de apagar). O que não casa fica em sprites_novos/.
Também grava/atualiza sprites_usados/LEIA-ME.md com a lista por grupo."""
import os, re, sys, subprocess, unicodedata

R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC, DST = os.path.join(R, 'sprites_novos'), os.path.join(R, 'sprites_usados')


def norm(s):
    return unicodedata.normalize('NFC', s)


KIT = ['Folha de Sprites Pixelados de Efeitos', 'Folha de Sprites de Efeitos Pixelados', 'Folha de Sprites de Impactos',
       'Sprite de efeitos pixel art', 'Sprites de Energia e Cura']
KAEN_ANTIGOS = ['E_KAEN', 'FORTE_KAEN', 'KAEN_SELOS', 'ÍCONE_TESTE_KAEN']
NINJAS = ['KESHIN', 'KENSHIN', 'MAYOI', 'KAZAN', 'UTSUSHI', 'IWAO', 'FUUKA', 'HIYORI', 'HIYORY', 'HYORI', 'MIZUHA', 'POKO',
          'RAIDEN', 'YUGAMI', 'HUD_ICONES', 'OD_KESHIN']


# nomes claros ao arquivar (o nome original vem do ChatGPT/GitHub e confunde); o sufixo (.png, _aligned.gif) é preservado
RENAME = {'Folha de sprites do ninja Kaen': 'KAEN_outros_16', 'Folha de sprites_ ataque flamejante de Kaen': 'KAEN_forte_20',
          'Ninja Kaen em animação de ataque em pixel art': 'KAEN_ataque_16', 'Sequência de Selos do Ninja Kaen': 'KAEN_jutsu_20',
          'Sequência de aterrissagem do ninja Kaen': 'KAEN_entrada_6', 'Sprite de Kaen em Animação de Salto': 'KAEN_pulo_3', 'Sequência de Chute Meteórico do Ninja Kaen': 'KAEN_meteoro_20',
          'Folha de Sprites Pixelados de Efeitos': 'kit1_brilhos', 'Sprite de efeitos pixel art monocromáticos': 'kit_teste',
          'Folha de Sprites de Efeitos Pixelados': 'kitA_poeira', 'Sprites de Energia e Cura em Pixel Art': 'kitB_status',
          'Folha de Sprites de Impactos Pixelados': 'kitC_golpes',
          'Folha de Sprites do Dragão Serpentino': 'dragao_molde', 'Spritesheet de Desintegração de Escamas de Dragão': 'dragao_desintegra',
          'Sprite de Chamas em Pixel Art': 'dragao_fogo', 'Dragão Oriental em Seis Quadros': 'dragao_frente',
          'Folha de sprites de efeitos de fogo em pixel art': 'fogo_invocacao', 'Folha de sprites de chamas em pixel art': 'dragao_impacto'}


def novo_nome(f):
    n = norm(f)
    for k in sorted(RENAME, key=len, reverse=True):
        if n.startswith(norm(k)): return RENAME[k] + n[len(norm(k)):]
    return f


def grupo(nome):
    n = norm(nome)
    base = os.path.splitext(n)[0]
    if any(n.startswith(k) for k in KIT): return 'kit_efeitos'
    if re.search(r'drag[ãa]o|chamas|efeitos de fogo', n, re.I): return 'dragao_kaen'
    if any(base.startswith(norm(k)) for k in KAEN_ANTIGOS): return 'kaen_antigos'
    if re.search(r'kaen', n, re.I): return 'kaen_regen'
    if any(base.upper().startswith(k) or ('_' + k) in base.upper() for k in NINJAS): return 'ninjas_integrados'
    if re.fullmatch(r'[0-9a-f]{6}', base) or base.startswith('file_'): return 'nomes_aleatorios'
    return None


def main():
    dry = '--dry' in sys.argv
    manter = {norm(sys.argv[i + 1]) for i, a in enumerate(sys.argv) if a == '--manter' and i + 1 < len(sys.argv)}
    plano, ficam = {}, []
    for f in sorted(os.listdir(SRC)):
        p = os.path.join(SRC, f)
        if not os.path.isfile(p) or f.startswith('.'): continue
        g = None if norm(f) in manter else grupo(f)
        (plano.setdefault(g, []).append(f)) if g else ficam.append(f)
    for g, fs in plano.items():
        print(f'[{g}] {len(fs)} arquivo(s)')
        for f in fs: print('   ', f, '->' + novo_nome(f) if novo_nome(f) != f else '')
    if ficam: print('[ficam em sprites_novos]', ', '.join(ficam))
    if dry: return
    for g, fs in plano.items():
        os.makedirs(os.path.join(DST, g), exist_ok=True)
        for f in fs:
            a, b = os.path.join(SRC, f), os.path.join(DST, g, novo_nome(f))
            r = subprocess.run(['git', 'mv', a, b], cwd=R, capture_output=True, text=True)
            if r.returncode: os.replace(a, b)   # arquivo ainda sem versionar
    os.makedirs(SRC, exist_ok=True)
    open(os.path.join(SRC, '.gitkeep'), 'a').close()
    linhas = ['# sprites_usados/ (já usados ou já processados)', '',
              'Gerado por `python3 tools/sprites/arquivar_usados.py`. **`sprites_novos/` só tem o que ainda não foi processado.**', '']
    for g in sorted(os.listdir(DST)):
        d = os.path.join(DST, g)
        if os.path.isdir(d):
            linhas += [f'## {g}', ''] + [f'- {x}' for x in sorted(os.listdir(d))] + ['']
    open(os.path.join(DST, 'LEIA-ME.md'), 'w', encoding='utf8').write('\n'.join(linhas))
    print('ok: movidos', sum(len(v) for v in plano.values()))


if __name__ == '__main__':
    main()
