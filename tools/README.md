# QA do Formação Shinobi

Na raiz do jogo, use Python com Pillow e Playwright, Chromium instalado pelo Playwright, Node.js e FFmpeg no PATH.

| Para conferir | Comando |
| --- | --- |
| Uma etapa inteira | `python tools/qa_etapa.py kaen` |
| Perseguições na etapa | `python tools/qa_etapa.py kaen --kind chase` |
| Só os retratos de jutsu | `python tools/qa_retratos.py` |
| Os dois lados de um personagem | `python tools/qa_retratos.py poko` |
| Só as animações, com saída curta | `python tools/qa_anim.py --only kaen:p --resumo` |

O QA de etapa valida a sintaxe dos scripts de jogo, joga as cinco missões com a equipe de controle, grava ações envolvendo o ninja escolhido e confere seu retrato. Cada execução imprime o caminho de uma pasta temporária com um log por tarefa, prints, vídeo e tiras. Leia primeiro o resumo e abra o arquivo da tarefa que pediu revisão. Use `--jobs 1` em máquinas com pouca memória e `--team kaen,iwao,raiden,mizuha` para escolher o time da gravação.

Vitória e derrota contam como missão concluída. A etapa retorna erro se a batalha expirar, ocorrer erro do jogo, faltar tira no filtro escolhido ou o retrato pedir revisão. Alertas de timing aparecem na contagem do resumo e precisam de inspeção da tira. Como a luta automática varia, um golpe raro pode exigir uma gravação mais longa com `--secs 120`.

O teste de retratos aciona a apresentação real do jutsu no Chromium, congela a faixa já aberta e salva `retratos.png` com aliado e inimigo lado a lado. Estima quatro pontos da cabeça pela silhueta do primeiro quadro de selos e verifica recorte e sobreposição com a caixa do título no navegador a 1152×648. Cabelo, capuz, efeitos e espaços entre letras podem afetar essa estimativa. Use a prancha para julgar os casos marcados. A pose durante o restante da luta e os retratos de seleção têm enquadramentos próprios.

## Replay de uma ação

```sh
python tools/qa_anim.py --replay kaen --expect-hits 1 --resumo
python tools/qa_anim.py --replay kaen --side e --speed 2 --ko --resumo
python tools/qa_anim.py --replay utsushi --clones 3 --expect-hits 4 --resumo
python tools/qa_anim.py --replay fuuka --kind jutsu --target iwao --resumo
```

O replay monta uma luta com um ninja de cada lado e usa as rotinas do jogo para reproduzir uma perseguição, jutsu, Forte ou básico. Na perseguição, o motor coloca o alvo no estado exigido pelo golpe. Por padrão, o atacante fica do lado aliado, o alvo é Iwao e a ação é a perseguição. O alvo começa com os PV cheios, ou com 1 PV se usar `--ko`. As rolagens de combate usam um valor fixo. Com `--expect-hits`, a execução retorna erro se o contador do jogo registrar outro valor.

Cada execução guarda vídeo, tira e relatório numa pasta temporária própria. Você também pode indicar com `--out` uma pasta vazia para guardar os artefatos. Use o replay para repetir o mesmo cenário antes e depois de uma mudança e as cinco missões para testar a interação com um time completo.

## Próxima ferramenta proposta

Uma comparação visual de atlas entre commits montaria uma prancha antes/depois só das linhas alteradas. Usaria os metadados para destacar mudanças de pivô, quadros vazios e saltos da silhueta.
