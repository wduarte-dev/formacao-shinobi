"""Confere a cabeça no cut-in real do jutsu dos dois lados. Uso: python tools/qa_retratos.py [id ...] [--out pasta]."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from io import BytesIO
from pathlib import Path
from tempfile import mkdtemp
from threading import Thread

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


# Estima a cabeça no próprio PNG, independente da âncora FACE usada pelo jogo.
def head_points(atlas, width, height, row):
    alpha = atlas.crop((0, row * height, width, (row + 1) * height)).getchannel('A')
    # Ignora ruído e efeitos isolados nas extremidades.
    band = alpha.crop((width // 4, 0, 3 * width // 4, height)).point(lambda a: 255 if a > 120 else 0)
    for y in range(height - 24):
        strip = band.crop((0, y, band.width, y + 1))
        if strip.histogram()[255] >= 6:
            left, _, right, _ = band.crop((0, y, band.width, y + 12)).getbbox()
            x = width // 4 + (left + right) // 2
            return [[x, y+2], [x-8, y+15], [x+8, y+15], [x, y+24]]
    return []


SCENE = """async ([id, side]) => {
    const u = mk(id, side, 0, 0, 0, 1);
    await cine(u, N[id].jutsu, []);
    const cut = $('cut'), cp = $('cutP');
    for (const animation of cut.getAnimations()) {
        animation.pause(); animation.currentTime = 350;
    }
    const atlas = new Image(); atlas.src = 'spr/' + id + '_atlas.png'; await atlas.decode();
    const s = SH[id];
    return [s.cw, s.ch, s.anim.cast[0], atlas.naturalWidth, atlas.naturalHeight];
}"""

# Mede os pontos depois do espelhamento, da rotação e do recorte pelos ancestrais.
MEASURE = """([points, row, ch, width, height, id]) => {
    const cp = $('cutP'), css = getComputedStyle(cp);
    if (!css.backgroundImage.endsWith('/spr/'+id+'_atlas.png")')) return false;
    const [w,h] = css.backgroundSize.split(' ').map(parseFloat);
    const dx = parseFloat(css.backgroundPositionX), dy = parseFloat(css.backgroundPositionY);
    return points.every(([x,y]) => {
        const dot = document.createElement('i');
        const left = dx+x*w/width, top = dy+(row*ch+y)*h/height;
        if (!(left>=0 && left<cp.clientWidth && top>=0 && top<cp.clientHeight)) return false;
        dot.style.cssText = 'position:absolute;width:2px;height:2px;pointer-events:auto';
        dot.style.left = left+'px'; dot.style.top = top+'px'; cp.append(dot);
        const r = dot.getBoundingClientRect();
        const visible = document.elementFromPoint(r.x+r.width/2,r.y+r.height/2) === dot;
        dot.remove();
        return visible;
    });
}"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('ids', nargs='*')
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    out = args.out or Path(mkdtemp(prefix='shinobi-retratos-'))
    out.mkdir(exist_ok=True, parents=True)
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=ROOT)) as server, sync_playwright() as pw:
        Thread(target=server.serve_forever, daemon=True).start()
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width':1152,'height':648})
        page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
        page.evaluate("()=>{show('sBattle'); U={p:[],e:[],clones:[]}; sleep=async()=>{};}")
        page.add_style_tag(content='#cutN{pointer-events:auto}')
        roster = page.evaluate('IDS')
        ids = args.ids or roster
        if set(ids) - set(roster):
            parser.error('ninja desconhecido: '+', '.join(sorted(set(ids)-set(roster))))
        board = Image.new('RGB', (800, len(ids)*116), '#191923')
        draw = ImageDraw.Draw(board)
        alerts = []
        for i, ninja in enumerate(ids):
            with Image.open(ROOT/'spr'/f'{ninja}_atlas.png') as src:
                atlas = src.convert('RGBA')
            for j, side in enumerate(('p','e')):
                cw,ch,row,w,h = page.evaluate(SCENE, [ninja,side])
                points = head_points(atlas,cw,ch,row)
                ok = bool(points) and page.evaluate(MEASURE,[points,row,ch,w,h,ninja])
                if not ok:
                    alerts.append(f'{ninja}/{side}')
                shot = Image.open(BytesIO(page.screenshot(clip={'x':0,'y':54,'width':1152,'height':420})))
                shot.thumbnail((398,96))
                board.paste(shot,(j*400,i*116+18))
                draw.text((j*400,i*116),f'{ninja}/{side}  '+('OK' if ok else 'REVISAR'), fill='white' if ok else 'orange')
        browser.close()
        server.shutdown()
    board.save(out/'retratos.png')
    print(f'{len(ids)*2} cenas. Revisar: {", ".join(alerts) or "nenhuma"}. Prancha: {out}/retratos.png')
    return bool(alerts)


if __name__ == '__main__':
    raise SystemExit(main())
