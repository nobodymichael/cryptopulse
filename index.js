const FEEDS = [
  ["CoinDesk","https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml"],
  ["Cointelegraph","https://cointelegraph.com/rss"],
  ["Decrypt","https://decrypt.co/feed"],
  ["The Block","https://www.theblock.co/rss.xml"]
];
const COINS = ["BTC","ETH","SOL","XRP","XLM","DOGE","CRO","PEPE","TRX","ADA","BNB","LINK"];
const IMPORTANT = /sec|etf|hack|exploit|lawsuit|ban |banned|approval|approved|regulation|fed |federal reserve|rate cut|rate hike|bankrupt|insolv|outage|halt|liquidat|record high|all.time high|mainnet|upgrade|acquisition|acquire|settlement|sanction|attack|stolen|million|billion/i;
const BULL = /approval|approved|inflow|adoption|partnership|launch|upgrade|record high|accumulation|bullish|rate cut/i;
const BEAR = /hack|exploit|lawsuit|ban |banned|outflow|liquidat|bankrupt|insolv|attack|stolen|fraud|investigation|rate hike/i;

function decode(s=""){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim()}
function tag(xml,name){const m=xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,"i"));return m?decode(m[1]):""}
function classify(title,desc){
 const s=(title+" "+desc).toLowerCase();const important=IMPORTANT.test(s);
 return {important,sentiment:BULL.test(s)&&!BEAR.test(s)?"bullish":BEAR.test(s)&&!BULL.test(s)?"bearish":"neutral",impact:important?"HIGH":"LOW"};
}
function symbols(text){const t=text.toUpperCase();return COINS.filter(c=>new RegExp(`(^|[^A-Z])${c}([^A-Z]|$)`).test(t) || ({BTC:/BITCOIN/,ETH:/ETHEREUM/,SOL:/SOLANA/,XRP:/RIPPLE/,XLM:/STELLAR/,DOGE:/DOGECOIN/,CRO:/CRONOS/,TRX:/TRON/}[c]||/$a/).test(t))}
async function readFeed([source,url]){
 try{
  const res=await fetch(url,{headers:{"User-Agent":"CryptoPulseAI/1.0 RSS reader"},cf:{cacheTtl:300,cacheEverything:true}});
  if(!res.ok)throw new Error("HTTP "+res.status);
  const xml=await res.text();const entries=xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>|<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi)||[];
  return entries.slice(0,20).map(x=>{
   const title=tag(x,"title");const description=tag(x,"description")||tag(x,"summary")||tag(x,"content:encoded");
   const link=tag(x,"link")||((x.match(/<link[^>]+href=["']([^"']+)/i)||[])[1]||"");
   const date=tag(x,"pubDate")||tag(x,"published")||tag(x,"updated");const c=classify(title,description);
   return {source,title,summary:description.slice(0,260),url:link,time:date?new Date(date).toISOString():"",coins:symbols(title+" "+description),...c};
  }).filter(x=>x.title);
 }catch(e){return []}
}
async function getNews(){
 const results=await Promise.all(FEEDS.map(readFeed));const all=results.flat();
 const seen=new Set();const unique=all.filter(n=>{const k=n.title.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,90);if(seen.has(k))return false;seen.add(k);return true});
 unique.sort((a,b)=>(Date.parse(b.time)||0)-(Date.parse(a.time)||0));
 return {items:unique.slice(0,60),sourcesOk:results.filter(x=>x.length).length,updatedAt:new Date().toISOString()};
}
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==="/api/news"){
   const data=await getNews();
   return new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*","Cache-Control":"public, max-age=180"}});
  }
  if(url.pathname==="/health")return Response.json({ok:true,service:"Crypto Pulse AI"});
  return new Response("Crypto Pulse API. Try /api/news",{status:200});
 },
 async scheduled(controller,env,ctx){ctx.waitUntil(getNews())}
};