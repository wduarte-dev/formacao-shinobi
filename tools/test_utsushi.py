"""Regressões da invocação no motor real. Uso: python3 tools/test_utsushi.py"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
with ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=root)) as server, sync_playwright() as playwright:
    Thread(target=server.serve_forever, daemon=True).start()
    browser = playwright.chromium.launch()
    page = browser.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"http://127.0.0.1:{server.server_port}/index.html")
    page.evaluate("""() => {
      const check=(ok,description)=>{if(!ok)throw Error(description);};
      run=()=>{}; placed=[{id:'utsushi',row:0,depth:2}]; startBattle2(); round=1;
      const owner=U.p[0], sk=owner.d.jutsu, clones=summonClones(owner,sk);
      check(clones.length===3 && new Set(clones.map(c=>c.row+','+c.depth)).size===3,'casas únicas');
      check(clones.every(c=>c.depth===0 && c.hp===266 && c.an==='birth'),'linha de frente, vida e nascimento');
      check(U.p.length===1 && document.querySelectorAll('#sbar button').length===1,'HUD do invocador');
      const target=pick(U.e[0],'front',false);
      check(target.owner===owner,'clone na frente recebe o golpe');
      hurt(target,40,''); check(target.hp===226 && owner.hp===760,'PV independente');
      round++; summonClones(owner,sk);
      check(clones.every(c=>c.hp===266 && c.expires===5) && U.clones.length===3,'renovação e teto');
      hurt(target,300,''); check(!target.alive && target.an==='vanish','dissolução');
      check(pick(U.e[0],'front',false)!==target,'clone derrotado deixa de ser alvo');
      const enemy=U.e[0]; const blockers=[];
      for(let row=0;row<3;row++)for(let depth=0;depth<3;depth++)
        if(!team('p').some(u=>u.alive&&u.row===row&&u.depth===depth))
          blockers.push({...owner,row,depth});
      U.p.push(...blockers);
      check(summonClones(owner,sk).length===2,'grade cheia');
      U.p=[owner]; owner.alive=false; check(result()==='lose','derrota mesmo com clones vivos');
      owner.alive=true; summonClones(enemy,sk); U.e.forEach(e=>e.alive=false);
      check(result()==='win','vitória mesmo com clones inimigos vivos');
    }""")
    browser.close()
    server.shutdown()
    assert not errors, errors
print("Invocação, células, HUD, alvos, renovação e resultado conferidos.")
