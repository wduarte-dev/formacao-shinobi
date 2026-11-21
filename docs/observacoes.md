# Observações do Wellington sobre o jogo

Fonte original: doc no claude.ai (artefato Docs, slug `56949c0c-2b3e-468f-a53c-af60ddb84e2d`) com prints do Naruto Online. Retrato de 21/11/2026 abaixo. **Se ele tiver observação nova, pedir pra colar aqui (ou anotar neste arquivo).**

## Bugs / arte (Kaen)
1. Sprite de caído (knockdown) aparece vertical; deveria ser horizontal.
2. Fundo cinza no idle e em algumas animações: deixar transparente.
3. Perseguição aérea fraca. Ajustar pra parecer ataque no ar de verdade, ou pedir lote específico. Referência: no Naruto Online o atacante não precisa voar até o alvo (bola de fogo, dragão d'água à distância).

## Mecânicas / UX
4. Ataque básico com variedade: uns golpeiam até 3x, outros derrubam com 1 golpe forte, outros atingem todos com pouco dano.
5. **Cena de jutsu (importante):** do início ao fim aparecem só o conjurador e os afetados, fundo mais escuro que na batalha normal. Todos voltam (e o fundo clareia) quando conjurador e alvo retornam às posições. Hoje só o começo é assim. (Decidido: vale também pra perseguição.)
6. Cura: aura verde + valor curado (a Mizuha já faz, ok).
7. Hover no inimigo: destaca (verde) e mostra vida exata (restante/total).
8. Clique no inimigo: marca (azul) até clicar de novo. Jutsus vão pro marcado, exceto os com restrição (mais fraco, todos).
9. Fluxo não é fixo: cada personagem/animação tem tempo próprio (um jutsu 4s, outro 8s).

**Status (21/11/2026): tudo resolvido.** 1–3: Kaen refeito no v2 (caído horizontal, sem fundo cinza, perseguição aérea com pouso). 4: básicos variados (`hits` de 2 a 5 socos, Rajada Leve em todos, Iwao derruba) + golpe Forte a cada 3ª ação. 6: ok. **Onda 0b resolveu 5, 7, 8 e 9:** cena isolada em jutsu e perseguição (perseguidores acumulam, fundo só clareia quando todos voltaram), hover verde + vida exata, clique marca em azul (jutsus de alvo único/fileira do jogador vão nele), tempos vindos da anim (`animMs`/`hitAt`) e do fim das partículas (`fxWait`).
