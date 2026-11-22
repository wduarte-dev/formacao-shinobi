#!/usr/bin/env python3
"""Segundo par de olhos: manda imagens do jogo pro Gemini (visão) e recebe uma lista de SUSPEITOS. Nunca é veredito:
quem confirma é o Claude olhando o quadro apontado. Não mede tempo/fluidez (isso é do tools/qa_anim.py).

Uso:
  python3 tools/qa_gemini.py strip /tmp/qa/acao_*.png            # tiras do qa_anim (usa o relatorio.txt ao lado, se houver)
  python3 tools/qa_gemini.py atlas spr/kaen_atlas.png [--cols 8] # uma chamada por linha (animação) do atlas 192x160
  python3 tools/qa_gemini.py scene bg/noite.png spr/kaen_fx.png  # cenário/efeito solto
Opções: --out /tmp/gem (saída: gemini.txt + imagens enviadas)  --model gemini-3.5-flash-lite  --note "contexto extra"
Chave: o proxy do ambiente injeta (host generativelanguage.googleapis.com, endpoint compatível OpenAI com Bearer qualquer).
Limites: texto/visão no plano grátis, ~poucas req/min -> há pausa entre chamadas e retry em 429."""
import sys, os, io, json, time, base64, argparse, subprocess
from PIL import Image

URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
PROMPTS = {
 'strip': "Você é revisor de QA de um jogo 2D de ninjas em pixel art/ilustração (batalha por turnos). Cada quadro da tira mostra um instante de uma AÇÃO "
  "(golpe, jutsu ou perseguição), com o tempo em ms. Borda vermelha=dano, amarela=troca de animação do atacante, azul=arremesso/queda do alvo. "
  "Liste só SUSPEITOS concretos, citando o tempo (ms) do quadro: personagem cortado ou com 2 corpos, efeito desconectado do alvo ou do atacante, "
  "alvo sem reação quando leva dano, efeito que aparece/some em bloco sem origem, pose que não combina com a ação, sobreposição estranha. "
  "Se nada chamar atenção, diga 'sem suspeitas'. Máx. 6 itens, 1 linha cada, sem elogios. Não invente: se tiver dúvida, marque (incerto).",
 'atlas': "Você é revisor de QA de sprites. A imagem é UMA LINHA (animação) de um atlas: quadros lado a lado, mesmo personagem, fundo cinza (era transparente). "
  "Liste só SUSPEITOS por número do quadro (1 = esquerda): membro/cabeça/arma faltando ou cortado na borda do quadro, dois corpos no mesmo quadro, "
  "mudança de cor/roupa/proporção entre quadros, resto de fundo verde, pedaço solto (retângulo/fragmento), pose incoerente com o nome da animação, "
  "quadro duplicado por engano. Se nada chamar atenção, diga 'sem suspeitas'. Máx. 6 itens, 1 linha cada. Não invente: dúvida = (incerto).",
 'scene': "Você é revisor de QA visual de um jogo 2D de ninjas. Analise a imagem (cenário ou atlas de efeitos). Liste só SUSPEITOS: "
  "artefatos de IA (texto/letras estranhas, objetos deformados, bordas/emendas, repetição óbvia), elementos que atrapalhariam a leitura de personagens "
  "em primeiro plano (contraste, brilho, ruído), quadros de efeito com recorte errado ou fundo sujo. Máx. 6 itens, 1 linha cada, sem elogios. Dúvida = (incerto).",
}

def to_png_b64(im, bg=(70, 70, 70)):
    im = im.convert('RGBA'); base = Image.new('RGBA', im.size, bg + (255,)); base.alpha_composite(im)
    b = io.BytesIO(); base.convert('RGB').save(b, 'PNG'); return b.getvalue()

def ask(model, prompt, png, retries=4):
    body = {"model": model, "messages": [{"role": "user", "content": [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": "data:image/png;base64," + base64.b64encode(png).decode()}}]}]}
    for i in range(retries):
        r = subprocess.run(['curl', '-s', '-X', 'POST', URL, '-H', 'Content-Type: application/json', '-H', 'Authorization: Bearer x',
                            '-d', '@-'], input=json.dumps(body), capture_output=True, text=True).stdout
        try:
            j = json.loads(r)
            if isinstance(j, list): j = j[0]
            if 'choices' in j: return j['choices'][0]['message']['content'].strip()
            err = j.get('error', {}); code = err.get('code')
            if code in (429, 503): time.sleep(8 * (i + 1)); continue
            return '[ERRO %s] %s' % (code, str(err.get('message'))[:200])
        except Exception as e:
            time.sleep(3)
    return '[ERRO] sem resposta'

def fit(im, maxw=1600, minscale=2):
    s = max(1, min(minscale, maxw // max(1, im.width))) if im.width * minscale <= maxw else 1
    if im.width * s > maxw: s = 1
    return im.resize((im.width * s, im.height * s), Image.NEAREST) if s > 1 else (im if im.width <= maxw else im.resize((maxw, int(im.height * maxw / im.width)), Image.LANCZOS))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('mode', choices=['strip', 'atlas', 'scene']); ap.add_argument('files', nargs='+')
    ap.add_argument('--cols', type=int, default=0, help='colunas do atlas (0 = detecta: 12 se largura%%12==0 e 2304, senão 8)')
    ap.add_argument('--out', default='/tmp/gem'); ap.add_argument('--model', default='gemini-3.5-flash-lite'); ap.add_argument('--note', default='')
    ap.add_argument('--pause', type=float, default=4.0); a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True); lines = []
    def emit(title, txt):
        lines.append('## ' + title + '\n' + txt + '\n'); print('## ' + title + '\n' + txt + '\n', flush=True)
    for f in a.files:
        im = Image.open(f); name = os.path.splitext(os.path.basename(f))[0]
        if a.mode == 'atlas':
            cols = a.cols or (12 if im.width == 192 * 12 else 8); cw, ch = im.width // cols, 160 if im.height % 160 == 0 else im.height // (im.height // 160)
            rows = im.height // ch
            for r in range(rows):
                row = im.crop((0, r * ch, im.width, (r + 1) * ch)).convert('RGBA')
                cells = [row.crop((c * cw, 0, (c + 1) * cw, ch)) for c in range(cols)]
                keep = [c for c in cells if c.getchannel('A').getbbox()]
                if not keep: continue
                strip = Image.new('RGBA', (cw * len(keep), ch), (0, 0, 0, 0))
                for k, c in enumerate(keep): strip.paste(c, (k * cw, 0))
                big = fit(strip, 1800, 2); png = to_png_b64(big); open('%s/%s_r%02d.png' % (a.out, name, r), 'wb').write(png)
                emit('%s linha %d (%d quadros)' % (name, r, len(keep)), ask(a.model, PROMPTS['atlas'] + ' ' + a.note, png)); time.sleep(a.pause)
        else:
            png = to_png_b64(fit(im, 1800, 1)); extra = ''
            if a.mode == 'strip':
                rep = os.path.join(os.path.dirname(f), 'relatorio.txt')
                if os.path.exists(rep): extra = ' Relatório de eventos da luta (trecho): ' + open(rep).read()[:1500]
            emit(os.path.basename(f), ask(a.model, PROMPTS[a.mode] + extra + ' ' + a.note, png)); time.sleep(a.pause)
    open(os.path.join(a.out, 'gemini.txt'), 'w').write('\n'.join(lines)); print('salvo em', os.path.join(a.out, 'gemini.txt'))

if __name__ == '__main__': main()
