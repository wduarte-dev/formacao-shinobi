# Ninjas novos — mecânica PRÉ-DEFINIDA (implementar na integração sem perguntar de novo)

Números são sugestão inicial, ajustar no teste. Design completo e prompts de cada um ficam no Project "GAME" do claude.ai (`claude/ninja-<nome>.md`); aqui está o que a integração precisa.

## Regras gerais
- **Esquiva (`dodge`):** % por ninja (padrão 0). Desviável: básico, forte, jutsu de alvo único. Não desviável: jutsu de "todos", DoT, cura, perseguição em andamento. Combo de vários golpes = 1 teste só. Sucesso: anim `dodge`, sem número/texto, sem dano, sem mudar estado; combo em andamento para. Não gasta nem dá chakra. Jutsu de fileira também não é desviável; paralisado não desvia. **Implementado na Onda 0b** (`dodge` em `js/data.js`, rolagem em `doSkill`, `evade` em `js/cine.js`: usa anim `dodge` se o atlas tiver, senão passo pra trás translúcido em CSS). Hoje: kuro (Mayoi) 15, Hiyori 10, Fuuka 8.
- **Campo/"plano":** um ativo por vez (novo substitui). Overlay em código (escurecer + névoa em movimento), nunca sprite. Regras por elemento.
- Cena de jutsu/perseguição isolada (ver `docs/ondas.md`, 0b).

## Hiyori (Gelo, Controle) — config pronto, `teal_fix`
- Visual: cabelo longo azul-gelo, kimono curto branco com marinho, obi marinho, grampo de floco de neve, sem arma (lâminas de gelo só nos ataques).
- **Básico — Combo de Lâmina de Gelo:** corpo a corpo, alvo único, 3 golpes de ~35% cada (~105%), sem estado.
- **Forte — Toque Congelante:** corpo a corpo, dano alto, **Congelado** = atordoado 1 rodada (sem R/L/D). Desviável.
- **Jutsu — Prisão de Gelo:** alvo único (respeita marcado), dano médio, **D + atordoa**; se já atordoado, só renova (máx 1 rodada). Recarga 4. Efeito `prison` do lote D cobre o alvo.
- **Perseguição — Pilar de Gelo:** D→L, corpo a corpo, pilar (`pillar` do D) sobe e lança; palma ascendente.
- dodge 10%. Sinergia: Jutsu (D) → Pilar (D→L) → quem pega L.
- Atlas real: idle 6, walk 8, dash 8, attack 8, strong 7, guard 4, hurt 3 (frames 2-3 + repete 3), dodge 6, seals 6, jutsu 8, buff 6 (reforçar com partículas azul-gelo), stun 4, victory 6, defeat 8, knockback 8 (quase estático: deslize em código), launched 8, knockdown 8, chase 8 (grampo some nos frames 3, 4, 6). FX: blade, crescents, prison, pillar, impact, aura (7 frames).

## Fuuka (Vento, Atacante em área) — config pronto
- Visual: cabelo prateado com pontas rosa, roupa carvão/branca com rosa, fita rosa na cintura, dois anéis-lâmina prateados nos quadris.
- **Básico — Rajada Leve:** atinge TODOS (1 hit cada, ~40%), sem estado, desviável por alvo; ela fica parada, efeito `gust` do D.
- **Forte — Corte Giratório:** salta e fatia com os anéis, corpo a corpo, dano alto, deixa **D**. Desviável.
- **Jutsu — Tufão Cortante:** todos, dano médio, **L**, não desviável. Recarga 4. **Dissipa o campo ativo** na hora (névoa some com fade). Efeito `tornado`.
- **Perseguição — Redemoinho:** D→L, corpo a corpo aérea, chute giratório ascendente + `whirlwind` do D.
- dodge 8%. Sinergia: Forte (D) → Redemoinho (D→L) → quem pega L.
- Atlas real: idle 6 (respiração), walk 8, dash 8, attack 7, strong 7, guard 4, hurt 3, dodge 6, seals 6, jutsu 7, buff 5 (reforçar com partículas rosa), stun 4, victory 6, defeat 7, knockback 8, launched 8, knockdown 8, chase 8. FX: crescent, gust, tornado, whirlwind, impact, aura.

