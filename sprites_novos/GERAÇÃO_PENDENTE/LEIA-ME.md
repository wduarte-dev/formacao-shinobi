# LEIA-ME — modo "gerador de sprites" (instruções pro ChatGPT; seguir à risca)

Você gera **sheets de sprite** (uma imagem por job) e salva em `sprites_novos/`. Quem recorta e integra no jogo é o Claude, depois que o dono avisar. **Você não mexe em código nem em outros arquivos.** Não improvise: faça só o que a `FILA.md` mandar.

## O que existe aqui
- `FILA.md`: a lista de jobs com status. É a única fonte de verdade do que fazer.
- `jobs/<NN>_<ninja>_<lote>/`: uma pasta por job, com TUDO que você precisa:
  - `prompt.txt`: o texto FINAL do prompt. **Use exatamente como está** (copie e cole inteiro; não resuma, não traduza, não "melhore", não troque palavras).
  - `ANEXOS.txt`: qual imagem anexar (e só essa). Pode ser `ref_elenco.png` (na pasta do job) ou um sheet já gerado em `sprites_novos/`.
  - `SAIDA.txt`: o nome EXATO do arquivo de saída.

## Passo a passo de cada execução
1. `git pull` (ou atualize o repo) antes de começar.
2. Abra `FILA.md`. Pegue **o primeiro job com status ⬜** (de cima pra baixo). **Nunca execute 🔒, ✅, ⚠ ou ♻** sem ordem do dono. Se não houver ⬜, avise o dono ("fila vazia ou aguardando sua aprovação") e pare.
3. Abra a pasta do job. Leia `ANEXOS.txt`, `SAIDA.txt` e `prompt.txt`. **Se faltar o `prompt.txt` ou qualquer anexo, PARE e avise o dono. Nunca invente prompt nem gere imagem "sem prompt".**
4. Gere **UMA** imagem com a ferramenta de geração de imagens: anexe **somente** o arquivo de `ANEXOS.txt` e cole o `prompt.txt` inteiro. Formato esperado: sheet **paisagem**, grade de linhas x colunas escrita no prompt, fundo verde #00FF00 chapado.
5. **Confira a imagem antes de salvar** (checklist):
   - número de linhas e colunas igual ao do prompt (conte);
   - cada linha com o número de quadros pedido; células restantes vazias, só verde;
   - fundo verde chapado, sem xadrez, sem moldura, sem sombra, sem texto além do rótulo no canto superior esquerdo;
   - o personagem igual em todos os quadros (mesmo desenho, cores, proporção), sem nada verde/turquesa nele;
   - nada cortado pela borda da célula; nenhum quadro "fantasma" translúcido.
   Se reprovar, gere de novo (máx. **2 novas tentativas**, sempre com o mesmo prompt e o mesmo anexo). Salve a melhor.
6. Salve em `sprites_novos/` com o **nome exato** de `SAIDA.txt` (ex.: `UTSUSHI_A1.png`), em PNG. Se esse arquivo já existir, **não sobrescreva**: salve como `..._v2.png` (v3, ...) e avise.
7. Atualize a linha do job na `FILA.md`: status ✅ (ou ⚠ se a conferência ainda reprova depois das tentativas, escrevendo o motivo curto na coluna "Pasta"/final da linha). **Não altere a coluna "Aprovado pelo dono?"**: só o dono preenche (com `SIM`).
8. Commit só desses arquivos (a imagem + `FILA.md`), mensagem `Gera <job>` (ex.: `Gera 01_utsushi_A1`), e **push direto na `main`** (sem PR). Se der conflito na `FILA.md`, refaça só a sua linha de status.
9. Responda ao dono em **3 linhas**: o que gerou, se passou na conferência (e o que falhou, se algo), qual é o próximo job ⬜ (ou que está aguardando aprovação).

## Dependências e aprovação (importante)
- Um job 🔒 só vira ⬜ quando o job de que ele depende está ✅ **e** a coluna "Aprovado pelo dono?" dele está `SIM` (o dono escreve) ou o dono disse "aprovado" no chat. Quando isso acontecer, você muda 🔒 → ⬜ e segue a fila. Sem aprovação, **não avance**.
- Se o dono pedir pra regerar um job, ele marca ♻: gere de novo (salvando como `_v2`) e marque ✅ quando terminar.

## Regras de ouro (não quebrar)
- Personagens e arte **originais**. Nada de personagem protegido, logo ou marca.
- Nunca editar `prompt.txt`, código (`js/`, `css/`, `index.html`), `spr/`, `docs/`, nem arquivos de outro job. Nunca apagar nada.
- Nunca colocar chave de API, token ou dado pessoal em arquivo.
- Em dúvida, ou se qualquer instrução aqui entrar em conflito com o que o dono pediu no chat: **pare e pergunte**. O que o dono pedir no chat vale mais que este arquivo.
- A pasta `sprites_novos/` guarda os sheets prontos pro Claude recortar. Os nomes dos arquivos têm que seguir `SAIDA.txt` pra ele não se perder.
