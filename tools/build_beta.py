#!/usr/bin/env python3
"""Gera beta/index.html a partir do index.html do jogo: MESMO motor e mesmos assets, mas um jogo separado (preview do Kaen).
Mudanças na página gerada: <base href="../"> (assets da raiz), save separado (toda chave 'shinobi*' vira 'beta-shinobi*'), sem service worker,
título BETA e o diretor do tutorial (beta/beta.js + beta/beta.css). Rode depois de mexer no index.html (o release.py/teste conferem)."""
import re, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
def transform(src):
    shim = """<script>/* BETA: save separado do jogo */(function(){window.BETA=true;var P=Storage.prototype,g=P.getItem,s=P.setItem,r=P.removeItem,m=function(k){return /^shinobi/.test(k)?'beta-'+k:k};
    P.getItem=function(k){return g.call(this,m(k))};P.setItem=function(k,v){return s.call(this,m(k),v)};P.removeItem=function(k){return r.call(this,m(k))};})();</script>"""
    out = src.replace('<head>', '<head>\n<base href="../">\n' + shim, 1) if '<head>' in src else src
    assert '<base href' in out, 'sem <head>'
    out = re.sub(r'<title>.*?</title>', '<title>Kaen — Preview BETA</title>', out, count=1, flags=re.S)
    out = re.sub(r"<script>\s*if\('serviceWorker' in navigator.*?</script>", '', out, flags=re.S)   # sem PWA no beta
    assert 'serviceWorker' not in out
    out = out.replace('</body>', '<link rel="stylesheet" href="beta/beta.css">\n<script src="beta/beta.js"></script>\n</body>', 1)
    return out

def build():
    return transform(open(os.path.join(R, 'index.html'), encoding='utf8').read())

if __name__ == '__main__':
    os.makedirs(os.path.join(R, 'beta'), exist_ok=True)
    open(os.path.join(R, 'beta/index.html'), 'w', encoding='utf8').write(build())
    print('beta/index.html gerado')