## Mayoi (Névoa, Esquiva/campo) — substitui o Kuro; config a escrever
- Visual: cabelo cinza-azulado cobrindo um olho, cachecol lilás, roupa ardósia-violeta com asas de mariposa nas mangas, bengala curta com lanterna de papel, mariposas fantasmas. (Inspirado só na MECÂNICA de esquiva + plano; nada de corvos/capa preta/olhos vermelhos.)
- **Básico:** 2 golpes de bengala + estouro de mariposas (corpo a corpo, 2 hits baixos).
- **Forte:** onda de névoa luminosa em linha, à distância (efeito do D).
- **Jutsu — Noite de Névoa (campo):** todos, 3 rodadas, recarga 5. Overlay escuro + névoa em código. Efeitos: Mayoi dodge +25 (40% total); aliados de Veneno: veneno +1 rodada; aliados de Gelo: básico +15%; inimigos de Fogo: -15% de dano.
- **Perseguição — Tempestade de Mariposas:** L→R, à distância: ele fica parado e o enxame voa até o alvo.
- dodge 15% base. Esquiva = corpo vira mariposas e se refaz (anim `dodge`).
- Sheets (molde antigo): A = 8 linhas (idle 6, walk 8, dash 8, básico 7, forte 7, guard 4, hurt 3, dodge 8); B = 6 linhas (seals, jutsu, buff, stun, victory, defeat); C = 4 linhas (knockback, launched, knockdown, chase); D = efeitos 6 linhas (enxame, nuvem que se desfaz/refaz, onda de névoa, impacto, aura, flash pequeno).

## Doku (Veneno, Desgaste) — INTEGRADO (Onda 3); prompts em `docs/prompts-doku.md`
- Visual: boticário/alquimista, capuz ameixa, máscara de pano, bandoleira com 5 frascos violeta, luvas de couro, estojo de agulhas no antebraço. Veneno é ROXO (verde some no chroma key).
- **Básico — Arremesso de Frascos:** à distância, alvo único, 2 hits baixos, veneno fraco 1 rodada. Desviável.
- **Forte — Agulhas:** corpo a corpo, dano alto, veneno forte 2 rodadas. Desviável.
- **Jutsu — Névoa Tóxica:** todos, **R + veneno**, não desviável. Recarga 4.
- **Perseguição — Ferrão:** L→D, mergulho de cima com agulha gigante.
- dodge a definir (sugestão 5%). Sinergia: Fuuka/Mayoi (L) → Ferrão (L→D).

## Poko (Som, Velocista/combo, GRANDALHÃO) — prompt A1 pronto (sem ref, de propósito), INTEGRADO (Onda 4): `size` 1.2, bloqueado (missão 3 como inimigo → vence e libera; Modo dev libera) em `tools/sprites/src/poko/` (obs: no B2 só 2 frames bons de stun, usar `pingpong`; B1 e B2 vieram com 9 colunas)
- Visual: **louva-a-deus alto e veloz** (criatura), corpo âmbar/ocre/ferrugem com placas cremes (SEM verde), duas foices serrilhadas, asas translúcidas que vibram e fazem som, discos dourados no peito tipo alto-falante. Paleta de som: dourado, laranja-avermelhado, creme. Prompt: `docs/refs/poko_A1_prompt.txt`. Sem ref no A1 porque é o primeiro bicho: a IA copiaria o ninja usado como ref.
- **Tamanho:** primeiro ninja com `size` (~1.4–1.6): multiplicador no `mkSpr`, `--h` da barra e alcance de `dashTo`. Sprites já gerados na proporção. A onda de `size` vem antes de ele entrar no jogo.
- **Básico — Rufo de Foices:** corpo a corpo, alvo único, ~5 hits de ~20% (`hits`), sem estado.
- **Forte — Estridulação:** onda sonora em arco à frente (atrito das asas), dano alto, **R**. Desviável.
- **Jutsu — Zumbido Ensurdecedor:** todos, pulsos de som, dano médio, **atordoa 1 rodada**, não desviável. Recarga 4.
- Números reais no jogo: hp 820, atk 115, def 15, dodge 15; básico 5 hits (mult 1.05), jutsu `stun:'all'` mult .8, recarga 4. A Estridulação (forte) ainda não é usada: o jogo só tem básico, jutsu e perseguição.
- **Perseguição — Ceifa Relâmpago:** **R→L**, corpo a corpo: dash, rajada de cortes e cruz ascendente que lança. Sinergia: a Estridulação dele deixa R, mas quem encadeia é outro ninja.
- dodge a definir (velocista: sugestão 15%). Foco: abrir combos com vários passos.
