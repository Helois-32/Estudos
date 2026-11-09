const $=s=>document.querySelector(s),V=$('#view');
let S=JSON.parse(localStorage.getItem('saber')||'{}');
S.done=S.done||{};S.fav=S.fav||{};S.notes=S.notes||{};S.hist=S.hist||[];S.cron=S.cron||{};S.flash=S.flash||{};
const save=()=>localStorage.setItem('saber',JSON.stringify(S));
const sub=id=>SUBJECTS.find(s=>s.id===id),key=(s,i)=>s+'-'+i;
const ALL=SUBJECTS.flatMap(s=>s.topics.map((t,i)=>({...t,s,i,k:key(s.id,i)})));
const log=txt=>{S.hist.unshift({txt,d:new Date().toLocaleString('pt-BR'),k:Date.now()});S.hist=S.hist.slice(0,60);save()};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pct=()=>Math.round(Object.keys(S.done).length/ALL.length*100);
const DIAS=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const card=t=>{const m=sub(t.s);return `<a class="card" style="--c:${m.cor}" href="#/t/${t.s}/${t.i}"><span class="tag">${m.nome} · ${t.n}</span><h3 style="margin-top:8px">${S.done[t.k]?'✅ ':''}${t.t}</h3></a>`};

/* tema e menu */
document.documentElement.dataset.theme=S.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
$('#theme').onclick=()=>{const d=document.documentElement;d.dataset.theme=d.dataset.theme==='dark'?'light':'dark';S.theme=d.dataset.theme;save()};
$('#burger').onclick=()=>$('#side').classList.toggle('open');
$('#nav').innerHTML=`<a href="#/">🏠 Início</a><b>Disciplinas</b>`+SUBJECTS.map(s=>`<a href="#/m/${s.id}">${s.ic} ${s.nome}</a>`).join('')+
`<b>Ferramentas</b><a href="#/flash">🃏 Flashcards</a><a href="#/quiz">❓ Questionários</a><a href="#/sim">📝 Simulados</a><a href="#/rev">🔁 Revisão</a><a href="#/crono">🗓️ Cronograma</a><a href="#/fav">⭐ Favoritos</a><a href="#/hist">🕘 Histórico</a><a href="#/notas">🗒️ Anotações</a><b>ENEM</b><a href="#/enem">🎯 Preparação ENEM</a><a href="#/treino">⚡ Treino (Pretexto)</a>`;

/* busca */
$('#q').oninput=e=>{const v=e.target.value.trim().toLowerCase(),r=$('#res');if(!v){r.style.display='none';return}
 const n=x=>x.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),nv=n(v);
 const hits=[...SUBJECTS.filter(s=>n(s.nome).includes(nv)).map(s=>`<a href="#/m/${s.id}">${s.ic} ${s.nome}</a>`),
 ...ALL.filter(t=>n(t.t+t.e+t.d.map(d=>d[0]).join()).includes(nv)).slice(0,8).map(t=>`<a href="#/t/${t.s}/${t.i}">${sub(t.s).ic} ${t.t} <span class="mut">— ${sub(t.s).nome}</span></a>`)];
 r.innerHTML=hits.join('')||'<a>Nada encontrado. Tente outro termo.</a>';r.style.display='block'};
document.addEventListener('click',e=>{if(!e.target.closest('.search'))$('#res').style.display='none';if(e.target.closest('#nav a'))$('#side').classList.remove('open')});

/* páginas */
function home(){
 const p=pct(),rec=ALL.filter(t=>!S.done[t.k]).slice(0,4),pop=['mat-1','bio-1','his-0','red-0'].map(k=>ALL.find(t=>t.k===k)).filter(Boolean);
 V.innerHTML=`<div class="hero"><h1>Estude tudo em um só lugar.</h1><p>Explicações, resumos, flashcards, questões e preparação para o ENEM. Do básico ao avançado.</p><div class="bar"><i style="width:${p}%"></i></div><p style="margin:8px 0 0">Progresso geral: <b>${p}%</b> (${Object.keys(S.done).length} de ${ALL.length} assuntos)</p></div>
 <h2>Disciplinas</h2><div class="grid">${SUBJECTS.map(s=>`<a class="card" style="--c:${s.cor}" href="#/m/${s.id}"><div class="ic">${s.ic}</div><h3>${s.nome}</h3><span class="mut">${s.topics.length} assunto(s)</span></a>`).join('')}</div>
 <h2>Conteúdos populares</h2><div class="grid">${pop.map(card).join('')}</div>
 <h2>Estudos recentes</h2>${S.hist.length?`<div class="grid">${[...new Set(S.hist.filter(h=>h.txt.startsWith('Estudou')).map(h=>h.txt))].slice(0,4).map(t=>`<div class="card">${esc(t)}</div>`).join('')||'<p class="mut">Abra um assunto para começar.</p>'}</div>`:'<p class="mut">Nada por aqui ainda. Abra um assunto para começar.</p>'}
 <h2>Recomendados para você</h2><div class="grid">${rec.length?rec.map(card).join(''):'<p class="mut">Você concluiu todos os assuntos. Faça um simulado.</p>'}</div>`}

