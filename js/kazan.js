// Kazan — forja, encaixe do dragão e ações do ferreiro.
"use strict";
// Dimensões e âncoras de spr/kazan_dragon_*.json, empacotadas para funcionar por file://.
const KAZAN_ART={
  body:[542,324,[[[4,4],[4,183],533,315],[[4,4],[4,183],533,316],[[4,4],[4,183],534,316],[[4,4],[4,183],533,315]]],
  cutin:[1603,896,[[[4,4],null,1595,888]]],
  erupt:[368,591,[[[92,197],null,184,196],[[82,144],null,203,303],[[65,50],null,237,490],[[4,4],null,360,583],[[24,86],null,319,418],[[84,158],null,200,275]]],
  head:[1027,599,[[[4,4],[4,384],1019,591],[[5,4],[5,383],1017,591]]],
  tail:[1081,485,[[[4,99],[4,231],1073,286],[[6,4],[6,267],1069,477]]],
};
const kazanArtPath=part=>`spr/kazan_dragon_${part}.png`;
const KAZAN_COLORS=['#ffe6a0','#ffb632','#ff691d','#db3015'];
const kazanDir=u=>u.side==='p'?1:-1;
const kazanClamp=(x,a,b)=>Math.max(a,Math.min(b,x));
let kazanTime=0, kazanDragon=null;
const kazanEffects=[];

