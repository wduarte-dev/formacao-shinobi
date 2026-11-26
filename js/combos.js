// combos.js — previsão de perseguições (lógica pura, sem DOM). Mesma regra do chain/comboPlan em combat.js:
// o estado deixado por um golpe é perseguido pelo 1º ninja na ordem de entrada cuja perseguição pega aquele estado (sem repetir na mesma cadeia).
"use strict";
const OPEN_KIND={normal:'Básico',strong:'Forte',jutsu:'Jutsu',recast:'Jutsu'};
// golpes do time que deixam estado (abrem combo)
function comboOpeners(ids){ const out=[];
  ids.forEach(id=>{ const d=N[id]; for(const k of ['normal','strong','jutsu','recast']){ const sk=d[k]; if(!sk?.cause)continue;
    out.push({id,kind:k,label:OPEN_KIND[k],skill:sk,state:sk.cause,area:sk.target==='all'||sk.target==='row'}); } });
  return out; }
// quem persegue a partir de um estado, em ordem
function comboChain(ids,state){ const seen=new Set(), out=[]; let s=state;
  for(;;){ const id=ids.find(x=>!seen.has(x)&&N[x].chase?.on===s); if(!id)break; seen.add(id); out.push({id,on:s,cause:N[id].chase.cause}); s=N[id].chase.cause; }
  return out; }
// linhas da previsão: uma por abertura (golpes do mesmo ninja com o mesmo estado viram uma linha só), maior cadeia primeiro
function comboRows(ids){ const rows=[];
  for(const o of comboOpeners(ids)){ const chain=comboChain(ids,o.state); if(!chain.length)continue;
    const same=rows.find(r=>r.id===o.id&&r.state===o.state);
    if(same){ if(!same.kinds.includes(o.label))same.kinds.push(o.label); same.area=same.area||o.area; same.skills.push(o.skill); continue; }
    rows.push({id:o.id,state:o.state,kinds:[o.label],area:o.area,skills:[o.skill],chain}); }
  return rows.sort((a,b)=>b.chain.length-a.chain.length||ids.indexOf(a.id)-ids.indexOf(b.id)); }
// quem tem perseguição e nunca entra em nenhuma cadeia, e por quê
function comboLeftOut(ids,rows=comboRows(ids)){ const used=new Set(rows.flatMap(r=>r.chain.map(c=>c.id))), out=[];
  for(const id of ids){ const ch=N[id].chase;
    if(!ch){ if(N[id].immuneState)out.push({id,why:`${N[id].name} não persegue: imune a estados, solta Bola de Fogo a cada ${KAZAN_LIMIT} contatos do time`}); continue; }
    if(used.has(id))continue;
    const before=ids.slice(0,ids.indexOf(id)).find(x=>N[x].chase?.on===ch.on);
    out.push({id,why:before?`${N[id].name} não entra: ${N[before].name} já persegue ${ST[ch.on]} antes`:`${N[id].name} não entra: ninguém do time deixa ${ST[ch.on]}`}); }
  return out; }
// texto detalhado ao clicar numa perseguição (chances e o que faz)
function chaseDetail(id){ const d=N[id], c=d.chase; if(!c)return '';
  const L=[`<b>${c.name}</b> (${d.name})`,`Persegue ${ST[c.on]} → deixa ${ST[c.cause]}`,
    `${c.hits?c.hits.length+' golpes':'1 golpe'}, ${Math.round(c.mult*100)}% do ataque, +10% por passo do combo`];
  if(c.tsunami)L.push(`${Math.round(c.tsunami*100)}% de chance: <b>Tsunami</b>, acerta o time inteiro (60% do dano em cada um)`);
  if(c.cloneHit)L.push('Cada clone vivo do Utsushi soma um golpe extra');
  if(c.mv==='slam')L.push('Salta alto e despenca no alvo'); if(c.mv==='rise')L.push('Sobe e golpeia no ar');
  if(c.ranged)L.push('À distância, sem sair do lugar'); if(c.cast)L.push('Invoca de longe');
  return L.join('<br>'); }
// texto detalhado ao clicar numa abertura
function openerDetail(row){ const d=N[row.id];
  const L=row.skills.map(sk=>{ const k=sk===d.strong?`Forte (${Math.round(STRONG_CHANCE*100)}% por ação sem jutsu)`:sk===d.normal?'Básico':'Jutsu';
    return `<b>${sk.name}</b> · ${k} · ${TG[sk.target]||''} → ${ST[sk.cause]}${sk.split?` · ${Math.round(sk.split*100)}%: acerta todos`:''}`; });
  if(row.area)L.push('Em área: vários ficam no estado, a perseguição pega um');
  return L.join('<br>'); }
