# Referência de mecânicas (Naruto Online)

Só **mecânica e estilo**, nada de nome, arte ou texto de personagem (o jogo nosso é 100% original). Fonte: prints de ficha de ~22 ninjas e balões de status que o Wellington tirou do jogo (21/11/2026), mais o texto de tutorial que ele colou. Legenda de confiança: **[print]** visto na tela do jogo; **[tutorial]** texto colado de guia (não conferido na tela); **[inferido]**.

## 1. Ficha de ninja: 5 slots
Esotérico (jutsu), Comum (ataque básico), Perseguição (1 a 3 por ninja) e 2 Passivos **[print]**.
- **Esotérico:** custo de chakra (20/40/60), recarga CD (2–4), às vezes `Init N` e `Instantânea`; elemento (Fogo, Vento, Relâmpago…); tipo de dano (Taijutsu/Ninjutsu); nº de hits; estado que causa; alvo ("até 4/9/12 inimigos", "coluna/linha à frente", "grupo inimigo", "alvo selecionado" + efeito extra no selecionado).
- **Comum:** `N hits`, **com chance de lançar "Combo de N"** (3, 5, 7, 10) e causar um estado. Alvo normal: "o inimigo à frente".
- **Passivo:** limite `Nx/rodada` (100x = sem limite prático).
- Tem **tipo de dano** Taijutsu e Ninjutsu, e atributos Ataque, Ninjutsu, Defesa, Resistência, Crítico, Esquiva, Combo, Velocidade, "1º Ataque" (iniciativa). Dano "Garantido" ignora esquiva; "Crítico garantido" existe.

## 2. Estados de posição (os 4) **[print]**
**Flutuação**, **Voo** (flutuação alta), **Queda**, **Repelimento**. O Comum e o Esotérico causam um deles; a Perseguição "persegue X e causa Y". Combinações vistas (persegue → causa): Queda→Voo; Queda→Voo+status; Queda→Flutuação+status; Queda→Repelimento+status; Flutuação→Repelimento; Flutuação→Voo+Chamas; Voo→Queda; Voo→Flutuação+Chamas; Repelimento→Queda; Repelimento→Queda+status; Repelimento→Flutuação+crítico garantido.
- **Repelimento:** "o inimigo repelido causa dano à coluna/fileira de trás".
- **Imunidades de posição:** há ninja imune a Flutuação, Voo, Repelimento e Queda (armadura), imune a Combo, imune a dano puramente Ninjutsu ou puramente Taijutsu, imune a Perseguição (num estado).

## 3. Perseguição: dois gatilhos **[print]**
1. **Por estado:** "Persegue Queda / Flutuação / Voo / Repelimento".
2. **Por combo:** "**Ativa com combo 10 / 20 / 30**": depois que os ninjas **da equipe** acumulam N hits, o ninja dispara (dano a 1–4 alvos, às vezes aleatórios, ou "lançado com combo de 30"). Faixas vistas: 10, 20, 30 (e Combo 10 no Comum do Kisame-like). Se o contador zera por rodada ou por sequência: **incerto**.
- Um ninja pode ter **2–3 perseguições** (ex.: uma por estado e uma por combo). A etiqueta **1º / 2º** é a prioridade quando mais de uma pode disparar.
- Um ninja pode ter perseguição **só por estado**, **só por combo** ou **as duas**. Alguns têm limite `2x/rodada` e podem **reduzir a própria recarga em 1** ao perseguir.
- Dano e hits próprios (1 a 5 hits). Algumas dão "Combo de 10" (adicionam hits ao contador).

## 4. Status negativos (texto do jogo) **[print]**
| Status | Efeito | Duração |
|---|---|---|
| Paralisia | não pode lançar Perseguição | 2 rodadas |
| Selamento | não pode lançar Esotérica | 3 rodadas |
| Chamas | não pode ser curado + dano no fim da rodada | 1 ou 3 rodadas (por skill) |
| Imobilidade | não pode agir | 1 rodada |
| Cegueira | não pode usar Ataque Comum | 1 rodada |
| Sono | não age; **sai ao receber dano de Taijutsu** | 1 rodada |
| Confusão | sem Esotérica/Perseguição/Comum em área; Comum de alvo único ataca os próprios aliados | 1–2 rodadas |
| Veneno | 3% da vida máx. por rodada, **acumula até 4 níveis**, limite de dano 25000 | 3 rodadas |
| Marca | Defesa e Resistência −30% | 2 rodadas |
| Supressão de Imunidade | perde a imunidade a status negativos | até o fim da próxima rodada |
Outros: **Interrupção** (cancela o jutsu em cast; "imune a Interrupção" existe). Buff exclusivo **Violência** (+chance de Combo, cura ao atacar, 1 rodada).
- **Remoção:** [tutorial] a cura limpa na ordem Lentidão→Imobilidade→Selamento→Paralisia→Cegueira → Confusão → Chamas→Veneno → Prisão Celestial→Marca. Passivas de cura "dispersam status negativos de até N companheiros". Existe **reflexão** (passivo: o 1º status negativo que um aliado recebe é transmitido a um inimigo).
- **Cuidado:** o texto da web que ele colou tinha números que divergem dos prints (ex.: Marca −10%, Chamas 2–3 rodadas). Vale o print.

