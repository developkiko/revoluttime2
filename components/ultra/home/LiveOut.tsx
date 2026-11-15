"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/ultra/i18n-context";
import type { LiveDemoConfig } from "@/lib/ultra/api";

interface LiveEntry {
  id: number;
  email: string;
  item: string;
  price: number;
  time: string;
}

let globalId = 0;

const domains = [
  "gmail.com","outlook.com","yahoo.com","proton.me","mail.ru","yandex.ru",
  "icloud.com","hotmail.com","gmx.de","wp.pl","t-online.de","web.de",
  "free.fr","orange.fr","onet.pl","seznam.cz","inbox.lt","rambler.ru",
  "bk.ru","list.ru","posteo.de","fastmail.com","zoho.com","tutanota.com",
  "mail.com","live.ru",
];

const namePatternFns: Record<string, () => string> = {
  letters: () => { const c="abcdefghijklmnopqrstuvwxyz"; let s=""; for(let i=0;i<randInt(5,8);i++) s+=c[randInt(0,25)]; return s; },
  letters_digits: () => { const c="abcdefghijklmnopqrstuvwxyz"; let s=""; for(let i=0;i<randInt(4,6);i++) s+=c[randInt(0,25)]; return s+randInt(1,99); },
  short_name_digits: () => { const a=["alex","sam","max","dan","kim","leo","jay","tom","ann","eve","mia","jon","ben","rik","lin","seth","kai","ria","zak","pax"]; return a[randInt(0,a.length-1)]+randInt(1,999); },
};

const countryByPrefix: Record<string,{code:string;prefix:number}> = {
  US:{code:"US",prefix:67},DE:{code:"DE",prefix:76},GB:{code:"GB",prefix:51},FR:{code:"FR",prefix:37},
  JP:{code:"JP",prefix:126},BR:{code:"BR",prefix:177},IN:{code:"IN",prefix:103},NL:{code:"NL",prefix:83},
  IT:{code:"IT",prefix:151},ES:{code:"ES",prefix:46},SE:{code:"SE",prefix:95},PL:{code:"PL",prefix:178},
  AU:{code:"AU",prefix:101},CA:{code:"CA",prefix:99},KR:{code:"KR",prefix:121},
};

const DEFAULT_LIVE_CONFIG: Required<Pick<LiveDemoConfig, "enabled" | "show_proxy" | "show_plans" | "initial_rows" | "max_rows" | "proxy_delay_min_ms" | "proxy_delay_max_ms" | "plan_delay_min_ms" | "plan_delay_max_ms" | "flash_duration_ms" | "use_products" | "currency" | "mask_email" | "avoid_repeat_country" | "avoid_repeat_item" | "pause_when_hidden" | "domains" | "name_patterns" | "countries" | "proxy_types" | "price_min" | "price_max" | "discount_min_percent" | "discount_max_percent" | "fallback_plans">> = {
  enabled:true, show_proxy:true, show_plans:true, initial_rows:5, max_rows:5, proxy_delay_min_ms:8000, proxy_delay_max_ms:15000, plan_delay_min_ms:25000, plan_delay_max_ms:45000, flash_duration_ms:5000, use_products:true, currency:"$", mask_email:true, avoid_repeat_country:true, avoid_repeat_item:true, pause_when_hidden:true,
  domains:["gmail.com","outlook.com","yahoo.com","proton.me","mail.ru","yandex.ru","icloud.com","hotmail.com","gmx.de","wp.pl","t-online.de","web.de","free.fr","orange.fr","onet.pl","seznam.cz","inbox.lt","rambler.ru","bk.ru","list.ru","posteo.de","fastmail.com","zoho.com","tutanota.com","mail.com","live.ru"],
  name_patterns:["letters","letters_digits","short_name_digits"], countries:["US","DE","GB","FR","JP","BR","IN","NL","IT","ES","SE","PL","AU","CA","KR"],
  proxy_types:[{label:"Residential",weight:35},{label:"Mobile",weight:25},{label:"Datacenter",weight:30},{label:"ISP Static",weight:10}], price_min:0.08, price_max:0.63, discount_min_percent:10, discount_max_percent:20,
  fallback_plans:[{label_ru:"Fast 35 (35 ГБ)",label_en:"Fast 35 (35 GB)",price:35,weight:30},{label_ru:"Residential 15 (15 ГБ)",label_en:"Residential 15 (15 GB)",price:31,weight:25},{label_ru:"Mobile 10 (10 ГБ)",label_en:"Mobile 10 (10 GB)",price:39,weight:20},{label_ru:"Datacenter 95 (95 ГБ)",label_en:"Datacenter 95 (95 GB)",price:55,weight:25}],
};
type ActiveLiveConfig = typeof DEFAULT_LIVE_CONFIG & { heading_ru?: string; heading_en?: string; proxy_title_ru?: string; proxy_title_en?: string; plan_title_ru?: string; plan_title_en?: string; labels?: LiveDemoConfig["labels"] };
let activeLiveConfig: ActiveLiveConfig = DEFAULT_LIVE_CONFIG;
let recentProxyCountries: string[] = [];
let recentProxyItems: string[] = [];

