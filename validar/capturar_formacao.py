"""Grava a abertura da Formação a 25 fps. Requer Playwright, Chromium e FFmpeg.

A partir da raiz do jogo:
    python3 capturar_formacao.py --repo . --output abertura.mp4
"""
import argparse
import json
import subprocess
from datetime import datetime, timedelta, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread

from playwright.sync_api import sync_playwright

TEAM = [
    {"id": "kaen", "row": 0, "depth": 0},
    {"id": "iwao", "row": 1, "depth": 0},
    {"id": "mizuha", "row": 2, "depth": 0},
    {"id": "raiden", "row": 1, "depth": 1},
]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def capture(repo, output):
    handler = partial(QuietHandler, directory=repo)
    with (
        TemporaryDirectory(prefix="shinobi-formacao-") as frames,
        ThreadingHTTPServer(("127.0.0.1", 0), handler) as server,
        sync_playwright() as playwright,
    ):
        Thread(target=server.serve_forever, daemon=True).start()
        origin = f"http://127.0.0.1:{server.server_port}"
        browser = playwright.chromium.launch()
        try:
            page = browser.new_page(
                viewport={"width": 1152, "height": 648}, service_workers="block"
            )
            page.route(
                "**/*",
                lambda route: route.continue_()
                if route.request.url.startswith(origin + "/")
                else route.fulfill(body=""),
            )
            save = json.dumps({"placed": TEAM, "unlocked": 0, "own": []})
            page.add_init_script(f"localStorage.setItem('shinobi-save', {json.dumps(save)})")
            page.clock.install()
            page.clock.pause_at(datetime.now(timezone.utc) + timedelta(seconds=1))
            page.goto(origin)
            page.evaluate("""() => {
                show('sForm');
                const tracks = $('sForm').getAnimations({subtree:true}).filter(
                    a => a.id==='formation-entry' || a.animationName==='formation-number'
                );
                if(tracks.length!==13) throw Error('Esperava nove círculos e quatro ninjas');
                for(const track of tracks) track.pause();
                window.seekOpening = ms => {
                    for(const track of tracks) track.currentTime=ms;
                    const tiles=$('fTiles');
                    const units=[...$('fUnits').children];
                    return {
                        pulse:Number(getComputedStyle(tiles.firstElementChild,'::after').opacity),
                        visible:units.some(el=>Number(getComputedStyle(el).opacity)>0),
                        moving:units.some(el=>getComputedStyle(el).transform!=='none')
                    };
                };
                seekOpening(0);
            }""")
            page.wait_for_load_state("networkidle")
            pulse = page.evaluate("""()=>$('fTiles').getAnimations({subtree:true})
                .find(a=>a.animationName==='formation-number').effect.getTiming().duration""")
            before = page.evaluate("seekOpening(0)")
            first_pulse = page.evaluate("(ms)=>seekOpening(ms)", pulse * 0.3)
            between = page.evaluate("(ms)=>seekOpening(ms)", pulse)
            second_pulse = page.evaluate("(ms)=>seekOpening(ms)", pulse * 1.3)
            after = page.evaluate("(ms)=>seekOpening(ms)", pulse * 2 + 40)
            assert not before["visible"]
            assert first_pulse["pulse"] > 0.9 and second_pulse["pulse"] > 0.9
            assert between["pulse"] < 0.2
            assert after == {"pulse": 0, "visible": True, "moving": False}
            moving_seen = False
            frame_ms = 40
            duration_ms = pulse * 2 + 1000
            for frame in range(int(duration_ms / frame_ms) + 1):
                if frame:
                    page.clock.run_for(frame_ms)
                state = page.evaluate("(ms)=>seekOpening(ms)", frame * frame_ms)
                moving_seen |= state["visible"] and state["moving"]
                page.screenshot(path=Path(frames) / f"{frame:03}.png")
            assert moving_seen
        finally:
            browser.close()

        output.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-framerate", "25", "-i", str(Path(frames) / "%03d.png"),
            "-vf", "tpad=start_duration=0.32:start_mode=clone",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19",
            "-movflags", "+faststart", str(output),
        ], check=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Grava a abertura da Formação.")
    parser.add_argument("--repo", type=Path, default=Path.cwd())
    parser.add_argument("--output", type=Path, default=Path("abertura.mp4"))
    args = parser.parse_args()
    capture(args.repo.resolve(), args.output.resolve())
    print(f"Vídeo salvo em {args.output}")
