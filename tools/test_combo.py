"""Regressões da perseguição por combo (Onda 6) e do estado Voo. Uso: python3 tools/test_combo.py [pasta_de_capturas]"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]) if len(sys.argv) > 1 else None
if out:
    out.mkdir(parents=True, exist_ok=True)


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


# Monta uma luta sem o laço principal; cada cenário chama comboReactions() direto.
SETUP = """async (cfg) => {
  run=()=>{}; loadSfx=()=>{}; speed=4; autoP=false; dev=cfg.dev; Math.random=()=>.42;
  FOES[0].team=cfg.foes; FOES[0].ai=0; placed=cfg.team; mark=null;
  await preloadFx([...placed.map(p=>p.id),...FOES[0].team.map(t=>t[0])]);
  startBattle2(); round=1; curSide='p';
  window.LOG=[]; window.HITS=[]; window.SMASH=[];
  const ds=doSkill; doSkill=async(u,sk,isJ)=>{ LOG.push(u.id+':'+sk.name); return ds(u,sk,isJ); };
  const lh=landHit; landHit=(a,t,...r)=>{ HITS.push(a.id+'>'+t.id); return lh(a,t,...r); };
  const sm=smash; smash=async(a,t,s)=>{ SMASH.push(a.id+'>'+t.id+':'+s); return sm(a,t,s); };
}"""
FOES4 = [['iwao', 0, 0], ['mizuha', 1, 0], ['hiyori', 2, 0], ['mayoi', 1, 1]]

with ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=ROOT)) as server, sync_playwright() as pw:
    Thread(target=server.serve_forever, daemon=True).start()
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={"width": 1152, "height": 648}, service_workers="block")
    origin = f"http://127.0.0.1:{server.server_port}"
    page.route("**/*", lambda route: route.continue_() if route.request.url.startswith(origin + "/")
               else route.fulfill(status=200, body=""))
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(origin)

    def scene(team, dev=False, foes=FOES4):
        page.reload()
        page.evaluate(SETUP, {"team": team, "dev": dev, "foes": foes})

    # 1) Estados: o antigo Lançado virou Voo e a rasteira (L) existe só como lógica.
    page.evaluate("""() => {
      const check=(ok,msg)=>{if(!ok)throw Error(msg);};
      check(ST.V==='Voo'&&ST.L==='Lançado','rótulos de estado');
      check(Object.values(N).every(d=>![d.normal,d.strong,d.jutsu,d.recast,d.chase].some(s=>s?.cause==='L'||s?.on==='L')),'nenhum golpe antigo ficou em L');
      check(N.raiden.chase.cause==='V'&&N.kaen.chase.on==='V','Gancho deixa Voo e o Chute Meteoro persegue Voo');
      check(comboChain(['raiden','kaen'],'R').map(c=>c.id).join()==='raiden,kaen','cadeia R→V→D');
    }""")

    # 2) Raiden (Combo 20, padrão): não dispara abaixo da faixa; acima, 3 alvos distintos, 1x por rodada.
    scene([{"id": "raiden", "row": 0, "depth": 0}, {"id": "iwao", "row": 1, "depth": 0}])
    r = page.evaluate("""async () => {
      hitsR.p=19; await comboReactions(); const before=LOG.length;
      hitsR.p=20; await comboReactions(); const after=[...LOG];
      hitsR.p=40; await comboReactions();
      return {before, after, again:LOG.length, hits:HITS, used:U.p[0].comboUsed};
    }""")
    assert r["before"] == 0, r
    assert r["after"] == ["raiden:Corrente Trovão"] and r["again"] == 1 and r["used"], r
    alvos = {h.split('>')[1] for h in r["hits"] if h.startswith('raiden>')}
    assert len(alvos) == 3, r
    if out:
        page.screenshot(path=out / "combo-raiden.png")

    # 3) Estrela: Kaen (Combo 30, 2★) fica travado fora do Modo dev e libera dentro dele.
    scene([{"id": "kaen", "row": 0, "depth": 0}])
    assert page.evaluate("async()=>{ hitsR.p=30; await comboReactions(); return LOG.length; }") == 0
    scene([{"id": "kaen", "row": 0, "depth": 0}], dev=True)
    r = page.evaluate("async()=>{ hitsR.p=30; await comboReactions(); return {log:LOG, burn:U.e.filter(u=>u.dot).length}; }")
    assert r["log"] == ["kaen:Chuva de Brasas"] and r["burn"] >= 1, r

    # 4) Paralisado não dispara; a trava passa na rodada seguinte (comboUsed zera junto com chaseUsed).
    scene([{"id": "raiden", "row": 0, "depth": 0}])
    assert page.evaluate("async()=>{ U.p[0].stunned=true; hitsR.p=25; await comboReactions(); return LOG.length; }") == 0

    # 5) Cascata e ordem por casa: Keshin (C10) dispara, os hits dele levam o time a 20 e o Raiden (C20) entra em seguida.
    #    Keshin encadeia: vai no alvo marcado e deixa Lançado (rasteira).
    scene([{"id": "keshin", "row": 0, "depth": 0}, {"id": "raiden", "row": 1, "depth": 0}])
    r = page.evaluate("""async () => {
      mark=U.e[2]; hitsR.p=19; await comboReactions();
      return {log:LOG, smash:SMASH, hits:HITS, n:hitsR.p};
    }""")
    assert r["log"][:2] == ["keshin:Rasteira Dinamite", "raiden:Corrente Trovão"], r
    assert r["smash"][0] == "keshin>hiyori:L", r
    assert r["hits"][0] == "keshin>hiyori", r

    # 6) Sem alvo marcado, a que encadeia cai em alvo aleatório.
    scene([{"id": "keshin", "row": 0, "depth": 0}])
    r = page.evaluate("async()=>{ hitsR.p=10; await comboReactions(); return SMASH; }")
    assert len(r) == 1 and r[0].endswith(':L'), r

    # 7) Kazan: a Bola de Fogo virou Combo 10 do sistema (executa o volley dele).
    scene([{"id": "kazan", "row": 0, "depth": 1}])
    r = page.evaluate("async()=>{ hitsR.p=9; await comboReactions(); const a=LOG.length; hitsR.p=10; await comboReactions(); return {a, log:LOG}; }")
    assert r["a"] == 0 and r["log"] == ["kazan:Bola de Fogo"], r

    # 8) Inimigo também usa: Raiden adversário dispara pelo contador do time dele.
    scene([{"id": "iwao", "row": 0, "depth": 0}], foes=[['raiden', 0, 0], ['iwao', 1, 0]])
    r = page.evaluate("async()=>{ curSide='e'; hitsR.e=20; await comboReactions(); return {log:LOG, hits:HITS}; }")
    assert r["log"] == ["raiden:Corrente Trovão"] and all(h.endswith('>iwao') for h in r["hits"]), r

    # 9) Voo e Lançado no knock: Voo sobe alto (como o antigo L), a rasteira fica baixa.
    scene([{"id": "iwao", "row": 0, "depth": 0}])
    r = page.evaluate("""async () => {
      const t=U.e[0]; await knock(t,'V'); const v=t.off.y; setState(t,null);
      await knock(t,'L'); const l=t.off.y, an=t.an;
      return {v, l, an};
    }""")
    assert r["v"] == -230 and -80 < r["l"] < 0 and r["an"] == "knockdown", r

    assert not errors, errors
    browser.close()
    server.shutdown()

print("Voo/Lançado, combo por faixa, estrela no Modo dev, paralisia, cascata por casa, alvo marcado, Kazan e inimigo conferidos.")
