---
name: audio-jogo-web
description: Criar e integrar áudio (efeitos, vozes sem palavras, ambiente e música) num jogo de navegador usando ElevenLabs e ffmpeg. Usar quando o Wellington pedir prompts de som/música, geração de SFX por API, conversão/corte de áudio, loop sem emenda ou ligar sons no código de um jogo web. Não usar pra edição de áudio fora de jogo.
---

# Áudio pra jogo web (ElevenLabs + ffmpeg)

Receita testada no Formação Shinobi (152 SFX + 72 vozes + músicas). Tom com ele: português informal e direto; escolhas via AskUserQuestion.

## 1. Prompts que funcionam (SFX do ElevenLabs)
- **Inglês**, uma frase descritiva + **tempo por trecho**: `0.0-0.1s: impacto, 0.1-0.5s: ruído de fundo`. Isso força o som a preencher a duração (sem isso o modelo usa só metade do tempo).
- Sufixo padrão: `crisp, dry, no reverb tail, no music, no voice, game sound effect, slightly stylized anime action, exactly N seconds long, cuts off cleanly at the end`. Pra voz sem palavras troque `no voice` por `no words, no speech`.
- **Influência do prompt = 100%** com tempo por trecho. Mais baixo (60–70%) só pra variação.
- **Duração mínima 0,5s** (API e site). Pra som mais curto, pedir 0,5 e cortar no conversor.
- O site gera 4 variações por clique; a API gera 1 por chamada. Variação evita repetição (golpe toca centenas de vezes): 3+ versões de swing/hit/heavy.
- Nome do arquivo baixado do site = **20 primeiros caracteres do prompt**: começar cada prompt com palavras únicas.
- Não citar nome de artista/música (recusa). Música: pedir estrutura **por tempo** (0:00-0:15 intro…) e "never repeat a section unchanged", senão repete a mesma frase 5x. Instrução negativa ("nothing cute, no glockenspiel") **no fim**.
- Entender o gosto dele antes: ler `docs/` ou perguntar; ele rejeita lento, ambiente, repetitivo, coral "divino", vocal fino, mudança de gênero no meio e som "artificial".

## 2. API (sound-generation)
`POST https://api.elevenlabs.io/v1/sound-generation?output_format=wav_44100` com `{"text","duration_seconds","prompt_influence":1.0}`. A chave vem **só por formulário seguro** (`request_credential`, host `api.elevenlabs.io`, header `xi-api-key`); o proxy injeta, nunca pedir a chave no chat. Custo observado ~30 créditos por som (no site, 80 por clique de 4). Falha 400 não gasta crédito. Ler saldo exige permissão `user_read` na chave (normalmente não tem). Pular o que já existe e parar em 401/402/403/422. Rodar em background e conferir o log.
Gemini: imagem pela API dá cota 0 no plano grátis (precisa faturamento); texto grátis funciona (`gemini-3.5-flash-lite`, endpoint `/v1beta/openai/` com Bearer). Plano Plus do app não inclui API.

## 3. Conversão (ffmpeg + numpy)
WAV 44,1k → **OGG Vorbis q4** (efeitos) / q5 (música). Por arquivo: apara silêncio (limiar -45 dB), corta no tempo pedido com fade de 15–40 ms, **normaliza o pico em -3 dBFS**. Ambiente em loop: crossfade de 1,5s do fim com o começo. Só reconverter o que mudou (mtime). Música: aparar silêncio das pontas (vinham com até 10s sobrando):
`ffmpeg -i x.ogg -af "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse" -c:a libvorbis -q:a 5 y.ogg`.
Evitar MP3 pra loop (silêncio de encoder cria "pulinho"). Gravar a tela é último recurso: no Linux, `ffmpeg -f pulse -i <monitor> out.wav` (nome do monitor em `pactl list short sources`).

## 4. Integração no código
- **Efeitos:** fetch + `decodeAudioData` em buffers (WebAudio), sorteio entre variações `_1.._N`, leve variação de `playbackRate`, anti-empilhamento (mesmo arquivo <40 ms), e **reserva sintetizada** se o arquivo faltar. Por `file://` (sem fetch) usar `<audio>`.
- **Música:** dois `<audio>` com **crossfade de 3 s no fim** (esconde corte seco), volume ~.45, respeita o botão de som. Menu com música própria que não reinicia ao trocar de tela.
- **Voz sem palavras:** por personagem (timbre masculino/feminino/criatura), tipos jutsu/golpe/dor/queda, **com chance** por tipo e trava global de ~350 ms pra não virar gritaria.
- Ambiente por cenário em `<audio loop>`. Tudo atrás de um objeto `sfx.<evento>()` pra o combate só chamar nomes.
- Testar com Playwright (`--autoplay-policy=no-user-gesture-required`); o `http.server` do Python **não suporta Range**, então não dá pra "pular" no áudio: acelerar com `playbackRate=16` pra testar o fim da faixa.
- Documentar o fluxo e a tabela evento→arquivo num `docs/audio.md` do projeto.