## 5. Instantânea e ordem de ação
- **Instantânea [print + ele explicou]:** o jutsu **sai na hora que clica**, independente de quem está agindo; o ninja ainda age normalmente depois. Gasta chakra e recarga, não a ação. **Não instantânea:** entra na fila e só sai na vez do ninja, **substituindo o Comum**.
- **Ordem [tutorial]:** cada ninja tem número de **Movimento (1º a 4º)** definido na tela de formação (não depende da posição no grid). A rodada **alterna os times**: Mov. 1 de um, Mov. 1 do outro, Mov. 2… até o 4. Desempate: atributo **1º Ataque**. Se dois cliques instantâneos ocorrem juntos, vence o 1º Ataque maior.
- Chakra: **+20 por rodada** (e +20 antes da ação em alguns). Teto existe ("reduz seu limite de chakra a 60").

## 6. Plano (campo) **[print + ele explicou]**
Jutsu que **cria um Plano** (muda o cenário e dá buff/efeito por N rodadas). Exemplos de efeito: +40% Ataque/Ninjutsu dos ninjas de um elemento; +100 chakra ao grupo no início de cada turno; ninguém recupera chakra acima do inicial; ninguém lança Esotérica + Interrupção (1 rodada). **Lançar de novo encerra o Plano** e dispara um efeito (dano a todos + Queda). Alguns jutsus **quebram o Plano e o Campo existentes** (e dispersam escudos e buffs dos dois lados). Alguns ultimates só valem **dentro** do Plano; se o Plano acabar antes, tem que criar de novo. Há também ninja que lança Plano automático nas rodadas 1, 5 e 9.

## 7. Catálogo de passivas **[print]**
- **Cura antes da ação** (X% do Ninjutsu, `2x/rodada`, no aliado de menor vida, dispersando status).
- **Revive** (volta 2 rodadas depois com 30% de vida; ou na hora com 10%, 1x por combate).
- **Escala com vida baixa:** + Ataque, + Defesa/Resistência, + chance de Combo por % de vida perdida.
- **Clones/invocação** no início ou a cada ataque comum (clone com 30–60% da vida ou atributos %, com ataque próprio "habilidades ligadas").
- **Esquiva** (taxa extra; "extremamente provável de esquivar", inclusive de Perseguição; teletransporte que sobe velocidade/Ninjutsu a cada perseguição).
- **Escudo no início do combate** (baseado em % da Resistência), **escudo ao bater**.
- **Chakra:** +20 ao grupo no início; +1% Ataque por ponto extra de chakra; jutsu grátis se chakra > 70; recupera chakra/vida quando um aliado morre; absorve chakra do inimigo.
- **Nova ação ao matar** com Comum; **ataque extra a um aliado** por rodada.
- **Provocação/redirect:** na 1ª coluna, os Comuns inimigos vão nele.
- **Dano ao ser atingido:** ao receber dano o alvo ganha defesa e causa status ao atacante (Chamas, Confusão).
- **Aliança:** +% Ataque/Ninjutsu para ninjas de um mesmo clã/aldeia.

## 8. Feedback (vídeo)
Contador "N Hit" na lateral (lado de quem ataca), "MORE THAN 10 COMBO", "N Chase!" subindo a cada elo, cut-in diagonal com retrato (~1s), banner `OUTCOME` com hit-stop + clarão branco no golpe final, pilha lateral de badges (ícone + nome), cores de número (amarelo normal, azul vantagem elemental, vermelho crítico, verde cura), texto "Resistance", elemental "X counters Y". Ritmo: rodada ~18–23s; elo de perseguição ~1–1,5s.

## 9. Estrelas (1★–5★) **[tutorial]**
Multiplicador de atributos; kit completo (5 slots) liberado em 3★; Despertar de habilidades em 3★/4★; 4★/5★ de raros adicionam usos extras, imunidades, mais alvos ou menos recarga; "Potencial/Cultivo" aumenta o teto de atributos.

