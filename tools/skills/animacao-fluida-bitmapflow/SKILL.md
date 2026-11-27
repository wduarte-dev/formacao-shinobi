---
name: animacao-fluida-bitmapflow
description: Fazer uma animação de ninja do Formação Shinobi (idle, respirar, cabelo/cachecol, ciclos suaves) ficar FLUIDA com poucas gerações, gerando poses-chave pequenas na IA de imagem, alinhando pelos pés e interpolando no Bitmapflow. Usar quando o dono pedir idle/ciclo fluido, "muitos quadros", Bitmapflow, interpolação ou alinhar sheet. Não serve pra movimento grande (dash, salto) nem pra smear.
---

# Animação fluida: poses-chave pequenas + alinhamento + Bitmapflow (validado 26/11/2026 no preview do Bitmapflow)

Resumo: a IA gera POUCAS poses com passo pequeno (ela erra menos), o `align_sheet.py` trava os pés, o Bitmapflow cria os quadros do meio. Sem a interpolação o ciclo fica "truncado"; com ela fica fluido (palavras do dono).

## 1. Triagem (regra do repo: AskUserQuestion, recomendada primeiro)
O que o ninja faz (ações em sequência), quantas poses (ver §6), onde a arma/acessório fica. **Conceito dele vale mais que o template.** Arma longa: embainhada, mão no cabo, inteira em todo quadro.

## 2. Prompt (um por linha, colado no chat; anexo: `docs/refs/elenco_ref.png`)
```
GRID=4x5 python3 tools/sprites/gen_prompts_lotes.py <ninja> A1 1      # 20 poses; GRID=2x5 = 10 poses
```
Precisa da chave `A1_<N>` (N = linhas×colunas) no ninja em `NINJAS` (`gen_prompts_lotes.py`; modelo: `kaen`, `A1_10` e `A1_20`). Ninja que já está na `elenco_ref`: `inroster=True` (o texto manda copiar o design do roster, em vez de "ser diferente de todos").
Regras que funcionaram no texto da linha:
- **Passos pequenos** entre poses vizinhas (poucos pixels), mas percurso total grande: muitas ações em sequência, ciclo que fecha na pose 1.
- **Cabelo, rosto e expressão idênticos** em todas as poses (a IA redesenhando o cabelo é o que o fluxo óptico derrete).
- **Pés plantados**, mesma escala, personagem centrado, ~80% da altura da célula, pé a ~8% da base.
- **Grade com células quase quadradas** (canvas ~colunas:linhas): 20 poses numa imagem baixa e larga ficam minúsculas.

**Regra de NATURALIDADE (do dono, 27/11/2026): movimento não surge do nada, ele ACONTECE.** A animação começa da pose em que o personagem já estava (ex.: idle com a mão na cintura → o walk começa levando a mão até o cabo, só depois anda). Escrever essa transição nas primeiras poses do prompt. Walk em ciclo: 5 poses de entrada + 20 de ciclo (`ANIM=walk GRID=5x5 python3 tools/sprites/gen_prompts_lotes.py kaen A1 1`, chave `walk_25`); a entrada toca uma vez e o ciclo repete (exige `loopFrom` no motor, decidir por triagem).
**Ref:** usar como anexo o sprite de MELHOR qualidade do elenco (hoje o Keshin), não só o do próprio ninja (`refchar="KESHIN"` no `NINJAS`; o texto manda copiar só a qualidade/estilo, não o rosto nem as roupas).

## 3. Salvar o sheet original INTACTO
`tools/sprites/src/<ninja>/<NOME>.png` (o dono sobe pro GitHub `sprites_novos/` com nome aleatório: identificar pelo conteúdo). Nunca editar o original.

## 4. Alinhar (corrige o "deslize" no chão)
```
python3 tools/sprites/align_sheet.py <sheet.png> <colunas> <linhas> --cell 320      # saída: <nome>_aligned.png
```
**Âncora certa por tipo de animação (erro meu em 27/11):** idle, pés plantados → `--anchor feet` (padrão). **Walk/corrida no lugar → `--anchor torso`**: o corpo fica parado e os pés é que andam; alinhar pelos pés num walk cancela a passada e faz o torso balançar. Acha cada pose, alinha a âncora e a sola, remonta em células inteiras (medidas divisíveis; célula fracionária também faz deslizar). Imprime os números da importação. Conferir: spread dos pés ≤1 px, nenhum pixel na borda da célula (`--cell` maior se avisar). Idle do Kaen em 10 poses: `--cell 400`; em 20 poses (1402×1122): `--cell 320`.

