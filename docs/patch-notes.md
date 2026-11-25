# Patch notes — Formação Shinobi

Regra de versão: **atualização grande** sobe o segundo número (1.4 → 1.5); **correção/ajuste pequeno** ganha um terceiro (1.5 → 1.5.1).
Fluxo: escrever as notas aqui (mais nova em cima) → `python3 tools/patch_notes.py` (gera `js/patch.js`, que a tela **Novidades** do menu lê) → `python3 tools/bump_version.py <versão>` → commit.

## 1.9.6 · 25/11/2026
- Iwao ganhou uma preparação antes dos dois socos, novo Punho de Pedra e novas poses do Gigante de Pedra.

## 1.9.5 · 25/11/2026
- Utsushi ganhou sons de golpe, esquiva e perseguição, vozes sem palavras e um efeito próprio para a Legião de Ventos.

## 1.9.4 · 25/11/2026
- Kaen ganhou novos selos e novos quadros na sequência do Chute Meteoro. O dano acompanha o contato do chute. A Galeria também mostra o novo golpe de katana.

## 1.9.3 · 25/11/2026
- Cada clone vivo acrescenta um golpe de vento à Rajada Fantasma antes de o alvo ser repelido.

## 1.9.2 · 25/11/2026
- Os clones atacam depois de Utsushi. Substituição sacrifica um clone para evitar o primeiro golpe da rodada. Ataques em área dissipam os clones atingidos.

## 1.9.1 · 25/11/2026
- Legião de Ventos invoca até três clones com barra de vida própria nas casas livres. Eles protegem as fileiras por três rodadas. Só os ninjas decidem o resultado da batalha.

## 1.9 · 25/11/2026
- Utsushi entra na Formação com três golpes de vento, Rajada Torta e a perseguição Rajada Fantasma (L → R). Nesta versão, Legião de Ventos dispara uma rajada.

## 1.8.2 · 25/11/2026
- **Sons próprios do Keshin.** O Combo Relâmpago tem impactos secos, a Bomba Dinamite tem uma pancada grave com estilhaços, e a esquiva tem um rasante curto. A Aura Relâmpago acende com um estalo elétrico e um pulso grave. Keshin também ganhou vozes de golpe, jutsu, dano e derrota.

## 1.8.1 · 25/11/2026
- **Golpes do Keshin com mais impacto.** O soco e o chute dão um tranco no alvo no quadro do contato. O último golpe dá uma batida mais forte antes de lançar, e a Bomba Dinamite espalha poeira e faíscas no chão no instante da queda.

## 1.8 · 24/11/2026
- **Keshin disponível na Formação e na Galeria.** O Combo Relâmpago emenda três golpes e lança o inimigo no último. Se o alvo cair antes, Keshin termina a sequência no próximo. A perseguição Bomba Dinamite agarra o alvo no ar e o derruba.
- **Aura Relâmpago:** jutsu instantâneo que sai entre ações e mantém o ataque normal. Custa 30 de chakra e até 18% da vida máxima, atravessa o escudo e deixa pelo menos 1 PV. Durante três rodadas, Keshin ganha 1, 2 e 3 golpes extras, com +20% de dano.

## 1.7.2 · 24/11/2026
- **Escudo igual ao Naruto Online:** agora é uma barra branca separada, **acima** da vida, que sempre começa cheia (qualquer que seja o valor do escudo) e encolhe conforme absorve os golpes.

## 1.7.1 · 24/11/2026
- **Correção: luta travada na Rodada 1** (ninjas parados, sem menu de jutsus). Acontecia quando o navegador misturava a página antiga com o código novo; agora a barra do escudo se cria sozinha e a luta não quebra.

## 1.7 · 24/11/2026
- **Triângulo elemental:** Fogo vence Vento, Vento vence Raio, Raio vence Terra, Terra vence Água, Água vence Fogo. Vantagem dá +25% de dano (número azul + texto "Fogo vence Vento"); desvantagem dá -20% (número cinza). Névoa e Gelo contam como Água, Som como Vento; Espaço e Veneno são neutros.
- **Retratos enquadrados:** o rosto agora fica centralizado e inteiro no cut-in do jutsu e na legenda lateral (e também no HUD, na formação e na galeria). Antes a cabeça saía cortada.

## 1.6 · 24/11/2026
- **Escudo como barra branca:** o escudo agora aparece como uma barra branca por cima da vida (no ninja e na barra do topo do time), encolhendo conforme absorve dano e sumindo quando acaba ou expira.

## 1.5.5 · 23/11/2026
- **Tsunami da Mizuha por cima dos personagens:** a onda não "atravessa" mais os ninjas; ela passa na frente de todos.

## 1.5.4 · 23/11/2026
- **Golpe de Pedra do Iwao com dois impactos:** o ataque simples dá dois socos e agora os dois acertam (pedrinhas, impacto e dano em cada um). Antes só o primeiro tinha impacto e o segundo saía vazio.
- **Muralha de Pedra sem gigante travado:** o Gigante de Pedra fica menos tempo na tela e se desfaz em vez de sumir de repente (fade, pedras caindo e poeira).