function materia(id){const m=sub(id);if(!m)return nf();
 const lv=['Básico','Intermediário','Avançado'];
 V.innerHTML=`<div class="ic" style="--c:${m.cor}">${m.ic}</div><h1>${m.nome}</h1><p class="mut">Assuntos organizados do básico ao avançado.</p>
 ${lv.map(l=>{const ts=ALL.filter(t=>t.s===id&&t.n===l);return ts.length?`<h2>${l}</h2><div class="grid">${ts.map(card).join('')}</div>`:''}).join('')}
 <h2>Pratique</h2><div class="row"><a class="btn pri" href="#/quiz/${id}">Questionário</a><a class="btn" href="#/flash/${id}">Flashcards</a><a class="btn" href="#/sim/${id}">Simulado</a></div>
 <p class="mut" style="margin-top:20px">Mais assuntos podem ser adicionados em <code>js/data.js</code>.</p>`}

function assunto(id,i){const t=ALL.find(x=>x.k===key(id,i));if(!t)return nf();const m=sub(id);log('Estudou: '+t.t);
 V.innerHTML=`<a class="mut" href="#/m/${id}">← ${m.nome}</a><h1>${t.t}</h1><span class="tag">${t.n}</span>
 <div class="row" style="margin:12px 0"><button id="fv">${S.fav[t.k]?'⭐ Favoritado':'☆ Favoritar'}</button><button id="dn" class="${S.done[t.k]?'':'pri'}">${S.done[t.k]?'✅ Concluído':'Marcar como concluído'}</button></div>
 <h2>Explicação</h2><p>${t.e}</p><h2>Definições importantes</h2><ul>${t.d.map(d=>`<li><b>${d[0]}:</b> ${d[1]}</li>`).join('')}</ul>
 <h2>Exemplo prático</h2><div class="box g">${t.x}</div><h2>Resumo para revisão</h2><div class="box">${t.r}</div><h2>Atenção</h2><div class="box w">${t.a}</div>
 <h2>Suas anotações</h2><textarea id="nt" rows="4" placeholder="Escreva suas anotações…">${esc(S.notes[t.k]||'')}</textarea>
 <h2>Pratique</h2><div class="row"><a class="btn pri" href="#/quiz/${id}">Questões de ${m.nome}</a><a class="btn" href="#/flash/${id}">Flashcards</a></div>`;
 $('#fv').onclick=()=>{S.fav[t.k]?delete S.fav[t.k]:S.fav[t.k]=1;save();assunto(id,i)};
 $('#dn').onclick=()=>{S.done[t.k]?delete S.done[t.k]:S.done[t.k]=Date.now();save();assunto(id,i)};
 $('#nt').oninput=e=>{S.notes[t.k]=e.target.value;save()}}

function quiz(list,title,back){let i=0,ok=0;list=[...list].sort(()=>Math.random()-.5);
 (function show(){if(i>=list.length){log(`${title}: ${ok}/${list.length} acertos`);V.innerHTML=`<h1>${title}</h1><div class="card"><h2 style="margin-top:0">${ok} de ${list.length} acertos (${Math.round(ok/list.length*100)}%)</h2><a class="btn pri" href="${back}">Refazer</a></div>`;return}
 const q=list[i];V.innerHTML=`<h1>${title}</h1><p class="mut">Questão ${i+1} de ${list.length} · ${sub(q.s).nome}</p><div class="card"><p><b>${q.q}</b></p>${q.o.map((o,j)=>`<button class="opt" data-j="${j}">${String.fromCharCode(65+j)}) ${o}</button>`).join('')}<div id="fb"></div></div>`;
 V.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const j=+b.dataset.j;if(j===q.c)ok++;V.querySelectorAll('.opt').forEach((x,k)=>{x.disabled=true;if(k===q.c)x.classList.add('ok');else if(k===j)x.classList.add('no')});
  $('#fb').innerHTML=`<div class="box">${q.x}</div><button class="pri" id="nx">${i+1<list.length?'Próxima':'Ver resultado'}</button>`;$('#nx').onclick=()=>{i++;show()}})})()}
