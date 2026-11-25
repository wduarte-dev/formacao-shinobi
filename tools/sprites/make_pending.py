#!/usr/bin/env python3
"""Monta a fila de geração de sprites pro ChatGPT em sprites_novos/GERAÇÃO_PENDENTE/.
Uso: python3 tools/sprites/make_pending.py <ninja> [A1 A1B A2 ...]   (sem lotes = cadeia completa do ninja novo)
Cria jobs/<NN>_<ninja>_<lote>/ com prompt.txt + refs + ANEXOS.txt + SAIDA.txt e acrescenta linhas em FILA.md.
Prompts vêm de ../formacao-shinobi-ctx/docs/refs/<ninja>_<lote>_prompt.txt (gerados por gen_prompts_lotes.py)."""
import os, sys, shutil, re
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CTX = os.path.join(R, '..', 'formacao-shinobi-ctx', 'docs', 'refs')
BASE = os.path.join(R, 'sprites_novos', 'GERAÇÃO_PENDENTE')
# lote -> lote cujo PNG aprovado vai anexado (None = só a ref do elenco). STYLE = 1 frame de idle pra aprovar o visual
# antes de gastar geração nos sheets; A1 anexa elenco_ref + STYLE aprovado. Use --no-style se o ninja já tem A1 (ex.: Utsushi).
CHAIN = [('STYLE', None), ('A1', 'STYLE'), ('A1B', 'A1'), ('A2', 'A1'), ('B1', 'A2'), ('B2', 'B1'), ('C', 'B2'), ('CH', 'C'), ('CL', 'A1'), ('D', 'A1')]
DESC = {'STYLE': 'UM frame de idle (aprovar o visual)', 'A1': 'idle, andar, investida', 'A1B': 'básico em 3 golpes (18 quadros)', 'A2': 'forte, defesa, dano, esquiva',
        'B1': 'selos, jutsu, buff', 'B2': 'atordoado, vitória, derrota', 'C': 'repelido, lançado, derrubado',
        'CH': 'perseguição (18 quadros)', 'CL': 'clones em forma de sombra', 'D': 'efeitos (6x6)'}

def main():
    nin = sys.argv[1].lower(); nostyle = '--no-style' in sys.argv; sel = [x.upper() for x in sys.argv[2:] if not x.startswith('--')]
    chain = [c for c in CHAIN if (not sel or c[0] in sel) and not (nostyle and c[0] == 'STYLE')]
    chain = [(l, (None if (nostyle and d == 'STYLE') else d)) for l, d in chain]
    os.makedirs(os.path.join(BASE, 'jobs'), exist_ok=True)
    fila = os.path.join(BASE, 'FILA.md')
    head = '# FILA de geração\n\nLeia primeiro o `LEIA-ME.md`. Estados: ⬜ pronto pra gerar (só com ordem do dono) · 🔒 bloqueado (espera o job de que depende ficar ✅) · ✅ aprovado pelo dono (arquivo já em `sprites_novos/`) · ⚠ conferência reprovou (avisar o dono) · ⏭ pulado (o dono gerou por conta própria; esperar o arquivo em `sprites_novos/`) · ♻ dono pediu pra regerar. Antes da aprovação a imagem só existe no chat; a fila só muda depois do SIM.\n\n| Job | Status | Saída (sprites_novos/) | Depende de | Aprovado pelo dono? | Pasta |\n|---|---|---|---|---|---|\n'
    rows = open(fila, encoding='utf8').read() if os.path.exists(fila) else head
    n0 = len(re.findall(r'^\| \d\d ', rows, re.M))
    nxt = n0 + 1
    for lote, dep in chain:
        m = re.search(rf'^\| (\d\d_{nin}_{lote}) \|', rows, re.M)   # job já existe: reaproveita a pasta (atualiza os prompts)
        if m: job = m.group(1)
        else: job = f'{nxt:02d}_{nin}_{lote}'; nxt += 1
        d = os.path.join(BASE, 'jobs', job); os.makedirs(d, exist_ok=True)
        src = os.path.join(CTX, f'{nin}_{lote}_prompt.txt')
        if not os.path.exists(src): sys.exit(f'falta o prompt {src}')
        shutil.copy(src, os.path.join(d, 'prompt.txt'))
        out = f'{nin.upper()}_{lote}.png'
        if dep is None or dep == 'STYLE':
            shutil.copy(os.path.join(CTX, 'elenco_ref.png'), os.path.join(d, 'ref_elenco.png'))
        if dep is None:
            anex = 'Anexe SÓ esta imagem: ref_elenco.png (desta pasta).'
            dep_txt, status = '—', '⬜'
        elif dep == 'STYLE':
            anex = f'Anexe DUAS imagens, nesta ordem: 1) ref_elenco.png (desta pasta); 2) sprites_novos/{nin.upper()}_STYLE.png (o visual já APROVADO).'
            dep_txt, status = f'{nin.upper()}_STYLE', '🔒'
        else:
            dep_out = f'{nin.upper()}_{dep}.png'
            anex = f'Anexe SÓ esta imagem: sprites_novos/{dep_out} (o sheet {dep} já APROVADO, em sprites_novos/).'
            dep_txt, status = f'{nin.upper()}_{dep}', '🔒'
        open(os.path.join(d, 'ANEXOS.txt'), 'w', encoding='utf8').write(anex + '\n\nANTES de gerar: releia sprites_novos/GERAÇÃO_PENDENTE/DIRETRIZES.md inteiro.\n')
        open(os.path.join(d, 'SAIDA.txt'), 'w', encoding='utf8').write(f'Mostrar a imagem no chat e perguntar ao dono "aprova ou não?". Só com o SIM salvar EXATAMENTE como sprites_novos/{out}.\n(lote {lote}: {DESC.get(lote, "")})\n')
        if f'| {job} |' not in rows:
            rows += f'| {job} | {status} | `{out}` | {dep_txt} | — | `jobs/{job}/` |\n'
    open(fila, 'w', encoding='utf8').write(rows); print('ok ->', BASE)
main()
