"""Regressões da Academia: previsão de combos = regra real do motor, metas do Teste de Perseguição, Selo Final e luta completa. Uso: python3 tools/test_academia.py"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
with ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=root)) as server, sync_playwright() as playwright:
    Thread(target=server.serve_forever, daemon=True).start()
    browser = playwright.chromium.launch()
    page = browser.new_page(viewport={"width": 1152, "height": 648})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"http://127.0.0.1:{server.server_port}/index.html")
    page.wait_for_timeout(800)
    page.evaluate("""async () => {
      const check=(ok,d)=>{if(!ok)throw Error(d);};
      // 1) previsão = comboPlan do motor, pra vários times
      const teams=[['iwao','mizuha','raiden','kaen'],['fuuka','hiyori','mizuha','utsushi'],['doku','keshin','yugami','poko'],['kazan','kaen','mayoi','iwao']];
      run=()=>{}; loadSfx=()=>{};
      for(const ids of teams){
        placed=ids.map((id,i)=>({id,row:i%3,depth:i>2?1:0})).reverse(); acad=null; startBattle2();
        const ordered=comboIds(placed);
        for(const s of ['D','L','R']){ const a=comboChain(ordered,s).map(c=>c.id).join(), b=comboPlan('p',s).map(u=>u.id).join(); check(a===b,`cadeia ${s} de ${ids}: ${a} vs ${b}`); }
      }
      check(comboIds(placed).join()===teams.at(-1).join(),'casas vão da frente ao fundo, de cima pra baixo');
      check(placed[0].id==='iwao'&&U.p[0].id==='iwao','ordenar preserva a lista da formação e os slots');
      const rivals=[{id:'hiyori',row:0,depth:1},{id:'fuuka',row:2,depth:0}];
      placed=rivals; startBattle2();
      check(comboChain(comboIds(rivals),'D')[0].id==='fuuka'&&comboPlan('p','D')[0].id==='fuuka','casa da frente ganha a disputa pela perseguição');
      U.p[1].stunned=true;
      check(comboPlan('p','D')[0].id==='hiyori','próxima casa persegue quando a primeira está paralisada');
      const rows=comboRows(['iwao','mizuha','raiden','kaen']);
      check(rows[0].chain.length===4 && rows[0].id==='iwao','Iwao abre a cadeia de 4');
      const out=comboLeftOut(comboIds(rivals)); check(out.some(o=>o.why.includes('Fuuka já persegue')),'aviso de quem fica de fora');
      check(comboLeftOut(['kazan']).length===1,'Kazan explicado');
      check(!IDS.includes('mestre'),'Mestre fora do elenco');
      check(U.p.every(u=>pos(u).y===[424,478,532][u.row]),'posição da luta não depende do grid da Formação');
      // 2) metas do teste
      labTeam=[{id:'iwao',row:1,depth:0},{id:'mizuha',row:0,depth:1},{id:'raiden',row:2,depth:1},{id:'kaen',row:1,depth:2}];
      acad={i:0,done:false}; startBattle2(); check(U.e.length===1&&U.e[0].id==='mestre'&&U.e[0].hp===20000,'Mestre sozinho com 20.000');
      check(result()===null,'luta segue'); acadCheck('e',3); check(!acad.done,'cadeia do Mestre não conta');
      acadCheck('p',1); check(!acad.done,'1 não basta'); acadCheck('p',2); check(acad.done&&result()==='win','meta 2 vence');
      acad={i:1,done:false}; labTeam=[{id:'iwao',row:1,depth:0},{id:'mizuha',row:0,depth:1},{id:'raiden',row:2,depth:1},{id:'doku',row:1,depth:2}]; startBattle2();
      acadCheck('p',4); check(!acad.done,'sem Fogo não conclui o 2');
      acad={i:3,done:false}; labTeam[3]={id:'kaen',row:1,depth:2}; startBattle2();
      chainOpenJ=false; acadCheck('p',3); check(!acad.done,'4 exige abertura por jutsu');
      chainOpenJ=true; acadCheck('p',3); check(acad.done,'abertura por jutsu conclui o 4');
      acad={i:0,done:false}; startBattle2(); U.e[0].hp=1; hurt(U.e[0],50,''); check(result()==='lose','Mestre caído = falhou');
      // 3) Selo Final derruba exatamente um ninja, mesmo com escudo
      acad={i:0,done:false}; startBattle2(); sleep=async()=>{}; gate=async()=>{}; speed=2;
      U.p.forEach(u=>{u.shield=500;u.shM=500;});
      const m=U.e[0]; await doSkill(m,m.d.jutsu,true);
      check(U.p.filter(u=>!u.alive).length===1,'Selo Final derruba um');
      check(STRONG_CHANCE===.3,'Forte a 30%');
    }""")
    page.close()
    # 4) luta completa do desafio 1 no motor real (Auto, 2x)
    page = browser.new_page(viewport={"width": 1152, "height": 648})
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(f"http://127.0.0.1:{server.server_port}/index.html")
    page.wait_for_timeout(800)
    page.evaluate("""()=>{ labTeam=[{id:'iwao',row:1,depth:0},{id:'mizuha',row:0,depth:1},{id:'raiden',row:2,depth:1},{id:'kaen',row:1,depth:2}];
      acad={i:0,done:false}; startBattle(); }""")
    page.wait_for_timeout(2500)
    page.evaluate("()=>{ battleRandom=seededRandom(42); autoP=true; speed=2; }")
    page.wait_for_selector("#resWin:not(.hide)", timeout=240000)
    print("resultado:", page.inner_text("#ovT"), "|", page.inner_text("#ovQ"), "| estrela salva:", page.evaluate("acadDone.includes(0)"))
    assert page.inner_text("#ovT")=="Desafio concluído!" and page.evaluate("acadDone.includes(0)")
    page.screenshot(path="/tmp/academia_fim.png")
    assert not errors, errors
    browser.close()
    print("erros: " + (", ".join(errors) if errors else "nenhum"))