// Coordenadas no atlas, relativas à mesma âncora que mkSpr.
const KAZAN_HEAD={
  idle:[[82,36],[83,34],[83,32],[85,37],[85,36],[84,36]],
  walk:[[126,43],[126,44],[137,43],[129,42],[120,43],[119,44],[126,43],[128,44]],
  dash:[[82,40],[81,45],[79,38],[79,42],[75,48],[77,46],[82,47]],
  sit:[[80,42],[86,54],[93,62],[72,43],[85,72],[69,49],[81,44],[80,45]],
  atk1:[[83,46],[85,49],[91,57],[95,61],[91,50],[81,45]],
  attackB:[[87,49],[88,52],[85,55],[84,67],[86,54],[86,47]],
  attackC:[[85,49],[90,51],[91,52],[86,49],[86,45],[88,46]],
  cast:[[87,49],[87,49],[88,51],[87,51],[88,46],[87,50]],
  atk2:[[83,57],[89,55],[101,61],[98,65],[94,67],[96,62],[93,48],[85,55]],
  fireball:[[86,47],[87,57],[84,56],[93,48],[90,51],[84,47]],
  guard:[[80,53],[76,51],[76,48],[81,55]],
  hurt:[[76,49],[73,52],[83,46]],
  stun:[[90,48],[81,48],[80,54],[82,52]],
  victory:[[83,49],[84,52],[85,51],[81,47],[79,47],[80,47]],
  die:[[79,43],[81,48],[89,56],[125,72]]
};
// Pontas desenhadas só onde o martelo perde o bloco ou muda de mão.
const KAZAN_HAMMER={
  idle:{3:[111,109]},
  dash:{1:[106,81],4:[109,67],6:[111,104]},
  sit:{4:[112,133]},
  attackB:{3:[127,108],4:[111,102]},
  attackC:{0:[110,102],3:[108,102]},
  fireball:{3:[58,57]},
  guard:{0:[111,131],3:[111,130]},
  hurt:{1:[103,105],2:[106,103]},
  victory:{1:[116,74]},
  die:{2:[110,110]}
};
const kazanFramePoint=(u,[x,y])=>{
  const p=pos(u), dir=kazanDir(u), scale=u.sc/3;
  return {x:p.x+(x-96)*scale*dir+(u.kazanRecoil||0),y:p.y+(y-150)*scale};
};
const kazanHead=u=>kazanFramePoint(u,KAZAN_HEAD[u.an]?.[u.frame]||[FACE.kazan.idle[0],FACE.kazan.idle[1]-13]);
const kazanAnvil=u=>kazanFramePoint(u,[113,113]);
function resetKazanFx(){ kazanEffects.length=0; kazanDragon=null; kazanTime=0; }
function kazanCinders(p,n=12,wide=0){
  em(n,()=>prt(p.x,p.y,R(-wide,wide),0,R(-2.1,2.1),R(-2.9,-.5),.09,R(13,29),R(1.3,3.3),0,pk(KAZAN_COLORS)));
}
function kazanSmoke(p,n=7){
  em(n,()=>prt(p.x,p.y,R(-5,5),1,R(-.6,.6),R(-1.35,-.36),-.012,R(15,32),R(4,8),0,pk(['#3b2330','#67434a','#ad6351']),1));
}
function kazanEffect(duration,draw){
  kazanEffects.push({duration,draw,t:0});
}
function kazanCrust(c,x,y,w,h,t=0){
  c.save(); c.translate(x,y);
  c.fillStyle='#721c19'; c.fillRect(-w*.56,-h*.45,w*1.12,h*.87);
  c.fillStyle='#29202b';
  c.beginPath(); c.moveTo(-w*.6,-h*.22); c.lineTo(-w*.37,-h*.56); c.lineTo(w*.38,-h*.51);
  c.lineTo(w*.59,-h*.22); c.lineTo(w*.48,h*.49); c.lineTo(-w*.53,h*.42); c.closePath(); c.fill();
  c.strokeStyle=t%160<80?'#ffa231':'#ff671e'; c.lineWidth=1.15;
  c.beginPath(); c.moveTo(-w*.31,-h*.49); c.lineTo(-w*.05,-h*.15); c.lineTo(-w*.16,h*.11);
  c.lineTo(w*.25,h*.39); c.moveTo(-w*.06,-h*.13); c.lineTo(w*.34,-h*.24); c.lineTo(w*.47,-h*.02); c.stroke();
  c.restore();
}
function kazanPool(c,p,r,t,a=1){
  c.save(); c.translate(p.x/3,p.y/3); c.globalAlpha=a;
  for(const [scale,color] of [[1,'#551919'],[.87,'#bb3018'],[.69,'#e55419']]){
    c.fillStyle=color; c.beginPath(); c.ellipse(0,1,r*scale,r*scale*.26,0,0,Math.PI*2); c.fill();
  }
  c.fillStyle='#ffa629';
  for(let i=0;i<5;i++){
    const x=Math.sin(i*4+t*.004)*r*.72, y=Math.cos(i*12+t*.003)*r*.14;
    c.fillRect(x,y,Math.max(1,r*.1),1);
  }
  c.restore();
}
function kazanShock(p,strength=1){
  kazanCinders(p,18); kazanSmoke(p);
  kazanEffect(350,(c,k)=>{
    c.save(); c.strokeStyle='#ffc353'; c.globalAlpha=(1-k)*.8; c.lineWidth=1.3;
    c.beginPath(); c.ellipse(p.x/3,p.y/3,2+k*30*strength,1+k*10*strength,0,0,Math.PI*2); c.stroke();
    c.restore();
  });
}
function kazanFlight(u,t,from,ms,large=false){
  const end=cur(t), dir=kazanDir(u);
  kazanEffect(ms,(c,k)=>{
    c.save();
    for(let i=5;i>=0;i--){
      const progress=kazanClamp(k-i*.037,0,1), along=1-Math.pow(1-progress,2.6);
      const x=(from.x+(end.x-dir*20-from.x)*along)/3;
      const y=(from.y+(end.y-66-from.y)*along-Math.sin(along*Math.PI)*(large?23:5))/3;
      const w=(large?3.9:2.2)*(1-i*.14);
      c.globalAlpha=(1-i*.14)*Math.min(1,k*7)*Math.min(1,(1-k)*9)*.9;
      c.fillStyle=KAZAN_COLORS[Math.min(3,i)];
      c.fillRect(x-w,y-w*.5,w*2,w);
    }
    c.restore();
  });
  return shoot(u,t,from,ms);
}
function kazanPoseChanged(u){
  if(!battleOn||!u.d?.stationary||!u.el||u.el.classList.contains('ghost'))return;
  const transitions={idle:[3,4],sit:[2,4,5,6],atk1:[2,3,5],attackC:[0,2,3,4],atk2:[4,5,7],
    guard:[0,3],hurt:[1,2],stun:[0],victory:[1,2,3],die:[2,3,4,6],dash:[2,3,4,6]};
  if(transitions[u.an]?.includes(u.frame)){
    const p=u.an==='atk2'||u.an==='sit'||u.an==='die'?kazanFramePoint(u,[113,142]):kazanAnvil(u);
    kazanSmoke(p,4); kazanCinders(p,7,4);
    if(u.an==='die'||u.an==='attackC')kazanEffect(230,(c,k,t)=>kazanPool(c,p,4+5*k,t,1-k));
  }
}
function kazanDrawNinja(c,u){
  if(!u.el||u.el.classList.contains('ghost')||u.an==='die'&&u.frame>=3)return;
  const p=kazanHead(u), t=kazanTime;
  const scale={dash:1.44,fireball:1.5,victory:1.72,hurt:.76,die:[.78,.42,.18][u.frame]}[u.an]??.93;
  const x=p.x/3+(u.an==='hurt'?Math.sin(t*.085)*2.4:0), y=p.y/3;
  const h=(5+2*Math.sin(t*.024))*scale;
  if(h>0){
    c.save(); c.globalAlpha=.92; c.translate(x,y);
    for(let i=0;i<3;i++){
      c.fillStyle=KAZAN_COLORS[3-i]; const dx=Math.sin(t*.017+i*2)*1.7;
      c.beginPath(); c.moveTo(-3+i,1); c.lineTo(-3+i,-2); c.lineTo(dx-1,-h*.9+i);
      c.lineTo(dx+.8,-h*1.48+i); c.lineTo(3-i*.4,-h*.55); c.lineTo(3-i,1); c.closePath(); c.fill();
    }
    c.restore();
  }
  const hammer=KAZAN_HAMMER[u.an]?.[u.frame];
  if(hammer){
    const p=kazanFramePoint(u,hammer);
    kazanCrust(c,p.x/3,p.y/3,7.2,6.1,t);
  }
}
function kazanDraw(c,k,elapsed){
  const units=U?.p.filter(u=>u.d.stationary)||[];
  if(!units.length&&!kazanEffects.length&&!kazanDragon)return;
  const dt=k*16.7;
  kazanTime+=dt;
  if(fieldA?.fx.visual==='forge'){
    for(const u of team(fieldA.side)){
      if(u.alive)kazanPool(c,pos(u),26,kazanTime+u.slot*193,.64);
    }
  }
  units.forEach(u=>kazanDrawNinja(c,u));
  for(let i=kazanEffects.length-1;i>=0;i--){
    const e=kazanEffects[i]; e.t+=dt;
    if(e.t>=e.duration)kazanEffects.splice(i,1);
    else e.draw(c,e.t/e.duration,e.t);
  }
  if(kazanDragon){ kazanDragon.t+=elapsed; kazanDrawDragon(c,kazanDragon); }
}

