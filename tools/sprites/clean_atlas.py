# Limpa sobras de recorte num atlas já gerado (192x160 por célula): riscos finos de grade e pedaços escuros soltos
# (ex.: pés da linha vizinha). Mantém o corpo (maior componente), pedaços escuros colados nele (<=3 px) e pedaços
# dourados/claros até 45 px (cubos, faíscas, anéis). Uso: python3 clean_atlas.py ../../spr/<ninja>_atlas.png [cw ch]
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
path=sys.argv[1]; cw=int(sys.argv[2]) if len(sys.argv)>2 else 192; ch=int(sys.argv[3]) if len(sys.argv)>3 else 160
im=Image.open(path).convert('RGBA'); a=np.array(im); H,W=a.shape[:2]; dropped=0
for r in range(H//ch):
  for c in range(W//cw):
    cell=a[r*ch:(r+1)*ch,c*cw:(c+1)*cw]; al=cell[...,3]>0
    for x in np.nonzero(al.sum(0)>ch*0.75)[0]: cell[:,x]=0      # risco de grade de ponta a ponta
    for y in np.nonzero(al.sum(1)>cw*0.75)[0]: cell[y,:]=0
    al=cell[...,3]>0
    if not al.any(): continue
    lab,n=ndi.label(al,structure=np.ones((3,3)))
    if n<2: continue
    sl=ndi.find_objects(lab); area=ndi.sum(al,lab,range(1,n+1)); m=int(np.argmax(area))+1; ys,xs=sl[m-1]
    for i in range(1,n+1):
      if i==m: continue
      y,x=sl[i-1]; h=y.stop-y.start; w=x.stop-x.start
      gx=max(xs.start-x.stop,x.start-xs.stop,0); gy=max(ys.start-y.stop,y.start-ys.stop,0); d=max(gx,gy)
      px=cell[lab==i][:,:3].astype(int); gold=(px[:,0].mean()>150 and px[:,1].mean()>110 and px[:,2].mean()<130)
      thin=(min(h,w)<=2 and max(h,w)>=8) or (max(h,w)>=20 and area[i-1]/(h*w)<0.15)
      keep=(not thin) and ((gold and d<=45) or d<=3)
      if not keep: cell[lab==i]=0; dropped+=1
Image.fromarray(a).save(path); print(path,'removidos:',dropped)