## 5. Bitmapflow (configuração que ficou boa)
Importação: Frame count = colunas×linhas, Frames per row = colunas, Width/Height = a célula, offsets e margens 0.
Painel: Inbetweens 1, Loop seamlessly ligado, Motion multiplier 0,5x (testar 1x), **DenseRLOF**, Grid step X/Y 6, Forward backward threshold 1, Post processing ligado, Variational refinement desligado, **Pixel art mode ligado**.
**fps:** o campo da prévia é a ENTRADA; a saída é o dobro com 1 inbetween. Duração = (poses×2) ÷ (entrada×2). Ex.: 20 poses, entrada 5 → saída 10 → 40 quadros, ~4 s.
Se distorcer: passos menores no prompt (mais poses), grid step maior, "Show motion vectors" pra ver onde o fluxo erra (cabelo, cachecol). Julgar no TAMANHO DO JOGO (célula 192×160): artefato do zoom some.

**Walk com entrada + ciclo (25 poses = 5 de entrada + 20 de loop):** o "Loop seamlessly" do Bitmapflow fecha a ÚLTIMA pose na PRIMEIRA, o que está errado aqui (o ciclo fecha 25→6). Importar em DUAS levas: (a) entrada: Frame count 6, Frames per row 5, Offset 0 (poses 1–6), loop DESLIGADO; (b) ciclo: Frame count 20, Frames per row 5, **Offset Y = altura da célula** (pula a 1ª linha), loop LIGADO.

**Parágrafo final que funciona (validado pelo dono, 27/11):** o gerador agora termina todo prompt com "WORK METHOD: take your time... pose by pose... final REVIEW pass and fine-tune..." (a IA refinou de verdade e levou ~3 min em vez de ~1). `CRAFT=0` desliga.

## 6. Quantas poses? O ciclo repete e enjoa
10 poses a 10 fps = ~1 s por volta: enjoativo. Alvo: ciclo de 3–4 s com ações DIFERENTES em sequência (20 poses). Mais ações, não mais amplitude por passo.

## 7. Limites do jogo ao integrar (decidir com triagem ANTES)
- `V2` (`js/sprites.js`): `nome:[linha, quadros, fps, loop, pingpong, seq]`, UMA linha por animação; atlas do Kaen tem 12 colunas ⇒ máx. 12 quadros por animação hoje. 40 quadros exigem suporte a animação em mais de uma linha (ou atlas mais largo).
- Ciclo que já fecha: **pingpong desligado** (senão vai e volta e dobra a volta). `seq` repete quadros (segurar poses extremas).
- Só recortar/integrar quando o dono avisar que terminou; depois `audit_atlas.py`, `qa_anim.py`, `test_battle.py`, patch notes e versão.

## 8. O que NÃO funcionou (não repetir; detalhes em `docs/licoes-validadas.md` do repo de contexto)
Smear por prompt (só dá pose esticada); smear por cópia deslocada/rastro/escala/skew; distorção aleatória em vídeo; fluxo óptico Farneback caseiro. Movimento grande (dash, salto) com Bitmapflow: sem teste, esperar ghosting.

## 9. Pendente (ideias, não feito)
Script de limpeza de paleta nos quadros interpolados (cores intermediárias, pixel solto, fundo → transparência), conversor GIF→quadros→atlas, suporte a animação multi-linha no motor.

## Fluxo completo atual (27/11/2026): do sheet à aprovação
1. Prompt do sheet: `python3 tools/sprites/gen_prompts_lotes.py <ninja> A1 1` com `GRID=4x5 ANIM=<chave>` (ou `kit N` para efeitos). Um sheet por vez. Não deixar regras do prompt se contradizerem (ex.: "não toque a borda" x "emenda reta na borda").
2. Sheets novos entram em `sprites_novos/`; depois de processados: `python3 tools/sprites/arquivar_usados.py` (vai para `sprites_usados/<grupo>/` com nome claro).
3. Preparo por script, sem abrir imagem por imagem: `python3 tools/sprites/kaen_lote.py` (quadros do Bitmapflow: tira o verde, mede geometria, acusa corte na borda e o que falta) e `python3 tools/sprites/dragao_lote.py` (peças que se encaixam: mede espessura e centro das emendas).
4. Bitmapflow só em ciclos contínuos (idle, ataque, forte, jutsu). Pulo, entrada, poses soltas e efeitos entram crus. Contato no quadro = pose x multiplicador.
5. Página de teste por receita JSON e verificação automática de truncamento: `python3 tools/golpe_teste.py <receita>` (golpes) e `python3 tools/jutsu_teste.py <receita>` (jutsu com criatura em peças e cut-in). Olhar o próprio print antes de mostrar.
6. Efeito: sprite como base, código só para efeito espacial; efeito sempre com origem; fogo atrás da criatura; número de dano em escada; nada fora do palco. Golpes de espada: sutil (arco, contato, impacto, hit-stop, flinch). Jutsu pesado: camada de impacto em cima.
7. Só depois do "aprovado" do dono a animação segue para o motor.
