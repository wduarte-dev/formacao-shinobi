"""Regressões do dado de iniciativa e da entrada: giro >= 3s reais em 0.5x/1x/2x, dado só na rodada 1, rodadas seguintes alternam,
corrida termina junto com o deslocamento, e na Formação o arrasto de entrada só começa depois dos círculos pulsarem.
Uso: python3 tools/test_iniciativa.py"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
with ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=root)) as server, sync_playwright() as pw:
    Thread(target=server.serve_forever, daemon=True).start()
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={"width": 1152, "height": 648})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(f"http://127.0.0.1:{server.server_port}/index.html")
    page.wait_for_timeout(800)
    # 1) duração real do giro e do deslocamento em cada velocidade
    for spd in (0.5, 1, 2):
        r = page.evaluate("""async (spd) => {
          loadSfx=()=>{}; speed=spd; placed=[{id:'kaen',row:0,depth:0},{id:'iwao',row:1,depth:0},{id:'mizuha',row:2,depth:0},{id:'raiden',row:0,depth:1}];
          run=()=>{}; startBattle2(); token++; const tk=token;
          await preloadFx(['kaen']); const hasAtlas=KEEP[INITIATIVE_ATLAS].naturalWidth===960; const t0=performance.now(); let landAt=0;
          const land=sfx.diceLand; sfx.diceLand=()=>{landAt=performance.now()-t0; land();};
          await showInitiative(4);
          const spin=landAt;
          for(const u of all()){u.mv.style.transition=`transform ${700/speed}ms linear`;}
          return {hasAtlas, spin, total:performance.now()-t0};
        }""", spd)
        print(f"{spd}x ->", r)
        assert r["hasAtlas"], "atlas do dado não carregou"
        if True:
            assert r["spin"] >= 2900, f"giro curto em {spd}x: {r['spin']}"
    # 2) dado só na rodada 1; depois alterna
    page.reload(); page.wait_for_timeout(800)
    r = page.evaluate("""() => {
      loadSfx=()=>{}; sleep=async()=>{}; intro=async()=>{}; showInitiative=async()=>{};
      placed=[{id:'kaen',row:0,depth:0}]; FOES[0].team=[['iwao',0,0]]; autoP=true;
      window.chk={rolls:0,first:[]};
      rollInitiative=()=>{chk.rolls++; return 2;};   // par: jogador começa a 1
      doSkill=async u=>{chk.first[round-1]??=u.side;};
      startBattle2();
    }""")
    page.wait_for_function("round>=6", timeout=20000)
    c = page.evaluate("chk")
    assert c["rolls"] == 1, c
    assert c["first"][:6] == ["p", "e", "p", "e", "p", "e"], c
    # 3) Formação: entrada só depois dos pulsos
    page.reload(); page.wait_for_timeout(800)
    d = page.evaluate("""() => { placed=[{id:'kaen',row:0,depth:0},{id:'iwao',row:1,depth:0},{id:'mizuha',row:2,depth:0},{id:'raiden',row:0,depth:1}];
      show('sForm'); const a=document.getAnimations().filter(x=>x.id==='formation-entry'); return a.map(x=>x.effect.getTiming().delay); }""")
    print("delays entrada:", d)
    assert d and min(d) >= 2000, d
    browser.close(); server.shutdown()
    assert not errors, errors
print("Dado (3s reais), rodada 1 única, alternância e entrada da Formação conferidos.")
