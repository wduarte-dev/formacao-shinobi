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
    page.evaluate("""async () => {
      const check=(ok,description)=>{if(!ok)throw Error(description);};
      run=()=>{}; loadSfx=()=>{}; placed=[{id:'utsushi',row:0,depth:2}]; startBattle2(); round=1;
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
      const enemy=U.e[0];
      check([...turnOrder()].slice(0,3).every((u,i)=>u===[owner,...livingClones(owner)][i]),'ordem após o dono');
      const clone=livingClones(owner)[0], victim=pick(clone,'front',false), before=victim.hp;
      sleep=async()=>{}; gate=async()=>{}; Math.random=()=>.9; speed=2;
      await doSkill(clone,clone.d.normal,false);
      check(victim.hp<before && before-victim.hp<owner.atk*.4,'ataque fraco do clone');
      const attack={name:'Teste',target:'front',mult:1,stun:'all',cause:'D'};

      // Alvo único isolado: força a seleção do invocador sem mudar o cálculo do golpe.
      const originalPick=pick; pick=()=>owner;
      await doSkill(enemy,attack,false);
      check(owner.hp===760 && !owner.stunned && !owner.state && livingClones(owner).length===1,'Substituição evita dano e estado');
      const hp=owner.hp; await doSkill(enemy,{...attack,stun:false,cause:null},false);
      check(owner.hp<hp && livingClones(owner).length===1,'uma Substituição por rodada');
      round++; await doSkill(enemy,attack,false);
      check(livingClones(owner).length===0 && !owner.stunned,'Substituição volta na próxima rodada');
      pick=originalPick;
      for(const id of ['fuuka','doku','poko']){
        const group=summonClones(owner,sk);
        const caster=mk(id,'e',0,0,0,1); mountUnit(caster);
        await doSkill(caster,caster.d.jutsu,true);
        check(group.every(c=>!c.alive),id+' limpa os clones');
        owner.hp=owner.max; owner.dot=null; owner.stunned=false;
      }
      const remaining=summonClones(owner,sk);
      const chaseTarget=U.e[0]; chaseTarget.hp=chaseTarget.max;
      setState(chaseTarget,'L'); curSide=owner.side;
      const count=hitsR.p; await chain('p',chaseTarget,1,owner);
      check(hitsR.p===count+4 && chaseTarget.state==='R','perseguição e três contatos extras');
      vanishClone(remaining[0]);
      const two=hitsR.p; await cloneVolley(owner,chaseTarget);
      check(hitsR.p===two+2,'apenas clones vivos participam');
      const hpLast=chaseTarget.hp; chaseTarget.hp=1;
      const one=hitsR.p; await cloneVolley(owner,chaseTarget);
      check(!chaseTarget.alive && hitsR.p===one+1,'fim da rajada quando o alvo cai');
      chaseTarget.alive=true; chaseTarget.hp=hpLast;
      const blockers=[];
      for(let row=0;row<3;row++)for(let depth=0;depth<3;depth++)
        if(!team('p').some(u=>u.alive&&u.row===row&&u.depth===depth))
          blockers.push({...owner,row,depth});
      U.p.push(...blockers);
      check(summonClones(owner,sk).length===2,'grade cheia');
      U.p=[owner]; owner.alive=false; check(result()==='lose','derrota mesmo com clones vivos');
      owner.alive=true; summonClones(enemy,sk); U.e.forEach(e=>e.alive=false);
      check(result()==='win','vitória mesmo com clones inimigos vivos');
    }""")
    # No desempate, três clones com vida cheia não podem inverter a derrota.
    page.reload()
    page.evaluate("""() => {
      loadSfx=()=>{}; sleep=async()=>{}; intro=async()=>{};
      placed=[{id:'utsushi',row:0,depth:2}]; FOES[0].team=[['iwao',0,0]];
      autoP=true;
      doSkill=async u=>{
        if(u.id==='utsushi'){ u.hp=u.max/2; summonClones(u,u.d.jutsu); }
      };
      startBattle2();
    }""")
    page.wait_for_selector("#resWin:not(.hide)")
    assert page.locator("#ovT").inner_text() == "Derrota"
    assert "decidido por tempo" in page.locator("#ovP").inner_text()
    browser.close()
    server.shutdown()
    assert not errors, errors
print("Invocação, ataques, Substituição, área, perseguição e desempate conferidos.")
