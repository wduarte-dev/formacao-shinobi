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
const KAZAN_CAULDRON=[85,54];
const KAZAN_ERUPTION=760, KAZAN_TAKEOFF=440, KAZAN_FLIGHT=2650, KAZAN_IMPACT=KAZAN_TAKEOFF+KAZAN_FLIGHT;
let kazanTime=0, kazanDragon=null;
const kazanEffects=[];

// Coordenadas no atlas, relativas à mesma âncora que mkSpr.
const KAZAN_HEAD={
  idle:[[82,36],[83,34],[83,32],[85,37],[85,36],[84,36]],
  dash:[[82,40],[81,45],[79,38],[79,42],[75,48],[77,46],[82,47]]
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
const kazanFramePoint=(u,point)=>{
  const p=pos(u), offset=spriteOffset(u,point);
  return {x:p.x+offset.x+(u.kazanRecoil||0),y:p.y+offset.y};
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
      const along=kazanClamp(k-i*.037,0,1);
      const x=(from.x+(end.x-dir*20-from.x)*along)/3;
      const y=(from.y+(end.y-66-from.y)*along-Math.sin(along*Math.PI)*(large?6:3))/3;
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
  if(!u.el||u.el.classList.contains('ghost'))return;
  const t=kazanTime;
  const hammer=KAZAN_HAMMER[u.an]?.[u.frame];
  if(hammer){
    const p=kazanFramePoint(u,hammer);
    kazanCrust(c,p.x/3,p.y/3,7.2,6.1,t);
  }
}
function kazanDraw(c,elapsed){
  const units=U?.p.filter(u=>u.d.stationary)||[];
  if(!units.length&&!kazanEffects.length&&!kazanDragon)return;
  const dt=elapsed;
  kazanTime+=dt;
  units.forEach(u=>kazanDrawNinja(c,u));
  if(kazanDragon){ kazanDragon.t+=elapsed; kazanDrawDragon(c,kazanDragon); }
  for(let i=kazanEffects.length-1;i>=0;i--){
    const e=kazanEffects[i]; e.t+=dt;
    if(e.t>=e.duration)kazanEffects.splice(i,1);
    else e.draw(c,e.t/e.duration,e.t);
  }
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
  el.style.backgroundSize=`${Math.min(452,w*290/h)}px auto`;
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
function kazanPath(a,b,dir){
  const reach=268, dx=Math.max(90,(b.x-a.x)*dir);
  const forward=kazanClamp(dx*.62,76,242);
  const rise=Math.sqrt(reach**2-forward**2);
  const neck={x:b.x-dir*forward,y:b.y-rise};
  const run=Math.max(30,(neck.x-a.x)*dir);
  const climb={x:a.x+dir*run*.25,y:Math.max(160,a.y-172)};
  const crest={x:neck.x-dir*run*.32,y:Math.max(102,neck.y-68)};
  const points=[{...a,s:0}];
  let last=a, length=0;
  for(let i=1;i<=64;i++){
    const t=i/64, q=1-t;
    const coordinate=k=>q*q*q*a[k]+3*q*q*t*climb[k]+3*q*t*t*crest[k]+t*t*t*neck[k];
    const point={x:coordinate('x'),y:coordinate('y')};
    length+=Math.hypot(point.x-last.x,point.y-last.y);
    points.push({...point,s:length}); last=point;
  }
  return {length,impactAngle:Math.atan2(rise,forward),at(s){
    if(s<=0)return points[0];
    const i=points.findIndex(p=>p.s>=s);
    if(i<1)return points.at(-1);
    const p=points[i-1], q=points[i], t=(s-p.s)/(q.s-p.s);
    return {x:p.x+(q.x-p.x)*t,y:p.y+(q.y-p.y)*t};
  }};
}
function trackKazanDragon(x,y,zoom){
  const cam=$('cam');
  cam.classList.add('tracking');
  cam.style.transformOrigin='0 0';
  const dx=kazanClamp(576-x*zoom,1152*(1-zoom),0);
  const dy=kazanClamp(306-y*zoom,648*(1-zoom),0);
  cam.style.transform=`translate(${dx}px,${dy}px) scale(${zoom})`;
}
function kazanDrawDragon(c,d){
  c.save(); c.scale(1/3,1/3); c.imageSmoothingEnabled=false;
  if(d.t<KAZAN_ERUPTION){
    const i=Math.min(5,Math.floor(d.t*6/KAZAN_ERUPTION));
    kazanArt(c,'erupt',i,d.a.x,d.a.y,0,.40,.40);
  }
  if(d.t>=KAZAN_TAKEOFF){
    const p=kazanClamp((d.t-KAZAN_TAKEOFF)/KAZAN_FLIGHT,0,1);
    const progress=p*p*(3-2*p);
    const path=d.path, distance=progress*path.length;
    const front=path.at(distance);
    const before=path.at(distance-18), after=path.at(distance+18);
    const tangent=Math.atan2(after.y-before.y,Math.abs(after.x-before.x));
    const dive=kazanClamp((p-.58)/.42,0,1);
    const tilt=kazanClamp(tangent,-.53,.83)*(1-dive)+path.impactAngle*dive;
    const dir=d.dir, scale=.14+.26*progress;
    const segment=475*scale, alpha=kazanClamp(1-(d.t-KAZAN_IMPACT)/400,0,1);
    const tipDistance=Math.max(0,distance-segment*3.05);
    const tailAttach=tipDistance+Math.min(340*scale,distance*.28);
    const pulse=Math.floor(d.t/165), bodyLength=distance-tailAttach;
    if(distance>15 && tailAttach-tipDistance>3){
      const root=path.at(tailAttach), tip=path.at(tipDistance);
      const extent=Math.hypot(root.x-tip.x,root.y-tip.y);
      const tilt=Math.atan2(root.y-tip.y,Math.abs(root.x-tip.x))*dir;
      c.save();
      if(tipDistance<31){
        // A parte que ainda está dentro do caldeirão fica escondida pelo aro.
        c.beginPath(); c.rect(0,0,1152,d.a.y-1); c.clip();
      }
      c.globalAlpha=alpha*Math.min(1,distance/94);
      kazanArt(c,'tail',pulse%2,root.x,root.y,tilt,-dir*extent/1000,scale*1.3);
      c.restore();
    }
    const count=Math.min(4,Math.ceil(bodyLength/segment));
    for(let i=count-1;i>=0;i--){
      const f=path.at(distance-i*segment), back=Math.max(tailAttach,distance-(i+1)*segment), b=path.at(back);
      const len=Math.hypot(f.x-b.x,f.y-b.y);
      const theta=Math.atan2(f.y-b.y,Math.abs(f.x-b.x))*dir;
      if(len<=1)continue;
      c.save();
      if(back<41){ c.beginPath(); c.rect(0,0,1152,d.a.y+1); c.clip(); }
      c.globalAlpha=alpha*Math.min(1,len/31);
      kazanArt(c,'body',(pulse+i)%4,f.x+dir*13,f.y,theta,dir*(len+24)/534,scale,true);
      c.restore();
    }
    c.globalAlpha=alpha*Math.min(1,(d.t-KAZAN_TAKEOFF)/280);
    kazanArt(c,'head',p>.58?1:0,front.x-dir*15,front.y,tilt*dir,dir*scale,scale);
    if(d.t-d.sparkAt>69){
      d.sparkAt=d.t;
      kazanCinders(d.impact?path.at(Math.max(0,distance-R(0,260))):front,d.impact?12:5,8);
    }
    if(!d.impact){
      trackKazanDragon(front.x+dir*Math.cos(tilt)*scale*460,front.y+Math.sin(tilt)*scale*340,1+.19*progress);
    }
    if(d.t>=KAZAN_IMPACT)d.impact=true;
    if(d.t>=KAZAN_IMPACT+400)kazanDragon=null;
  }
  c.restore();
}
// Silhueta em degraus, com as camadas quentes crescendo de dentro para fora.
function kazanBlastTongue(c,x,y,w,h,dir,alpha){
  c.save(); c.translate(x,y); c.scale(dir,1); c.globalAlpha=alpha;
  const colors=['#f64a1b','#ff9b32','#ffd56c','#fff2bf'];
  colors.forEach((color,i)=>{
    const half=w*(1-i*.2), top=h*(1-i*.17);
    c.fillStyle=color;
    c.beginPath();
    c.moveTo(-half,3);
    c.lineTo(-half,Math.round(-top*.22));
    c.lineTo(Math.round(-half*.74),Math.round(-top*.22));
    c.lineTo(Math.round(-half*.75),Math.round(-top*.56));
    c.lineTo(Math.round(-half*.35),Math.round(-top*.56));
    c.lineTo(Math.round(-half*.26),Math.round(-top*.82));
    c.lineTo(Math.round(half*.13),Math.round(-top*.82));
    c.lineTo(Math.round(half*.38),-Math.round(top));
    c.lineTo(Math.round(half*.49),Math.round(-top*.57));
    c.lineTo(Math.round(half*.8),Math.round(-top*.57));
    c.lineTo(Math.round(half*.95),Math.round(-top*.3));
    c.lineTo(half,3);
    c.closePath(); c.fill();
  });
  c.restore();
}
function kazanDragonBurst(p,targets){
  const ground={x:p.x,y:p.y+18};
  crack(ground.x,ground.y);
  shake(2.05);
  $('flash').animate([{opacity:.58},{opacity:.26,offset:.18},{opacity:0}],
    {duration:240/speed,easing:'ease-out'});
  sfx.forge('blast',()=>{sfx.heavy(); sfx.thud();});
  const vents=[{x:ground.x,y:ground.y,delay:0,w:28,h:107,dir:1}];
  for(const t of targets){
    const a=cur(t), dir=a.x<ground.x?-1:1;
    vents.push({x:a.x+dir*30,y:a.y-2,delay:.07,w:20,h:74,dir});
    crack(a.x,a.y);
    kazanSmoke(a,12);
  }
  for(const dir of [-1,1]){
    vents.push({x:ground.x+dir*127,y:ground.y+6,delay:.13,w:21,h:73,dir});
    vents.push({x:ground.x+dir*219,y:ground.y+11,delay:.23,w:15,h:53,dir});
  }
  const hotRock=['#462329','#6e3028','#ec501b','#ffa534','#ffdc79'];
  em(85,i=>{
    const angle=i*2.3999, push=R(3,12), size=R(2,7);
    return prt(ground.x,ground.y,R(-26,26),R(-12,4),Math.cos(angle)*push,-R(2,9),.29,
      R(23,49),size,R(2,6),pk(hotRock));
  });
  kazanEffect(1080,(c,k,t)=>{
    const x=ground.x/3, y=ground.y/3;
    if(k<.69){
      const glow=Math.min(1,k*28), fade=(1-k/.69)**1.4;
      const radius=14+83*glow+64*k;
      const bloom=c.createRadialGradient(x,y-24,0,x,y-24,radius);
      bloom.addColorStop(0,'#fff4c2');
      bloom.addColorStop(.28,'#ffb343db');
      bloom.addColorStop(.65,'#ff5d24a8');
      bloom.addColorStop(1,'#ff421200');
      c.save(); c.globalAlpha=fade*.75; c.fillStyle=bloom;
      c.fillRect(x-radius,y-24-radius,2*radius,2*radius); c.restore();
    }
    for(const vent of vents){
      const q=(k-vent.delay)/(1-vent.delay);
      if(q<=0||q>=1)continue;
      const rapid=Math.min(1,q*7);
      const collapse=(1-q)**.77;
      kazanPool(c,vent,vent.w*(.62+q*.65),t,(1-q)*.89);
      kazanBlastTongue(c,vent.x/3,vent.y/3,vent.w*(.65+q*.5),vent.h*rapid*collapse,vent.dir,Math.min(1,collapse*2.1));
    }
    for(let i=0;i<3;i++){
      const sweep=(k-i*.103)*1.42;
      if(sweep<=0||sweep>=1)continue;
      const travel=1-(1-sweep)**2;
      c.save(); c.globalAlpha=(1-sweep)*.92;
      c.lineWidth=1.6+(1-sweep)*2.2;
      c.strokeStyle=['#fff0a0','#ff9b32','#ff6424'][i];
      c.beginPath(); c.ellipse(x,y,4+(125-i*16)*travel,1+(25-i*5)*travel,0,0,Math.PI*2); c.stroke();
      c.restore();
    }
  });
}

const kazanPick=ts=>ts[Math.floor(Math.random()*ts.length)];
function kazanCount(side){
  for(const u of U[side]){
    if(!u.alive||!u.d.volley||u.teamHits>=KAZAN_LIMIT)continue;
    u.teamHits++;
  }
}
async function kazanReactions(){
  for(const u of U.p){
    if(result())return;
    if(u.alive&&u.d.volley&&u.teamHits===KAZAN_LIMIT){
      await gate();
      u.teamHits=0;
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
  await hitstop(105);
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
  await sleep(180);
  kazanCinders(a,16); sfx.shoot(u);
  await Promise.all(ts.map(t=>kazanFlight(u,t,a,540)));
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
  skTag(u,sk.name);
  setAnim(u,'cast',0,true); sfx.cast(u);
  await sleep(animMs(u,'cast')*.74);
  setAnim(u,'atk2',0,true);
  await sleep(300);
  sfx.jutsu(u);
  const p=kazanAnvil(u), dir=kazanDir(u);
  fxSpr(u.id,'wave',{x:p.x,y:p.y+22,sc:.72,dir,flip:dir<0});
  kazanCinders(p,19,12);
  await transitionField('forge',true,()=>setField(u,sk.field));
  log(`${nm(u)} ativa <b>${sk.name}</b> por ${sk.field} rodadas`);
}
async function kazanDragonSkill(u,sk){
  if(fieldA?.owner!==u)return;
  clearField(true,true);
  u.cd=sk.cd;
  const ts=foes(u);
  if(!ts.length){ await transitionField('forge',false,()=>showFieldScene(null)); return; }
  setAnim(u,'idle',0,true); u.ts=0;
  await cine(u,sk,ts);
  sfx.voz(u,'jutsu',.65);
  const a=kazanFramePoint(u,KAZAN_CAULDRON), ps=ts.map(cur);
  const b={x:ps.reduce((sum,p)=>sum+p.x,0)/ps.length,y:ps.reduce((sum,p)=>sum+p.y,0)/ps.length-18};
  const dir=kazanDir(u);
  const flight={a,dir,path:kazanPath(a,b,dir),t:0,sparkAt:0,impact:false};
  kazanDragon=flight;
  sfx.forge('dragon',()=>sfx.jutsu(u)); kazanCinders(a,20);
  u.kazanRecoil=-8*dir;
  u.st.animate([{translate:'0'},{translate:`${-12*dir}px 3px`,offset:.27},{translate:'0'}],
    {duration:290/speed,easing:'ease-out'});
  await sleep(290); u.kazanRecoil=0;
  while(!flight.impact){ await gate(); await sleep(28); }
  kazanDragonBurst(b,ts);
  const connected=[];
  let damage=0;
  for(const t of ts){
    const dealt=kazanHit(u,t,sk,sk.mult,'big');
    if(dealt!==null){ damage+=dealt; kazanBurn(u,t); if(t.alive)connected.push(t); }
  }
  log(`${nm(u)} solta <b>${sk.name}</b>: ${damage} de dano`);
  const primary=connected.find(t=>!t.d.immuneState);
  await hitstop(165);
  $('cam').classList.remove('tracking');
  zoomOut(true);
  await Promise.all(connected.map(t=>knock(t,sk.cause,true)));
  if(result())await finale(ts.find(t=>!t.alive)||ts[0]);
  for(const t of connected){
    if(!t.state)continue;
    if(t===primary){ endCine(); comboShow(u,t); await chain(u.side,t,1,u); }
    if(t.alive){ setState(t,null); t.el.style.zIndex=t.z; }
  }
  await sleep(205);
  await transitionField('forge',false,()=>showFieldScene(null));
}
async function kazanVolley(u,sk){
  await kazanRitual(u);
  const p=kazanFramePoint(u,[123,48]);
  let shots;
  await kazanContact(u,'fireball',p,()=>{
    sfx.forge('fireball',()=>sfx.hit(u,'atk'));
    fxSpr(u.id,'bigfire',{x:p.x,y:p.y,sc:.6,dir:kazanDir(u),flip:u.side==='e',fps:16});
    skTag(u,sk.name);
    shots=sleep(140).then(()=>kazanVolleyShots(u,sk,p)).catch(error=>({error}));
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
    await kazanFlight(u,t,from,425,true);
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
    if(sk===u.d.recast){ u.ts=1; u.kazanRecoil=0; }
    home(u);
  }
}
