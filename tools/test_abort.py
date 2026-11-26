"""Confere o isolamento entre lutas ao sair durante uma ação."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


root = Path(__file__).resolve().parents[1]
with ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=root)) as server, sync_playwright() as pw:
    Thread(target=server.serve_forever, daemon=True).start()
    browser = pw.chromium.launch()
    page = browser.new_page(service_workers="block")
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    origin = f"http://127.0.0.1:{server.server_port}"
    page.route("**/*", lambda route: route.continue_() if route.request.url.startswith(origin + "/")
               else route.fulfill(status=200, body=""))
    page.goto(origin)
    page.evaluate("""async () => {
      run=()=>{}; loadSfx=()=>{};
      placed=[{id:'mizuha',row:0,depth:0},{id:'utsushi',row:1,depth:0},{id:'kazan',row:2,depth:0}];
      await preloadFx(placed.map(p=>p.id));
      const check=(value, message)=>{if(!value)throw Error(message);};
      const until=async (ready, label)=>{
        const limit=performance.now()+6000;
        while(!ready()&&performance.now()<limit) await new Promise(requestAnimationFrame);
        check(ready(),label+' não começou');
      };
      // Força Tsunami sem depender do sorteio global.
      N.mizuha.chase.tsunami=1;
      const aborted=promise=>promise.then(()=>false,error=>{if(error!==ABORT)throw error;return true;});
      for(const rate of [.5,1,2]){
        for(const phase of ['jutsu','tsunami','clones','forja']){
          speed=rate; startBattle2(); round=1;
          const [mizuha,utsushi,kazan]=U.p, oldTarget=U.e[0];
          let action;
          if(phase==='tsunami'){
            setState(oldTarget,'D');
            action=aborted(chain('p',oldTarget,1,utsushi));
            await until(()=>WAVES.length>0,phase);
          }else{
            const actor={jutsu:mizuha,clones:utsushi,forja:kazan}[phase];
            action=aborted(doSkill(actor,actor.d.jutsu,true));
            const ready={
              jutsu:()=>scene.on,
              clones:()=>U.clones.length>0,
              forja:()=>$('planCurtain').getAnimations({subtree:true}).length>0
            }[phase];
            await until(ready,phase);
          }
          let oldEffectRan=false;
          battleAfter(()=>{oldEffectRan=true;},0);
          const oldStop=aborted(hitstop(60000));
          setPaused(true);
          leave('sMap');
          check(!battleTimers.size&&!fxLive&&!scene.on,phase+' deixou trabalho da batalha anterior');
          startBattle2();
          const newTarget=U.e[0];
          sceneOn([U.p[0],newTarget]); markTargets([newTarget]);
          const newStop=aborted(hitstop(60000));
          check(await action,phase+' não foi cancelada');
          check(await oldStop,'hit-stop antigo não foi cancelado');
          check(!oldEffectRan&&scene.on&&newTarget.el.classList.contains('tgt')&&frozen,
                phase+' interferiu na luta nova em '+rate+'x');
          check(!fieldA&&!U.clones.length&&!WAVES.length,'campo, clones ou ondas sobraram');
          leave('sMap');
          check(await newStop,'hit-stop da segunda luta ficou pendente');
        }
      }
    }""")
    assert not errors, errors
    browser.close()
    server.shutdown()

print("12 trocas de batalha durante jutsu, Tsunami, clones e forja em 0,5x/1x/2x.")
