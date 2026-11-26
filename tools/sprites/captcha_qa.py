#!/usr/bin/env python3
"""Captcha de QA de sprites: mede QUAIS detectores acertam, com 1 clique sim/não do dono por suspeito.
Fluxo:
  detect <sheet.png ...> [--frames 7] [--raw] [--no-gemini] [--controls 4] --out DIR   # detecta suspeitos e monta a fila (DIR/queue.json)
  batch DIR [--n 4]                         # próximos N itens sem resposta: imagem DIR/batch_K.png + perguntas numeradas
  answer DIR "s n n s"                      # respostas do último batch (s/n) -> grava em tools/sprites/captcha/log.csv
  report                                    # precisão por detector/defeito + taxa de defeito nos controles (estimativa de cobertura)
Detectores: local:verde_halo (halo/brilho esverdeado, relativo à mediana do sheet), local:celula (conteúdo depois do último frame),
gemini (visão, 1 chamada por meia tira de 4 quadros; é só SUSPEITO). controle = quadro sem suspeita, pergunta genérica
(estima o que os detectores deixam passar). Sheets: 8 colunas iguais; --raw limpa label e faixas brancas (sheets crus do gerador)."""
import sys, os, json, csv, time, random, argparse
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..'))
LOG = os.path.join(HERE, 'captcha', 'log.csv')
PERGUNTA = {
 'membro_duplicado': 'Este quadro tem braço, perna ou cabeça DUPLICADO ou sobrando?',
 'acessorio_faltando': 'Falta o cajado ou a lanterna (ou outro acessório) neste quadro?',
 'acessorio_duplicado': 'Há cajado/lanterna (ou outro acessório) DUPLICADO neste quadro?',
 'corpo_translucido': 'O corpo do personagem está translúcido/fantasma neste quadro?',
 'verde_no_sprite': 'Há verde sujando o sprite, ou brilho esverdeado/amarelo-esverdeado em volta de algo?',
 'celula_invadida': 'Este quadro deveria estar vazio, mas tem conteúdo?',
 'brilho_halo': 'Há brilho/halo amarelado ou esverdeado (luz da lanterna etc.) misturado com o fundo em volta de algo?',
 'mao_emendada': 'Há mão EMENDADA/fundida com o acessório ou com o corpo (aquela mistura estranha de IA)?',
 'mao_escondida': 'Falta uma mão visível (escondida dentro do corpo/manga)?',
 'vao_fundo': 'Sobrou um vão/fundo que devia ter sido removido (ex.: entre cachecol e roupa)?',
 'sujeira_fora': 'Há sujeira/pedaços soltos FORA do sprite?',
 'controle': 'Este quadro tem ALGUM defeito (membro, acessório, fantasma, verde, corte)?',
}
GEM = ("Você é revisor de QA de sprites pixel art (fundo verde #00FF00). A imagem tem 4 quadros lado a lado do MESMO personagem numa animação; "
       "numere-os de 1 a 4 da esquerda para a direita. Procure SÓ estes defeitos concretos por quadro: verde_no_sprite (verde sujando o personagem ou brilho esverdeado), "
       "mao_emendada (mão fundida/emendada com o acessório ou com o corpo, sem dedos claros), mao_escondida (uma mão que some dentro do corpo/manga), "
       "vao_fundo (fresta entre peças do sprite onde sobrou fundo que devia ter sido removido), sujeira_fora (pontos/pedaços soltos fora do sprite; NÃO conta mariposa nem efeito). "
       "Responda SÓ um JSON: [{\"frame\":1..4,\"defeito\":\"<um dos nomes>\",\"motivo\":\"<curto>\"}]. Sem defeito = []. Não invente: se tiver dúvida, não liste. "
       "(Histórico do captcha: corpo_translucido, acessorio_faltando/duplicado e membro_duplicado deram 0 acertos em 8 e foram removidos; os 4 tipos de mão/vão/sujeira são NOVOS e estão em teste.)")

