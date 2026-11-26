"""Exercita save legado, arrasto, RNG, Kazan adversário, áudio e PWA."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


with ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=ROOT)) as server, sync_playwright() as pw:
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_port}"
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={"width": 932, "height": 430}, service_workers="block")
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.route("**/*", lambda route: route.continue_() if route.request.url.startswith(origin + "/")
               else route.fulfill(status=200, body=""))
    page.add_init_script("""localStorage.setItem('shinobi-save', JSON.stringify({
      unlocked:3, acadDone:[0,0,1.5], lite:false,
      placed:[null,{id:'raiden',row:99,depth:0},{id:'kaen',row:0,depth:0},
        {id:'iwao',row:0,depth:0},{id:'mizuha',row:1,depth:0},{id:'kaen',row:2,depth:0}]
    }));""")
    page.goto(origin)
    page.evaluate("""async () => {
      const check=(ok,message)=>{if(!ok)throw Error(message);};
      check(unlocked===3&&acadDone.join()==='0'&&placed.map(p=>p.id).join()==='kaen,mizuha','save legado');
      save(); check(JSON.parse(localStorage.getItem('shinobi-save')).schema===1,'versão do save');
      show('sForm');
      const slot=$('fRoster').querySelector('button');
      const point=slot.getBoundingClientRect();
      slot.dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,button:0,clientX:point.x,clientY:point.y}));
      slot.dispatchEvent(new PointerEvent('pointerdown',{pointerId:2,button:0}));
      dispatchEvent(new PointerEvent('pointerup',{pointerId:2}));
      check(drag?.pointerId===1,'segundo dedo tomou controle');
      dispatchEvent(new PointerEvent('pointercancel',{pointerId:1}));
      check(!drag&&placed.length===2,'cancelamento gravou o arrasto');
      $('fRoster').querySelector('[data-ninja=raiden]').click();
      const cell=()=>document.querySelector('#fTiles [data-rd="2,0"]');
      cell().dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',cancelable:true}));
      check(placed.some(p=>p.id==='raiden'&&p.row===2)&&document.activeElement===cell(),'posicionar por teclado');
      cell().dispatchEvent(new KeyboardEvent('keydown',{key:'Delete',cancelable:true}));
      check(placed.length===2,'remover por teclado');
      const rngA=seededRandom(42), rngB=seededRandom(42);
      for(let n=0;n<100;n++){const x=rngA(); Math.random(); check(x===rngB(),'RNG depende de efeitos');}
      FOES[0].team=[['kazan',0,0]];
      run=()=>{}; speed=2; startBattle2(); round=1;
      const kazan=U.e[0];
      battleRandom=()=>.99;
      check(pick(kazan,'random',true)===U.p.at(-1),'alvo aleatório');
      const until=async ready=>{
        const end=performance.now()+10000;
        while(!ready()&&performance.now()<end)await new Promise(requestAnimationFrame);
        check(ready(),'tempo esgotado');
      };
      const dragon=async()=>{
        setField(kazan,3);
        await doSkill(kazan,kazan.d.recast,true);
      };
      await Promise.race([dragon(),new Promise((_,reject)=>setTimeout(()=>reject(Error('dragão travou')),12000))]);
      check(U.p.every(u=>u.hp<u.max),'dragão adversário não causou dano');
      await until(()=>audioWorkers===0);
      check(BUF['kazan-pour']&&!BUF['voz-yugami-dor_1'],'banco não filtrou elenco');
      leave('sMap'); await until(()=>audioWorkers===0);
      check(!BUF['kazan-pour'],'áudio da luta ficou no menu');
      acad={i:0,done:true}; U.e[0].alive=false;
      check(result()==='lose','morte do Mestre tem prioridade');
    }""")
    assert not errors, errors
    page.close()
    context = browser.new_context()
    pwa = context.new_page()
    pwa.goto(origin)
    pwa.wait_for_function("!!navigator.serviceWorker.controller")
    context.set_offline(True)
    pwa.reload()
    assert pwa.evaluate("typeof startBattle==='function' && !!VERSION.v")
    assert pwa.locator("#sTitle").is_visible()
    browser.close()

print("Save legado, multitoque, RNG, Kazan adversário, áudio por elenco e primeira abertura offline passaram.")
