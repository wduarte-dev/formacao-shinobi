# Teste automático: python3 tools/test_battle.py <pasta_do_jogo> <pasta_saida> [missao 0-4]   (P3=yugami troca o Raiden pelo Yugami)
# Sobe servidor local, joga uma batalha com Auto + 2x, salva prints e lista erros do console.
import sys, subprocess, time, os
from playwright.sync_api import sync_playwright
root, out = sys.argv[1], sys.argv[2]; mis = int(sys.argv[3]) if len(sys.argv)>3 else 0
os.makedirs(out, exist_ok=True)
srv = subprocess.Popen([sys.executable,'-m','http.server',str(8765+mis),'-d',root],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
errs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1152,'height':648})
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto('http://localhost:%d/'%(8765+mis)+'index.html'); pg.wait_for_timeout(800)
    pg.screenshot(path=f'{out}/0_titulo.png')
    pg.click('#sTitle'); pg.wait_for_timeout(300)
    pg.evaluate(f"""()=>{{ if(placed.length<4) placed=[{{id:'kaen',row:0,depth:0}},{{id:'iwao',row:1,depth:0}},{{id:'{os.environ.get('P3','raiden')}',row:2,depth:1}},{{id:'mizuha',row:1,depth:2}}];
      unlocked=4; foeIx={mis}; autoP=true; speed=2; startBattle(); }}""")
    shots=0; t0=time.time(); res=None
    while time.time()-t0<240:
      pg.wait_for_timeout(1500)
      if shots<3 and time.time()-t0>3+shots*6: pg.screenshot(path=f'{out}/{shots+1}_batalha.png'); shots+=1
      res=pg.evaluate("()=>U&&!battleOn&&!$('resWin').classList.contains('hide')?({'Vitória':'win','Derrota':'lose'}[$('ovT').textContent]):null")
      if res: break
    pg.wait_for_timeout(1200); pg.screenshot(path=f'{out}/9_fim.png')
    rnd=pg.evaluate("()=>round")
    print('resultado:',res,'| rodadas:',rnd,'| tempo: %.0fs'%(time.time()-t0)); b.close()
finally: srv.terminate()
print('erros:',errs if errs else 'nenhum')
