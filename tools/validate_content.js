// Verifica os dados carregados pelo jogo sem navegador, rede ou serviços pagos.
'use strict';
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const vm=require('node:vm');
const root=join(__dirname,'..');
const context=vm.createContext({
  localStorage:{getItem:()=>null}, navigator:{}, requestAnimationFrame:()=>{},
  document:{body:{classList:{toggle(){}}},getElementById:()=>({getContext(){}})}
});
for(const name of ['data','badframes','sprites','fx']){
  vm.runInContext(readFileSync(join(root,'js',name+'.js'),'utf8'),context,{filename:name+'.js'});
}
const {N,TG,ST,FOES,ACAD_FOE,SH,V2,FXA,FXUSE}=vm.runInContext('({N,TG,ST,FOES,ACAD_FOE,SH,V2,FXA,FXUSE})',context);
const errors=[];
function check(ok,path,message){if(!ok)errors.push(path+' — '+message);}
function png(name){
  try{
    const data=readFileSync(join(root,'spr',name+'.png'));
    if(data.toString('ascii',12,16)!=='IHDR')throw Error('cabeçalho PNG inválido');
    return [data.readUInt32BE(16),data.readUInt32BE(20)];
  }catch(error){errors.push(name+' — '+error.message);return [0,0];}
}
for(const [id,unit] of Object.entries(N)){
  for(const key of ['hp','atk','def'])check(Number.isFinite(unit[key])&&unit[key]>=(key==='def'?0:1),'N.'+id+'.'+key,'atributo inválido');
  check(SH[id]?.anim.idle&&SH[id].anim.cast,'N.'+id,'idle/cast ausente');
  for(const key of ['normal','jutsu','strong','chase','recast','volley']){
    const s=unit[key], path='N.'+id+'.'+key;
    if(!s){check(!['normal','jutsu'].includes(key),path,'golpe obrigatório');continue;}
    check(typeof s.name==='string'&&s.name.length,path,'golpe sem nome');
    if(key!=='chase')check(Object.hasOwn(TG,s.target),path+'.target','alvo desconhecido');
    for(const state of ['on','cause'])if(s[state]!==undefined||key==='chase')check(Object.hasOwn(ST,s[state]),path+'.'+state,'estado desconhecido');
    if(['jutsu','recast'].includes(key)){
      for(const k of ['cost','cd'])check(Number.isInteger(s[k])&&s[k]>=0,path+'.'+k,'inteiro não negativo esperado');
    }
    if(s.hits)check(s.hits.length&&s.hits.every((x,i)=>Number.isFinite(x)&&x>=0&&x<=1&&(s.sequence||!i||x>s.hits[i-1])),path+'.hits','marcadores de contato inválidos');
    for(const action of [s.an,...(s.sequence||[]),...(s.phases||[])].filter(Boolean))check(SH[id]?.anim[action],path,'animação ausente: '+action);
  }
}
for(const [id,v] of Object.entries(V2)){
  const [w,h]=png(id+'_atlas');
  check(SH[id].W===w&&SH[id].H===h,'V2.'+id,'dimensões divergentes do PNG');
  for(const [name,[row,frames,fps,,,seq]] of Object.entries(v.a)){
    const path='V2.'+id+'.'+name;
    check(Number.isInteger(row)&&row>=0&&(row+Math.ceil(frames/(w/192)))*160<=h,path,'animação fora do atlas');
    check(Number.isInteger(frames)&&frames>0&&Number.isFinite(fps)&&fps>0,path,'quadros ou FPS inválidos');
    if(seq)check(seq.length&&seq.every(x=>Number.isInteger(x)&&x>=0&&x<frames),path,'sequência fora da animação');
  }
}
for(const [id,effect] of Object.entries(FXA)){
  const [w,h]=png(id+'_fx'), path='FXA.'+id;
  check(effect.c*288===w&&(effect.r||6)*192===h,path,'grade divergente do PNG');
  for(const [name,[row,count]] of Object.entries(effect.a))check(Number.isInteger(row)&&row>=0&&(row+1)*192<=h&&Number.isInteger(count)&&count>0&&count<=effect.c,path+'.'+name,'efeito fora da grade');
}
for(const [id,use] of Object.entries(FXUSE)){
  for(const [event,name] of Object.entries(use)){
    if(event==='psc')check(Number.isFinite(name)&&name>0,'FXUSE.'+id+'.psc','escala inválida');
    else check(FXA[id]?.a[name],'FXUSE.'+id+'.'+event,'efeito desconhecido');
  }
}
for(const mission of [...FOES,ACAD_FOE]){
  const cells=new Set();
  for(const [id,row,depth] of mission.team){
    const path='FOES.'+mission.name;
    check(Object.hasOwn(N,id),path,'ninja desconhecido: '+id);
    check([row,depth].every(x=>Number.isInteger(x)&&x>=0&&x<=2),path,'casa inválida');
    const pos=row+','+depth;
    check(!cells.has(pos),path,'casa ocupada duas vezes: '+pos);
    cells.add(pos);
  }
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
else console.log('Ninjas, missões, atlas e referências de efeitos validados.');