## 1.5.3 · 22/11/2026
- **Mizuha invoca de longe:** na perseguição ela para a uma distância, faz a pose de jutsu e a onda surge no alvo (antes corria e "socava"). A **Prisão de Gelo** da Hiyori também é lançada de onde ela está.
- **Esmagar do Iwao no tempo certo:** a animação começa no salto e o pouso cai exatamente no quadro do soco do Gigante de Pedra (poeira, tremor, som e dano juntos).
- **Combos sem pausa:** a perseguição começa assim que o alvo cai (antes havia ~0,6 s de espera).
- **Tela de carregamento** preenchendo as laterais em tela larga; **puxar as notificações** em tela cheia não encolhe mais o jogo.
- Por dentro: `docs/fluidez.md` (regras de fluidez) e `tools/qa_anim.py` (grava a luta e gera tiras de quadros por ação com alertas de tempo morto).

## 1.5.2 · 22/11/2026
- **Tela cheia de verdade no celular:** em tela mais larga que 16:9 o cenário se estende pras laterais (as pontas da imagem espelhadas, sem emenda), em vez de sobrar um quadrado no meio com faixas pretas.
- **Onda da Mizuha refeita em código:** a perseguição normal (sem Tsunami) virou uma onda que brota embaixo do alvo, cresce, curva e quebra em cima dele com espuma; o respingo desenhado ficou só como detalhe no impacto.
- Regra nova pros próximos sprites: todo efeito entra com complemento em código.

## 1.5.1 · 22/11/2026
- **Chuva de Frascos (Doku):** o Arremesso de Frascos tem 20% de chance de o frasco se multiplicar no ar e cair em **todos** os inimigos, com o mesmo dano e veneno. Igual ao Tsunami: todos aparecem na cena e ficam marcados.
- **Correção:** os ninjas inimigos voltaram a olhar pro lado certo (um comentário quebrado no CSS da 1.5 desligava o espelhamento).
- **Correção:** na Formação os botões Limpar/Pronto ficavam escondidos (agora os 10 ninjas cabem em 2 linhas); no Mapa o 4º inimigo saía do painel.
- **Correção:** o frasco do Doku estava gigante no arremesso.

## 1.5 · 22/11/2026 · Mega patch (base definitiva)
- **Tsunami da Mizuha refeito em código:** a água brota do chão em jatos, a parede sobe, avança e desaba sobre o time inimigo inteiro, depois escoa. Pixel art desenhada no canvas, sem bloco quadrado.
- **Todo alvo fica marcado:** em jutsu, perseguição e Tsunami, quem vai levar o golpe aparece na cena com um círculo vermelho pulsando nos pés. Dá pra ver que o Tsunami pega todo mundo.
- **Iwao ganhou golpe Forte:** Punho de Pedra (toda 3ª ação sem jutsu), dano alto e deixa **Repelido** (abre combo pra Raiden, Poko e o próprio Iwao). Som novo.
- **Efeitos sem corte reto:** os efeitos desenhados têm a borda esfumada e ganharam continuação em código: brotam do chão com detritos, deixam rastro, respingam ao cair, giram partículas em volta.
- **Assinatura em código por elemento no jutsu:** fita de fogo serpenteando (Kaen), espiral de vento (Fuuka), estilhaços de gelo convergindo (Hiyori), bolhas tóxicas (Doku), raio extra do céu (Raiden), chuva de cura (Mizuha) e pedras subindo no escudo (Iwao).
- **Menu:** botão **Novidades** com estas notas (pisca quando tem versão nova).
- **Por dentro:** campo da Mayoi e bônus do Yugami agora vêm dos dados (nada de nome fixo no código), sons por ninja montados a partir do elenco, ícone de jutsu certo em atlas com mais linhas, destaque de alvo sem `filter` no sprite (mais leve no celular).
- **Correções:** dica da paralisia estava errada (paralisado age, só não persegue nem desvia), duplicata na tabela de movimentos dos efeitos.

## 1.4 · 22/11/2026
- Fuuka, Hiyori, Mayoi e Doku regerados no estilo realista (saem do bloqueio e voltam ao elenco jogável).
- Idle novo da Mizuha e do Iwao (animação gerada em vez de respiração em código).
- Forte do Iwao regerado no atlas.
- Tsunami da Mizuha com sprite próprio e todo inimigo reage ao golpe.

## 1.3 · 22/11/2026
- Perseguição do Iwao (Esmagar) sincronizada: poeira, tremor, som e dano saem no quadro do soco do Gigante de Pedra.

## 1.2 · 22/11/2026
- Jutsu armado fica comprometido: aura na cor do ninja até a vez dele, sem cancelar (se ele cair antes, o chakra volta).
- Paralisia como no Naruto Online: o ninja age normal, só não consegue perseguir.
- Som some quando o app vai pro segundo plano no celular.

## 1.1 · 22/11/2026
- Versão aparece no menu e o app avisa quando sai versão nova (faixa "Nova versão disponível").
- Service worker sempre busca a versão nova com internet.

## 1.0 · até 21/11/2026 · Primeira versão jogável
- Batalha por turnos 4v4 em formação 3x3, perseguições por estado (Derrubado, Lançado, Repelido), golpe Forte, jutsus armados pelo jogador, IA.
- 10 ninjas originais (Kaen, Mizuha, Raiden, Iwao, Fuuka, Mayoi, Hiyori, Doku, Yugami, Poko) e 5 missões com cenários próprios.
- Sons gravados, vozes sem palavras, músicas por missão, ambiente animado nos cenários.
- Otimizado pro celular (modo leve automático, tela de carregamento, só transform/opacity) e instalável como app (PWA).
