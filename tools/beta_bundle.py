#!/usr/bin/env python3
"""Monta o pacote do beta pra publicar como Artifact: roda o tutorial inteiro em beta/index.html registrando TODOS os arquivos que o jogo pede
e grava <saida>/manifest.json ({caminho publicado: arquivo do repo}) e <saida>/index.html (fragmento, ver build_beta.artifact()).
python3 tools/beta_bundle.py <pasta_saida>"""
import json, os, subprocess, sys, time
from urllib.parse import urlparse, unquote
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); out = sys.argv[1]; os.makedirs(out, exist_ok=True)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import build_beta
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8788', '--bind', '127.0.0.1', '-d', ROOT], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
seen = {}
try:
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(service_workers='block', viewport={'width': 1152, 'height': 648}); o = 'http://127.0.0.1:8788'
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(o + '/') else r.fulfill(status=200, body=''))
        def on_resp(r):
            u = r.url
            if u.startswith(o + '/') and r.status == 200: seen[unquote(urlparse(u).path.lstrip('/'))] = 1
        pg.on('response', on_resp)
        pg.goto(o + '/beta/index.html'); pg.wait_for_timeout(900); pg.click('#betaGo')
        n = pg.evaluate('betaDebug.STEPS.length')
        for i in range(n):
            pg.wait_for_function(f"betaDebug.cur=={i} && !document.getElementById('betaPanel').hidden && !document.getElementById('bpOk').disabled", timeout=240000)
            pg.click('#bpOk'); pg.wait_for_timeout(300)
        b.close()
finally:
    srv.terminate()
man = {}
for path in sorted(seen):
    if path in ('beta/index.html', 'index.html', '') or path.endswith('/'): continue
    pub = {'beta/beta.js': 'beta.js', 'beta/beta.css': 'beta.css'}.get(path, path)
    if os.path.isfile(os.path.join(ROOT, path)): man[pub] = path
open(os.path.join(out, 'manifest.json'), 'w').write(json.dumps(man, indent=1)); open(os.path.join(out, 'index.html'), 'w', encoding='utf8').write(build_beta.artifact())
tot = sum(os.path.getsize(os.path.join(ROOT, v)) for v in man.values()); print(len(man), 'arquivos,', round(tot / 1e6, 1), 'MB'); print([k for k in man if k.startswith('audio')][:3], sum(k.startswith('audio') for k in man), 'sons')
