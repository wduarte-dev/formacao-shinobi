"""Gera a ref limpa do Poko (idle, 768x640, fundo verde) em pixel art por código.
Uso: python3 tools/sprites/make_poko_ref.py docs/refs/poko_ref.png"""
import sys
from PIL import Image, ImageDraw
W,H=96,80
OUT=(40,24,28)
FUR=(150,98,58); FUR_D=(110,68,44); FUR_L=(188,134,84)
CREAM=(244,222,178); CREAM_D=(214,184,140)
PATCH=(62,40,38)
LEAF=(226,110,40); LEAF_D=(170,66,30)
GOLD=(250,190,60); RED=(200,60,50)
STICK=(190,140,80); STICK_D=(120,80,44)
im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
def el(cx,cy,rx,ry,c): d.ellipse([cx-rx,cy-ry,cx+rx,cy+ry],fill=c)
# cauda (atrás, esquerda) com listras
el(20,52,13,10,FUR); 
for x0 in (11,17,23):
    d.rectangle([x0,44,x0+2,60],fill=FUR_D)
el(13,50,4,5,CREAM)  # ponta clara
# pernas/pés
el(38,72,9,4,FUR_D); el(60,72,9,4,FUR_D)
# corpo
el(46,50,26,21,FUR)
el(40,44,12,9,FUR_L)               # luz no flanco
# barriga-tambor
el(53,52,17,15,CREAM)
d.ellipse([53-17,52-15,53+17,52+15],outline=OUT)
d.ellipse([53-13,52-11,53+13,52+11],outline=CREAM_D)
for a in range(0,360,45):  # tachinhas do tambor
    import math
    x=53+15*math.cos(math.radians(a)); y=52+13*math.sin(math.radians(a))
    d.point((round(x),round(y)),fill=RED)
# marca de som no centro da barriga
d.rectangle([51,50,55,54],fill=GOLD); d.rectangle([52,51,54,53],fill=RED)
# braço de trás
el(30,52,5,9,FUR_D)
# cabeça
el(48,25,19,15,FUR)
el(41,18,9,5,FUR_L)
# orelhas
el(35,11,6,6,FUR_D); el(36,12,3,3,CREAM)
el(60,10,6,6,FUR_D); el(60,11,3,3,CREAM)
# folha laranja na cabeça
d.polygon([(44,8),(48,1),(53,8),(49,11)],fill=LEAF)
d.line([(48,3),(48,10)],fill=LEAF_D)
# focinho
el(63,29,9,6,CREAM)
el(70,27,2,2,PATCH)   # nariz
d.line([(61,33),(66,33)],fill=PATCH)  # boca
# manchas dos olhos
el(56,23,7,5,PATCH)
el(55,23,2,2,CREAM); d.point((56,23),fill=OUT)  # olho
d.line([(51,17),(59,18)],fill=OUT)  # sobrancelha
# braço da frente com baqueta erguida
el(70,52,6,8,FUR)
d.line([(72,46),(80,28)],fill=STICK,width=2)
el(81,27,3,3,STICK_D)
d.line([(70,58),(80,62)],fill=STICK,width=2)  # 2ª baqueta baixa
el(81,63,3,3,STICK_D)
el(70,56,5,4,FUR_D)  # mão
# contorno 1px escuro
a=im.split()[3].point(lambda v:255 if v>0 else 0)
px=a.load(); out=im.copy(); op=out.load(); ip=im.load()
for y in range(H):
    for x in range(W):
        if px[x,y]==0:
            for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                nx,ny=x+dx,y+dy
                if 0<=nx<W and 0<=ny<H and px[nx,ny]: op[x,y]=OUT+(255,); break
# posiciona na célula 192x160 -> 4x = 768x640; arte 96x80 em 2x
cell=Image.new('RGB',(192,160),(0,255,0))
big=out.resize((192,160),Image.NEAREST)
cell.paste(big,(0,0),big)
cell.resize((768,640),Image.NEAREST).save(sys.argv[1])
