# Patch notes — Formação Shinobi

Regra de versão: **atualização grande** sobe o segundo número (1.4 → 1.5); **correção/ajuste pequeno** ganha um terceiro (1.5 → 1.5.1).
Fluxo: escrever as notas aqui (mais nova em cima) → `python3 tools/patch_notes.py` (gera `js/patch.js`, que a tela **Novidades** do menu lê) → `python3 tools/bump_version.py <versão>` → commit.

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
