// OP Planner v0.14.1 (beta)
// ===== DB =====
const DB={
  g:function(k){try{return JSON.parse(localStorage.getItem('op_'+k));}catch(e){return null;}},
  s:function(k,v){localStorage.setItem('op_'+k,JSON.stringify(v));},
  d:function(k){localStorage.removeItem('op_'+k);}
};
function gU(){return DB.g('u')||[];}
function sU(u){DB.s('u',u);}
function gC(){return DB.g('c');}
function sC(u){DB.s('c',u);}
function gS(){var u=gC();if(!u)return[];return DB.g('s_'+u.email)||[];}
function sS(s){var u=gC();if(!u)return;DB.s('s_'+u.email,s);}
function gT(){var u=gC();if(!u)return[];return DB.g('t_'+u.email)||[];}
function sT(t){var u=gC();if(!u)return;DB.s('t_'+u.email,t);}
function gP(){var u=gC();if(!u)return{};return DB.g('p_'+u.email)||{};}
function sP(p){var u=gC();if(!u)return;DB.s('p_'+u.email,p);}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}


// ===== AUTH =====
function vmail(){
  var v=document.getElementById('re').value.trim();
  var e=document.getElementById('ree');
  var ok=/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v);
  if(v&&!ok){e.textContent='E-mail inválido. Use: nome@dominio.com';e.style.display='';}
  else{e.style.display='none';}
}
function cpw(){
  var v=document.getElementById('rp').value;
  function upd(id,ok,tx){var e=document.getElementById(id);e.classList.toggle('ok',ok);e.textContent=(ok?'✓ ':'— ')+tx;}
  upd('r1',v.length>=8,'Mínimo 8 caracteres');
  upd('r2',/[A-Z]/.test(v),'Letra maiúscula');
  upd('r3',/[0-9]/.test(v),'Número');
  upd('r4',/[!@#$%^&*()\-_+=\[\]{};':"\\|,.<>/?`~]/.test(v),'Caractere especial (!@#$...)');
}
function vpw(v){
  return v.length>=8&&/[A-Z]/.test(v)&&/[0-9]/.test(v)&&/[!@#$%^&*()\-_+=\[\]{};':"\\|,.<>/?`~]/.test(v);
}
function stab(s){
  var r=s==='r';
  document.getElementById('tbl').classList.toggle('on',!r);
  document.getElementById('tbr').classList.toggle('on',r);
  document.getElementById('tsl').classList.toggle('r',r);
  document.getElementById('lf').style.display=r?'none':'';
  document.getElementById('rf').style.display=r?'':'none';
  document.getElementById('lerr').style.display='none';
  document.getElementById('rerr').style.display='none';
  document.getElementById('ree').style.display='none';
}
function hashPw(p){var h=0;for(var i=0;i<p.length;i++){h=((h<<5)-h)+p.charCodeAt(i);h|=0;}return'h'+Math.abs(h).toString(36)+p.length;}
function dologin(){
  var e=document.getElementById('le').value.trim();
  var p=document.getElementById('lp').value;
  var err=document.getElementById('lerr');
  var us=gU();
  var u=us.find(function(u){return u.email===e&&(u.pw===hashPw(p)||u.pw===p);});
  if(!u){err.textContent='E-mail ou senha incorretos.';err.style.display='';return;}
  if(u.pw===p){u.pw=hashPw(p);sU(us);}
  err.style.display='none';sC(u);init();
}
function doreg(){
  var n=document.getElementById('rn').value.trim();
  var e=document.getElementById('re').value.trim();
  var p=document.getElementById('rp').value;
  var err=document.getElementById('rerr');
  if(!n||!e||!p){err.textContent='Preencha todos os campos.';err.style.display='';return;}
  if(!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(e)){err.textContent='E-mail inválido.';err.style.display='';return;}
  if(!vpw(p)){err.textContent='A senha não atende os requisitos acima.';err.style.display='';return;}
  var us=gU();
  if(us.find(function(u){return u.email===e;})){err.textContent='E-mail já cadastrado.';err.style.display='';return;}
  var u={id:uid(),name:n,email:e,pw:hashPw(p)};
  us.push(u);sU(us);sC(u);err.style.display='none';init();setTimeout(function(){tutOpen();},400);
}
function dologout(){
  DB.d('c');
  document.getElementById('app').classList.remove('on');
  document.getElementById('auth').style.display='flex';
  toast('Até logo!','inf');
}

// ===== INIT =====
function init(){
  var u=gC();if(!u)return;
  document.getElementById('auth').style.display='none';
  document.getElementById('app').classList.add('on');
  document.getElementById('uav').textContent=u.name.charAt(0).toUpperCase();
  document.getElementById('ddn').textContent=u.name;
  document.getElementById('dde').textContent=u.email;
  document.getElementById('wn').textContent='Olá, '+u.name.split(' ')[0]+'!';
  // BUGFIX: linha 'tdt.value=tod()' removida daqui — já é definida em otmod() ao abrir o modal
  var pr=gP();
  stheme(pr.theme||'dark',true);
  scb(pr.cb||'none',true);
  autoClean();
  nav('dashboard');
}

// ===== NAVIGATION =====
var cp='', csi=null;
function nav(p){
  document.querySelectorAll('.pg').forEach(function(x){x.classList.remove('on');});
  document.querySelectorAll('.si[dp]').forEach(function(x){x.classList.remove('on');});
  var pg=document.getElementById('pg-'+p);if(pg)pg.classList.add('on');
  var sb=document.querySelector('.si[dp="'+p+'"]');if(sb)sb.classList.add('on');
  cp=p;closeDD();
  if(p==='dashboard')rdash();
  else if(p==='schedules')rschs();
  else if(p==='calendar')rcal();
  else if(p==='analytics')ranal();
}
function ref(){
  if(cp==='dashboard')rdash();
  else if(cp==='schedules')rschs();
  else if(cp==='detail')rdettl(csi);
  else if(cp==='calendar'){rcal();rcaldet();}
  else if(cp==='analytics')ranal();
  if(document.getElementById('todm').classList.contains('on'))rtodm();
}

// ===== MODAL =====
function omod(id){document.getElementById(id).classList.add('on');}
function cmod(id){document.getElementById(id).classList.remove('on');}
document.querySelectorAll('.mo').forEach(function(m){
  m.addEventListener('click',function(e){if(e.target===m&&m.id!=='tutm')m.classList.remove('on');});
});
var ccb=null;
function conf(msg,cb){document.getElementById('confmsg').textContent=msg;ccb=cb;omod('confm');}
document.getElementById('confok').addEventListener('click',function(){if(ccb)ccb();cmod('confm');ccb=null;});

// ===== DROPDOWN =====
function tdd(id){var e=document.getElementById(id),w=e.classList.contains('on');closeDD();if(!w)e.classList.add('on');}
function closeDD(){document.querySelectorAll('.dd.on').forEach(function(d){d.classList.remove('on');});}
document.addEventListener('click',function(e){if(!e.target.closest('.dd'))closeDD();});

// ===== TOAST =====
// BUGFIX: msg é escapada via esc() para prevenir XSS caso msg contenha dados do usuário
function toast(msg,type){
  type=type||'ok';
  var c={ok:'var(--ok)',err:'var(--er)',inf:'var(--ac)'};
  var ic={ok:'✓',err:'✕',inf:'i'};
  var t=document.createElement('div');
  t.className='toast '+type;
  t.innerHTML='<span style="color:'+c[type]+';font-weight:700">'+ic[type]+'</span>'+esc(msg);
  document.getElementById('tst').appendChild(t);
  setTimeout(function(){t.remove();},3200);
}

// ===== THEME =====
function stheme(t,s){
  document.documentElement.setAttribute('data-theme',t);
  var p=gP();p.theme=t;sP(p);
  var dk=document.getElementById('ddk');var dl=document.getElementById('ddl');
  if(dk)dk.classList.toggle('on',t==='dark');
  if(dl)dl.classList.toggle('on',t==='light');
  if(!s)toast('Tema alterado.','inf');
}
function scb(m,s){
  var map={none:'',deut:'deut',prot:'prot',trit:'trit',achr:'achr'};
  document.documentElement.setAttribute('data-cb',map[m]||'');
  var p=gP();p.cb=m;sP(p);
  ['none','deut','prot','trit','achr'].forEach(function(k){
    var el=document.getElementById('cb'+k);
    if(el)el.classList.toggle('on',m===k);
  });
  if(!s)toast('Paleta atualizada.','inf');
}

// ===== TIME INDICATOR =====
function ddlDate(task){
  if(!task.ddl)return null;
  var tm=task.ddltm?task.ddltm:'23:59';
  return new Date(task.ddl+'T'+tm+':00');
}
function tindState(task){
  if(!task.ddl||task.done)return'none';
  var now=new Date();
  var dl=ddlDate(task);
  if(!dl)return'none';
  if(now>dl)return'crit';
  var diff=dl-now;
  var total=24*60*60*1000*7;
  if(task.ca){
    var cr=new Date(task.ca+'T00:00:00');
    if(!isNaN(cr.getTime())){total=dl-cr;}
  }
  if(total<=0)return'crit';
  var ratio=(now-(dl-total))/total;
  if(ratio>=0.75)return'crit';
  if(ratio>=0.5)return'warn';
  return'ok';
}
function tindLabel(task){
  if(!task.ddl||task.done)return'Sem prazo';
  var now=new Date();
  var dl=ddlDate(task);
  // BUGFIX: verificação de null antes de calcular diff (evita NaN em operações subsequentes)
  if(!dl)return'Sem prazo';
  var diff=dl-now;
  if(diff<0)return'Prazo expirado!';
  var days=Math.floor(diff/86400000);
  if(days===0){
    var hrs=Math.floor((diff%86400000)/3600000);
    var mins=Math.floor((diff%3600000)/60000);
    if(hrs>0)return'Vence em '+hrs+'h '+mins+'min';
    if(mins>0)return'Vence em '+mins+' min!';
    return'Vence agora!';
  }
  if(days===1)return'Vence amanhã';
  return'Vence em '+days+' dias';
}


function gH(){var u=gC();if(!u)return[];return DB.g('h_'+u.email)||[];}
function sH(h){var u=gC();if(!u)return;DB.s('h_'+u.email,h);}
// Auto-exclusao: remove tarefas concluidas ou expiradas ha +2 dias, salvando no historico
function autoClean(){
  var u=gC();if(!u)return;
  var ts=gT();
  var now=new Date();
  var limit=2*24*60*60*1000;
  var keep=[],remove=[];
  ts.forEach(function(t){
    var shouldRemove=false;
    if(t.done){
      var ref=t.doneAt?new Date(t.doneAt):null;
      if(!ref&&t.dt){ref=new Date(t.dt+'T23:59:00');}
      if(ref&&(now-ref)>=limit)shouldRemove=true;
    } else {
      var dl=ddlDate(t);
      if(!dl&&t.dt){dl=new Date(t.dt+'T23:59:00');}
      if(dl&&(now-dl)>=limit)shouldRemove=true;
    }
    if(shouldRemove)remove.push(t);else keep.push(t);
  });
  if(!remove.length)return;
  var hist=gH();
  remove.forEach(function(t){hist.push({sid:t.sid,dt:t.dt,done:t.done,pri:t.pri,removedAt:new Date().toISOString()});});
  sH(hist);
  sT(keep);
}
// ===== TASK HTML =====
function thtml(t,ro){
  var s=gS().find(function(s){return s.id===t.sid;});
  // BUGFIX: fallback para task.pri inválido/corrompido no localStorage
  var pl={high:'Alta',medium:'Média',low:'Baixa'}[t.pri]||'Média';
  var pt={high:'tr2',medium:'to',low:'tg'}[t.pri]||'to';
  var pb={high:'ph_',medium:'pm_',low:'pl_'}[t.pri]||'pm_';
  var ist=tindState(t);
  var ilb=tindLabel(t);
  var ihtml='<div class="tind '+ist+'-t"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span class="tind-tip">'+ilb+'</span></div>';
  // Verificar se expirada e não concluída — bloquear checkbox
  var isExp=!t.done&&(function(){var dl=ddlDate(t);return dl&&dl<new Date();}());
  var tckHtml=isExp
    ?'<div class="tck tck-exp" title="Prazo expirado"><span style="font-size:10px;color:var(--er)">✕</span></div>'
    :'<div class="tck" onclick="tdone(\''+t.id+'\')">'+(t.done?'<span style="font-size:10px;color:#fff">✓</span>':'')+'</div>';
  return '<div class="ti '+(t.done?'dn':'')+(isExp?' exp':'')+'">' +
    '<div class="pbar '+pb+'"></div>' +
    tckHtml+
    '<div class="tinf">'+
      '<div class="tt">'+esc(t.title)+'</div>'+
      '<div class="tmeta">'+
        (t.dt?'<span>'+fmt(t.dt)+'</span>':'')+
        (t.tm?' <span>'+t.tm+'</span>':'')+
        (s?' <span>'+esc(s.name)+'</span>':'')+
        ' <span class="tag '+pt+'" style="padding:1px 7px;font-size:10px">'+pl+'</span>'+
      '</div>'+
    '</div>'+
    ihtml+
    (ro?'':
      '<div class="tacts">'+
        (isExp?'':'<button class="btn btng bic bsm" onclick="tedit(\''+t.id+'\')"><svg style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>')+
        '<button class="btn btng bic bsm" onclick="tdel(\''+t.id+'\')"><svg style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>'+
      '</div>'
    )+
  '</div>';
}

// ===== SCHEDULES =====
function openSchModal(){
  document.getElementById('smtit').textContent='Novo Cronograma';
  document.getElementById('eid').value='';
  document.getElementById('sn').value='';
  document.getElementById('sd').value='';
  document.getElementById('sc').value='estudos';
  document.getElementById('scol').value='blue';
  omod('schm');
}
function ssave(){
  var n=document.getElementById('sn').value.trim();
  if(!n){toast('Informe o nome.','err');return;}
  var ss=gS();
  var eid=document.getElementById('eid').value;
  var d={name:n,desc:document.getElementById('sd').value,cat:document.getElementById('sc').value,color:document.getElementById('scol').value};
  if(eid){
    var i=ss.findIndex(function(s){return s.id===eid;});
    // BUGFIX: feedback de erro quando o cronograma editado não é encontrado (id inválido)
    if(i>-1){ss[i]=Object.assign({},ss[i],d);sS(ss);toast('Cronograma atualizado.');}
    else{toast('Erro: cronograma não encontrado.','err');return;}
  }else{
    ss.push(Object.assign({id:uid()},d,{ca:tod()}));
    sS(ss);toast('Cronograma criado.');
  }
  cmod('schm');ref();
}
function oedit(){
  var s=gS().find(function(s){return s.id===csi;});
  if(!s)return;
  document.getElementById('smtit').textContent='Editar Cronograma';
  document.getElementById('eid').value=s.id;
  document.getElementById('sn').value=s.name;
  document.getElementById('sd').value=s.desc||'';
  document.getElementById('sc').value=s.cat;
  document.getElementById('scol').value=s.color;
  omod('schm');
}
function esby(id){csi=id;oedit();}
function dels(id){
  conf('Apagar este cronograma e todas as suas tarefas?',function(){
    sS(gS().filter(function(s){return s.id!==id;}));
    sT(gT().filter(function(t){return t.sid!==id;}));
    sH(gH().filter(function(h){return h.sid!==id;}));
    toast('Cronograma excluído.');nav('schedules');
  });
}
function dcs(){dels(csi);}
function osd(id){
  var s=gS().find(function(s){return s.id===id;});
  if(!s)return;
  csi=id;
  document.getElementById('dtit').textContent=s.name;
  document.getElementById('ddsc').textContent=s.desc||'Sem descrição.';
  document.getElementById('dtags').innerHTML='<span class="tag tb">'+clb(s.cat)+'</span>';
  rdettl(id);
  document.querySelectorAll('.pg').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.si[dp]').forEach(function(s){s.classList.remove('on');});
  document.getElementById('pg-detail').classList.add('on');
  cp='detail';
  closeDD();
}
function rdettl(sid){
  var ts=gT().filter(function(t){return t.sid===sid;});
  var el=document.getElementById('dettl');
  el.innerHTML=ts.length?ts.map(function(t){return thtml(t,false);}).join(''):'<div class="emp"><div class="ei">📝</div><h3>Sem tarefas</h3><p>Adicione a primeira tarefa.</p></div>';
}
function oats(){otmod(null,csi);}

// ===== TASKS =====
function onewt(){
  if(!gS().length){toast('Crie um cronograma primeiro.','err');return;}
  otmod(null,null);
}
function otmod(t,sid){
  var ss=gS();
  if(!ss.length){toast('Crie um cronograma primeiro.','err');return;}
  var sel=document.getElementById('tsch');
  var lbl=document.getElementById('tsch-lbl');
  sel.innerHTML=ss.map(function(s){return'<option value="'+s.id+'">'+esc(s.name)+'</option>';}).join('');
  if(sid){
    var sNome=(ss.find(function(s){return s.id===sid;})||{}).name||'';
    sel.style.display='none';lbl.style.display='';lbl.textContent=sNome;
  } else {
    sel.style.display='';lbl.style.display='none';
  }
  document.getElementById('tmtit').textContent=t?'Editar Tarefa':'Nova Tarefa';
  document.getElementById('etid').value=t?t.id:'';
  document.getElementById('ttit').value=t?t.title:'';
  document.getElementById('tdsc').value=t?t.desc||'':'';
  document.getElementById('tpri').value=t?t.pri:'medium';
  document.getElementById('tdt').value=t?t.dt||tod():tod();
  document.getElementById('ttm').value=t?t.tm||'':'';
  document.getElementById('tddl').value=t?t.ddl||'':'';
  document.getElementById('tddltm').value=t?t.ddltm||'':'';
  if(sid)sel.value=sid;else if(t)sel.value=t.sid;
  omod('taskm');
}
function tsave(){
  var ti=document.getElementById('ttit').value.trim();
  if(!ti){toast('Informe o título.','err');return;}
  var sid=document.getElementById('tsch').value;
  if(!sid){toast('Selecione um cronograma.','err');return;}
  var ts=gT();
  var eid=document.getElementById('etid').value;
  var d={title:ti,desc:document.getElementById('tdsc').value,sid:sid,pri:document.getElementById('tpri').value,dt:document.getElementById('tdt').value,tm:document.getElementById('ttm').value,ddl:document.getElementById('tddl').value,ddltm:document.getElementById('tddltm').value};
  if(eid){
    var i=ts.findIndex(function(t){return t.id===eid;});
    // BUGFIX: feedback de erro quando a tarefa editada não é encontrada (id inválido)
    if(i>-1){ts[i]=Object.assign({},ts[i],d);sT(ts);toast('Tarefa atualizada.');}
    else{toast('Erro: tarefa não encontrada.','err');return;}
  }else{
    ts.push(Object.assign({id:uid()},d,{done:false,ca:tod()}));
    sT(ts);toast('Tarefa criada.');
  }
  cmod('taskm');ref();
}
function tdone(id){
  var ts=gT();
  var t=ts.find(function(t){return t.id===id;});
  // Bloquear conclusão se prazo expirado e tarefa ainda não concluída
  if(t&&!t.done){
    var dl=ddlDate(t);
    if(dl&&dl<new Date()){toast('Prazo expirado — não é possível concluir.','err');return;}
  }
  if(t){t.done=!t.done;if(t.done)t.doneAt=new Date().toISOString();else delete t.doneAt;sT(ts);}
  var pt=gT().filter(function(x){return x.dt===tod()&&!x.done;}).length;
  var bdg=document.getElementById('tbdg');
  if(bdg)bdg.textContent=pt;
  ref();
}
function tdel(id){
  conf('Excluir esta tarefa?',function(){
    sT(gT().filter(function(t){return t.id!==id;}));
    toast('Tarefa excluída.');ref();
  });
}
function tedit(id){
  var t=gT().find(function(t){return t.id===id;});
  if(t)otmod(t,null);
}

// ===== DASHBOARD =====
function rdash(){
  var ts=gT(),ss=gS(),td=tod();
  var tts=ts.filter(function(x){return x.dt===td;});
  var dn=ts.filter(function(x){return x.done;}).length;
  var pt=tts.filter(function(x){return !x.done;}).length;
  document.getElementById('tbdg').textContent=pt;
  document.getElementById('dstat').innerHTML=
    '<div class="sc"><div class="sv">'+ss.length+'</div><div class="slbl">Cronogramas</div></div>'+
    '<div class="sc"><div class="sv">'+ts.length+'</div><div class="slbl">Total de tarefas</div></div>'+
    '<div class="sc"><div class="sv">'+dn+'</div><div class="slbl">Concluídas</div><div class="ssub">'+(ts.length?Math.round(dn/ts.length*100):0)+'%</div></div>'+
    '<div class="sc"><div class="sv">'+tts.length+'</div><div class="slbl">Tarefas hoje</div><div class="ssub">'+tts.filter(function(x){return x.done;}).length+' feitas</div></div>';
  var dtl=document.getElementById('dtl');
  dtl.innerHTML=tts.length?tts.slice(0,5).map(function(t){return thtml(t,false);}).join(''):'<div class="emp" style="padding:28px"><div class="ei">🎉</div><p>Sem tarefas hoje!</p></div>';
  var dr=document.getElementById('drec');
  dr.innerHTML=ss.length?'<div style="display:flex;flex-direction:column;gap:10px">'+ss.slice(-3).reverse().map(smini).join('')+'</div>':
    '<div class="emp" style="padding:28px"><div class="ei">📋</div><h3>Sem cronogramas</h3><p>Crie o primeiro!</p></div>';
}
function smini(s){
  var t=gT().filter(function(t){return t.sid===s.id;}),d=t.filter(function(t){return t.done;}).length,p=t.length?Math.round(d/t.length*100):0;
  return '<div class="card" style="padding:16px" onclick="osd(\''+s.id+'\')">'+
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-weight:700;font-size:14px">'+esc(s.name)+'</span><span class="tmut tsm">'+t.length+' tarefas</span></div>'+
    '<div class="pb"><div class="pf" style="width:'+p+'%"></div></div>'+
    '<div style="display:flex;justify-content:space-between;margin-top:6px"><span class="tag tb" style="font-size:10px">'+clb(s.cat)+'</span><span class="tsm tmut">'+p+'%</span></div>'+
  '</div>';
}

// ===== TODAY MODAL =====
function stodm(){rtodm();omod('todm');}
function rtodm(){
  var ts=gT().filter(function(t){return t.dt===tod();});
  var el=document.getElementById('todml');
  el.innerHTML=ts.length?ts.map(function(t){return thtml(t,true);}).join(''):'<div class="emp" style="padding:28px"><div class="ei">🎉</div><p>Sem tarefas hoje!</p></div>';
}

// ===== SCHEDULES PAGE =====
function rschs(){
  var q=(document.getElementById('schq')?document.getElementById('schq').value:'').toLowerCase();
  var ss=gS().filter(function(s){return !q||s.name.toLowerCase().indexOf(q)>-1||(s.desc||'').toLowerCase().indexOf(q)>-1;});
  var el=document.getElementById('schlist');
  el.innerHTML=ss.length?ss.map(scard).join(''):'<div class="emp" style="grid-column:1/-1;padding:60px"><div class="ei">📋</div><h3>Sem cronogramas</h3><p>Crie o primeiro!</p><button class="btn btnp bsm" onclick="openSchModal()">+ Criar</button></div>';
}
function scard(s){
  var t=gT().filter(function(t){return t.sid===s.id;}),d=t.filter(function(t){return t.done;}).length,p=t.length?Math.round(d/t.length*100):0;
  var ct={blue:'tb',green:'tg',orange:'to',red:'tr2',purple:'tp'}[s.color]||'tb';
  return '<div class="card" onclick="osd(\''+s.id+'\')">'+
    '<div class="chard">'+
      '<div class="cico">'+cem(s.cat)+'</div>'+
      '<div class="cmenu" onclick="event.stopPropagation()">'+
        '<button class="btn btng bic bsm" onclick="event.stopPropagation();esby(\''+s.id+'\')"><svg style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>'+
        '<button class="btn btng bic bsm" onclick="event.stopPropagation();dels(\''+s.id+'\')"><svg style="width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>'+
      '</div>'+
    '</div>'+
    '<h3>'+esc(s.name)+'</h3>'+
    '<p>'+esc(s.desc||'Sem descrição.')+'</p>'+
    '<div class="cft"><span class="tag '+ct+'">'+clb(s.cat)+'</span><span class="tsm tmut">'+t.length+' tarefas</span></div>'+
    '<div style="margin-top:10px">'+
      '<div style="display:flex;justify-content:space-between" class="tsm tmut mb2"><span>Progresso</span><span>'+p+'%</span></div>'+
      '<div class="pb"><div class="pf" style="width:'+p+'%"></div></div>'+
    '</div>'+
  '</div>';
}

// ===== CALENDAR =====
var MNS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
var cald=new Date(),csel=null;

function getFeriados(yr) {
  var a=yr%19,b=Math.floor(yr/100),c=yr%100;
  var d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25);
  var g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
  var ii=Math.floor(c/4),k=c%4,l=(32+2*e+2*ii-h-k)%7;
  var mm=Math.floor((a+11*h+22*l)/451);
  var mes=Math.floor((h+l-7*mm+114)/31);
  var dia=(h+l-7*mm+114)%31+1;
  var pascoa=new Date(yr,mes-1,dia);

  function ds(dt){return dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');}
  function add(base,days){var dt=new Date(base);dt.setDate(dt.getDate()+days);return dt;}
  function fix(mo,dy){return yr+'-'+String(mo).padStart(2,'0')+'-'+String(dy).padStart(2,'0');}

  // BUGFIX: variável renomeada de 'f' para 'fer' para evitar shadowing com 'f' do cálculo de Páscoa acima
  var fer={};
  fer[fix(1,1)]='Confraternização Universal';
  fer[fix(4,21)]='Tiradentes';
  fer[fix(5,1)]='Dia do Trabalho';
  fer[fix(9,7)]='Independência do Brasil';
  fer[fix(10,12)]='Nossa Sra. Aparecida';
  fer[fix(11,2)]='Finados';
  fer[fix(11,15)]='Proclamação da República';
  fer[fix(11,20)]='Consciência Negra';
  fer[fix(12,25)]='Natal';
  // BUGFIX: labels corrigidos — pascoa-48=segunda-feira, pascoa-47=terça-feira de carnaval
  fer[ds(add(pascoa,-48))]='Segunda de Carnaval';
  fer[ds(add(pascoa,-47))]='Terça de Carnaval';
  fer[ds(add(pascoa,-2))]='Sexta-feira Santa';
  fer[ds(pascoa)]='Páscoa';
  fer[ds(add(pascoa,60))]='Corpus Christi';
  return fer;
}

function rcal(){
  var yr=cald.getFullYear(),mo=cald.getMonth();
  document.getElementById('cml').textContent=MNS[mo]+' '+yr;
  document.getElementById('cll').innerHTML=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(function(d){return'<div class="cdl">'+d+'</div>';}).join('');
  var fd=new Date(yr,mo,1).getDay(),dm=new Date(yr,mo+1,0).getDate(),pv=new Date(yr,mo,0).getDate(),ts=gT();
  var feriados=getFeriados(yr);
  var h='';
  for(var i=fd-1;i>=0;i--)h+='<div class="cd om"><div class="cn">'+(pv-i)+'</div></div>';
  for(var d=1;d<=dm;d++){
    (function(day){
    var ds=yr+'-'+String(mo+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    var dt=ts.filter(function(t){return t.dt===ds;});
    var cv=['cb','cg','co','cp'];
    var isFer=feriados[ds];
    var evs='';
    if(isFer)evs+='<div class="cev ch">🎉 '+esc(isFer)+'</div>';
    evs+=dt.slice(0,2).map(function(t,i){return'<div class="cev '+cv[i%4]+'">'+esc(t.title)+'</div>';}).join('');
    h+='<div class="cd '+(ds===tod()?'tod':'')+' '+(ds===csel?'sel':'')+' '+(isFer?'feriado':'')+'" onclick="ssel(\''+ds+'\')"><div class="cn">'+day+'</div><div class="cevs">'+evs+'</div></div>';
    })(d);
  }
  var rm=(7-(fd+dm)%7)%7;
  for(var x=1;x<=rm;x++)h+='<div class="cd om"><div class="cn">'+x+'</div></div>';
  document.getElementById('clg').innerHTML=h;
}
function chmo(d){cald=new Date(cald.getFullYear(),cald.getMonth()+d,1);rcal();}
function ssel(ds){csel=ds;rcal();rcaldet();}
function rcaldet(){
  var el=document.getElementById('cdet');
  if(!csel){el.style.display='none';return;}
  el.style.display='';
  var yr=new Date(csel+'T12:00:00').getFullYear();
  var feriados=getFeriados(yr);
  var nomeFer=feriados[csel];
  var titulo=fmt(csel)+(nomeFer?' — 🎉 '+nomeFer:'');
  document.getElementById('cdl').textContent=titulo;
  var ts=gT().filter(function(t){return t.dt===csel;});
  var tl=document.getElementById('cdtl');
  tl.innerHTML=ts.length?ts.map(function(t){return thtml(t,false);}).join(''):'<div class="emp" style="padding:20px"><p>Sem tarefas neste dia.</p></div>';
}

// ===== ANALYTICS =====
function ranal(){
  var tsAtivas=gT(),ss=gS();
  var hist=gH();
  var tsHist=hist.map(function(h){return{sid:h.sid,dt:h.dt,done:h.done,pri:h.pri};});
  var ts=tsAtivas.concat(tsHist);
  var dn=ts.filter(function(t){return t.done;}).length,tot=ts.length;
  var pc=tot?Math.round(dn/tot*100):0;
  var hi=tsAtivas.filter(function(t){return t.pri==='high'&&!t.done;}).length;
  var tts=tsAtivas.filter(function(t){return t.dt===tod();});
  document.getElementById('astat').innerHTML=
    '<div class="sc"><div class="sv">'+pc+'%</div><div class="slbl">Taxa de conclusão</div></div>'+
    '<div class="sc"><div class="sv">'+dn+'</div><div class="slbl">Concluídas</div></div>'+
    '<div class="sc"><div class="sv">'+hi+'</div><div class="slbl">Alta prioridade pendente</div></div>'+
    '<div class="sc"><div class="sv">'+tts.length+'</div><div class="slbl">Tarefas hoje</div></div>';
  var now=new Date();
  var yr=now.getFullYear(),mo=now.getMonth();
  var diasNoMes=new Date(yr,mo+1,0).getDate();
  var meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  document.getElementById('wcht-titulo').textContent=meses[mo]+' '+yr;
  var wk=[];
  for(var i=1;i<=diasNoMes;i++){
    (function(dia){
      var ds=yr+'-'+String(mo+1).padStart(2,'0')+'-'+String(dia).padStart(2,'0');
      var dts=ts.filter(function(t){return t.dt===ds;});
      var total=dts.length;
      var done=dts.filter(function(t){return t.done;}).length;
      wk.push({l:String(dia),total:total,done:done,hoje:(dia===now.getDate())});
    })(i);
  }
  // Gráfico simples: barra verde proporcional às tarefas concluídas no dia
  var wkLen=wk.length;
  document.getElementById('wcht').innerHTML=wk.map(function(w,wIdx){
    var MAXH=148;
    var hBase=4;
    var tipCls=wIdx<3?'tip-left':wIdx>=wkLen-3?'tip-right':'';
    // dia sem tarefas: barra mínima neutra
    if(w.total===0){
      return'<div class="cbw"><div class="cbar '+tipCls+'" style="height:'+hBase+'px;background:var(--bd)" data-v="—"></div>'+(w.hoje||w.l==='1'||Number(w.l)%5===0?'<div class="clb">'+w.l+'</div>':'<div class="clb clbs">'+w.l+'</div>')+'</div>';
    }
    // dia com tarefas mas nenhuma concluída: barra mínima neutra
    if(w.done===0){
      return'<div class="cbw"><div class="cbar '+tipCls+'" style="height:'+hBase+'px;background:var(--bd)" data-v="0%"></div>'+(w.hoje||w.l==='1'||Number(w.l)%5===0?'<div class="clb">'+w.l+'</div>':'<div class="clb clbs">'+w.l+'</div>')+'</div>';
    }
    // barra verde proporcional: done/total
    var ratio=w.done/w.total;
    var alt=Math.max(Math.round(ratio*MAXH),hBase);
    var cor='var(--ok)';
    var label=Math.round(ratio*100)+'%';
    return'<div class="cbw"><div class="cbar '+tipCls+'" style="height:'+alt+'px;background:'+cor+'" data-v="'+label+'"></div>'+(w.hoje||w.l==='1'||Number(w.l)%5===0?'<div class="clb">'+w.l+'</div>':'<div class="clb clbs">'+w.l+'</div>')+'</div>';
  }).join('');
  // Pop-up de tarefas expiradas: dispara uma vez por dia ao abrir desempenho
  (function(){
    var hoje=tod();
    var expKey='op_exp_warn_'+hoje;
    if(localStorage.getItem(expKey))return;
    var expiradas=ts.filter(function(t){
      if(t.done)return false;
      var dl=ddlDate(t);
      return dl&&dl<now&&t.dt===hoje;
    });
    if(expiradas.length>0){
      localStorage.setItem(expKey,'1');
      setTimeout(function(){omod('expm');},400);
      var lista=expiradas.map(function(t){
        return'<div class="ti"><div class="pbar ph_"></div><div class="tinf"><div class="tt">'+esc(t.title)+'</div><div class="tmeta"><span style="color:var(--er);font-weight:600">Prazo expirado</span></div></div></div>';
      }).join('');
      document.getElementById('expml').innerHTML=lista;
      document.getElementById('expmsg').textContent=expiradas.length+' tarefa'+(expiradas.length>1?'s':'')+(expiradas.length>1?' não foram concluídas':' não foi concluída')+' no prazo hoje.';
    }
  })();
  var h=tsAtivas.filter(function(t){return t.pri==='high'&&!t.done;}).length;
  var m=tsAtivas.filter(function(t){return t.pri==='medium'&&!t.done;}).length;
  var l=tsAtivas.filter(function(t){return t.pri==='low'&&!t.done;}).length;
  var mp=Math.max(h,m,l,1);
  document.getElementById('pcht').innerHTML=[{lb:'Alta',n:h,c:'var(--er)'},{lb:'Média',n:m,c:'var(--wn)'},{lb:'Baixa',n:l,c:'var(--ok)'}].map(function(p){return'<div style="margin-bottom:13px"><div style="display:flex;justify-content:space-between" class="tsm mb2"><span>'+p.lb+'</span><span style="font-weight:700">'+p.n+'</span></div><div class="pb"><div style="height:100%;width:'+Math.round(p.n/mp*100)+'%;background:'+p.c+';border-radius:99px;transition:width .6s ease"></div></div></div>';}).join('');
  document.getElementById('sprog').innerHTML=ss.map(function(s){var st=ts.filter(function(t){return t.sid===s.id;});var sd=st.filter(function(t){return t.done;}).length;var sp=st.length?Math.round(sd/st.length*100):0;return'<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;align-items:center" class="tsm mb2"><span style="font-weight:600">'+esc(s.name)+'</span><span class="tmut">'+sd+'/'+st.length+' — '+sp+'%</span></div><div class="pb"><div class="pf" style="width:'+sp+'%"></div></div></div>';}).join('')||'<p class="tmut tsm">Sem cronogramas ainda.</p>';
}

// ===== HELPERS =====
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function tod(){var d=new Date();var y=d.getFullYear();var m=String(d.getMonth()+1).padStart(2,'0');var day=String(d.getDate()).padStart(2,'0');return y+'-'+m+'-'+day;}
function fmt(ds){if(!ds)return'';var p=ds.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function cem(c){return{estudos:'📚',trabalho:'💼',saude:'🏋️',pessoal:'🌱',financeiro:'💰',outro:'📌'}[c]||'📌';}
function clb(c){return{estudos:'Estudos',trabalho:'Trabalho',saude:'Saúde & Fitness',pessoal:'Pessoal',financeiro:'Financeiro',outro:'Outro'}[c]||'Outro';}

// ===== TUTORIAL =====
var TUT_STEPS=[
  {
    icon:'👋',
    title:'Bem-vindo ao OP Planner!',
    text:'Seu sistema de gerenciamento de cronogramas e tarefas. Este tutorial rápido vai te mostrar como aproveitar ao máximo a plataforma.',
    tip:'<strong>Dica:</strong> Você pode navegar pelos passos com os botões abaixo ou pular o tutorial a qualquer momento.'
  },
  {
    icon:'📋',
    title:'Crie seus Cronogramas',
    text:'Cronogramas são grupos de tarefas relacionadas. Crie um para cada área da sua vida — estudos, trabalho, saúde ou projetos pessoais.',
    tip:'<strong>Como fazer:</strong> Acesse <strong>Cronogramas</strong> na barra lateral e clique em <strong>+ Novo</strong> para começar.'
  },
  {
    icon:'✅',
    title:'Adicione Tarefas',
    text:'Dentro de cada cronograma você pode adicionar tarefas com data, horário, prioridade e prazo limite. Tarefas expiradas são removidas automaticamente após 2 dias.',
    tip:'<strong>Atenção:</strong> Tarefas com prazo expirado não podem ser concluídas — fique de olho no indicador de tempo em cada tarefa.'
  },
  {
    icon:'📅',
    title:'Use o Calendário',
    text:'Visualize todas as suas tarefas organizadas por data. Clique em qualquer dia para ver e gerenciar o que está programado para aquele momento.',
    tip:'<strong>Extra:</strong> Feriados nacionais brasileiros são marcados automaticamente no calendário.'
  },
  {
    icon:'📊',
    title:'Acompanhe seu Desempenho',
    text:'A tela de Desempenho mostra sua taxa de conclusão, gráfico mensal e progresso por cronograma. Seus dados são preservados mesmo após a limpeza automática de tarefas.',
    tip:'<strong>Pronto!</strong> Agora você já sabe tudo para começar. Bom planejamento! 🚀'
  }
];
var tutStep=0;
function tutOpen(){
  tutStep=0;
  tutRender();
  omod('tutm');
}
function tutRender(){
  var s=TUT_STEPS[tutStep];
  var last=tutStep===TUT_STEPS.length-1;
  document.getElementById('tut-body').innerHTML=
    '<div class="tut-icon">'+s.icon+'</div>'+
    '<h3>'+s.title+'</h3>'+
    '<p>'+s.text+'</p>'+
    '<div class="tut-tip">'+s.tip+'</div>';
  document.getElementById('tut-dots').innerHTML=TUT_STEPS.map(function(_,i){
    return'<div class="tut-dot'+(i===tutStep?' on':'')+'"></div>';
  }).join('');
  document.getElementById('tut-prev').style.display=tutStep===0?'none':'';
  document.getElementById('tut-next').textContent=last?'Concluir ✓':'Próximo →';
  document.getElementById('tut-skip').style.display=last?'none':'';
}
function tutNav(dir){
  if(dir===1&&tutStep===TUT_STEPS.length-1){tutSkip();return;}
  tutStep=Math.max(0,Math.min(TUT_STEPS.length-1,tutStep+dir));
  tutRender();
}
function tutSkip(){
  cmod('tutm');
}

// ===== BOOT =====
(function(){var u=gC();if(u)init();})();