def prep(path, raw):
    a = np.asarray(Image.open(path).convert('RGB')).copy()
    if not raw: return a
    ge = a[..., 1].astype(int) - np.maximum(a[..., 0], a[..., 2]).astype(int)
    rows = np.nonzero(np.median(ge, axis=1) > 100)[0]; b = a[rows.min():rows.max() + 1].copy()
    g = np.median(b[(ge[rows.min():rows.max() + 1]) > 100], axis=0).astype(np.uint8); b[:55, :430] = g
    gb = b[..., 1].astype(int) - np.maximum(b[..., 0], b[..., 2]).astype(int)
    ys = np.nonzero(ndi.binary_opening(gb < 38).sum(1) > 3)[0]
    return b[max(ys.min() - 18, 0):min(ys.max() + 18, b.shape[0] - 1) + 1]

def frames(a): w = a.shape[1] / 8; return [a[:, int(c * w):int((c + 1) * w)] for c in range(8)]

def metrics(f):
    ge = f[..., 1].astype(int) - np.maximum(f[..., 0], f[..., 2]).astype(int)
    fg = ndi.binary_opening(ge < 38); edge = fg & ~ndi.binary_erosion(fg)
    return int((fg & (ge > 8) & ~edge).sum()), int(fg.sum())

def local(sheet, a, nfr):
    out, fr = [], frames(a); m = [metrics(f) for f in fr]; med = float(np.median([t for t, _ in m[:nfr]]))
    for i, (t, area) in enumerate(m, 1):
        if i <= nfr and t >= max(150, 1.8 * med): out.append(dict(frame=i, detector='local:verde_halo', defeito='brilho_halo', motivo=f'tom verde {t} px (mediana do sheet {med:.0f})'))
        if i > nfr and area > 400: out.append(dict(frame=i, detector='local:celula', defeito='celula_invadida', motivo=f'{area} px depois do último quadro'))
    return out