## 10. O que já temos × o que falta (ver também §11–§15 abaixo)
Já temos: chakra +20/rodada, CD, estados D/L/R, 1 perseguição por estado, DoT/atordoar/escudo/cura, campo (Mayoi), esquiva, golpe Forte. Falta: contador e gatilho de combo; Voo; múltiplas perseguições com prioridade; novos status (Selamento, Cegueira, Sono, Confusão, Marca, Imobilidade, veneno acumulável) e remoção; jutsu Instantâneo; Plano geral; slot de 2 passivas data-driven; ordem por Movimento 1–4 alternando times; clones; elemental; cut-in. Ver `docs/ondas.md`.

---
Seções 11–15: material de **outra IA com busca na web** (22/11/2026), marcado **[web]**. Não foi visto na tela do jogo: serve de rascunho, e o que contradiz um print perde pro print.

## 11. Catálogo de status [web, de um site de wiki]
Cerca de 526 variações; as primeiras ~38 únicas (A–M) mostram **as famílias de efeito**. Vale copiar a ideia, não a lista:
- **Variantes "irremovível / não pode ser imunizado nem dispersado"** de quase todo status (Cegueira, Chamas, Imobilidade, Paralisia…): o contra-jogo é "dispersar" e a versão irremovível o ignora.
- **Controle:** Imobilidade/Adormecido/Congelamento (não age; Congelamento sai com dano físico), Lentidão (age só no fim da rodada), Cegueira, Confusão (e Grave), Mancha (sem Perseguição nem Comum).
- **Dano por tempo (% da vida):** Chamas, Cola (15% vida máx. no fim da rodada), Explosivo (8% da vida restante por Comum usado), Ferimento (3% vida máx. por Comum), Apreensão (10% da vida restante a cada ação).
- **Anti-cura:** Chamas (bloqueia), Laceração (−50%), Corrente (−99%), Divisão (−40% e custo de chakra +40).
- **Anti-buff:** Decadência e Anti-cola (não recebe escudo/buff).
- **Corta dano ou defesa:** Debilidade (Comum a 30%), Cansaço, Fraqueza (Ataque e Ninjutsu a 75%), Dor (Defesa e Resistência a 75%), Maldição (zera Defesa/Resistência), Marca (−30%, 2 rodadas), Magnetização (−30% de chance de crítico), Dissolução (+30% de crítico a quem bate no alvo).
- **Custo ao lançar:** Ancioso (perde vida proporcional ao chakra gasto no Esotérico), Combustão (espalha Chamas ao usar Esotérica).
- **Imunidade nível 2:** resiste até à Supressão de Imunidade (só ninjas de topo).

## 12. Atributos [web]
Vida; Ataque (dano Tai); Defesa (reduz Tai); Ninjutsu (dano Nin, **cura e escudo**); Resistência (reduz Nin); 1º Ataque (iniciativa); Crítico e Dano crítico; **Combo** (chance de Comuns extras e menos chance de sofrer combo); **Controle** (chance de aplicar status e de resistir); Esquiva; Penetração Tai/Nin; Dano/Resistência elemental (Fogo, Vento, Raio, Terra, Água); Redução de dano; Regeneração por rodada. Fórmula (comunidade, **não oficial**): `(poder × mult. da skill − (defesa − penetração)) × bônus × crítico`; skill híbrida soma Ataque+Ninjutsu e Defesa+Resistência. Pra nós basta uma versão simples.

## 13. Filtros da lista de ninjas [web, **duvidoso**: a IA não viu a tela]
Entrada da perseguição: qualquer, Flutuação, Voo, Queda, Repelimento, Combo 10+/20+/30+. Saída: as 4 posições + Imobilidade, Chamas, Veneno, Sangramento, Paralisia, Cegueira, Selamento, Marca, Interrupção. Tags de sinergia (clã/aldeia/papel) e funções (escudo, cura, limpar status, gerar chakra, super armadura, imunidade, reviver). A ideia útil: **busca por "quem persegue X" na tela de formação**.

## 14. Formação [web, conferir]
Grid 3×3, até 4 ninjas. Colunas frente / meio / trás (frente leva os ataques de linha; trás é a última). Cada ninja tem número de **Movimento 1–4**, que manda na ordem (não a coluna); parece vir da leitura frente→trás e cima→baixo, **ajustável à mão** (conferir com ele).

## 15. Elemental e estados [web + vídeo]
- **Ciclo (confirmado pelo vídeo: Fogo vence Vento, Vento vence Raio):** Fogo > Vento > Raio > Terra > Água > Fogo; cada elemento é fraco contra o que o vence.
- **Flutuação, Voo, Queda, Repelimento** não duram rodadas: são a **janela do combo**, só habilitam a perseguição seguinte; evitados por Super Armadura / imunidade a posição; cada perseguição tem limite de 1–2 por rodada.
