---
name: qa-animacao-jogo-web
description: "QA visual de animações em jogo de navegador (HTML/canvas/CSS): grava uma partida com Playwright, alinha vídeo e eventos do jogo, gera tiras de quadros por ação (golpe, jutsu, perseguição, magia) com os eventos marcados e um relatório de TEMPO MORTO e ATRASO de impacto, e revisa a fluidez pelos princípios de animação de jogo. Use sempre que o Wellington (ou qualquer pessoa) reclamar de animação truncada, golpe que sai depois do pouso, pausa estranha, efeito quadrado/cortado, personagem que \"soca\" quando devia invocar, dessincronia entre som/dano/animação, ou pedir pra \"ver o jogo\", conferir fluidez, revisar animações antes de commitar, ou testar se um combo/efeito ficou bom, mesmo sem falar em QA ou Playwright."
---

# QA visual de animação (jogo de navegador)

Teste automático diz "rodou sem erro"; não diz se ficou bonito. Esta skill dá olhos pra conferir animação como um jogador veria: vídeo da partida → tira de quadros por ação com os eventos do jogo carimbados → relatório de pausas e atrasos. O critério de "bom" está em `references/fluidez.md` (leia antes de julgar).

## Fluxo
1. **Ler `references/fluidez.md`** (6 princípios: sprite + código, invocar de longe, impacto no quadro do contato, sem tempo morto, alvos marcados, conferir com os olhos). É a régua.
2. **Config do jogo.** `scripts/qa_anim.py` é genérico: o que é do jogo fica num JSON (`--config`): como entrar na partida (`setup_js`), como saber que acabou (`done_js`) e quais funções globais instrumentar (início/fim de ação, troca de anim, dano, arremesso, efeito, poeira…). Exemplo completo e comentado: `references/config-formacao-shinobi.json`. Jogo novo: copie e troque os nomes das funções (procure no código quem aplica dano, quem troca a animação, quem inicia a ação). Scripts clássicos com funções globais funcionam direto; em ES modules, exponha as funções em `window` só no modo de teste.
3. **Gravar e gerar as tiras:**
   ```bash
   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 scripts/qa_anim.py --root <pasta do jogo> --config <config.json> \
     [--kind chase|jutsu|...] [--only <id do personagem>] [--set "flag=valor"] [--w 384] [--max 8] --out /tmp/qa
   ```
   `--set` roda JS antes da partida (ex.: forçar uma chance pra 100% e ver o efeito raro). Precisa de playwright, ffmpeg e Pillow.
4. **Ler `relatorio.txt`** (linha do tempo de cada ação + alertas) e **olhar as tiras** `acao_NN_*.png` (recorte as linhas de interesse antes de abrir: a tira inteira é grande). Bordas: vermelha = dano, azul = arremesso/poeira, amarela = troca de animação do atacante. O tempo em cada quadro é desde o início da ação.
5. **Julgar com a régua, corrigir e regravar** até as tiras contarem a história certa. Mostre ao usuário os trechos (antes/depois) quando der.

## Como ler os alertas (o que é bug e o que é de propósito)
- **TEMPO MORTO** = intervalo > 450 ms sem nenhum evento dentro da ação. É bug quando a tela fica parada (alvo caído esperando a anim do atacante acabar, golpe que demora a sair). É de propósito quando há movimento sem evento: salto, onda subindo, corte de câmera do jutsu, câmera lenta. Confirme na tira.
- **ATRASO** = o atacante pousou/chegou (poeira, dash) e o dano só saiu depois de 260 ms. Quase sempre bug: o impacto tem que sair no quadro do contato (princípio 3). Correção típica: começar a anim do golpe no início do salto e cronometrar o pouso pra cair no quadro do soco.
- **Dano antes do contato** (borda vermelha antes do quadro em que o golpe encosta): impacto adiantado; ajuste a fração do golpe na anim (`hits` ou equivalente).

## Armadilhas
- O vídeo do Playwright começa um pouco depois da página: o script calibra com um quadro vermelho de 300 ms no início (precisão ~33 ms). Se a calibração falhar (sem quadro vermelho), os tempos ficam deslocados ~250 ms.
- Animação de sprite a 6–12 fps: grave a 12–15 fps (`--fps`); mais que isso só repete quadros.
- `page.click` em botão com animação de pulso falha por "elemento instável": use `force=True` ou chame a função pelo `evaluate`.
- Na nuvem: `pip install playwright==<versão do playwright global do npm>` e `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.