type PlanPick = { label: string; price: number; weight: number };

function deriveProductProxyTypes(products: any[]): Array<{ label: string; weight: number }> {
  const grouped = new Map<string, { label: string; weight: number }>();
  products.forEach((product, index) => {
    const rawType = String(product?.type || product?.name_en || "Proxy").trim();
    const key = rawType.toLowerCase();
    const label = rawType ? rawType.charAt(0).toUpperCase() + rawType.slice(1) : "Proxy";
    const configuredWeight = Number(product?.live_weight);
    const weight = Number.isFinite(configuredWeight) ? Math.min(1000, Math.max(0, configuredWeight)) : (product?.popular ? 40 : 20 + Math.max(0, products.length - index));
    const current = grouped.get(key);
    grouped.set(key, current ? { ...current, weight: current.weight + weight } : { label, weight });
  });
  return Array.from(grouped.values());
}

/** Filled from /api/products; fallback matches DEFAULT_PRODUCTS */
let activePlans: PlanPick[] = [
  { label: "Fast 35 (35 GB)", price: 35, weight: 30 },
  { label: "Residential 15 (15 GB)", price: 31, weight: 25 },
  { label: "Mobile 10 (10 GB)", price: 39, weight: 20 },
  { label: "Datacenter 95 (95 GB)", price: 55, weight: 25 },
];

function randInt(min:number,max:number){return Math.floor(Math.random()*(max-min+1))+min;}
function pick<T>(arr:T[]):T{return arr[randInt(0,arr.length-1)];}
function weightedPick<T extends [string,number]>(arr:T[]):string{
  const total=arr.reduce((s,[,w])=>s+w,0);let r=Math.random()*total;
  for(const[v,w]of arr){r-=w;if(r<=0)return v;}return arr[0][0];
}
function makeEmail(){
  const names = activeLiveConfig.name_patterns.map((key) => namePatternFns[key]).filter(Boolean);
  const makeName = names.length ? pick(names) : namePatternFns.letters_digits;
  const domain = pick(activeLiveConfig.domains.length ? activeLiveConfig.domains : DEFAULT_LIVE_CONFIG.domains);
  const name = makeName();
  return activeLiveConfig.mask_email ? `${name.slice(0, 2)}***@${domain}` : `${name}@${domain}`;
}

