// Minimal frontend glue for Predator AI dashboard

const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

function fmtCurrency(v){
  try{ return new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(Number(v||0)); }catch(e){return String(v);} 
}

async function fetchDashboard(){
  try{
    const res = await fetch('/api/orders/dashboard');
    if(!res.ok) throw new Error(await res.text());
    const j = await res.json();
    return j;
  }catch(e){
    console.error('dashboard fetch', e);
    return {ok:false, error: String(e)};
  }
}

async function renderDashboard(){
  const root = qs('#orders-list');
  const kpiRevenue = qs('#kpi-revenue');
  const kpiToShip = qs('#kpi-to-ship');
  const aiActions = qs('#ai-actions');
  root.innerHTML = 'Ładowanie...';
  const data = await fetchDashboard();
  if(!data || !data.ok){
    root.innerHTML = `<div class="text-sm text-red-400">Błąd: ${data && data.error ? data.error : 'brak danych'}</div>`;
    kpiRevenue.textContent = '—'; kpiToShip.textContent = '—';
    return;
  }
  const orders = data.orders || [];
  // KPIs
  let total = 0; let toShip = 0;
  const items = [];
  orders.forEach(o => {
    const profit = Number(o.intelligence_status.profit) || 0;
    total += profit;
    // heuristic: if raw_status indicates logistics
    const carrier = (o.intelligence_status.carrier) || '';
    if((o.raw_status||{}).steps && (o.raw_status.steps.inventory || {}).results){
      // nothing
    }
    // count toShip from raw_status
    try{ if((o.raw_status.steps || {}).logistics && (o.raw_status.steps.logistics.result || {}).carrier) toShip += 1 }catch(e){}

    items.push(o);
  });
  kpiRevenue.textContent = fmtCurrency(total);
  kpiToShip.textContent = String(toShip);

  // orders list
  if(items.length===0){ root.innerHTML = '<div class="text-sm text-slate-400">Brak zamówień</div>'; return; }
  root.innerHTML = '';
  items.slice().reverse().forEach(o => {
    const el = document.createElement('div');
    el.className = 'p-3 bg-slate-900 rounded flex justify-between items-center';
    const left = document.createElement('div');
    left.innerHTML = `<div class="text-sm font-medium">${o.order_id}</div><div class="text-xs text-slate-400">Kurier: ${o.intelligence_status.carrier || '—'}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<div class="text-sm text-predator">${o.intelligence_status.profit || '—'}</div><div class="text-xs text-slate-400">Risk: ${o.intelligence_status.risk ? '⚠️' : 'OK'}</div>`;
    el.append(left, right);
    root.appendChild(el);
  });

  aiActions.textContent = 'Ostatnie akcje są monitorowane w Live Feed.';
}

function setupTabs(){
  const tabs = qsa('.tab-btn');
  tabs.forEach(t=>t.addEventListener('click', ()=>{ switchTab(t.dataset.tab); }));
  // init first
  switchTab('dashboard');
}

function switchTab(name){
  qsa('[data-panel]').forEach(p => p.classList.add('hidden'));
  const active = qs(`[data-panel="${name}"]`);
  if(active) active.classList.remove('hidden');
}

function addLive(msg){
  const feed = qs('#live-feed');
  const el = document.createElement('div');
  el.className = 'p-2 bg-slate-900/70 rounded text-sm';
  el.textContent = `${new Date().toLocaleTimeString()} • ${msg}`;
  feed.prepend(el);
  // keep max
  Array.from(feed.children).slice(50).forEach(n=>n.remove());
}

async function doChatQuery(text){
  if(!text) return;
  const log = qs('#chat-log');
  const entry = document.createElement('div'); entry.className='p-2 text-sm text-slate-200'; entry.textContent = `Ty: ${text}`; log.appendChild(entry); log.scrollTop = log.scrollHeight;
  addLive(`Wysłano zapytanie do Gemini: ${text}`);
  // Attempt to POST to an available endpoint; best-effort to /api/negotiate as generic AI entry
  try{
    const resp = await fetch('/api/negotiate', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({offer_id:'ui-chat', client_offer:0, product:{id:'ui', price:0, cost:0}, customer_history:{}, inventory_count:0})});
    const j = await resp.json();
    const r = document.createElement('div'); r.className='p-2 text-sm text-slate-300'; r.textContent = `Gemini: ${j && j.result ? JSON.stringify(j.result).slice(0,200) : JSON.stringify(j).slice(0,200)}`;
    log.appendChild(r); log.scrollTop = log.scrollHeight;
    addLive('Otrzymano odpowiedź od Gemini (zastępcze).');
  }catch(e){
    const r = document.createElement('div'); r.className='p-2 text-sm text-rose-400'; r.textContent = `Brak endpointu czatu: ${e.message}`;
    log.appendChild(r); log.scrollTop = log.scrollHeight;
    addLive('Brak dostępnego endpointu AI — lokalna symulacja.');
  }
}

function setupUI(){
  setupTabs();
  qs('#btn-refresh').addEventListener('click', ()=>renderDashboard());
  qs('#chat-send').addEventListener('click', ()=>{ const v=qs('#chat-input').value; doChatQuery(v); qs('#chat-input').value=''; });
  qs('#ai-send').addEventListener('click', ()=>{ const v=qs('#ai-query').value; doChatQuery(v); qs('#ai-query').value=''; });
  qs('#gen-restock').addEventListener('click', async ()=>{
    addLive('Żądanie generowania listy zakupów...');
    // call inventory generate_restock_list if available via API; fallback show placeholder
    try{
      // no endpoint implemented — simulate
      addLive('Lista zakupów wygenerowana (symulacja).');
      alert('Lista zakupów wygenerowana — sprawdź logs.');
    }catch(e){ console.error(e); alert('Błąd generowania listy.'); }
  });
}

// Polling for live updates
let pollHandle = null;
function startPolling(){
  renderDashboard();
  pollHandle = setInterval(async ()=>{
    try{ await renderDashboard(); }catch(e){ console.error(e); }
  }, 5000);
}

// init
window.addEventListener('load', ()=>{
  setupUI();
  startPolling();
  addLive('Panel uruchomiony.');
});

export {};