def gemini(sheet, a, nfr, model):
    import qa_gemini as G
    out, fr = [], frames(a)
    for h in (0, 4):
        if h >= nfr: break
        im = Image.fromarray(np.concatenate(fr[h:h + 4], axis=1)); im = im.resize((im.width * 3 // 2, im.height * 3 // 2), Image.LANCZOS)
        r = G.ask(model, GEM, G.to_png_b64(im)); time.sleep(4)
        try: js = json.loads(r[r.index('['):r.rindex(']') + 1])
        except Exception: print('  gemini sem JSON:', r[:80]); continue
        for j in js:
            k = h + int(j.get('frame', 0)); d = j.get('defeito', 'outro')
            if 1 <= k <= nfr and d in PERGUNTA and d != 'controle': out.append(dict(frame=k, detector='gemini', defeito=d, motivo=str(j.get('motivo', ''))[:80]))
    return out

def cmd_detect(a):
    os.makedirs(a.out, exist_ok=True); q = []; seen = set()
    sheets = {os.path.basename(p)[:-4]: prep(p, a.raw) for p in a.sheets}
    for name, arr in sheets.items():
        found = local(name, arr, a.frames) + ([] if a.no_gemini else gemini(name, arr, a.frames, a.model))
        for it in found: q.append(dict(sheet=name, **it)); seen.add((name, it['frame']))
        print(name, [(i['detector'].split(':')[-1], i['frame'], i['defeito']) for i in found])
    pool = [(n, i) for n in sheets for i in range(1, a.frames + 1) if (n, i) not in seen]; random.seed(7)
    for n, i in random.sample(pool, min(a.controls, len(pool))): q.append(dict(sheet=n, frame=i, detector='controle', defeito='controle', motivo=''))
    random.shuffle(q)
    for k, it in enumerate(q, 1): it['id'] = k; it['resp'] = None
    json.dump(dict(items=q, last=[], dir=a.out, raw=a.raw, paths={os.path.basename(p)[:-4]: os.path.abspath(p) for p in a.sheets}), open(os.path.join(a.out, 'queue.json'), 'w'), indent=1, ensure_ascii=False)
    print(len(q), 'itens na fila (', sum(i['detector'] != 'controle' for i in q), 'suspeitos +', sum(i['detector'] == 'controle' for i in q), 'controles )')

def cmd_batch(a):
    qp = os.path.join(a.dir, 'queue.json'); Q = json.load(open(qp)); todo = [i for i in Q['items'] if i['resp'] is None][:a.n]
    if not todo: print('fila vazia'); return
    tiles = []
    for k, it in enumerate(todo, 1):
        f = frames(prep(Q['paths'][it['sheet']], Q['raw']))[it['frame'] - 1]; t = Image.fromarray(f).resize((f.shape[1] * 2, f.shape[0] * 2), Image.NEAREST)
        d = ImageDraw.Draw(t); d.rectangle([0, 0, 40, 26], fill=(0, 0, 0)); d.text((8, 7), str(k), fill=(255, 255, 255)); tiles.append(t)
    W = sum(t.width for t in tiles) + 6 * (len(tiles) - 1); sh = Image.new('RGB', (W, max(t.height for t in tiles)), (30, 30, 30)); x = 0
    for t in tiles: sh.paste(t, (x, 0)); x += t.width + 6
    n = len([i for i in Q['items'] if i['resp'] is not None]) // a.n + 1; p = os.path.join(a.dir, f'batch_{n}.png')
    sh.resize((min(sh.width, 2000), int(sh.height * min(sh.width, 2000) / sh.width)), Image.LANCZOS).save(p)
    Q['last'] = [i['id'] for i in todo]; json.dump(Q, open(qp, 'w'), indent=1, ensure_ascii=False)
    print(p)
    for k, it in enumerate(todo, 1): print(f'{k}) {PERGUNTA[it["defeito"]]}')

def cmd_answer(a):
    qp = os.path.join(a.dir, 'queue.json'); Q = json.load(open(qp)); r = a.resp.lower().split(); ids = Q['last']
    assert len(r) == len(ids) and all(x in ('s', 'n') for x in r), f'preciso de {len(ids)} respostas s/n'
    os.makedirs(os.path.dirname(LOG), exist_ok=True); new = not os.path.exists(LOG)
    with open(LOG, 'a', newline='') as fh:
        w = csv.writer(fh)
        if new: w.writerow(['sheet', 'frame', 'detector', 'defeito', 'motivo', 'veredito', 'data'])
        for i, x in zip(ids, r):
            it = next(j for j in Q['items'] if j['id'] == i); it['resp'] = x
            w.writerow([it['sheet'], it['frame'], it['detector'], it['defeito'], it['motivo'], x, time.strftime('%Y-%m-%d')])
    json.dump(Q, open(qp, 'w'), indent=1, ensure_ascii=False); print(len(ids), 'respostas gravadas em', LOG)

def cmd_report(a):
    rows = list(csv.DictReader(open(LOG))); g = {}
    for r in rows: g.setdefault((r['detector'], r['defeito']), []).append(r['veredito'] == 's')
    print('detector / defeito                      n   sim   precisão')
    for (d, df), v in sorted(g.items()):
        lab = 'taxa de defeito nos NÃO suspeitos (o que escapa)' if d == 'controle' else 'precisão'
        print(f'{d:14s} {df:20s} {len(v):3d} {sum(v):4d}   {100 * sum(v) / len(v):.0f}%  ({lab})')

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='c', required=True)
    d = sp.add_parser('detect'); d.add_argument('sheets', nargs='+'); d.add_argument('--frames', type=int, default=7); d.add_argument('--raw', action='store_true')
    d.add_argument('--no-gemini', action='store_true'); d.add_argument('--controls', type=int, default=4); d.add_argument('--out', required=True); d.add_argument('--model', default='gemini-3.5-flash-lite')
    b = sp.add_parser('batch'); b.add_argument('dir'); b.add_argument('--n', type=int, default=4)
    r = sp.add_parser('answer'); r.add_argument('dir'); r.add_argument('resp')
    sp.add_parser('report')
    a = ap.parse_args(); {'detect': cmd_detect, 'batch': cmd_batch, 'answer': cmd_answer, 'report': cmd_report}[a.c](a)