const qs=id=>QUESTOES.filter(q=>!id||q.s===id);
const picker=(rota,tit)=>V.innerHTML=`<h1>${tit}</h1><div class="grid"><a class="card" href="#/${rota}/all">Todas as matérias</a>${SUBJECTS.map(s=>`<a class="card" style="--c:${s.cor}" href="#/${rota}/${s.id}">${s.ic} ${s.nome}</a>`).join('')}</div>`;

function flash(id){if(!id)return picker('flash','Flashcards');
 const cards=ALL.filter(t=>id==='all'||t.s===id).flatMap(t=>t.d.map((d,j)=>({k:t.k+'-'+j,f:d[0],b:d[1],s:t.s}))).sort(()=>Math.random()-.5);let i=0,back=false;
 (function show(){const c=cards[i%cards.length];V.innerHTML=`<h1>Flashcards</h1><p class="mut">${i%cards.length+1} de ${cards.length} · ${sub(c.s).nome}. Clique no cartão para virar.</p><div class="card flash" id="fc" tabindex="0">${back?c.b:`<b>${c.f}</b>`}</div><div class="row" style="margin-top:12px"><button id="no">Revisar depois</button><button id="yes" class="pri">Sabia</button></div>`;
 const flip=()=>{back=!back;show()};$('#fc').onclick=flip;$('#fc').onkeydown=e=>{if(e.key==='Enter'||e.key===' ')flip()};
 const go=v=>{S.flash[c.k]=v;save();back=false;i++;show()};$('#yes').onclick=()=>go(1);$('#no').onclick=()=>go(0)})()}

function revisao(){const dias=3*864e5,old=ALL.filter(t=>S.done[t.k]&&Date.now()-S.done[t.k]>dias),fl=ALL.flatMap(t=>t.d.map((d,j)=>({k:t.k+'-'+j,f:d[0],b:d[1],s:t.s}))).filter(c=>S.flash[c.k]===0);
 V.innerHTML=`<h1>Revisão</h1><h2>Assuntos concluídos há mais de 3 dias</h2><div class="grid">${old.map(card).join('')||'<p class="mut">Nenhum assunto pendente de revisão.</p>'}</div><h2>Flashcards marcados para revisar</h2>${fl.map(c=>`<div class="card" style="margin:8px 0"><b>${c.f}</b><br>${c.b}</div>`).join('')||'<p class="mut">Nenhum flashcard marcado.</p>'}`}

function crono(){V.innerHTML=`<h1>Cronograma de estudos</h1><div class="row" style="margin-bottom:14px"><select id="cd" style="width:auto">${DIAS.map((d,i)=>`<option value="${i}">${d}</option>`).join('')}</select><select id="cs" style="width:auto">${SUBJECTS.map(s=>`<option>${s.nome}</option>`).join('')}</select><input id="ct" placeholder="O que estudar (ex.: 1h de exercícios)" style="flex:1;min-width:180px"><button class="pri" id="ca">Adicionar</button></div>
 <div class="days">${DIAS.map((d,i)=>`<div class="card"><b>${d}</b>${(S.cron[i]||[]).map((x,j)=>`<div class="item"><input type="checkbox" style="width:auto" data-d="${i}" data-j="${j}" ${x.ok?'checked':''}><span style="${x.ok?'text-decoration:line-through':''}"><b>${x.s}</b> ${esc(x.t)}</span><button data-r="${i}-${j}" style="padding:0 6px">×</button></div>`).join('')}</div>`).join('')}</div>`;
 $('#ca').onclick=()=>{const d=$('#cd').value;(S.cron[d]=S.cron[d]||[]).push({s:$('#cs').value,t:$('#ct').value});save();crono()};
 V.querySelectorAll('input[type=checkbox]').forEach(c=>c.onchange=()=>{S.cron[c.dataset.d][c.dataset.j].ok=c.checked;save();crono()});
 V.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{const[d,j]=b.dataset.r.split('-');S.cron[d].splice(j,1);save();crono()})}