function makeProxyEntry():LiveEntry{
  const allCountries = activeLiveConfig.countries.map((code) => countryByPrefix[code]).filter(Boolean);
  const availableCountries = activeLiveConfig.avoid_repeat_country ? allCountries.filter((c) => recentProxyCountries.indexOf(c.code) < 0) : allCountries;
  const c=pick((availableCountries.length ? availableCountries : allCountries).length ? (availableCountries.length ? availableCountries : allCountries) : Object.values(countryByPrefix));
  const ip=`${c.prefix}.*.*.${randInt(1,255)}`;
  const proxyType=weightedPick((activeLiveConfig.proxy_types.length ? activeLiveConfig.proxy_types : DEFAULT_LIVE_CONFIG.proxy_types).map((p) => [p.label, p.weight] as [string, number]));
  const item=`${ip} [${c.code}] ${proxyType}`;
  const base=activeLiveConfig.price_min+Math.random()*Math.max(0, activeLiveConfig.price_max-activeLiveConfig.price_min);
  const discount=randInt(Math.round(activeLiveConfig.discount_min_percent),Math.round(activeLiveConfig.discount_max_percent));
  const price=Math.round(base*(1-discount/100)*100)/100;
  recentProxyCountries = [...recentProxyCountries, c.code].slice(-5);
  if (activeLiveConfig.avoid_repeat_item) recentProxyItems = [...recentProxyItems, item].slice(-5);
  const now=new Date();
  return{id:++globalId,email:makeEmail(),item,price,
    time:`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`};
}
function weightedPlan(): PlanPick {
  const total = activePlans.reduce((s, p) => s + p.weight, 0) || 1;
  let r = Math.random() * total;
  for (const p of activePlans) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return activePlans[0];
}
function makePlanEntry(): LiveEntry {
  const plan = weightedPlan();
  const now = new Date();
  return {
    id: ++globalId,
    email: makeEmail(),
    item: plan.label,
    price: plan.price,
    time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
  };
}



const EASE:[number,number,number,number]=[0.22,0.8,0.3,1];

