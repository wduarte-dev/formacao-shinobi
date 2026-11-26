#!/usr/bin/env python3
"""Testa no Playwright os Planos, o enquadramento responsivo e Congelar no modo dev."""
import argparse
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from tempfile import mkdtemp
from threading import Thread

from playwright.sync_api import sync_playwright

from qa_retratos import QuietHandler

ROOT = Path(__file__).resolve().parents[1]
MOUNT = """async () => {
    run = () => {};
    const ids = ['kazan', 'mayoi', 'keshin', 'iwao'];
    await preloadFx([...ids, ...FOES[0].team.map(t=>t[0])]);
    placed = ids.map((id,i)=>({id,row:i%3,depth:i===3?1:0}));
    startBattle2();
    round = 1;
    window.actionDone = true;
    window.begin = action => {
        actionDone = false;
        action().then(() => actionDone = true);
    };
    window.snapshot = () => ({
        frame: U.p[0].frame, round, hp: U.e.map(t=>t.hp),
        dragon: kazanDragon?.t, particles: FX.length, ambient: ambT,
        veil: getComputedStyle(document.querySelector('#planCurtain .veil')).opacity,
        effect: getComputedStyle(document.querySelector('#planCurtain .magma')).transform,
        cam: getComputedStyle($('cam')).transform, canvas: $('fxc').toDataURL(),
        actionDone
    });
}"""
BOUNDS = """() => {
    const layer = $('planBg');
    const rect = layer.getBoundingClientRect();
    return layer.classList.contains('on') && rect.left <= 1 && rect.right >= innerWidth-1 &&
      Number(getComputedStyle(layer).zIndex) < Number(getComputedStyle($('units')).zIndex);
}"""


def check_frozen(page, phase, out):
    page.wait_for_timeout(80)
    before = page.evaluate('snapshot()')
    page.wait_for_timeout(700)
    assert page.evaluate('snapshot()') == before, f'Cena avançou congelada: {phase}'
    assert page.get_by_role('button', name='Retomar').get_attribute('aria-pressed') == 'true'
    page.screenshot(path=out / f'congelado-{phase}.png')
    page.keyboard.press('f')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    out = args.out or Path(mkdtemp(prefix='shinobi-planos-'))
    out.mkdir(parents=True, exist_ok=True)
    errors = []
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=ROOT)) as server, sync_playwright() as playwright:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = playwright.chromium.launch()
        page = browser.new_page(viewport={'width': 1366, 'height': 640}, service_workers='block')
        origin = f'http://127.0.0.1:{server.server_port}'
        page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(origin + '/') else route.fulfill(status=200, body=''))
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(origin)
        page.click('#sTitle')
        page.evaluate('()=>{dev=false;}')
        page.evaluate(MOUNT)
        page.keyboard.press('f')
        assert not page.evaluate('devFrozen')
        page.evaluate('()=>{dev=true;}')
        page.evaluate(MOUNT)
        assert page.get_by_text('0/10', exact=False).count() == 0

        page.evaluate('()=>begin(()=>doSkill(U.p[0], N.kazan.jutsu, true))')
        page.wait_for_function("()=>+getComputedStyle(document.querySelector('#planCurtain .veil')).opacity > .3")
        assert page.evaluate("!$('planBg').classList.contains('on')")
        page.keyboard.press('f')
        check_frozen(page, 'forja', out)
        page.wait_for_function('actionDone')
        assert page.evaluate("$('planBg').dataset.theme==='forge'")

        for width, height in ((1152, 648), (1366, 640), (932, 430), (1920, 720)):
            page.set_viewport_size({'width': width, 'height': height})
            page.wait_for_function(BOUNDS, timeout=4000)
        page.set_viewport_size({'width': 1366, 'height': 640})
        page.wait_for_timeout(200)
        page.screenshot(path=out/'forja.png')

        page.evaluate('''() => {
          const blast = kazanDragonBurst;
          kazanDragonBurst = (...args) => {
            blast(...args);
            battleAfter(() => setDevFreeze(true), 210);
          };
          begin(()=>doSkill(U.p[0], N.kazan.recast, true));
        }''')
        page.wait_for_function('()=>kazanDragon?.t > 925 && !kazanDragon.impact')
        page.get_by_role('button', name='Congelar').click()
        check_frozen(page, 'dragao', out)
        page.wait_for_function('() => devFrozen && U.e.every(unit=>unit.hp<unit.max)')
        page.screenshot(path=out/'explosao.png')
        page.keyboard.press('f')
        page.wait_for_function('actionDone')
        assert page.evaluate("fieldA===null && $('planBg').dataset.theme===''")
        assert page.evaluate('U.e.every(unit=>unit.hp<unit.max)')

        page.evaluate('()=>begin(()=>doSkill(U.p[1], N.mayoi.jutsu, true))')
        page.wait_for_function("()=>+getComputedStyle(document.querySelector('#planCurtain .mist')).opacity > .4")
        assert page.evaluate("!$('planBg').classList.contains('on')")
        page.screenshot(path=out/'nevoa-transicao.png')
        page.wait_for_function('actionDone')
        assert page.evaluate("$('planBg').dataset.theme==='mist' && $('fog').classList.contains('on')")
        for width, height in ((1152, 648), (932, 430), (1920, 720)):
            page.set_viewport_size({'width': width, 'height': height})
            page.wait_for_function(BOUNDS, timeout=4000)
        page.screenshot(path=out/'noite-de-nevoa.png')
        page.evaluate('()=>begin(()=>dismissField())')
        page.wait_for_function('actionDone')
        assert page.evaluate("fieldA===null && !$('fog').classList.contains('on') && !$('planBg').classList.contains('on')")
        assert not errors, errors
        browser.close()
        server.shutdown()

    print(f'Planos e Congelar OK. Capturas em {out}')


if __name__ == '__main__':
    main()
