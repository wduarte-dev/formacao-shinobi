"""Confere os contatos do Kaen no motor real e salva prints quando recebe um diretório."""
import sys
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

from qa_retratos import QuietHandler

ROOT = Path(__file__).resolve().parents[1]
SETUP = """async ({side, kind, rate, ko, dodge, capture, row}) => {
  const enemy = side === 'p' ? 'iwao' : 'kaen';
  const ally = side === 'p' ? 'kaen' : 'iwao';
  run = () => {};
  placed = [{id: ally, row, depth: 1}];
  FOES[foeIx] = {...FOES[foeIx], team: [[enemy,row,1]], mult: 1};
  await preloadFx([ally,enemy]);
  startBattle2();
  speed=rate;
  round=1;
  battleRandom=()=>.5;
  const actor=U[side][0], target=U[side==='p'?'e':'p'][0];
  if(ko){ target.hp=1; upd(target); }
  if(dodge)target.d={...target.d,dodge:100};
  window.trace={contacts:[], shakes:0, flashes:0, particles:0, effects:[]};
  const oldFx=contactFx, oldHitstop=hitstop;
  contactFx=(unit,effect)=>{trace.effects.push([unit.frame,effect.frame,effect.arc]); return oldFx(unit,effect);};
  shake=()=>{trace.shakes++;};
  flash=()=>{trace.flashes++;};
  spark=()=>{trace.particles++;};
  hitstop=ms=>{
    const done=oldHitstop(ms);
    const pos=actor.spr.style.backgroundPosition.split(' ').map(parseFloat);
    trace.contacts.push([actor.frame, ms, pos, target.hp, frozen]);
    if(capture)setDevFreeze(true);
    return done;
  };
  window.action=doSkill(actor,actor.d[kind],false).then(()=>{
    const expected=kind==='normal'?[10,20]:[22];
    const frames=dodge?[]:ko?expected.slice(0,1):expected;
    const base=kind==='normal'?21:24;
    const loss=target.max-target.hp;
    if (JSON.stringify(trace.contacts.map(c=>c[0]))!==JSON.stringify(frames)) throw Error(JSON.stringify(trace));
    for (const [frame,ms,[x,y],hp,stopped] of trace.contacts){
      if(ms!==(kind==='normal'?70:100)||!stopped)throw Error('Hit-stop no quadro incorreto');
      if(x!==-(frame%12)*192||y!==-(base+Math.floor(frame/12))*160)throw Error('Quadro no atlas incorreto');
      if(ko&&hp!==0)throw Error('Nocaute não ocorreu no primeiro contato');
    }
    if(hitsR[side]!==frames.length||trace.effects.some(([now,want,arc])=>now!==want||dodge&&!arc)){
      throw Error('Contagem de hits ou quadro de efeito incorreto');
    }
    if(!ko&&loss!==(dodge?0:kind==='normal'?90:126))throw Error('Dano: '+loss);
    if(trace.shakes||trace.flashes||trace.particles||frozen||target.state)throw Error('Efeitos extras ou estado alterado');
    if(actor.an!=='idle'||actor.onFrame)throw Error('O atacante não voltou ao idle');
    return trace;
  });
}"""


def main():
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if output:
        output.mkdir(parents=True, exist_ok=True)
    cases = [
        ('basico', 'p', 'normal', 1, False, False, 1),
        ('forte', 'e', 'strong', 1, False, False, 0),
        ('basico-2x', 'e', 'normal', 2, False, False, 2),
        ('forte-2x', 'p', 'strong', 2, False, False, 2),
        ('esquiva', 'e', 'normal', 2, False, True, 0),
        ('nocaute', 'p', 'normal', 2, True, False, 2),
    ]
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=ROOT)) as server, sync_playwright() as pw:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = pw.chromium.launch()
        origin = f'http://127.0.0.1:{server.server_port}'
        for name, side, kind, rate, ko, dodge, row in cases:
            page = browser.new_page(viewport={'width': 1152, 'height': 648}, service_workers='block')
            errors = []
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin + '/')
                       else route.fulfill(status=200, body=''))
            page.goto(origin)
            capture = bool(output and rate == 1)
            page.evaluate(SETUP, dict(side=side, kind=kind, rate=rate, ko=ko, dodge=dodge, capture=capture, row=row))
            if capture:
                for index in range(1, 3 if kind == 'normal' else 2):
                    page.wait_for_function('(index)=>devFrozen && trace.contacts.length===index', arg=index)
                    page.locator('#stage').screenshot(path=output / f'{name}-{index}.png')
                    page.evaluate('setDevFreeze(false)')
            page.evaluate('window.action')
            assert not errors, errors
            print(f'{name}: OK')
            page.close()
        browser.close()


if __name__ == '__main__':
    main()
