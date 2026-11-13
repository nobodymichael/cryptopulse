const API_URL = ""; // Wklej adres wdrożonego Cloudflare Workera, np. https://crypto-pulse-api.twojlogin.workers.dev
const COINS = ["BTC","ETH","SOL","XRP","XLM","DOGE","CRO","PEPE","TRX","ADA","BNB","LINK"];
const demoNews = [
 {source:"Crypto Pulse • demo",time:"Teraz",title:"Crypto Pulse AI czeka na podłączenie źródeł wiadomości",summary:"To ekran startowy aplikacji. Po wdrożeniu Workera pojawią się tutaj aktualne nagłówki z kanałów RSS, polskie streszczenia i ocena wpływu na rynek.",sentiment:"neutral",impact:"INFO",coins:["BTC","ETH","SOL"],important:false,url:"https://www.coindesk.com/"},
 {source:"Konfiguracja",time:"Start",title:"Twoja watchlista jest gotowa do personalizacji",summary:"Domyślnie obserwujemy BTC, ETH, SOL, XRP, XLM, DOGE i CRO. Możesz zmienić listę przyciskiem EDYTUJ.",sentiment:"bullish",impact:"SETUP",coins:["BTC","ETH","SOL","XRP","XLM","DOGE","CRO"],important:false,url:"#"}
];
let news = demoNews;
let filter = "all";
let watchlist = JSON.parse(localStorage.getItem("cpai-watchlist") || '["BTC","ETH","SOL","XRP","XLM","DOGE","CRO"]');
const $ = s => document.querySelector(s);

function renderWatchlist(){
 $("#watchlist").innerHTML = watchlist.map(c=>`<div class="coin-chip"><b>${c}</b><span>WATCHING</span></div>`).join("");
}
function renderNews(){
 const items = news.filter(n => filter==="important" ? n.important : filter==="watchlist" ? n.coins?.some(c=>watchlist.includes(c)) : true);
 $("#newsList").innerHTML = items.map(n=>`<article class="news-card">
   <div class="news-meta"><span>${escapeHTML(n.source||"Źródło")}</span><span>•</span><span>${escapeHTML(n.time||"")}</span><span class="tag ${n.sentiment||"neutral"}">${n.sentiment==="bullish"?"BULLISH":n.sentiment==="bearish"?"BEARISH":"NEUTRAL"}</span></div>
   <h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.summary||"Otwórz źródło, aby przeczytać więcej.")}</p>
   <div class="news-footer"><div class="coin-tags">${(n.coins||[]).slice(0,5).map(c=>`<span>${escapeHTML(c)}</span>`).join("")}</div><a class="read-link" href="${safeURL(n.url)}" target="_blank" rel="noopener">CZYTAJ ↗</a></div>
 </article>`).join("") || '<div class="status">Brak wiadomości w tej kategorii.</div>';
 $("#newsCount").textContent = news.length;
 $("#importantCount").textContent = news.filter(n=>n.important).length;
}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function safeURL(s=""){try{const u=new URL(s);return ["https:","http:"].includes(u.protocol)?u.href:"#"}catch{return "#"}}
async function loadNews(){
 $("#status").textContent = "Pobieranie najnowszych wiadomości…";
 if(!API_URL){$("#status").textContent="Tryb startowy — podłącz Cloudflare Worker, aby pobierać aktualne newsy.";renderNews();return}
 try{
  const r=await fetch(`${API_URL.replace(/\/$/,"")}/api/news`,{cache:"no-store"});
  if(!r.ok) throw new Error(`HTTP ${r.status}`);
  const data=await r.json();news=data.items||[];$("#updatedAt").textContent="AKTUALIZACJA "+new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"});$("#status").textContent=`Źródła: ${data.sourcesOk||0} • Ostatnie pobranie: ${$("#updatedAt").textContent}`;renderNews();
 }catch(e){$("#status").textContent="Nie udało się pobrać newsów. Sprawdź konfigurację API.";renderNews()}
}
$("#refreshBtn").addEventListener("click",loadNews);
$("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;filter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderNews()});
$("#editWatchlist").addEventListener("click",()=>{$("#coinChoices").innerHTML=COINS.map(c=>`<label class="coin-choice"><input type="checkbox" value="${c}" ${watchlist.includes(c)?"checked":""}>${c}</label>`).join("");$("#watchlistDialog").showModal()});
$("#saveWatchlist").addEventListener("click",()=>{watchlist=[...document.querySelectorAll("#coinChoices input:checked")].map(x=>x.value);localStorage.setItem("cpai-watchlist",JSON.stringify(watchlist));renderWatchlist();$("#watchlistDialog").close();renderNews()});
$("#pushBtn").addEventListener("click",async()=>{
 if(!("Notification" in window)){ $("#pushStatus").textContent="Ta przeglądarka nie obsługuje powiadomień.";return}
 if(!window.matchMedia("(display-mode: standalone)").matches && !navigator.standalone){$("#pushStatus").textContent="Najpierw dodaj aplikację do ekranu początkowego: Safari → Udostępnij → Do ekranu początkowego.";return}
 const p=await Notification.requestPermission();
 $("#pushStatus").textContent=p==="granted"?"Zgoda udzielona. Do odbierania alertów potrzebna jest jeszcze konfiguracja serwera Web Push.": "Nie przyznano zgody na powiadomienia.";
});
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderWatchlist();renderNews();loadNews();