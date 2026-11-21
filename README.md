# Formação Shinobi

Jogo de navegador por turnos estilo formação 3x3 (4v4, combos e perseguições). Personagens e arte originais.

**Jogar localmente:** `python3 -m http.server 8000` na pasta e abrir http://localhost:8000

- Código: `index.html` + `css/` + `js/` (módulos por responsabilidade, ver `CLAUDE.md`)
- Teste automático: `python3 tools/test_battle.py . /tmp/shots`
- Sprites: `tools/sprites/` (pipeline de recorte) · planos e decisões: `docs/`

Sprites e cenários gerados numa IA de imagem a partir de prompts próprios; UI: Pixel UI Fantasy Free (CC BY 4.0, crédito na tela de título).
