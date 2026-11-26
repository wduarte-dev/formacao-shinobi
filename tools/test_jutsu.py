"""Regressões do agendamento de jutsus. Uso: python3 tools/test_jutsu.py [pasta_de_capturas]"""
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
    page.evaluate("""async () => {
      const check=(ok,msg)=>{if(!ok)throw Error(msg);};
      const originalRun=run;
      let battle;
      run=()=>{battle=originalRun();};
      loadSfx=()=>{}; intro=async()=>{}; showInitiative=async()=>{};
      rollInitiative=()=>1; Math.random=()=>.99; autoP=false;
      FOES[0].team=[['iwao',0,0]]; FOES[0].ai=0;
      placed=[{id:'raiden',row:0,depth:0},{id:'kaen',row:1,depth:0},{id:'doku',row:2,depth:0}];
      const instant={...N.raiden.jutsu,instant:true};
      N.raiden.jutsu=instant;
      N.doku.jutsu={...N.doku.jutsu,instant:true,cost:0};
      sleep=async ms=>{
        const [,,doku]=U.p;
        const kaen=U.p[1];
        if(ms===60&&kaen.sk.classList.contains('ready')){
          doku.sk.click(); kaen.sk.click();
          check(doku.skl.textContent==='na fila'&&kaen.skl.textContent==='preparado','rótulos de fila e preparo');
        }
      };
      const actions=[];
      doSkill=async (u,sk,isJ)=>{
        actions.push([u.id,isJ]);
        const [raiden,kaen]=U.p;
        if(u===U.e[0]){
          raiden.sk.click(); raiden.sk.click();
          check(raiden.armedSkill===instant&&raiden.cd===0,'instantâneo fica na fila até o fim da ação');
          check(chakra.p===100-instant.cost,'cada clique válido reserva chakra uma só vez');
        }
        if(u===raiden&&isJ){
          check(sk===instant&&u.cd===instant.cd&&!u.armedSkill,'recarga começa ao lançar');
          check(chakra.p===100-instant.cost,'lançar não cobra de novo');
        }
        if(u===kaen)hurt(U.e[0],99999,'');
      };
      startBattle2(); chakra.p=100; drawJ();
      await battle;
      check(JSON.stringify(actions)===JSON.stringify([['iwao',false],['raiden',true],['raiden',false],['doku',true],['kaen',true]]),
            'instantâneo entre ações, básico preservado e jutsu comum apenas no próprio turno: '+JSON.stringify(actions));
    }""")

    page.reload()
    page.evaluate("""async () => {
      run=()=>{}; loadSfx=()=>{}; speed=2; autoP=false;
      placed=[{id:'kazan',row:0,depth:1},{id:'keshin',row:1,depth:0}];
      await preloadFx([...placed.map(p=>p.id),...FOES[0].team.map(t=>t[0])]);
      startBattle2(); round=1; chakra.p=100; drawJ();
    }""")
    page.locator("#sbar .sk").nth(0).click()
    page.locator("#sbar .sk").nth(1).click()
    assert page.evaluate("chakra.p===40 && U.p.every(u=>u.armedSkill && u.skl.textContent==='na fila')")
    if out:
        page.screenshot(path=out / "jutsus-na-fila.png")
    page.evaluate("() => castInstants()")
    assert page.evaluate("""fieldA?.owner===U.p[0] && U.p[1].power && U.p[1].hp<U.p[1].max &&
                           U.p[1].cd===N.keshin.jutsu.cd && chakra.p===40""")

    page.locator("#sbar .sk").nth(0).click()
    assert page.evaluate("U.p[0].armedSkill===N.kazan.recast && chakra.p===20")
    page.evaluate("() => castInstants()")
    assert page.evaluate("""!fieldA && U.p[0].cd===N.kazan.recast.cd && chakra.p===20 &&
                           U.e.every(u=>u.hp<u.max)""")
    if out:
        page.wait_for_timeout(400)
        page.screenshot(path=out / "depois-do-dragao.png")

    page.evaluate("""() => {
      const kazan=U.p[0];
      kazan.cd=0; chakra.p=50;
      setField(kazan,1);
      kazan.sk.click();
      clearField();
    }""")
    assert page.evaluate("""!U.p[0].armedSkill && !U.p[0].el.classList.contains('armed') &&
                           chakra.p===50 && U.p[0].cd===N.kazan.recast.cd""")
    page.evaluate("""() => {
      const keshin=U.p[1];
      keshin.cd=0; drawJ(); keshin.sk.click();
      hurt(keshin,99999,'');
    }""")
    assert page.evaluate("!U.p[1].armedSkill && !U.p[1].alive && chakra.p===50")
    assert not errors, errors
    browser.close()
    server.shutdown()

print("Jutsu comum, instantâneo genérico, Keshin, Kazan, chakra, recarga e estornos conferidos.")
