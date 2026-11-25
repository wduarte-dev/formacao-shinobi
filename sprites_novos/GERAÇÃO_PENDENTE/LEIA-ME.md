# LEIA-ME — modo "gerador de sprites" (instruções pro ChatGPT; seguir à risca)

Você gera **sheets de sprite** (uma imagem por job), mostra no chat, pergunta ao dono "aprova ou não?" e, só com o SIM, salva em `sprites_novos/`. Quem recorta e integra no jogo é o Claude, depois que o dono avisar. **Você não mexe em código nem em outros arquivos.** Não improvise: faça só o que a `FILA.md` mandar.

## O que existe aqui
- `FILA.md`: a lista de jobs com status. É a única fonte de verdade do que fazer.
- `DIRETRIZES.md`: as diretrizes de arte/animação/técnica (SPRITE FACTORY). **Ler inteiro antes de cada geração.**
- `jobs/<NN>_<ninja>_<lote>/`: uma pasta por job, com TUDO que você precisa:
  - `prompt.txt`: o texto FINAL do prompt. **Use exatamente como está** (copie e cole inteiro; não resuma, não traduza, não "melhore", não troque palavras).
  - `ANEXOS.txt`: qual imagem anexar (e só essa). Pode ser `ref_elenco.png` (na pasta do job) ou um sheet já gerado em `sprites_novos/`.
  - `SAIDA.txt`: o nome EXATO do arquivo de saída.

## Passo a passo de cada execução
1. `git pull` (ou atualize o repo) antes de começar.
2. **Só comece se o dono mandou gerar agora** (veja "Permissão pra gerar"). Abra `FILA.md`. Pegue **o primeiro job com status ⬜** (de cima pra baixo). **Nunca execute 🔒, ⏭, ✅ ou ⚠** (⏭ = o dono gerou por conta própria); ♻ (regerar) só com a permissão do dono. Se não houver ⬜, avise o dono ("fila vazia ou aguardando sua aprovação") e pare.
3. Abra a pasta do job. Leia `ANEXOS.txt`, `SAIDA.txt` e `prompt.txt`. **Se faltar o `prompt.txt` ou qualquer anexo, PARE e avise o dono. Nunca invente prompt nem gere imagem "sem prompt".**
4. **ANTES de gerar, releia `sprites_novos/GERAÇÃO_PENDENTE/DIRETRIZES.md` inteiro** (toda vez; é obrigatório, inclui a regra 19 de espaçamento entre frames). Gere **UMA** imagem com a ferramenta de geração de imagens: anexe **somente** o arquivo de `ANEXOS.txt` e cole o `prompt.txt` inteiro. Formato esperado: sheet **paisagem**, grade de linhas x colunas escrita no prompt, fundo verde #00FF00 chapado.
5. **Confira a imagem antes de salvar** (checklist):
   - número de linhas e colunas igual ao do prompt (conte);
   - cada linha com o número de quadros pedido; células restantes vazias, só verde;
   - fundo verde chapado, sem xadrez, sem moldura, sem sombra, sem texto além do rótulo no canto superior esquerdo;
   - o personagem igual em todos os quadros (mesmo desenho, cores, proporção), sem nada verde/turquesa nele;
   - nada cortado pela borda da célula; nenhum quadro "fantasma" translúcido.
   Se reprovar, **não gere de novo sozinho**: mostre a imagem, diga o que falhou e pergunte ao dono se tenta de novo.
6. **Mostre a imagem aqui no chat** (não salve nada no repo ainda) junto com o resultado da conferência do passo 5, e pergunte: **"Aprova ou não?"**. **PARE e espere a resposta do dono.** Gere **no máximo UM job por mensagem do dono**: depois de mostrar a imagem, não comece outro job, não gere outra imagem e não faça mais nada.
7. **Se o dono disser SIM (aprovou):**
   - salve a imagem aprovada **direto em `sprites_novos/`** com o **nome exato** de `SAIDA.txt` (PNG; se esse nome já existir, não sobrescreva: salve `..._v2.png` e avise);
   - na `FILA.md`: status do job ✅ e coluna "Aprovado pelo dono?" = `SIM`; desbloqueie os jobs que dependiam dele (🔒 → ⬜), olhando a coluna "Depende de";
   - commit só da imagem + `FILA.md` (`Aprovado <job>`) e push direto na `main`;
   - depois **pergunte** ao dono se pode gerar o próximo job ⬜ (diga qual é). **Não gere o próximo sem ele responder** (veja "Permissão pra gerar" abaixo).
8. **Se o dono disser NÃO (ou pedir ajuste):** pergunte em uma frase o que mudar (ou se é pra tentar de novo igual) e **espere a resposta antes de gerar de novo**. Quando ele autorizar, gere uma nova versão (mesmo prompt, mais o ajuste que ele pediu escrito só na hora de gerar, **sem alterar o `prompt.txt`**) e volte ao passo 6. Nada da versão rejeitada vai pro repo.
9. Responda sempre em **poucas linhas**.

## Job STYLE (ninja novo): aprovar o visual com UM frame antes de gastar geração
- Todo ninja novo começa por um job `STYLE`: **UM único frame de idle** (um personagem, uma pose, sem grade). Siga o mesmo fluxo: gerar só com ordem do dono, mostrar no chat, perguntar "aprova ou não?".
- **Aprovou:** salve como `sprites_novos/<NINJA>_STYLE.png`, marque ✅ + `SIM` e libere o A1 (🔒 → ⬜). O A1 anexa **duas** imagens, nesta ordem: 1) `ref_elenco.png` da pasta do job; 2) o `<NINJA>_STYLE.png` aprovado.
- **Não aprovou:** pergunte o que mudar e **espere**. O dono pode ajustar o prompt no chat e depois mandar o prompt final aprovado pro Claude, que atualiza os prompts dos outros lotes. Enquanto isso **nenhum outro job do ninja é executado**.
- Não existe job STYLE pra ninja que já tem A1 aprovado.

## Permissão pra gerar (regra principal)
- **Toda geração de imagem precisa de ordem do dono nessa mesma conversa** ("pode gerar", "próximo job", "gera de novo" ou equivalente). Aprovar um sheet **não** é ordem pra gerar o próximo: depois do SIM, você só pergunta e espera. Nunca gere por conta própria, nunca gere dois em sequência e nunca "tente de novo" sozinho depois de uma reprovação sua ou do dono (a conferência do passo 5 reprovada = você avisa o dono e pergunta se tenta de novo).
- Quem aprova é só o dono, **sempre pelo chat** ("sim", "aprovo", "ok"). Silêncio ou dúvida **não** é aprovação.
- Um job 🔒 só vira ⬜ quando o job de que depende está ✅ (aprovado e já em `sprites_novos/`). O anexo de um job dependente é o sheet aprovado em `sprites_novos/`.

## Regras de ouro (não quebrar)
- Personagens e arte **originais**. Nada de personagem protegido, logo ou marca.
- Nunca editar `prompt.txt`, código (`js/`, `css/`, `index.html`), `spr/`, `docs/`, nem arquivos de outro job. Nunca apagar nada.
- Nunca colocar chave de API, token ou dado pessoal em arquivo.
- Em dúvida, ou se qualquer instrução aqui entrar em conflito com o que o dono pediu no chat: **pare e pergunte**. O que o dono pedir no chat vale mais que este arquivo.
- `sprites_novos/` guarda só os sheets **aprovados**, prontos pro Claude recortar; os nomes têm que seguir `SAIDA.txt` pra ele não se perder. Nada de pasta intermediária: antes da aprovação a imagem só existe no chat.
