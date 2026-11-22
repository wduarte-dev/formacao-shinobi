# Ninjas — mecânica (todos os 9 integrados)

Números reais ficam em `N` (`js/data.js`); aqui o design e as regras. Ninja novo: escrever a seção dele aqui antes de integrar (vale como pré-definido, sem perguntar de novo). Design completo e prompts de cada um ficam no Project "GAME" do claude.ai (`claude/ninja-<nome>.md`); aqui está o que a integração precisa.

## Regras gerais
- **Paralisia (`stunned`, 22/11/2026):** o ninja paralisado **age normal** (básico, Forte, jutsu armado), só **não persegue** e não desvia. Dura até o fim da próxima ação dele (aparece o "P" na barra). Antes, paralisia pulava a ação inteira; mudou pra seguir o Naruto Online. As menções de "atordoa 1 rodada" abaixo valem com essa regra.
- **Jutsu armado (22/11/2026):** clicou, o chakra já foi e não dá pra cancelar (nem pra devolver). Aura na cor do ninja até a vez dele; só deixa de sair se ele morrer (chakra volta). Código: `x.onclick` em `drawJ`, `.aura` em `mk`/CSS.
- **Esquiva (`dodge`):** % por ninja (padrão 0). Desviável: básico, forte, jutsu de alvo único. Não desviável: jutsu de "todos", DoT, cura, perseguição em andamento. Combo de vários golpes = 1 teste só. Sucesso: anim `dodge`, sem número/texto, sem dano, sem mudar estado; combo em andamento para. Não gasta nem dá chakra. Jutsu de fileira também não é desviável; paralisado não desvia. Código: `dodge` em `N`, rolagem em `doSkill`, `evade` em `js/cine.js` (anim `dodge` + passo pra trás em CSS). Valores: Mayoi 15 (+25 no campo dela), Poko 15, Hiyori 10, Fuuka 8, Doku 5, resto 0.
- **Golpe Forte (`strong`):** toda 3ª ação sem jutsu o básico vira o Forte (contador `nc` por ninja). Usa a anim `strong` do atlas. Só quem tem Forte definido abaixo (Fuuka, Mayoi, Hiyori, Doku, Poko).
- **Perseguição com dinâmica (`chase.mv`):** `slam` = salta alto e despenca no alvo (Iwao); `rise` = golpe que sobe junto com o alvo lançado (Fuuka, Hiyori, Poko). Kaen tem a aérea própria (lote E: `rise`/`meteor`/`landing`).
- **Campo/"plano":** um ativo por vez (novo substitui). Overlay em código (escurecer + névoa em movimento), nunca sprite. Regras por elemento.
- Cena de jutsu/perseguição isolada (ver `docs/ondas.md`, 0b).

## Elenco original (Kaen, Mizuha, Raiden, Iwao)
Resumo na tabela do `CLAUDE.md`. Detalhes que não estão lá: Kaen corta 2x no básico e queima a fileira no jutsu; Mizuha atira à distância e a Onda dela (D→R) é desenhada em código (`waveFx` local: brota embaixo do alvo, curva e quebra nele), com 25% de virar **Tsunami** (pega o time inimigo inteiro); Raiden dá 2 golpes no básico e o jutsu paralisa; Iwao derruba (D) no básico e a **Muralha de Pedra** dá escudo de 2,5x o ataque dele a cada aliado, **não acumula** (fica o maior) e some depois de 2 rodadas. Só o Iwao tem Forte (Punho de Pedra, R, desde a 1.5).

> **Regeração 22/11/2026:** Fuuka, Hiyori, Mayoi e Doku foram regerados no estilo realista (ref `docs/refs/elenco_ref.png`, lotes em `docs/prompts-<ninja>.md`) e saíram do `LOCK`. Contagens de quadros reais: ver o objeto `V2` em `js/sprites.js` (valem mais que as listas "Atlas real" abaixo, que são do atlas antigo). Efeitos do lote D da Fuuka e da Mayoi têm até 7 quadros. Mizuha e Iwao ganharam idle gerado (8 quadros); Iwao ganhou Forte: **Punho de Pedra** (1.5), toda 3ª ação sem jutsu, mult 1.4, deixa **R** (abre combo pra Raiden, Poko e o próprio Iwao). **Tsunami da Mizuha (1.5):** desenhado em código no canvas (`tsunamiFx` em `js/fx.js`): jatos brotam do chão, a parede sobe, avança e desaba; na hora da queda todo inimigo leva 60% do dano da Onda, splash e empurrão; todos ficam visíveis na cena e marcados (`.tgt`). O sheet gerado (`src/mizuha/T.jpg`) ficou só como referência visual.

