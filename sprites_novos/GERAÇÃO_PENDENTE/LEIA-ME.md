# LEIA-ME — MODO LINHA (instruções pro ChatGPT; seguir à risca)

Você gera **sprites do ninja Utsushi, UMA animação por imagem** (uma linha de 6 a 8 quadros por geração, nunca várias linhas juntas). O dono aprova **só o job STYLE** (1 frame de idle). Depois disso, você roda a fila inteira **sozinho, em sequência, mantendo o contexto**. Quem recorta e integra no jogo é o Claude (outro assistente). **Você não mexe em código nem em outros arquivos.**

## O que existe aqui
- `FILA.md`: lista de jobs com status (única fonte de verdade).
- `DIRETRIZES.md`: diretrizes de arte/animação/técnica (SPRITE FACTORY, com a regra 19 de espaçamento e a 20 de coerência de objetos). **Reler inteiro antes de CADA geração.**
- `jobs/<NN>_utsushi_<anim>/`: `prompt.txt` (texto FINAL: colar inteiro, sem editar), `ANEXOS.txt` (qual imagem anexar), `SAIDA.txt` (nome exato do arquivo e o que fazer).

## Fase 1 — STYLE (único job com aprovação do dono)
1. **Só comece quando o dono mandar.** Pegue o job `01_utsushi_STYLE`. Leia `DIRETRIZES.md`, `ANEXOS.txt`, `SAIDA.txt` e `prompt.txt`. **Se faltar o prompt ou o anexo, pare e avise. Nunca invente prompt.**
2. Gere **UMA** imagem (um frame de idle) anexando só o que `ANEXOS.txt` manda e colando o `prompt.txt` inteiro. **O resultado tem que ser PIXEL ART** (pixels visíveis, contorno escuro de 1px, poucas cores, igual aos personagens da `ref_elenco.png`), e **não** uma ilustração suave/anime. Confira também o visual do prompt (parca cinza com capuz de pelos off-white SEMPRE levantado cobrindo a cabeça, mechas loiro-areia saindo, faixas ocre nas mãos, postura curvada e SEM arma). Se não bater, **diga isso ao dono ao mostrar a imagem** em vez de apresentar como ok.
3. **Mostre no chat**, cole abaixo da imagem **o prompt EXATO que você enviou ao gerador de imagens e a lista das imagens que anexou** (isso permite diagnosticar se o fluxo está alterando prompt/referências), e pergunte: **"Aprova ou não?"**. **Pare e espere.** Não gere outra imagem nem outro job.
4. **SIM:** salve em `sprites_novos/UTSUSHI/STYLE.png`, marque o STYLE ✅ na `FILA.md`, mude **todos os 🔒 para ⬜**, faça commit + push na `main` (`Aprovado STYLE`) e **comece a Fase 2 imediatamente**, sem perguntar de novo.
5. **NÃO** (ou pedido de ajuste): pergunte em uma frase o que mudar e **espere a resposta antes de gerar de novo**. Quando o dono autorizar, gere outra versão (mesmo prompt + o ajuste dele escrito só na hora de gerar, **sem alterar o `prompt.txt`**) e volte ao passo 3. Nada rejeitado vai pro repo.

## Fase 2 — fila automática (depois do STYLE aprovado)
O "SIM" do STYLE vale como ordem pra **toda a fila**. Para cada job ⬜, **de cima pra baixo, um de cada vez**:
1. **Releia `DIRETRIZES.md` inteiro.** Abra a pasta do job: `ANEXOS.txt` (anexe **DUAS imagens, nesta ordem: 1) `sprites_novos/GERAÇÃO_PENDENTE/ref_elenco.png` (estilo pixel art do jogo); 2) `sprites_novos/UTSUSHI/STYLE.png`**; **nunca** use como referência imagens que você mesmo gerou nos jobs anteriores), `SAIDA.txt`, `prompt.txt`.
2. Gere **UMA** imagem (e só essa; sem versões extras): **uma linha, uma animação**, colando o `prompt.txt` inteiro, sem editar. Continue na **mesma conversa** pra manter o contexto (mesmo personagem, mesma escala, mesmo estilo dos jobs anteriores). Reanexe a `ref_elenco.png` e o STYLE em todo job (as duas, sempre).
3. **Confira antes de salvar:**
   - exatamente 1 linha, com o número de quadros do prompt; células restantes vazias, só verde;
   - fundo verde chapado, sem xadrez, moldura, sombra nem texto além do rótulo no canto. **Pequena variação de tom do verde (ex.: #01F901 em vez de #00FF00) NÃO é erro**: o recorte do Claude trata isso; só marque ⚠ se o fundo tiver manchas escuras/cinza, degradê ou outra cor;
   - **é PIXEL ART** (como a `ref_elenco.png`): pixels duros e visíveis, contorno escuro de 1px, poucas cores. Ilustração suave/anime/pintada = erro grave (⚠ `_REVISAR`);
   - personagem igual ao STYLE em todos os quadros (cabelo, gorro, roupa, tatuagens, cores) e sem nada verde/turquesa;
   - **objetos iguais em todos os quadros** (regra 20): **sem arma nenhuma** (se aparecer qualquer arma, é erro), o capuz de pelos sempre levantado com as mesmas mechas de cabelo saindo, as mesmas faixas nas mãos, a mesma parca (cor, gola de pelos, aberta);
   - **espaço entre os quadros** (regra 19): nada cortado pela borda, nada invadindo o quadro vizinho, nenhum quadro fantasma/translúcido, dois corpos na mesma célula = reprovado.
4. **Se perceber algum erro na imagem: NUNCA gere de novo a mesma animação** (nem automaticamente, nem "só mais uma vez"). Salve a imagem como está em `sprites_novos/UTSUSHI/<ANIM>_REVISAR.png`, marque o job **⚠** na fila com o motivo curto (qual quadro e qual defeito) e **siga pro próximo job**. Quem decide se refaz é o dono; só regere se ele mandar.
5. **Se não houver erro:** salve **direto** em `sprites_novos/UTSUSHI/<ANIM>.png` (nome exato do `SAIDA.txt`; se já existir, não sobrescreva: `<ANIM>_v2.png`), marque o job ✅ na `FILA.md`, commit só da imagem + `FILA.md` (`Gera <job>`) e push na `main` (se der conflito na `FILA.md`, refaça só a sua linha).
6. **Passe direto pro próximo job ⬜**, sem esperar o dono.

**Pare e avise o dono** quando: a fila acabar; ele disser "pare/espera"; faltar prompt/anexo; ou a ferramenta de imagem falhar/limitar. Ao parar, responda com um **resumo curto**: quantos ✅, quais ⚠ (com o motivo) e qual é o próximo job.

## Regras de ouro
- Personagem **original**; nunca personagem protegido, logo ou marca. Nunca chave de API, token ou dado pessoal em arquivo.
- Nunca editar `prompt.txt`, código (`js/`, `css/`, `index.html`), `spr/`, `docs/`, `tools/` nem arquivos de outro job. Nunca apagar nada.
- Um job = uma imagem = uma linha. **Nunca juntar vários jobs numa imagem.** **Nunca regerar uma animação sozinho**, nem ao perceber erro: salve como `_REVISAR`, marque ⚠ e siga; só o dono manda refazer (♻).
- O dono pode interromper ou mudar qualquer coisa pelo chat; o que ele disser vale mais que este arquivo. Em dúvida real, pare e pergunte.
- `sprites_novos/UTSUSHI/` guarda só o que o Claude vai recortar: nomes iguais ao `SAIDA.txt`; arquivos `_REVISAR` o Claude ignora até o dono aprovar.