async function kazanSit(u){
  setAnim(u,'sit',0,true);
  const p=kazanFramePoint(u,[119,147]);
  kazanEffect(1060,(c,k,t)=>{
    if(k<.18)return;
    const rise=kazanClamp((k-.2)*3,0,1);
    const alpha=Math.min(1,(1-k)*7);
    kazanPool(c,p,11*rise,t,alpha);
    c.save(); c.globalAlpha=alpha;
    const y=p.y/3-7*rise;
    kazanCrust(c,p.x/3,y+2,9*rise,5,t); // pedestal da bigorna
    c.fillStyle='#51424a'; c.fillRect(p.x/3-7*rise,y-2,14*rise,3);
    c.fillStyle='#fd932d'; c.fillRect(p.x/3-5*rise,y-2,10*rise,1);
    const banner=p.x/3+5*rise;
    c.fillStyle='#855747'; c.fillRect(banner,y-8*rise,1,12*rise);
    c.fillStyle='#e8b680'; c.fillRect(banner+1,y-6*rise,4*rise,5*rise);
    c.fillStyle='#c44c25'; c.fillRect(banner+2,y-4*rise,2*rise,2*rise);
    c.fillStyle='#a77652'; c.fillRect(p.x/3-11,y-8*rise,1.1,8*rise);
    kazanCrust(c,p.x/3-11,y-8*rise,5,4,t); // martelo ainda preso à lava
    c.restore();
  });
  await sleep(240); kazanSmoke(p,13); kazanCinders(p,23); sfx.thud();
  await sleep(animMs(u,'sit')-240); kazanShock(p,.7); setAnim(u,'idle');
}
function kazanGuard(u){
  if(!u.alive)return;
  const b=kazanFramePoint(u,[106,115]);
  setAnim(u,'guard'); sfx.forge('guard',sfx.absorb);
  kazanEffect(490,(c,k,t)=>{
    const rise=Math.min(1,k*7), x=b.x/3+4*kazanDir(u), y=b.y/3-15*rise;
    c.save(); c.globalAlpha=Math.min(1,(1-k)*4);
    if(k<.55)kazanCrust(c,x,y,14*rise,13*rise,t);
    else{
      const d=(k-.55)*16;
      kazanCrust(c,x-d,y+d,7,10,t); kazanCrust(c,x+d,y+d*.65,7,9,t);
    }
    c.restore();
  });
  kazanShock(b,.65);
}