function favs(){const f=ALL.filter(t=>S.fav[t.k]);V.innerHTML=`<h1>Favoritos</h1><div class="grid">${f.map(card).join('')||'<p class="mut">Toque em ☆ dentro de um assunto para salvá-lo aqui.</p>'}</div>`}
function hist(){V.innerHTML=`<h1>Histórico de estudos</h1>${S.hist.map(h=>`<div class="card" style="margin:8px 0">${esc(h.txt)} <span class="mut">· ${h.d}</span></div>`).join('')||'<p class="mut">Sem registros ainda.</p>'}<button id="lh" style="margin-top:12px">Limpar histórico</button>`;$('#lh').onclick=()=>{S.hist=[];save();hist()}}
function notas(){const n=ALL.filter(t=>S.notes[t.k]);V.innerHTML=`<h1>Minhas anotações</h1>${n.map(t=>`<a class="card" href="#/t/${t.s}/${t.i}" style="margin:8px 0"><b>${t.t}</b><br>${esc(S.notes[t.k])}</a>`).join('')||'<p class="mut">Suas anotações aparecem aqui. Escreva nelas dentro de qualquer assunto.</p>'}`}

function enem(){V.innerHTML=`<h1>🎯 Preparação para o ENEM</h1><p>O ENEM tem 180 questões objetivas (45 por área) e uma redação, aplicadas em dois domingos. Fonte: Inep/MEC.</p>
 <div class="row"><a class="btn pri" href="#/sim/all">Simulado ENEM</a><a class="btn" href="#/treino">Treino com questões reais (Pretexto)</a></div>
 <h2>Áreas de conhecimento e matriz</h2><div class="grid">${AREAS.map(a=>`<div class="card"><h3>${a[0]}</h3><p class="mut">${a[1]}</p></div>`).join('')}</div>
 <h2>Assuntos mais cobrados por disciplina</h2>${SUBJECTS.map(s=>`<div class="card" style="margin:8px 0;--c:${s.cor}"><b>${s.ic} ${s.nome}</b><br><span class="mut">${s.enem}</span> <a href="#/m/${s.id}" class="tag">Estudar</a></div>`).join('')}
 <h2>As 5 competências da redação (200 pontos cada, total 1000)</h2><ul>${COMPETENCIAS.map(c=>`<li><b>Competência ${c[0]}:</b> ${c[1]}</li>`).join('')}</ul>
 <div class="box w">Redação zerada: fuga total ao tema, não atender ao tipo dissertativo-argumentativo, até 7 linhas, cópia dos textos motivadores, desrespeito aos direitos humanos, partes desconectadas, etc.</div>
 <h2>Como interpretar uma questão</h2><ul><li>Leia o enunciado e o comando (o que se pede) antes dos textos de apoio.</li><li>Sublinhe palavras como "exceto", "incorreto", "principalmente".</li><li>Os textos de apoio trazem dados: use-os em vez de decidir pela memória.</li><li>Elimine alternativas absolutas ("sempre", "nunca") e as que fogem do comando.</li><li>Em Matemática, confira as unidades e o que a questão pede (valor, porcentagem ou variação).</li></ul>`}
function treino(){V.innerHTML=`<h1>⚡ Treino para o ENEM — Pretexto</h1><p class="mut">Plataforma parceira para praticar. Se a janela abaixo não carregar, abra em nova aba.</p><p><a class="btn pri" target="_blank" rel="noopener" href="https://pretexto.vercel.app/">Abrir Pretexto em nova aba</a></p><iframe src="https://pretexto.vercel.app/" title="Pretexto — treino para o ENEM" loading="lazy"></iframe>`}
const nf=()=>V.innerHTML='<h1>Página não encontrada</h1><a class="btn pri" href="#/">Voltar ao início</a>';

function route(){const[,r,a,b]=location.hash.split('/');window.scrollTo(0,0);
 ({undefined:home,'':home,m:()=>materia(a),t:()=>assunto(a,b),flash:()=>flash(a),quiz:()=>a?quiz(qs(a==='all'?0:a),'Questionário','#/quiz/'+a):picker('quiz','Questionários'),
 sim:()=>a?quiz(qs(a==='all'?0:a),'Simulado','#/sim/'+a):picker('sim','Simulados'),rev:revisao,crono,fav:favs,hist,notas,enem,treino}[r]||nf)();
 document.querySelectorAll('#nav a').forEach(x=>x.classList.toggle('on',x.getAttribute('href')===location.hash))}
addEventListener('hashchange',route);route();