function LiveTable({
    entries, flashId, title, icon, colEmail, colItem, colPrice, colTime, currency, flashDurationMs,

}:{
    entries:LiveEntry[]; flashId:number|null; title:string; icon:React.ReactNode;
  colEmail:string; colItem:string; colPrice:string; colTime:string; currency:string; flashDurationMs:number;

  }){
  const th="text-left px-3 py-2 text-[11px] text-[var(--text-muted)] font-medium border-b border-[var(--border-default)] whitespace-nowrap";
  const td="px-3 py-2 text-[11px] text-[var(--text-secondary)] whitespace-nowrap";
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden">
      <div className="bg-[var(--color-primary)]/8 border-b border-[var(--border-default)] px-3 py-2">
        <span className="text-sm font-semibold text-white flex items-center gap-2">{icon} {title}</span>
      </div>
      <div className="overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>{colEmail}</th>
              <th className={th}>{colItem}</th>
              <th className={`${th} text-right`}>{colPrice}</th>
              <th className={`${th} text-right`}>{colTime}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false} mode="popLayout">
              {entries.map((e,i)=>{
                const isNew=flashId===e.id;
                return (
                  <motion.tr
                    key={e.id}
                    layout
                    initial={{opacity:0,y:-28,scale:0.98}}
                    animate={{
                      opacity:1,y:0,scale:1,
                      boxShadow: isNew
                        ? ["inset 0 0 0 0px rgba(34,197,94,0)","inset 0 0 0 1.5px rgba(34,197,94,1)","inset 0 0 0 1.5px rgba(34,197,94,0)"]
                        : "inset 0 0 0 0px rgba(34,197,94,0)",
                      backgroundColor: isNew
                        ? ["rgba(34,197,94,0)","rgba(34,197,94,0.14)","rgba(34,197,94,0)"]
                        : (i%2===0?"rgba(255,255,255,0.01)":"rgba(255,255,255,0.03)"),
                    }}
                    exit={{opacity:0,y:18}}
                    transition={{
                      layout:{duration:0.28,ease:EASE},
                      opacity:{duration:0.28},
                      y:{duration:0.28,ease:EASE},
                      scale:{duration:0.28,ease:EASE},
                      boxShadow: isNew?{duration:Math.max(0.5, flashDurationMs / 1000),times:[0,0.06,1],ease:"easeOut"}:{duration:0.2},
                      backgroundColor: isNew?{duration:Math.max(0.5, flashDurationMs / 1000),times:[0,0.06,1],ease:"easeOut"}:{duration:0.2},
                    }}
                    className="relative"
                    style={{display:"table-row"}}
                  >
                    <td className={`${td} text-[var(--text-primary)] font-medium`}>{e.email}</td>
                    <td className={`${td} text-[var(--color-primary)] font-mono`}>{e.item}</td>
                    <td className={`${td} text-right font-semibold text-[var(--color-warning)]`}>{currency}{e.price.toFixed(2)}</td>
                    <td className={`${td} text-right text-[var(--text-muted)]`}>{e.time}</td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LiveOut(){
  const {t, lang}=useI18n();
  const [mounted,setMounted]=useState(false);
  const [proxyEntries,setProxyEntries]=useState<LiveEntry[]>([]);
  const [planEntries,setPlanEntries]=useState<LiveEntry[]>([]);
  const [proxyFlash,setProxyFlash]=useState<number|null>(null);
  const [planFlash,setPlanFlash]=useState<number|null>(null);
  const proxyTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const planTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);

  const addProxy=useCallback(()=>{
    const entry=makeProxyEntry();
    setProxyEntries(prev=>[entry,...prev].slice(0,activeLiveConfig.max_rows));
    setProxyFlash(entry.id);
  },[]);
  const addPlan=useCallback(()=>{
    const entry=makePlanEntry();
    setPlanEntries(prev=>[entry,...prev].slice(0,activeLiveConfig.max_rows));
    setPlanFlash(entry.id);
  },[]);

  const scheduleProxy=useCallback(()=>{
    return setTimeout(()=>{if (!activeLiveConfig.pause_when_hidden || !document.hidden) addProxy();proxyTimerRef.current=scheduleProxy();},randInt(activeLiveConfig.proxy_delay_min_ms,activeLiveConfig.proxy_delay_max_ms));
  },[addProxy]);
  const schedulePlan=useCallback(()=>{
    return setTimeout(()=>{if (!activeLiveConfig.pause_when_hidden || !document.hidden) addPlan();planTimerRef.current=schedulePlan();},randInt(activeLiveConfig.plan_delay_min_ms,activeLiveConfig.plan_delay_max_ms));
  },[addPlan]);

  useEffect(()=>{
    let cancelled = false;
    (async () => {
      try {
        const [productsRes, configRes] = await Promise.all([
          fetch("/api/ultra/products", { cache: "no-store" }),
          fetch("/api/ultra/site-config", { cache: "no-store" }),
        ]);
        const configData = configRes.ok ? await configRes.json() : {};
        const raw = (configData.live_demo || {}) as LiveDemoConfig;
        activeLiveConfig = {
          ...DEFAULT_LIVE_CONFIG,
          ...raw,
          // Products/Tariffs is the single authoritative LIVE plan/type source.
          use_products: true,
          domains: Array.isArray(raw.domains) && raw.domains.length ? raw.domains : DEFAULT_LIVE_CONFIG.domains,
          name_patterns: Array.isArray(raw.name_patterns) && raw.name_patterns.length ? raw.name_patterns : DEFAULT_LIVE_CONFIG.name_patterns,
          countries: Array.isArray(raw.countries) && raw.countries.length ? raw.countries : DEFAULT_LIVE_CONFIG.countries,
          proxy_types: Array.isArray(raw.proxy_types) && raw.proxy_types.length ? raw.proxy_types : DEFAULT_LIVE_CONFIG.proxy_types,
          fallback_plans: Array.isArray(raw.fallback_plans) && raw.fallback_plans.length ? raw.fallback_plans : DEFAULT_LIVE_CONFIG.fallback_plans,
        };
        const data = productsRes.ok ? await productsRes.json() : {};
        const products = (data.products || []) as any[];
        if (activeLiveConfig.use_products && products.length && !cancelled) {
          activeLiveConfig.proxy_types = deriveProductProxyTypes(products);
          activePlans = products.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((p, i) => {
            const traffic = String(p[lang === "en" ? "traffic_en" : "traffic_ru"] || p.traffic_en || p.traffic_ru || "").replace(/\s+/g, " ").trim();
            const name = String(p[lang === "en" ? "name_en" : "name_ru"] || p.name_en || p.name_ru || "Plan");
            const configuredWeight = Number(p.live_weight);
            const weight = Number.isFinite(configuredWeight) ? Math.min(1000, Math.max(0, configuredWeight)) : (p.popular ? 40 : 20 + (products.length - i));
            return { label: traffic ? `${name} (${traffic})` : name, price: Number(p.price) || 0, weight };
          });
        } else {
          activePlans = activeLiveConfig.fallback_plans.map((p) => ({ label: lang === "en" ? p.label_en : p.label_ru, price: p.price, weight: p.weight }));
        }
      } catch { activePlans = DEFAULT_LIVE_CONFIG.fallback_plans.map((p) => ({ label: lang === "en" ? p.label_en : p.label_ru, price: p.price, weight: p.weight })); }
      if (cancelled) return;
      setProxyEntries(Array.from({ length: activeLiveConfig.initial_rows }, () => makeProxyEntry()));
      setPlanEntries(Array.from({ length: activeLiveConfig.initial_rows }, () => makePlanEntry()));
      setMounted(true);
      if (activeLiveConfig.enabled) {
        if (activeLiveConfig.show_proxy) proxyTimerRef.current = scheduleProxy();
        if (activeLiveConfig.show_plans) planTimerRef.current = schedulePlan();
      }
    })();
    return () => {
      cancelled = true;
      if (proxyTimerRef.current) clearTimeout(proxyTimerRef.current);
      if (planTimerRef.current) clearTimeout(planTimerRef.current);
    };
  }, [scheduleProxy, schedulePlan]);

  if(!mounted || !activeLiveConfig.enabled) return null;
  const labels = activeLiveConfig.labels || {};
  const colEmail = lang === "en" ? (labels.email_en || t("live_col_email")) : (labels.email_ru || t("live_col_email"));
  const colItem = lang === "en" ? (labels.item_en || t("live_col_item")) : (labels.item_ru || t("live_col_item"));
  const colPrice = lang === "en" ? (labels.price_en || t("live_col_price")) : (labels.price_ru || t("live_col_price"));
  const colTime = lang === "en" ? (labels.time_en || t("live_col_time")) : (labels.time_ru || t("live_col_time"));
  const heading = lang === "en" ? (activeLiveConfig.heading_en || t("live_heading")) : (activeLiveConfig.heading_ru || t("live_heading"));
  const proxyTitle = lang === "en" ? (activeLiveConfig.proxy_title_en || t("live_proxies")) : (activeLiveConfig.proxy_title_ru || t("live_proxies"));
  const planTitle = lang === "en" ? (activeLiveConfig.plan_title_en || t("live_plans")) : (activeLiveConfig.plan_title_ru || t("live_plans"));
  return (
    <div className="max-w-[var(--max-width)] mx-auto px-6 mt-16">
      <h3 className="text-center text-[1.1rem] font-bold text-[var(--text-secondary)] mb-4 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
        {heading}
      </h3>
      <div className={`grid grid-cols-1 ${activeLiveConfig.show_proxy && activeLiveConfig.show_plans ? "md:grid-cols-2" : "md:grid-cols-1"} gap-4`}>
        {activeLiveConfig.show_proxy && <LiveTable entries={proxyEntries} flashId={proxyFlash} title={proxyTitle} icon={<GlobeIcon/>} currency={activeLiveConfig.currency}
          colEmail={colEmail} colItem={colItem} colPrice={colPrice} colTime={colTime} flashDurationMs={activeLiveConfig.flash_duration_ms} />}
        {activeLiveConfig.show_plans && <LiveTable entries={planEntries} flashId={planFlash} title={planTitle} icon={<PackageIcon/>} currency={activeLiveConfig.currency}
          colEmail={colEmail} colItem={colItem} colPrice={colPrice} colTime={colTime} flashDurationMs={activeLiveConfig.flash_duration_ms} />}
      </div>
    </div>
  );
}

function GlobeIcon(){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function PackageIcon(){
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  );
}