function kazanCutin(el){
  const [w,h]=KAZAN_ART.cutin;
  el.style.backgroundImage=`url(${kazanArtPath('cutin')})`;
  el.style.backgroundSize=`${Math.min(520,w*290/h)}px auto`;
  el.style.backgroundPosition='center';
}
function kazanArt(c,part,i,x,y,angle,sx,sy,right=false){
  const [w,h,frames]=KAZAN_ART[part], [at,attach,cw,ch]=frames[i];
  const im=KEEP[kazanArtPath(part)];
  if(!im?.naturalWidth)return;
  const anchor=right?[at[0]+cw,185]:attach||[w/2,at[1]+ch];
  c.save(); c.translate(x,y); c.rotate(angle); c.scale(sx,sy);
  c.drawImage(im,i*w+at[0],at[1],cw,ch,at[0]-anchor[0],at[1]-anchor[1],cw,ch);
  c.restore();
}
function kazanPath(a,b){
  const dx=b.x-a.x, dir=Math.sign(dx)||1;
  const top=Math.max(210,Math.min(a.y,b.y)-165);
  const crest={x:b.x-dir*205,y:top};
  // A curva segue o pescoço: a boca fica bem adiante da âncora do PNG.
  const neck={x:b.x+dir*157,y:b.y-225};
  const sections=[
    [a,{x:a.x+dir*104,y:a.y-113},{x:crest.x-dir*115,y:top-26},crest],
    [crest,{x:crest.x+dir*132,y:top+25},{x:neck.x+dir*130,y:top-60},
      {x:neck.x+dir*45,y:top-25}],
    [{x:neck.x+dir*45,y:top-25},{x:neck.x+dir*36,y:top+5},
      {x:neck.x+dir*26,y:neck.y-39},neck]
  ];
  let last=a, length=0;
  const points=[{...a,s:0}];
  for(const [p0,p1,p2,p3] of sections)for(let i=1;i<=46;i++){
    const t=i/46, q=1-t;
    const coord=k=>q*q*q*p0[k]+3*q*q*t*p1[k]+3*q*t*t*p2[k]+t*t*t*p3[k];
    const p={x:coord('x'),y:coord('y')};
    length+=Math.hypot(p.x-last.x,p.y-last.y);
    points.push({...p,s:length}); last=p;
  }
  const at=s=>{
    if(s<=0)return points[0];
    const i=points.findIndex(p=>p.s>=s);
    if(i<1)return points.at(-1);
    const p=points[i-1], q=points[i], t=(s-p.s)/(q.s-p.s);
    return {x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t};
  };
  return {length,at};
}
function kazanDrawDragon(c,d){
  const eruption=540, flight=1250;
  c.save(); c.scale(1/3,1/3); c.imageSmoothingEnabled=false;
  if(d.t<eruption){
    const i=Math.min(5,Math.floor(d.t/90));
    kazanArt(c,'erupt',i,d.a.x,d.a.y,0,.43,.43);
  }
  if(d.t>=310){
    const p=kazanClamp((d.t-310)/flight,0,1);
    const path=d.path, s=p*path.length;
    const front=path.at(s), guide=path.at(s>9?s-9:s+9);
    const angle=s>9?Math.atan2(front.y-guide.y,front.x-guide.x):Math.atan2(guide.y-front.y,guide.x-front.x);
    const scale=.37, segment=180;
    const alpha=kazanClamp(1-(d.t-1560)/380,0,1);
    const n=Math.min(4,Math.ceil(s/segment));
    const pulse=Math.floor(d.t/104);
    for(let i=n-1;i>=0;i--){
      const f=path.at(s-i*segment), b=path.at(s-(i+1)*segment);
      const len=Math.hypot(f.x-b.x,f.y-b.y);
      const theta=Math.atan2(f.y-b.y,f.x-b.x);
      c.globalAlpha=alpha*Math.min(1,len/45);
      if(i===n-1&&s>120){
        const tailTurn=Math.abs(theta)<Math.PI/2?theta:theta+Math.PI;
        const tailScale=Math.min(1,(s-120)/220)*scale;
        kazanArt(c,'tail',pulse%2,b.x+Math.cos(theta)*13,b.y+Math.sin(theta)*13,tailTurn,
          Math.cos(theta)>=0?-tailScale:tailScale,tailScale*1.3);
      }
      if(len>1)kazanArt(c,'body',(pulse+i)%4,f.x+Math.cos(theta)*10,f.y+Math.sin(theta)*10,theta,(len+24)/534,scale,true);
    }
    c.globalAlpha=alpha*Math.min(1,(d.t-310)/180);
    const mirror=Math.cos(angle)>=0?1:-1;
    const dive=kazanClamp((p-.72)/.22,0,1);
    const turn=kazanClamp(Math.atan2(Math.sin(angle)*mirror,Math.abs(Math.cos(angle))),-.54-.54*dive,.81);
    kazanArt(c,'head',p>.42?1:0,front.x-Math.cos(angle)*20,front.y-Math.sin(angle)*20,turn,scale*mirror,scale);
    if(d.t-d.sparkAt>52){
      d.sparkAt=d.t;
      kazanCinders(d.t>1560?path.at(Math.max(0,s-R(0,490))):front,d.t>1560?13:5,8);
    }
    if(!d.impact&&d.t-d.cameraAt>84){
      d.cameraAt=d.t;
      zoomTo(kazanClamp(front.x+Math.cos(angle)*100,130,1020),kazanClamp(front.y+Math.sin(angle)*86,190,500),1.07);
    }
    if(d.t>=1560)d.impact=true;
    if(d.t>=1940)kazanDragon=null;
  }
  c.restore();
}

