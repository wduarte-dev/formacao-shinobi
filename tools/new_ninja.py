#!/usr/bin/env python3
"""Formação Shinobi — esqueleto de ninja novo (economiza token: o que é mecânico sai daqui).

  python3 tools/new_ninja.py config <id> [--premium]   # escreve tools/sprites/config/<id>.json
  python3 tools/new_ninja.py snippets <id>             # lê tools/sprites/out/<id>_atlas.json + _fx.json e imprime as linhas pra colar
  python3 tools/new_ninja.py face <id> [anim]          # mede o FACE (topo da cabeça + ~16px, centro x) do atlas em spr/
  python3 tools/new_ninja.py checklist <id>            # lista o que falta integrar (confere nos arquivos do repo)

--premium: sheets com ação de 18 quadros (A1B = básico em 3 linhas, CH = perseguição em 3 fases), como o Keshin.
Fluxo completo e decisões: tools/skills/ninja-novo-shinobi/SKILL.md"""
import sys, os, json, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CFG = os.path.join(ROOT, 'tools/sprites/config')
OUT = os.path.join(ROOT, 'tools/sprites/out')


def cfg_template(nid, premium):
    a1 = {"file": "A1.png", "rows": 3 if premium else 4, "cols": 8,
          "anims": ["idle", "walk", "dash"] + ([] if premium else ["attack"])}
    sheets = [a1]
    if premium:   # 3 golpes de 6 quadros: viram attack / attackB / attackC; contato do quadro 4 vem de `hits` no data.js
        sheets.append({"file": "A1B.png", "rows": 3, "cols": 8, "color_ref": "A1.png", "outline": 0.35,
                       "anims": [{"name": "attack", "fps": 14, "loop": 0}, {"name": "attackB", "fps": 14, "loop": 0},
                                 {"name": "attackC", "fps": 14, "loop": 0}]})
    sheets += [
        {"file": "A2.png", "rows": 4, "cols": 8, "color_ref": "A1.png", "outline": 0.35, "anims": ["strong", "guard", "hurt", "dodge"]},
        {"file": "B1.png", "rows": 3, "cols": 8, "color_ref": "A1.png", "outline": 0.35, "anims": ["seals", "jutsu", "buff"]},
        {"file": "B2.png", "rows": 3, "cols": 8, "color_ref": "A1.png", "outline": 0.35, "anims": ["stun", "victory", "defeat"]},
    ]
    c = {"file": "C.png", "rows": 3 if premium else 4, "cols": 8, "color_ref": "A1.png", "outline": 0.35,
         "anims": ["knockback", "launched", "knockdown"] + ([] if premium else ["chase"])}
    # lote C: a ref de escala tem que ser frame RETO (lição do lote C), ajustar depois de ver a prévia
    sheets.append(c)
    if premium:
        sheets.append({"file": "CH.png", "rows": 3, "cols": 8, "color_ref": "A1.png", "outline": 0.35,
                       "anims": [{"name": "chase1", "fps": 12, "loop": 0, "anchor": "cell", "air": 1},
                                 {"name": "chase2", "fps": 14, "loop": 0, "anchor": "cell", "air": 1},
                                 {"name": "chase3", "fps": 12, "loop": 0, "anchor": "cell"}]})
    return {"name": nid, "body_h": 115, "sheets": sheets,
            "fx": {"file": "D.png", "rows": 6, "cols": 6, "fps": 12,
                   "names": ["proj", "hit", "jutsu", "chase", "impact", "aura"]}}


def cmd_config(nid, premium):
    p = os.path.join(CFG, nid + '.json')
    if os.path.exists(p):
        sys.exit(f'{p} já existe (não sobrescrevo).')
    os.makedirs(os.path.join(ROOT, 'tools/sprites/src', nid), exist_ok=True)
    json.dump(cfg_template(nid, premium), open(p, 'w'), indent=1, ensure_ascii=False)
    print(f'ok: {p}\nSalve os sheets em tools/sprites/src/{nid}/ (A1, A1B, A2, B1, B2, C, CH, D) e rode:\n'
          f'  cd tools/sprites && python3 shinobi_atlas.py config/{nid}.json\n'
          'Conferir a prévia (out/<id>_preview.png); ajustar `ref` do lote C e `scale_mul` se o boneco ficar gigante/pequeno.')


def cmd_snippets(nid):
    aj = json.load(open(f'{OUT}/{nid}_atlas.json'))
    parts = []
    for a in aj['anims']:
        parts.append(f"{a['name']}:[{a['row']},{a['n']},{a['fps']},{a['loop']},{a['pingpong']}]")
    H = aj['h']
    print('// js/sprites.js — objeto V2 (ajuste hd com o pescoço/cabeça do quadro 0):')
    print(f" {nid}:{{hd:[96,55],H:{H},a:{{{','.join(parts)}}}}},\n")
    fp = f'{OUT}/{nid}_fx.json'
    if os.path.exists(fp):
        fj = json.load(open(fp))['fx']
        fxa = ','.join(f"{f['name']}:[{f['row']},{f['n']}]" for f in fj)
        print('// js/fx.js — FXA (lista do atlas de efeitos):')
        print(f" {nid}:{{c:8,a:{{{fxa}}}}},")
        names = [f['name'] for f in fj]
        print('// js/fx.js — FXUSE (qual efeito cada momento usa; troque pelos nomes certos):')
        g = lambda i: names[i] if i < len(names) else names[0]
        print(f" {nid}:{{hit:'{g(1)}',jutsu:'{g(2)}',chase:'{g(3)}',imp:'{g(4)}',aura:'{g(5)}',proj:'{g(0)}'}},")
        print('// + FXMOVE (como cada efeito se mexe) e complemento em código (fxCont/jutsuFx), regra de 22/11.\n')
    print('// js/data.js — objeto N (esqueleto; hits = fração do contato de cada golpe, ver docs/fluidez.md):')
    print(f""" {nid}:{{name:'{nid.title()}',el:'Neutro',c:'#e8803a',role:'Atacante',hp:900,atk:100,def:15,dodge:10,
  normal:{{name:'Basico',mult:.45,target:'front',hits:[.2,.5,.8]}},
  jutsu:{{name:'Jutsu',cost:40,cd:2,mult:1,target:'front',an:'atk2',desc:'...'}},
  chase:{{name:'Perseguicao',on:'L',cause:'D',mult:.8,mv:'slam'}}}}""")
    print('\nDepois: copiar out/<id>_atlas.png e _fx.png pra spr/, FACE (comando face), audit_atlas.py --fix,'
          ' gen_ninja_sfx.py, audio.js, test_battle.py. Veja `checklist`.')


