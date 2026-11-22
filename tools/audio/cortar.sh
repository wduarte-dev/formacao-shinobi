#!/bin/bash
# Corta um trecho de cada áudio da pasta (wav/ogg/mp3/flac) e salva como <nome>_corte.ogg.
# Pergunta início, fim e fade-out de cada arquivo. Início vazio = pula o arquivo.
# Tempo pode ser em segundos (95) ou m:ss (1:35).
shopt -s nullglob
tosec(){ awk -v t="$1" 'BEGIN{n=split(t,a,":"); s=0; for(i=1;i<=n;i++) s=s*60+a[i]; print s}'; }
for f in *.wav *.ogg *.mp3 *.flac; do
  case "$f" in *_corte.ogg) continue;; esac
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  printf "\n%s (%.1fs)\n" "$f" "$dur"
  read -r -p "  início (ex 0:05, Enter = pular arquivo): " ini; [ -z "$ini" ] && continue
  read -r -p "  fim (Enter = até o fim): " fim
  read -r -p "  fade-out em segundos (Enter = 1.5, 0 = sem fade): " fd; fd=${fd:-1.5}
  s=$(tosec "$ini"); e=$([ -z "$fim" ] && echo "$dur" || tosec "$fim")
  len=$(awk -v s="$s" -v e="$e" 'BEGIN{print e-s}')
  af="afade=t=in:d=0.05"
  [ "$fd" != "0" ] && af="$af,afade=t=out:st=$(awk -v l="$len" -v d="$fd" 'BEGIN{x=l-d; if(x<0)x=0; print x}'):d=$fd"
  out="${f%.*}_corte.ogg"
  ffmpeg -v error -y -ss "$s" -i "$f" -t "$len" -af "$af" -c:a libvorbis -q:a 5 "$out" \
    && echo "  ok: $out ($(du -h "$out" | cut -f1), $(printf '%.1f' "$len")s)"
done
