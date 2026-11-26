# Formação Shinobi

Jogo de navegador por turnos estilo formação 3x3 (4v4, combos e perseguições). Personagens e arte originais.

**Jogar online:** https://wduarte-dev.github.io/formacao-shinobi/ (no celular dá pra instalar como app: Android ⋮ → *Instalar app*; iPhone Compartilhar → *Adicionar à Tela de Início*; ele atualiza sozinho).

**Jogar localmente:** `python3 -m http.server 8000` na pasta e abrir http://localhost:8000

- Código: `index.html` + `css/` + `js/` (módulos por responsabilidade, ver `CLAUDE.md`)
- Teste automático: `python3 tools/test_battle.py . /tmp/shots`
- Conteúdo: `python3 tools/new_ninja.py verify` confere os dados e os atlas sem rede.
- Offline: a instalação guarda a base do jogo. Visite as missões com internet para carregar seus sprites, cenários e sons.
- Sprites: `tools/sprites/` (pipeline de recorte) · planos e decisões: repo privado de contexto

Sprites e cenários gerados numa IA de imagem a partir de prompts próprios; UI: Pixel UI Fantasy Free (CC BY 4.0, crédito na tela de título).

## Licença e créditos
- **Uso não comercial.** Código, textos e o conjunto do jogo: [PolyForm Noncommercial 1.0.0](LICENSE). Pode jogar, estudar, modificar e compartilhar sem fins comerciais; **vender ou usar comercialmente é proibido**.
- **Criado com ajuda de IA.** Ferramentas: Claude (código, lógica e documentação, praticamente tudo), ChatGPT, Gemini e Google AI Studio (spritesheets, a partir de prompts do autor) e ElevenLabs (efeitos sonoros e músicas). Material gerado por IA pode não ter proteção de direito autoral em vários países; a licença acima vale só pro que for protegível, e o uso do material segue também os termos de cada ferramenta.
- **Interface:** Pixel UI Fantasy Free by heyheythere, [CC BY 4.0](https://heyheythere.itch.io/pixel-ui-fantasy-free). Não é coberta pela PolyForm; mantém a licença e o crédito originais.
- **Fonte:** Pixelify Sans (SIL OFL 1.1, Google Fonts).
- Personagens e arte originais; nada de assets ripados ou personagem protegido.
