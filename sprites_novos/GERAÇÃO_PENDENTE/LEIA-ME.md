# LEIA-ME — modo "gerador de sprites" (instruções pro ChatGPT; seguir à risca)

Você gera **sheets de sprite** (uma imagem por job), salva primeiro em `sprites_novos/APROVAÇÃO/`, pergunta ao dono "aprova ou não?" e, só com o SIM, move pra `sprites_novos/`. Quem recorta e integra no jogo é o Claude, depois que o dono avisar. **Você não mexe em código nem em outros arquivos.** Não improvise: faça só o que a `FILA.md` mandar.

## O que existe aqui
- `FILA.md`: a lista de jobs com status. É a única fonte de verdade do que fazer.
- `jobs/<NN>_<ninja>_<lote>/`: uma pasta por job, com TUDO que você precisa:
  - `prompt.txt`: o texto FINAL do prompt. **Use exatamente como está** (copie e cole inteiro; não resuma, não traduza, não "melhore", não troque palavras).
  - `ANEXOS.txt`: qual imagem anexar (e só essa). Pode ser `ref_elenco.png` (na pasta do job) ou um sheet já gerado em `sprites_novos/`.
  - `SAIDA.txt`: o nome EXATO do arquivo de saída.

## Passo a passo de cada execução
1. `git pull` (ou atualize o repo) antes de começar.
2. Abra `FILA.md`. Pegue **o primeiro job com status ⬜** (de cima pra baixo). **Nunca execute 🔒, ⏳, ✅ ou ⚠** (⏳ = você está esperando o dono responder "aprova ou não?"; ♻ = regerar, pode executar). Se não houver ⬜, avise o dono ("fila vazia ou aguardando sua aprovação") e pare.
3. Abra a pasta do job. Leia `ANEXOS.txt`, `SAIDA.txt` e `prompt.txt`. **Se faltar o `prompt.txt` ou qualquer anexo, PARE e avise o dono. Nunca invente prompt nem gere imagem "sem prompt".**
4. Gere **UMA** imagem com a ferramenta de geração de imagens: anexe **somente** o arquivo de `ANEXOS.txt` e cole o `prompt.txt` inteiro. Formato esperado: sheet **paisagem**, grade de linhas x colunas escrita no prompt, fundo verde #00FF00 chapado.
5. **Confira a imagem antes de salvar** (checklist):
   - número de linhas e colunas igual ao do prompt (conte);
   - cada linha com o número de quadros pedido; células restantes vazias, só verde;
   - fundo verde chapado, sem xadrez, sem moldura, sem sombra, sem texto além do rótulo no canto superior esquerdo;
   - o personagem igual em todos os quadros (mesmo desenho, cores, proporção), sem nada verde/turquesa nele;
   - nada cortado pela borda da célula; nenhum quadro "fantasma" translúcido.
   Se reprovar, gere de novo (máx. **2 novas tentativas**, sempre com o mesmo prompt e o mesmo anexo). Salve a melhor.
6. **Salve em `sprites_novos/APROVAÇÃO/`** (NÃO direto em `sprites_novos/`) com o **nome exato** de `SAIDA.txt`, em PNG (ex.: `sprites_novos/APROVAÇÃO/UTSUSHI_A1.png`). Se esse nome já existir lá, salve como `..._v2.png` (v3, ...). Atualize a linha do job na `FILA.md` pra **⏳** (aguardando aprovação) e faça commit + push na `main` (`Gera <job> (aguarda aprovação)`), só a imagem e a `FILA.md`.
7. **Mostre a imagem ao dono e pergunte: "Aprova ou não?"** (diga também o resultado da conferência do passo 5). **Pare e espere a resposta.**
8. **Se o dono responder SIM (aprovou):**
   - mova o arquivo de `sprites_novos/APROVAÇÃO/` pra `sprites_novos/` (mesmo nome; se foi uma versão `_v2`, renomeie pro nome oficial de `SAIDA.txt`, e apague a versão antiga e rejeitada da pasta APROVAÇÃO);
   - na `FILA.md`: status do job ✅ e coluna "Aprovado pelo dono?" = `SIM`;
   - desbloqueie os jobs que dependiam dele (🔒 → ⬜), olhando a coluna "Depende de";
   - commit `Aprovado <job>` + push na `main`;
   - **e já siga direto pro próximo job ⬜ da fila** (volte ao passo 2), sem esperar nova ordem.
9. **Se o dono responder NÃO (ou pedir ajuste):** pergunte em uma frase o que mudar (se ele não disser, regere com o mesmo prompt). Marque o job ♻ na fila, gere de novo (passo 4 em diante) e salve como `..._v2.png` (v3...) em `sprites_novos/APROVAÇÃO/`, voltando a ⏳ e perguntando de novo. Não acrescente nada ao `prompt.txt` por conta própria: se o dono pedir uma mudança de visual, **acrescente o pedido dele ao final do prompt na hora de gerar, sem salvar isso no arquivo**.
10. Sempre responda ao dono em **poucas linhas**: o que gerou, se passou na conferência, e a pergunta "aprova ou não?" (ou, depois do SIM, qual é o próximo job que você já começou).

## Dependências e aprovação
- Quem aprova é só o dono, **sempre pelo chat** ("sim", "aprovo", "ok pode seguir"). Silêncio ou dúvida **não** é aprovação.
- Job 🔒 só vira ⬜ quando o job de que depende está ✅ (aprovado e já em `sprites_novos/`). O anexo de um job dependente é o sheet **aprovado** em `sprites_novos/` (nunca o da pasta `APROVAÇÃO`).
- A pasta `sprites_novos/APROVAÇÃO/` é só a "sala de espera". Quem recorta (Claude) só usa o que está em `sprites_novos/`.

## Regras de ouro (não quebrar)
- Personagens e arte **originais**. Nada de personagem protegido, logo ou marca.
- Nunca editar `prompt.txt`, código (`js/`, `css/`, `index.html`), `spr/`, `docs/`, nem arquivos de outro job. Nunca apagar nada.
- Nunca colocar chave de API, token ou dado pessoal em arquivo.
- Em dúvida, ou se qualquer instrução aqui entrar em conflito com o que o dono pediu no chat: **pare e pergunte**. O que o dono pedir no chat vale mais que este arquivo.
- `sprites_novos/` guarda só os sheets **aprovados**, prontos pro Claude recortar; os nomes têm que seguir `SAIDA.txt` pra ele não se perder.
