#!/usr/bin/env python3
"""Campo de Provas: roda a missão-laboratório (js/prova.js) no navegador e confere o resultado.

Uso:
  python3 tools/prova.py                      # luta padrão; confere invariantes + impressão digital
  python3 tools/prova.py --grava              # regrava a impressão digital (mudança de comportamento PROPOSITAL)
  python3 tools/prova.py --repete 2           # roda 2x e exige o mesmo hash (determinismo)
  python3 tools/prova.py --cpu 8              # CPU 8x mais lenta (CDP): lógica presa ao relógio da animação muda o hash
  python3 tools/prova.py --cfg '{"seed":3}'   # config livre (JSON inline ou caminho .json); não compara impressão
  python3 tools/prova.py --set chance.strong=1 --set e.0.hp=0.1
Saída: uma linha por luta. Print e log de eventos só quando falha (pasta impressa).
"""
import argparse
import functools
import http.server
import json
from pathlib import Path
import sys
import tempfile
import threading

ROOT = Path(__file__).resolve().parents[1]
DIGITAL = ROOT / 'tools/prova/digital.json'
# mecânicas que a luta padrão TEM que exercitar (cobertura: se a semente parar de passar por elas, o teste perde valor)
EXIGE = {'jutsus': 1, 'fortes': 1, 'perseguicoes': 1, 'absorvido': 1, 'dot': 1, 'clones': 1}
EXIGE_ESTADOS = ('D', 'V', 'R', 'L')


def parse_value(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return text


def apply_set(cfg, base, expr):
    """--set a.b.0.c=valor: escreve no caminho; listas de time são copiadas da base quando faltam."""
    path, _, raw = expr.partition('=')
    keys = path.split('.')
    node = cfg
    for i, key in enumerate(keys[:-1]):
        nxt = keys[i + 1]
        if isinstance(node, list):
            node = node[int(key)]
            continue
        if key not in node:
            node[key] = json.loads(json.dumps(base[key])) if key in ('p', 'e') else ([] if nxt.isdigit() else {})
        node = node[key]
    last = keys[-1]
    if isinstance(node, list):
        node[int(last)] = parse_value(raw)
    else:
        node[last] = parse_value(raw)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):  # navegador fechando conexão (BrokenPipe) não é falha da prova
        pass


def run_once(page, origin, cfg, timeout_s):
    page.goto(origin + '/index.html')
    page.wait_for_function('typeof provaStart==="function"')
    page.evaluate('cfg=>provaStart(cfg)', cfg)
    page.wait_for_selector('#resWin:not(.hide)', timeout=timeout_s * 1000)
    return page.evaluate('()=>({...provaDigital(), log: provaEvs})')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--cfg', default='', help='JSON inline ou arquivo .json com a config da prova')
    ap.add_argument('--set', action='append', default=[], metavar='CAMINHO=VALOR')
    ap.add_argument('--grava', action='store_true', help='regrava a impressão digital da luta padrão')
    ap.add_argument('--repete', type=int, default=1, help='quantas vezes rodar (todas precisam dar o mesmo hash)')
    ap.add_argument('--cpu', type=float, default=1, help='estrangula a CPU N vezes (determinismo sob carga; mesmo hash esperado)')
    ap.add_argument('--timeout', type=int, default=300, help='segundos por luta')
    ap.add_argument('--out', default='', help='pasta para print/log em caso de falha')
    args = ap.parse_args()

    from playwright.sync_api import sync_playwright

    cfg = {}
    if args.cfg:
        src = Path(args.cfg)
        cfg = json.loads(src.read_text() if src.suffix == '.json' and src.is_file() else args.cfg)
    padrao = not cfg and not args.set

    server = Server(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    errors, results, falhas = [], [], []
    out = Path(args.out or tempfile.mkdtemp(prefix='shinobi-prova-'))
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(service_workers='block', viewport={'width': 1152, 'height': 648})
            if args.cpu > 1:
                page.context.new_cdp_session(page).send('Emulation.setCPUThrottlingRate', {'rate': args.cpu})
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.on('console', lambda m: m.type == 'error' and 'fonts.g' not in m.location.get('url', '')
                    and errors.append(m.text))
            page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(origin + '/')
                       else r.fulfill(status=200, body=''))
            if args.set:
                base = page.goto(origin + '/index.html') and page.evaluate('()=>PROVA_BASE')
                for expr in args.set:
                    apply_set(cfg, base, expr)
            for i in range(args.repete):
                try:
                    d = run_once(page, origin, cfg, args.timeout)
                except Exception as exc:  # luta não terminou: guarda o print e segue para o relatório
                    falhas.append(f'luta {i + 1} não terminou: {type(exc).__name__}')
                    out.mkdir(parents=True, exist_ok=True)
                    page.screenshot(path=str(out / f'falha_{i + 1}.png'))
                    break
                results.append(d)
                est = ' '.join(f'{k}{v}' for k, v in sorted(d['estados'].items()))
                print(f"prova {i + 1}: {d['res']} em {d['rodadas']} rodadas | hash {d['hash']} | "
                      f"{d['acoes']} ações, {d['jutsus']} jutsus, {d['fortes']} fortes, {d['perseguicoes']} perseguições "
                      f"(combo máx {d['maiorCombo']}), estados {est or '-'}, dano {d['danoP']}/{d['danoE']}, "
                      f"escudo {d['absorvido']}, dot {d['dot']}, clones {d['clones']}")
            browser.close()
    finally:
        server.shutdown()

    if errors:
        falhas.append('erros no console: ' + ' | '.join(errors[:5]))
    for d in results:
        if d.get('copia'):
            falhas.append('cópia da tela diverge da regra no fim: ' + ', '.join(d['copia']))
    hashes = {d['hash'] for d in results}
    if len(hashes) > 1:
        falhas.append(f'NÃO determinístico: {len(hashes)} hashes diferentes com a mesma config')
    if results and padrao:
        d = results[0]
        for k, mn in EXIGE.items():
            if d[k] < mn:
                falhas.append(f'cobertura: {k}={d[k]} (mínimo {mn})')
        for s in EXIGE_ESTADOS:
            if not d['estados'].get(s):
                falhas.append(f'cobertura: estado {s} não apareceu')
        resumo = {k: v for k, v in d.items() if k != 'log'}
        if args.grava:
            DIGITAL.parent.mkdir(parents=True, exist_ok=True)
            DIGITAL.write_text(json.dumps({'padrao': resumo}, ensure_ascii=False, indent=1) + '\n')
            print(f'impressão digital gravada em {DIGITAL.relative_to(ROOT)}')
        elif DIGITAL.is_file():
            ref = json.loads(DIGITAL.read_text())['padrao']
            if ref['hash'] != d['hash']:
                diff = ', '.join(f'{k}: {ref.get(k)} -> {v}' for k, v in resumo.items() if ref.get(k) != v)
                falhas.append(f'impressão digital mudou ({diff}). Se foi de propósito: python3 tools/prova.py --grava')
        else:
            falhas.append('sem impressão digital gravada: rode python3 tools/prova.py --grava')
    if falhas:
        out.mkdir(parents=True, exist_ok=True)
        for i, d in enumerate(results):
            (out / f'eventos_{i + 1}.json').write_text(json.dumps(d['log'], ensure_ascii=False))
        print('FALHOU:\n  ' + '\n  '.join(falhas) + f'\n  arquivos: {out}')
        sys.exit(1)
    print('ok')


if __name__ == '__main__':
    main()