def cmd_face(nid, anim='idle'):
    anim = {'cast': 'seals'}.get(anim, anim)   # 'cast' é o nome do jogo; no atlas a anim é 'seals'
    from PIL import Image
    import numpy as np
    png = os.path.join(ROOT, 'spr', f'{nid}_atlas.png')
    if not os.path.exists(png): png = f'{OUT}/{nid}_atlas.png'
    row = None
    jp = f'{OUT}/{nid}_atlas.json'
    if os.path.exists(jp):
        for a in json.load(open(jp))['anims']:
            if a['name'] == anim: row = a['row']
    if row is None:   # sem json (atlas já integrado): lê a linha no V2 de js/sprites.js
        m = re.search(rf'\b{nid}:\{{hd:.*?a:\{{(.*?)\}}\}}', open(f'{ROOT}/js/sprites.js', encoding='utf8').read())
        mm = re.search(rf'\b{anim}:\[(\d+),', m.group(1)) if m else None
        row = int(mm.group(1)) if mm else None
    if row is None: sys.exit(f'anim {anim} não encontrada (nem no json, nem no V2)')
    im = Image.open(png).convert('RGBA'); CW, CH = 192, 160
    cell = np.array(im.crop((0, row * CH, CW, (row + 1) * CH)))[..., 3] > 40
    ys = np.nonzero(cell.any(axis=1))[0]
    top = int(ys[0]); xs = np.nonzero(cell[top:top + 12].any(axis=0))[0]
    cx = int(xs.mean())
    print(f'FACE {nid} {anim}: topo da cabeça y={top}, centro x={cx}  ->  {nid}:{{{anim}:[{cx},{top + 16}]}}')
    print('Conferir o retrato num contact sheet (cut-in 5.2 e círculo 1.8) antes de commitar.')


def cmd_checklist(nid):
    def has(path, pat):
        try: return re.search(pat, open(os.path.join(ROOT, path), encoding='utf8').read()) is not None
        except OSError: return False
    def hasctx(path, pat):   # fichas/ondas ficam no repo privado ao lado (../formacao-shinobi-ctx), senão aqui
        for base in (os.path.join(ROOT, '..', 'formacao-shinobi-ctx'), ROOT):
            fp = os.path.join(base, path)
            if os.path.exists(fp): return re.search(pat, open(fp, encoding='utf8').read()) is not None
        return False
    items = [
        ('config do recorte', os.path.exists(f'{CFG}/{nid}.json')),
        ('sheets em tools/sprites/src', os.path.isdir(f'{ROOT}/tools/sprites/src/{nid}') and bool(os.listdir(f'{ROOT}/tools/sprites/src/{nid}'))),
        ('atlas em spr/', os.path.exists(f'{ROOT}/spr/{nid}_atlas.png')),
        ('efeitos em spr/', os.path.exists(f'{ROOT}/spr/{nid}_fx.png')),
        ('V2 em js/sprites.js', has('js/sprites.js', rf'\b{nid}:\{{hd:')),
        ('FACE em js/sprites.js', has('js/sprites.js', rf'FACE=\{{.*\b{nid}:')),
        ('N em js/data.js', has('js/data.js', rf"\b{nid}:\{{name:")),
        ('FXA/FXUSE em js/fx.js', has('js/fx.js', rf'\b{nid}:\{{hit:')),
        ('sons gerados (audio/sfx: -atk, -chase, esq-, jutsux-)', all(os.path.exists(f'{ROOT}/audio/sfx/{f}.ogg') for f in (f'{nid}-atk', f'{nid}-chase', f'esq-{nid}', f'jutsux-{nid}'))),
        ('ficha em docs/ninjas.md (repo de contexto)', hasctx('docs/ninjas.md', nid.title())),
        ('patch notes (docs/patch-notes.md)', has('docs/patch-notes.md', nid.title())),
    ]
    for t, ok in items: print(('✅' if ok else '⬜'), t)
    print('(audio.js monta as listas a partir de N em data.js: não precisa ligar à mão. Rode audit_atlas.py --fix depois de copiar o atlas.)')
    print('Depois: python3 tools/test_battle.py . /tmp/shots, patch_notes.py, bump_version.py, commit e push.')


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) < 2 or a[0] not in ('config', 'snippets', 'face', 'checklist'):
        sys.exit(__doc__)
    nid = a[1]
    if a[0] == 'config': cmd_config(nid, '--premium' in a)
    elif a[0] == 'snippets': cmd_snippets(nid)
    elif a[0] == 'face': cmd_face(nid, a[2] if len(a) > 2 else 'idle')
    else: cmd_checklist(nid)
