#!/bin/bash
# Converte cada .wav da pasta pra .ogg, perguntando o nome novo (Enter vazio = mantém o nome)
shopt -s nullglob
for f in *.wav; do
  read -r -p "$f -> " novo
  [ -z "$novo" ] && novo="${f%.wav}"
  novo="${novo%.ogg}.ogg"
  ffmpeg -v error -y -i "$f" -c:a libvorbis -q:a 5 "$novo" && echo "  ok: $novo ($(du -h "$novo" | cut -f1))"
done