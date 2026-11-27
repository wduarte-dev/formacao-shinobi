#!/usr/bin/env python3
"""Roda o tutorial do beta/index.html inteiro (aprova tudo, rejeita um passo com comentário), confere erros e o resumo em prompt.
python3 tools/test_beta.py [pasta_prints]"""
import subprocess, sys, time, os
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/beta_shots'
os.makedirs(out, exist_ok=True)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_beta
if open(os.path.join(ROOT, 'beta/index.html'), encoding='utf8').read() != build_beta.build():
    sys.exit('beta/index.html desatualizado: rode python3 tools/build_beta.py')
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8793', '--bind', '127.0.0.1', '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
errs = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(service_workers='block', viewport={'width': 1152, 'height': 648})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'font' not in m.text.lower() else None)
        o = 'http://127.0.0.1:8793'
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(o + '/') else r.fulfill(status=200, body=''))
        pg.goto(o + '/beta/index.html'); pg.wait_for_timeout(900)
        pg.screenshot(path=f'{out}/00_intro.png'); pg.click('#betaGo')
        n = pg.evaluate('betaDebug.STEPS.length'); t0 = time.time()
        for i in range(n):
            pg.wait_for_function(f"betaDebug.cur=={i} && !document.getElementById('betaPanel').hidden && !document.getElementById('bpOk').disabled", timeout=240000)
            pg.wait_for_timeout(300); pg.screenshot(path=f'{out}/{i+1:02d}_{pg.evaluate("betaDebug.STEPS[betaDebug.cur].t")[:18].replace(" ","_")}.png')
            if i == 2:
                pg.click('#bpNo'); pg.fill('#bpIn', 'teste de comentario'); pg.click('#bpSend')
            else:
                pg.click('#bpOk')
            pg.wait_for_timeout(400)
        pg.wait_for_selector('#betaEnd:not([hidden])', timeout=10000); pg.screenshot(path=f'{out}/99_resumo.png')
        txt = pg.evaluate("document.getElementById('beTxt').value"); print(txt)
        assert 'teste de comentario' in txt and 'NÃO APROVADOS (1)' in txt and f'APROVADOS ({n-1}/{n})' in txt
        b.close()
finally:
    srv.terminate()
print('erros:', errs if errs else 'nenhum')
sys.exit(1 if errs else 0)