## Hiyori (Gelo, Controle) — `teal_fix` no config
- Visual: cabelo longo azul-gelo, kimono curto branco com marinho, obi marinho, grampo de floco de neve, sem arma (lâminas de gelo só nos ataques).
- **Básico — Combo de Lâmina de Gelo:** corpo a corpo, alvo único, 3 golpes de ~35% cada (~105%), sem estado.
- **Forte — Toque Congelante:** corpo a corpo, dano alto, **Congelado** = atordoado 1 rodada (sem R/L/D). Desviável.
- **Jutsu — Prisão de Gelo:** alvo único (respeita marcado), dano médio, **D + atordoa**; se já atordoado, só renova (máx 1 rodada). Recarga 4. Efeito `prison` do lote D cobre o alvo.
- **Perseguição — Pilar de Gelo:** D→L, corpo a corpo, pilar (`pillar` do D) sobe e lança; palma ascendente.
- dodge 10%. Sinergia: Jutsu (D) → Pilar (D→L) → quem pega L.
- Atlas real: idle 6, walk 8, dash 8, attack 8, strong 7, guard 4, hurt 3 (frames 2-3 + repete 3), dodge 6, seals 6, jutsu 8, buff 6 (reforçar com partículas azul-gelo), stun 4, victory 6, defeat 8, knockback 8 (quase estático: deslize em código), launched 8, knockdown 8, chase 8 (grampo some nos frames 3, 4, 6). FX: blade, crescents, prison, pillar, impact, aura (7 frames).

## Fuuka (Vento, Atacante em área)
- Visual: cabelo prateado com pontas rosa, roupa carvão/branca com rosa, fita rosa na cintura, dois anéis-lâmina prateados nos quadris.
- **Básico — Rajada Leve:** atinge TODOS (1 hit cada, ~40%), sem estado, desviável por alvo; ela fica parada, efeito `gust` do D.
- **Forte — Corte Giratório:** salta e fatia com os anéis, corpo a corpo, dano alto, deixa **D**. Desviável.
- **Jutsu — Tufão Cortante:** todos, dano médio, **L**, não desviável. Recarga 4. **Dissipa o campo ativo** na hora (névoa some com fade). Efeito `tornado`.
- **Perseguição — Redemoinho:** D→L, corpo a corpo aérea, chute giratório ascendente + `whirlwind` do D.
- dodge 8%. Sinergia: Forte (D) → Redemoinho (D→L) → quem pega L.
- Atlas real: idle 6 (respiração), walk 8, dash 8, attack 7, strong 7, guard 4, hurt 3, dodge 6, seals 6, jutsu 7, buff 5 (reforçar com partículas rosa), stun 4, victory 6, defeat 7, knockback 8, launched 8, knockdown 8, chase 8. FX: crescent, gust, tornado, whirlwind, impact, aura.

## Mayoi (Névoa, Esquiva/campo) — substituiu o Kuro
- Visual: cabelo cinza-azulado cobrindo um olho, cachecol lilás, roupa ardósia-violeta com asas de mariposa nas mangas, bengala curta com lanterna de papel, mariposas fantasmas. (Inspirado só na MECÂNICA de esquiva + plano; nada de corvos/capa preta/olhos vermelhos.)
- **Básico — Bengala e Mariposas:** corpo a corpo, alvo único (no jogo é 1 golpe só; dá pra virar 2 com `hits`).
- **Forte — Onda de Névoa:** à distância, alvo único, dano alto, sem estado.
- **Jutsu — Noite de Névoa (campo):** todos, 3 rodadas, recarga 5. Overlay escuro + névoa em código. Efeitos: Mayoi dodge +25 (40% total); aliados de Veneno: veneno +1 rodada; aliados de Gelo: básico +15%; inimigos de Fogo: -15% de dano.
- **Perseguição — Tempestade de Mariposas:** L→R, à distância: ele fica parado e o enxame voa até o alvo.
- dodge 15% base. Esquiva = corpo vira mariposas e se refaz (anim `dodge`).
- Sheets (molde antigo): A = 8 linhas (idle 6, walk 8, dash 8, básico 7, forte 7, guard 4, hurt 3, dodge 8); B = 6 linhas (seals, jutsu, buff, stun, victory, defeat); C = 4 linhas (knockback, launched, knockdown, chase); D = efeitos 6 linhas (enxame, nuvem que se desfaz/refaz, onda de névoa, impacto, aura, flash pequeno).

