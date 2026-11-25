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

## QA pelo diff

```sh
python tools/qa_diff.py --plano
python tools/qa_diff.py
python tools/qa_diff.py --base HEAD~1
```

O comando compara a árvore de trabalho com o commit indicado, por padrão `HEAD`. Inclui arquivos preparados, alterações locais e arquivos novos que o Git não ignora. Use `--plano` para ver a seleção sem abrir o navegador.

- **Atlas em `spr/`** aciona a prancha do ninja e seu replay. Ninjas novos entram pelo nome do atlas e usam o jutsu da própria ficha até terem um cenário cadastrado. Efeitos `_fx.png` acionam o replay. Variantes do Yugami e dos clones acionam o ninja correspondente. Para revisar o Yugami sem capuz, confira também o Lacre Rompido em batalha.
- **CSS, HTML ou módulos compartilhados de retrato** acionam a prancha do elenco.
- **JavaScript alterado** passa pela conferência de sintaxe. Módulos novos e mudanças nos módulos de combate também reproduzem Chute Meteoro, Rajada Fantasma e Tufão Cortante. Os cenários salvos em `SCENARIOS`, em `qa_diff.py`, conferem os hits e o nocaute do Kaen a 2×. Acrescente ali um caso quando uma mecânica nova precisar de uma verificação específica.

O terminal lista uma linha por verificação. As falhas retornam código 1 e incluem o caminho do log. Relatórios, vídeo e pranchas ficam juntos na pasta temporária impressa no início. Use `qa_etapa.py` antes de publicar para conferir as cinco missões e a animação em batalha completa.

Para conferir as regras de seleção sem abrir o navegador, rode `python tools/test_qa_diff.py`.

## Replay de uma ação

```sh
python tools/qa_anim.py --replay kaen --expect-hits 1 --resumo
python tools/qa_anim.py --replay kaen --side e --speed 2 --ko --expect-ko --resumo
python tools/qa_anim.py --replay utsushi --clones 3 --expect-hits 4 --resumo
python tools/qa_anim.py --replay fuuka --kind jutsu --target iwao --resumo
```

O replay monta uma luta com um ninja de cada lado e usa as rotinas do jogo para reproduzir uma perseguição, jutsu, Forte ou básico. Na perseguição, o motor coloca o alvo no estado exigido pelo golpe. Por padrão, o atacante fica do lado aliado, o alvo é Iwao e a ação é a perseguição. O alvo começa com os PV cheios, ou com 1 PV se usar `--ko`. As rolagens de combate usam um valor fixo. Com `--expect-hits`, a execução retorna erro se o contador do jogo registrar outro valor.

Cada execução guarda vídeo, tira e relatório numa pasta temporária própria. Você também pode indicar com `--out` uma pasta vazia para guardar os artefatos. Use o replay para repetir o mesmo cenário antes e depois de uma mudança e as cinco missões para testar a interação com um time completo.

## Comparar atlas

`python tools/qa_atlas_diff.py [ninja] [--base HEAD~1] [--salto 24]`

Sem ID, seleciona os atlas de `spr/` que diferem do commit base, incluindo arquivos novos ainda sem rastreamento. Usa o V2 de cada versão e salva uma prancha por ninja com as linhas alteradas. O relatório temporário guarda os deslocamentos por quadro e as linhas que excedem a saída do terminal.

O pivô estimado usa a faixa inferior da silhueta como referência para os pés. A ferramenta sai com código 1 quando falta um quadro, algum eixo do pivô difere mais de 3 px de (96,150) ou o salto entre centros de quadros consecutivos excede o limite em pixels. Para atlas novos, mede pivô e quadros vazios e gera somente o relatório. Requer Pillow.

## Preparar uma versão

`python tools/release.py --grande|--pequeno [--dry-run] [--commit]`

Atualize `docs/patch-notes.md` antes de executar. O comando verifica as notas contra o commit da versão atual e roda `qa_diff.py` com essa base, a batalha com Playwright, a geração de notas e a atualização da versão, nessa ordem. Para na primeira falha e fornece o caminho do log. `--dry-run` lista os passos. `--commit` cria um commit local com os arquivos de publicação. A publicação remota é manual.

## Gerar o estado do repositório

`python tools/estado.py`

Gera `docs/ESTADO.md` com as duas fontes de versão, os ninjas do jogo, os arquivos de atlas, FX e som, os dez commits mais recentes e as linhas `Pendente:` dos últimos vinte commits e de `docs/`. O arquivo gerado é local. Se o conteúdo ultrapassar 60 linhas, o resumo indica quantos itens ficaram de fora e mantém a contagem total de pendências.
