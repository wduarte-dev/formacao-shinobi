"""Regressão: a pausa do jogador congela o relógio da batalha (sleep e battleAfter), não só o gate(). Uso: python3 tools/test_pausa.py"""
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
      const wait=ms=>new Promise(r=>setTimeout(r,ms));
      run=()=>{}; loadSfx=()=>{}; placed=[{id:'kaen',row:0,depth:0}]; startBattle2(); battleOn=true; speed=1;
      let done=false; sleep(300).then(()=>done=true);
      await wait(100); setPaused(true);
      await wait(500); check(!done,'sleep avançou durante a pausa');
      let after=false; battleAfter(()=>after=true,50); await wait(300); check(!after,'battleAfter avançou durante a pausa');
      setPaused(false); await wait(400);
      check(done,'sleep não retomou depois da pausa'); check(after,'battleAfter não retomou');
      // o tempo restante é preservado: pausar com ~100 ms já gastos não reinicia a espera inteira
      let t0=performance.now(), fin=0; sleep(400).then(()=>fin=performance.now()-t0);
      await wait(200); setPaused(true); await wait(300); setPaused(false); await wait(400);
      check(fin>0 && fin>=650 && fin<=900,'tempo restante preservado: '+fin);
      // pausa + congelar do dev não se atropelam
      setPaused(true); setDevFreeze(true); setPaused(false); check(timeHeld,'dev ainda segura o relógio'); setDevFreeze(false); check(!timeHeld,'relógio solto');
    }""")
    browser.close()
    print("erros: " + (", ".join(errors) if errors else "nenhum"))
