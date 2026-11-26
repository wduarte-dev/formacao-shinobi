"""Regressões dos status novos (Selamento, Cegueira, Sono) e do Resistiu. Uso: python3 tools/test_status.py"""
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
      const check=(ok,d)=>{if(!ok)throw Error(d);};
      run=()=>{}; loadSfx=()=>{}; placed=[{id:'kaen',row:0,depth:0},{id:'iwao',row:1,depth:0}]; startBattle2(); round=1;
      sleep=async()=>{}; gate=async()=>{}; speed=2;
      const a=U.p[0], t=U.e[0];
      // Resistiu: com sorte máxima (0.99) o status pega; com 0 resiste sempre
      const atk={name:'T',target:'front',mult:.1,status:{seal:3,blind:2,sleep:2}};
      pick=()=>t;
      Math.random=()=>.99; await doSkill(a,atk,false);
      check(t.seal===3&&t.blind===2&&t.sleep===2,'status aplicados');
      Math.random=()=>0; clearStatus(t); await doSkill(a,atk,false);
      check(!t.seal&&!t.blind&&!t.sleep,'resistiu a tudo');
      check(resOf({id:'iwao'})===30&&resOf({id:'mayoi'})===10&&resOf({id:'utsushic'})===20,'tabela de resistência');
      // Sono acorda com dano físico, mas não com dano de DoT
      Math.random=()=>.99; t.sleep=2; hurt(t,5,'dot'); check(t.sleep===2,'DoT não acorda');
      hurt(t,5,''); check(t.sleep===0,'dano físico acorda');
      // morte limpa
      t.seal=t.blind=t.sleep=2; hurt(t,99999,''); check(!t.seal&&!t.blind&&!t.sleep,'morte limpa status');
    }""")
    browser.close()
    print("erros: " + (", ".join(errors) if errors else "nenhum"))