## Doku (Veneno, Desgaste) — prompts em `docs/prompts-doku.md`
- Visual: boticário/alquimista, capuz ameixa, máscara de pano, bandoleira com 5 frascos violeta, luvas de couro, estojo de agulhas no antebraço. Veneno é ROXO (verde some no chroma key).
- **Básico — Arremesso de Frascos:** à distância, alvo único, 2 hits baixos, veneno fraco 1 rodada. Desviável. **Chuva de Frascos (1.5.1):** 20% (`normal.split`) de o frasco se multiplicar no ar e acertar todos os inimigos com o mesmo dano/veneno (não desviável); todos aparecem na cena e ficam marcados, como no Tsunami (`shootSplit` em `cine.js`).
- **Forte — Agulhas:** corpo a corpo, dano alto, veneno forte 2 rodadas. Desviável.
- **Jutsu — Névoa Tóxica:** todos, **R + veneno**, não desviável. Recarga 4.
- **Perseguição — Ferrão:** L→D, mergulho de cima com agulha gigante.
- dodge 5%. Sinergia: Fuuka/Mayoi (L) → Ferrão (L→D).

## Poko (Som, Velocista/combo, GRANDALHÃO) — `size` 1.2, bloqueado (missão 3 como inimigo → vence e libera; Modo dev libera). Sheets: B1/B2 com 9 colunas e legendas limpas por `clean_labels.py`; stun = frames 0,1,0,1
- Visual: **louva-a-deus alto e veloz** (criatura), corpo âmbar/ocre/ferrugem com placas cremes (SEM verde), duas foices serrilhadas, asas translúcidas que vibram e fazem som, discos dourados no peito tipo alto-falante. Paleta de som: dourado, laranja-avermelhado, creme. Prompt: `docs/refs/poko_A1_prompt.txt`. Sem ref no A1 porque é o primeiro bicho: a IA copiaria o ninja usado como ref.
- **Tamanho:** primeiro ninja com `size` (1.2 no jogo): multiplicador no `mkSpr`, `--h` da barra e alcance de `dashTo`.
- **Básico — Rufo de Foices:** corpo a corpo, alvo único, ~5 hits de ~20% (`hits`), sem estado.
- **Forte — Estridulação:** onda sonora à distância (projétil `arc` do D), dano alto, **R**. Desviável. Abre combo pra quem persegue R (Raiden, Iwao, o próprio Poko).
- **Jutsu — Zumbido Ensurdecedor:** todos, pulsos de som, dano médio, **atordoa 1 rodada**, não desviável. Recarga 4.
- Números reais no jogo: hp 820, atk 115, def 15, dodge 15; básico 5 hits (mult 1.05), Forte mult 1.4, jutsu `stun:'all'` mult .8, recarga 4.
- **Perseguição — Ceifa Relâmpago:** **R→L**, corpo a corpo: dash, rajada de cortes e cruz ascendente que lança (sobe junto, `mv:'rise'`).
- dodge 15%. Foco: abrir combos com vários passos.

## Yugami (Espaço, Distorção) — integrado 22/11/2026 (efeitos do lote D em `spr/yugami_fx.png`: shard/fenda/lacre/rasgo/estouro/halo; sons em `docs/audio.md`)
- Humano 6,5 cabeças (proporção do Kaen), capuz azul-marinho = lacre; dourado/marinho/branco. Dois atlas de 192x160: `yugami` (capuz, A1/A2 + B1/B2/C) e `yugamir` (solto: H1/H2 no lugar de A1/A2, + `unhood`/`rehood` do lote T). Configs `tools/sprites/config/yugami.json` e `yugamir.json`, rodar com `--src src/yugami`. `hurt` não está no `V2` (a anim gerada era corrida; cai no `guard`).
- **Jutsu Lacre Rompido** (`jutsu.unleash:3`, `target:'self'`): `setForm(u,true)` troca o atlas (`sid(u)` em `sprites.js`) e liga a distorção em código (`glitchSet`: 2 clones recortados em 3 faixas horizontais que escorregam de lado, CSS `.gl0/.gl1/.gl2`); `u.sR` conta as rodadas; ao zerar toca `rehood` e volta. Enquanto solto: dano x1,35 (`dmgOf`) e +20 de esquiva (`dodgeOf`). Relançar só renova a duração. IA só usa se não estiver solto (`wants`). Ao acabar (rodada em que `sR` zera), `rehoodCine` em `cine.js`: cena isolada, zoom 1.9 nele e anim `rehood` em câmera lenta (`u.ts`, ~3s no total), depois volta pro atlas encapuzado.
- Normal Corte Dimensional (front), Forte Dupla Fenda (1,5x), perseguição Passo Dimensional (D→R, 0,7x). Atributos: HP 860, ATK 112, DEF 18, esquiva 12. Sem sons próprios (cai no genérico).

## Destaque do combo (22/11/2026)
No começo da perseguição (`comboShow` em `combat.js`), todos que vão entrar no combo (`comboPlan`: segue on→cause sem repetir) saem da cena escura e ganham o anel rosa pulsando (`.u.cmb .sh`), estilo NO; antes só aparecia quem estava golpeando.
