# FILA de geração

Leia primeiro o `LEIA-ME.md`. Estados: ⬜ pronto pra gerar (só com ordem do dono) · 🔒 bloqueado (espera o job de que depende ficar ✅) · ✅ aprovado pelo dono (arquivo já em `sprites_novos/`) · ⚠ conferência reprovou (avisar o dono) · ⏭ pulado (o dono gerou por conta própria; esperar o arquivo em `sprites_novos/`) · ♻ dono pediu pra regerar. Antes da aprovação a imagem só existe no chat; a fila só muda depois do SIM.

| Job | Status | Saída (sprites_novos/) | Depende de | Aprovado pelo dono? | Pasta |
|---|---|---|---|---|---|
| 01_utsushi_A1 | ✅ | `UTSUSHI_A1.png` | — | SIM | `jobs/01_utsushi_A1/` |
| 02_utsushi_A1B | ✅ | `UTSUSHI_A1B.png` | UTSUSHI_A1 | SIM | `jobs/02_utsushi_A1B/` |
| 03_utsushi_A2 | ⬜ | `UTSUSHI_A2.png` | UTSUSHI_A1 | — | `jobs/03_utsushi_A2/` |
| 04_utsushi_B1 | 🔒 | `UTSUSHI_B1.png` | UTSUSHI_A2 | — | `jobs/04_utsushi_B1/` |
| 05_utsushi_B2 | 🔒 | `UTSUSHI_B2.png` | UTSUSHI_B1 | — | `jobs/05_utsushi_B2/` |
| 06_utsushi_C | 🔒 | `UTSUSHI_C.png` | UTSUSHI_B2 | — | `jobs/06_utsushi_C/` |
| 07_utsushi_CH | 🔒 | `UTSUSHI_CH.png` | UTSUSHI_C | — | `jobs/07_utsushi_CH/` |
| 08_utsushi_CL | ⬜ | `UTSUSHI_CL.png` | UTSUSHI_A1 | — | `jobs/08_utsushi_CL/` |
| 09_utsushi_D | ⬜ | `UTSUSHI_D.png` | UTSUSHI_A1 | — | `jobs/09_utsushi_D/` |