const kazanPick=ts=>ts[Math.floor(Math.random()*ts.length)];
function kazanCount(side){
  for(const u of U[side]){
    if(!u.alive||!u.d.volley||u.teamHits>=KAZAN_LIMIT)continue;
    u.teamHits++; upd(u);
  }
}
async function kazanReactions(){
  for(const u of U.p){
    if(result())return;
    if(u.alive&&u.d.volley&&u.teamHits===KAZAN_LIMIT){
      await gate();
      u.teamHits=0; upd(u);
      await doSkill(u,u.d.volley,false);
    }
  }
}
async function kazanRitual(u){
  const p=kazanHead(u);
  sfx.cast(u); sfx.voz(u,'golpe',.4); kazanSmoke(p,5);
  setAnim(u,'dash',0,true);
  await sleep(200);
  kazanCinders(kazanHead(u),19); sfx.forge('pour',()=>sfx.shoot(u));
  await sleep(animMs(u,'dash')-200);
}
async function kazanContact(u,anim,p,onContact){
  const impact=1000/an_of(u)[anim][4]*3;
  setAnim(u,anim,0,true);
  await sleep(impact);
  setAnim(u,anim,3,true);
  kazanShock(p,1.15); shake(.35); flashSoft();
  onContact();
  await hitstop(75);
  // A pose do quadro 4 continua pelo passo repetido em seq, depois do hit-stop.
  await sleep(animMs(u,anim)-impact);
}
function kazanBurn(u,t){
  if(!t.alive)return;
  const dot=N.kaen.jutsu.dot;
  t.dot={dmg:Math.round(u.atk*dot.mult),rounds:dot.rounds,el:'Fogo'};
  sfx.apply('burn'); upd(t);
}
function kazanHit(u,t,sk,mult,cls){
  fxAt(u,'imp',t,.69,-12);
  spark(t,u.d.c,9);
  return landHit(u,t,mult,sk===u.d.normal,cls,sk.target==='all',sk.el);
}
async function kazanBasic(u,sk){
  const enemies=foes(u);
  if(!enemies.length)return;
  const first=kazanPick(enemies), ts=[first];
  if(enemies.length>1&&Math.random()<sk.twoFlames)ts.push(kazanPick(enemies.filter(t=>t!==first)));
  const a=kazanAnvil(u);
  await kazanRitual(u);
  setAnim(u,'atk1',0,true);
  await sleep(2*1000/an_of(u).atk1[4]);
  fxSpr(u.id,'pour',{x:a.x-15*kazanDir(u),y:a.y-18,sc:.49,dir:kazanDir(u),flip:u.side==='e',fps:18});
  kazanCinders(a); sfx.forge('pour',sfx.thud);
  await sleep(animMs(u,'atk1')-2*1000/an_of(u).atk1[4]);
  await kazanContact(u,'attackB',a,()=>sfx.hit(u,'atk'));
  sceneOn([u,...ts]); markTargets(ts);
  setAnim(u,'attackC',0,true);
  await sleep(92);
  kazanCinders(a,16); sfx.shoot(u);
  await Promise.all(ts.map(t=>kazanFlight(u,t,a,290)));
  let damage=0;
  const burns=Math.random()<sk.burnChance;
  await Promise.all(ts.map(async t=>{
    if(!t.stunned&&!t.state&&Math.random()*100<dodgeOf(t)){ await evade(t); return; }
    const dealt=kazanHit(u,t,sk,sk.mult/ts.length,'');
    if(dealt!==null){ damage+=dealt; if(burns)kazanBurn(u,t); }
  }));
  log(`${nm(u)} usa <b>${sk.name}</b>: ${damage} de dano`);
  if(result())await finale(ts.find(t=>!t.alive)||first);
  else await hitstop(30);
}
async function kazanForge(u,sk){
  await cine(u,sk,team(u.side).filter(t=>t.alive));
  setAnim(u,'atk2',0,true);
  await sleep(330);
  setField(u,sk.field); sfx.jutsu(u);
  const dir=kazanDir(u);
  for(const t of team(u.side)){
    if(!t.alive)continue;
    const p=pos(t);
    fxSpr(u.id,'wave',{x:p.x-dir*40,y:p.y-22,sc:.8,dir,flip:dir<0,lo:true});
    kazanCinders(p,13,26);
  }
  log(`${nm(u)} ativa <b>${sk.name}</b> por ${sk.field} rodadas`);
  await sleep(animMs(u,'atk2')-330);
}
async function kazanDragonSkill(u,sk){
  if(fieldA?.owner!==u)return;
  clearField(true);
  u.cd=sk.cd;
  const ts=foes(u);
  if(!ts.length)return;
  setAnim(u,'idle');
  await cine(u,sk,ts);
  sfx.voz(u,'jutsu',.65);
  const a=kazanHead(u), ps=ts.map(cur);
  const b={x:ps.reduce((sum,p)=>sum+p.x,0)/ps.length,y:ps.reduce((sum,p)=>sum+p.y,0)/ps.length-18};
  const flight={a,path:kazanPath(a,b),t:0,sparkAt:0,cameraAt:0,impact:false};
  kazanDragon=flight;
  sfx.forge('dragon',()=>sfx.jutsu(u)); kazanCinders(a,20);
  const dir=kazanDir(u);
  u.kazanRecoil=-8*dir;
  u.st.animate([{translate:'0'},{translate:`${-12*dir}px 3px`,offset:.27},{translate:'0'}],
    {duration:290/speed,easing:'ease-out'});
  await sleep(290); u.kazanRecoil=0;
  while(!flight.impact){ await gate(); await sleep(28); }
  kazanShock(b,2.8); crack(b.x,b.y); shake(1.4);
  const connected=[];
  let damage=0;
  for(const t of ts){
    const dealt=kazanHit(u,t,sk,sk.mult,'big');
    if(dealt!==null){ damage+=dealt; kazanBurn(u,t); if(t.alive)connected.push(t); }
  }
  log(`${nm(u)} solta <b>${sk.name}</b>: ${damage} de dano`);
  const primary=connected.find(t=>!t.d.immuneState);
  const focus=primary||ts.find(t=>!t.d.immuneState);
  if(focus)await smash(u,focus,sk.cause,()=>Promise.all(connected.map(t=>knock(t,sk.cause))),{x:b.x,y:b.y+48});
  else{
    connected.forEach(kazanGuard);
    flashSoft(); sfx.heavy(); zoomOut(true);
  }
  if(result())await finale(ts.find(t=>!t.alive)||ts[0]);
  for(const t of connected){
    if(!t.state)continue;
    if(t===primary){ endCine(); comboShow(u,t); await chain(u.side,t,1,u); }
    if(t.alive){ setState(t,null); t.el.style.zIndex=t.z; }
  }
}
async function kazanVolley(u,sk){
  await kazanRitual(u);
  const p=kazanFramePoint(u,[123,48]);
  let shots;
  await kazanContact(u,'fireball',p,()=>{
    sfx.forge('fireball',()=>sfx.hit(u,'atk'));
    fxSpr(u.id,'bigfire',{x:p.x,y:p.y,sc:.6,dir:kazanDir(u),flip:u.side==='e',fps:16});
    skTag(u,sk.name);
    shots=kazanVolleyShots(u,sk,p).catch(error=>({error}));
  });
  const {damage,last,error}=await shots;
  if(error)throw error;
  log(`${nm(u)} dispara <b>${sk.name}</b>: ${damage} de dano`);
  if(last&&result())await finale(last);
}
async function kazanVolleyShots(u,sk,p){
  let damage=0, last=null;
  sceneOn([u,...foes(u)]);
  // Cada bola rola seu próprio alvo, incluindo alvos já atingidos que continuem vivos.
  for(let i=0;i<sk.shots;i++){
    const t=kazanPick(foes(u));
    if(!t)break;
    const from={x:p.x+i*11*kazanDir(u),y:p.y-i*9};
    markTargets([t]); sfx.shoot(u);
    await kazanFlight(u,t,from,170,true);
    kazanCinders(cur(t),7,4);
    damage+=kazanHit(u,t,sk,sk.mult,'volley')||0;
    last=t;
  }
  return {damage,last};
}
async function kazanSkill(u,sk){
  try{
    if(sk===u.d.normal)await kazanBasic(u,sk);
    else if(sk===u.d.jutsu)await kazanForge(u,sk);
    else if(sk===u.d.recast)await kazanDragonSkill(u,sk);
    else if(sk===u.d.volley)await kazanVolley(u,sk);
  }finally{
    home(u);
  }
}
