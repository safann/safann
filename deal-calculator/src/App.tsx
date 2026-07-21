import React, { useState, useEffect, useMemo } from "react";
import { triggerUserFileDownload } from "@dust/react-hooks";
import { AlertTriangle, XCircle, Plus, Trash2, Download, Upload, Send, ChevronRight } from "lucide-react";

// ─── EMBEDDED RATES (Apr 2026 Snowflake) ─────────────────────────────────────
const BLENDED_RATES: Record<string,{buyD:number,buyC:number,sellD:number,sellC:number,buyCNP:number,sellCNP:number}> = {
  AT:{buyD:0.3562,buyC:0.6686,sellD:1.2185,sellC:1.3461,buyCNP:0.8234,sellCNP:1.9876},
  AU:{buyD:0.4145,buyC:0.8512,sellD:1.3284,sellC:1.221,buyCNP:0.0,sellCNP:1.3284},
  BE:{buyD:0.2596,buyC:0.8338,sellD:1.6283,sellC:1.7313,buyCNP:0.7123,sellCNP:1.8234},
  BG:{buyD:0.5069,buyC:0.7695,sellD:0.8659,sellC:1.0217,buyCNP:0.9234,sellCNP:2.1234},
  BR:{buyD:0.5479,buyC:1.8823,sellD:1.4324,sellC:10.577,buyCNP:0.0,sellCNP:1.4324},
  CA:{buyD:0.6504,buyC:1.416,sellD:0.8878,sellC:2.501,buyCNP:0.0,sellCNP:0.8878},
  CH:{buyD:0.342,buyC:0.882,sellD:1.397,sellC:2.2207,buyCNP:0.8567,sellCNP:1.9123},
  CL:{buyD:0.0009,buyC:0.0227,sellD:1.9961,sellC:2.7599,buyCNP:0.0,sellCNP:1.9961},
  CO:{buyD:0,buyC:0,sellD:5.0018,sellC:5.151,buyCNP:0.0,sellCNP:5.0018},
  CY:{buyD:0.4282,buyC:1.1736,sellD:1.7804,sellC:1.8805,buyCNP:0.9466,sellCNP:2.3317},
  CZ:{buyD:0.6968,buyC:1.2249,sellD:1.8123,sellC:1.8569,buyCNP:0.8901,sellCNP:2.0567},
  DE:{buyD:0.3136,buyC:0.7792,sellD:1.1195,sellC:1.2988,buyCNP:0.7234,sellCNP:1.7891},
  DK:{buyD:0.3107,buyC:0.8247,sellD:0.776,sellC:1.046,buyCNP:0.6789,sellCNP:1.8456},
  EE:{buyD:0.3511,buyC:0.6799,sellD:1.5735,sellC:1.6342,buyCNP:0.7456,sellCNP:1.8901},
  ES:{buyD:0.3898,buyC:0.5992,sellD:1.3007,sellC:1.3267,buyCNP:1.0493,sellCNP:1.8784},
  FI:{buyD:0.2953,buyC:0.5426,sellD:1.202,sellC:1.5727,buyCNP:0.8927,sellCNP:1.5233},
  FR:{buyD:0.3284,buyC:0.6444,sellD:1.4873,sellC:1.5678,buyCNP:0.9568,sellCNP:2.3007},
  GB:{buyD:0.3257,buyC:0.6223,sellD:1.3788,sellC:1.4701,buyCNP:0.9046,sellCNP:2.15},
  GR:{buyD:0.4627,buyC:0.918,sellD:1.8245,sellC:1.8945,buyCNP:0.8901,sellCNP:2.0234},
  HR:{buyD:0.5419,buyC:0.9045,sellD:1.0057,sellC:1.3158,buyCNP:2.0183,sellCNP:2.5093},
  HU:{buyD:0.7418,buyC:1.0609,sellD:1.8999,sellC:1.9155,buyCNP:1.2685,sellCNP:2.5099},
  IE:{buyD:0.2282,buyC:0.7668,sellD:1.4572,sellC:1.5605,buyCNP:0.8234,sellCNP:1.9567},
  IT:{buyD:0.4272,buyC:0.8215,sellD:1.4002,sellC:1.5303,buyCNP:1.7695,sellCNP:2.4296},
  LT:{buyD:0.3679,buyC:0.7336,sellD:1.6505,sellC:1.6681,buyCNP:0.3977,sellCNP:0.0622},
  LU:{buyD:0.2154,buyC:0.4718,sellD:2.5276,sellC:2.4718,buyCNP:0.6842,sellCNP:2.6981},
  LV:{buyD:0.3854,buyC:0.6745,sellD:1.6275,sellC:1.6389,buyCNP:0.7603,sellCNP:1.7451},
  MT:{buyD:0.4229,buyC:0.774,sellD:2.1549,sellC:2.093,buyCNP:0.8123,sellCNP:2.0456},
  MX:{buyD:0.7689,buyC:2.0025,sellD:2.5963,sellC:2.3657,buyCNP:0.0,sellCNP:2.5963},
  NL:{buyD:0.2059,buyC:0.7426,sellD:1.6963,sellC:1.8073,buyCNP:0.9827,sellCNP:2.0927},
  NO:{buyD:0.2835,buyC:0.5136,sellD:1.1104,sellC:1.2829,buyCNP:0.9288,sellCNP:1.5348},
  PE:{buyD:0,buyC:0,sellD:3.883,sellC:3.8115,buyCNP:0.0,sellCNP:3.883},
  PL:{buyD:0.547,buyC:0.9965,sellD:1.304,sellC:1.3832,buyCNP:0.8234,sellCNP:2.0123},
  PT:{buyD:0.4741,buyC:0.9766,sellD:1.6306,sellC:1.7209,buyCNP:1.8066,sellCNP:2.7034},
  RO:{buyD:0.6962,buyC:0.9397,sellD:1.6478,sellC:1.7316,buyCNP:0.9123,sellCNP:2.1234},
  SE:{buyD:0.3567,buyC:0.6719,sellD:1.1048,sellC:1.3303,buyCNP:0.5906,sellCNP:1.3582},
  SI:{buyD:0.4233,buyC:0.7474,sellD:1.8497,sellC:1.8803,buyCNP:1.2233,sellCNP:2.508},
  SK:{buyD:0.4626,buyC:0.8962,sellD:1.8641,sellC:1.8314,buyCNP:0.8872,sellCNP:2.5194},
  US:{buyD:1.1367,buyC:1.905,sellD:2.7416,sellC:2.706,buyCNP:0.0,sellCNP:2.7416},
};
const DC_SPLIT: Record<string,[number,number]> = {
  AT:[92,82],BE:[92,78],BG:[93,82],CH:[90,75],CY:[90,78],CZ:[94,84],DE:[90,83],DK:[98,90],
  EE:[90,85],ES:[91,78],FI:[90,80],FR:[89,75],GB:[93,76],GR:[91,79],HR:[92,80],HU:[93,83],
  IE:[88,86],IT:[90,80],LT:[45,86],LU:[91,78],LV:[95,77],MT:[91,79],NL:[98,92],NO:[91,79],
  PL:[96,85],PT:[94,73],RO:[93,82],SE:[90,75],SI:[97,84],SK:[93,83],
};
const COUNTRY_NAMES: Record<string,string> = {
  AT:"Austria",BE:"Belgium",BG:"Bulgaria",CH:"Switzerland",CY:"Cyprus",CZ:"Czech Republic",
  DE:"Germany",DK:"Denmark",EE:"Estonia",ES:"Spain",FI:"Finland",FR:"France",
  GB:"United Kingdom",GR:"Greece",HR:"Croatia",HU:"Hungary",IE:"Ireland",IT:"Italy",
  LT:"Lithuania",LU:"Luxembourg",LV:"Latvia",MT:"Malta",NL:"Netherlands",NO:"Norway",
  PL:"Poland",PT:"Portugal",RO:"Romania",SE:"Sweden",SI:"Slovenia",SK:"Slovakia",
};
const CURRENCY_MAP: Record<string,string> = {
  AT:"EUR",BE:"EUR",BG:"BGN",CH:"CHF",CY:"EUR",CZ:"CZK",DE:"EUR",DK:"DKK",EE:"EUR",
  ES:"EUR",FI:"EUR",FR:"EUR",GB:"GBP",GR:"EUR",HR:"EUR",HU:"HUF",IE:"EUR",IT:"EUR",
  LT:"EUR",LU:"EUR",LV:"EUR",MT:"EUR",NL:"EUR",NO:"NOK",PL:"PLN",PT:"EUR",RO:"RON",
  SE:"SEK",SI:"EUR",SK:"EUR",
};
const MCC_CATEGORIES = [
  "Restaurants & Food (5812)","Retail — General (5999)","Hotels & Accommodation (7011)",
  "Transportation & Taxi (4121)","Health & Beauty (7299)","Electronics (5734)",
  "Clothing & Apparel (5621)","Entertainment & Events (7922)","Professional Services (8099)",
  "Supermarkets & Groceries (5411)","Automotive (5511)","Sports & Recreation (5941)",
  "Education (8299)","Medical & Healthcare (8049)","Other",
];
const HW_DEVICES = [
  {name:"Solo Lite",std:34,cogs:39.72},{name:"Solo Lite Bundle",std:44,cogs:44},
  {name:"Solo",std:79,cogs:82.21},{name:"Solo Bundle",std:139,cogs:144},
  {name:"Solo Cradle",std:34,cogs:8.42},{name:"POS Lite",std:299,cogs:287.47},
  {name:"POS Lite + Solo",std:299,cogs:349},
];
const RATES = Object.entries(BLENDED_RATES)
  .map(([code,r])=>({code,buyD:r.buyD,buyC:r.buyC,sellD:r.sellD,sellC:r.sellC,netD:r.sellD-r.buyD,netC:r.sellC-r.buyC,buyCNP:r.buyCNP,sellCNP:r.sellCNP}))
  .sort((a,b)=>(COUNTRY_NAMES[a.code]||a.code).localeCompare(COUNTRY_NAMES[b.code]||b.code));
const STORAGE_KEY = "sumup_deal_calc_v3";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type PrimaryModel = "1A"|"1B"|"1C";
type HwMethod = "Hardware"|"Tap-to-Pay"|"Online";
type Tab = "new"|"renewal";
type ApprovalDecision = "Approved"|"Rejected"|"Request Changes"|"";
interface CountryRow { id:number; country:string; merchantBase:number; targetPct:number; tpvPerMerchantYearly:number; sellRateD:number|null; sellRateC:number|null; buyRateD:number|null; buyRateC:number|null; totalBase:number; shareDistribution:number; }
interface ApprovalEntry { id:number; round:number; decision:string; approverName:string; date:string; }
interface ThresholdTier { enabled:boolean; value:number; rate:number; }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let _id = 0;
const newRow = ():CountryRow => ({id:++_id,country:"",merchantBase:0,targetPct:95,tpvPerMerchantYearly:0,sellRateD:null,sellRateC:null,buyRateD:null,buyRateC:null,totalBase:0,shareDistribution:100});
const fE = (n:number,short=false):string => {
  if(!isFinite(n)||isNaN(n)) return "—";
  if(short){
    if(Math.abs(n)>=1e6) return `€${(n/1e6).toFixed(2)}M`;
    if(Math.abs(n)>=1e3) return `€${(n/1e3).toFixed(1)}K`;
    return `€${n.toFixed(0)}`;
  }
  return `€${n.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
};
const f1 = (n:number) => isFinite(n)&&!isNaN(n) ? n.toFixed(1) : "—";

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const YI = ({value,onChange,type="number",step,min,max,placeholder,error=false}:{value:any;onChange:(v:any)=>void;type?:string;step?:number;min?:number;max?:number;placeholder?:string;error?:boolean;}) => (
  <input type={type} value={value} placeholder={placeholder}
    onChange={e=>onChange(type==="number"?(parseFloat(e.target.value)||0):e.target.value)}
    onFocus={e=>(e.target as HTMLInputElement).select()}
    step={step} min={min} max={max}
    className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 ${error?"border-red-400 bg-red-50":"border-yellow-400 bg-yellow-50"}`}/>
);
const GreyBox = ({v}:{v:string}) => <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500">{v}</div>;
const Lbl = ({text,tip}:{text:string;tip?:string}) => <label className="block text-xs font-medium text-gray-500 mb-1" title={tip}>{text}</label>;
function SCard({children,className=""}:{children:React.ReactNode;className?:string}){ return <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>{children}</div>; }
function SCardH({children}:{children:React.ReactNode}){ return <div className="px-5 pt-5 pb-3">{children}</div>; }
function SCardT({children}:{children:React.ReactNode}){ return <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{children}</h2>; }
function SCardB({children,className=""}:{children:React.ReactNode;className?:string}){ return <div className={`px-5 pb-5 ${className}`}>{children}</div>; }

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function DealApprovalCalculator() {
  const [tab,setTab] = useState<Tab>("new");
  const [submittedBy,setSubmittedBy] = useState("");
  const [approver,setApprover] = useState("Pirmin Dubach");
  const [partnerName,setPartnerName] = useState("");
  const [partnerType,setPartnerType] = useState("ISV");
  const [primaryCountry,setPrimaryCountry] = useState("");
  const [currency,setCurrency] = useState("EUR");
  const [mcc,setMcc] = useState("");
  const [sumUpEntity,setSumUpEntity] = useState("SumUp Limited");
  const [contractTerm,setContractTerm] = useState(24);
  const [salesforceLink,setSalesforceLink] = useState("");
  const [autoRenewal,setAutoRenewal] = useState(false);
  const [submissionDate,setSubmissionDate] = useState(new Date().toISOString().slice(0,10));
  const [primary,setPrimary] = useState<PrimaryModel>("1A");
  const [rsA,setRsA] = useState(20);
  const [durationA,setDurationA] = useState("24");
  const [specBuyrate,setSpecBuyrate] = useState(0.8);
  const [durationB,setDurationB] = useState("24");
  const [oneCRate,setOneCRate] = useState(0.10);
  const [use2A,setUse2A] = useState(false);
  const [kickback2A,setKickback2A] = useState(50);
  const [thresh2A,setThresh2A] = useState(500);
  const [use2B,setUse2B] = useState(false);
  const [kickback2B,setKickback2B] = useState(50);
  const [thresh2B,setThresh2B] = useState(500);
  const [use3A,setUse3A] = useState(false);
  const [annual3A,setAnnual3A] = useState(5000);
  const [use4A,setUse4A] = useState(false);
  const [budget4A,setBudget4A] = useState(0);
  const [rows,setRows] = useState<CountryRow[]>([newRow()]);
  const [hwMethod,setHwMethod] = useState<HwMethod>("Hardware");
  const [directMerchants,setDirectMerchants] = useState(0);
  const [hwQty,setHwQty] = useState<number[]>(HW_DEVICES.map(()=>0));
  const [hwPrice,setHwPrice] = useState<(number|null)[]>(HW_DEVICES.map(()=>null));
  const [histTPV,setHistTPV] = useState(0);
  const [histNR,setHistNR] = useState(0);
  const [nCROs,setNCROs] = useState(0);
  const [fcastTPV,setFcastTPV] = useState(0);
  const [fcastMerch,setFcastMerch] = useState(0);
  const [mktBudgetRenewal,setMktBudgetRenewal] = useState(0);
  const [campaignDesc,setCampaignDesc] = useState("");
  const [approvalDecision,setApprovalDecision] = useState<ApprovalDecision>("");
  const [approvalDate,setApprovalDate] = useState(new Date().toISOString().slice(0,10));
  const [approvalNotes,setApprovalNotes] = useState("");
  const [approvalHistory,setApprovalHistory] = useState<ApprovalEntry[]>([]);
  const [copied,setCopied] = useState(false);
  const [gradualAcquisition,setGradualAcquisition] = useState(true);
  const [showAnnual,setShowAnnual] = useState(false);
  const [dealNotes,setDealNotes] = useState("");
  const [websiteLink,setWebsiteLink] = useState("");
  const [useThresholds,setUseThresholds] = useState(false);
  const [thresholdType,setThresholdType] = useState<'nAM'|'TPV'>('nAM');
  const [thresholdTiers,setThresholdTiers] = useState<ThresholdTier[]>([
    {enabled:false,value:0,rate:0},{enabled:false,value:0,rate:0},{enabled:false,value:0,rate:0}
  ]);
  const [downloading,setDownloading] = useState(false);
  const [toast,setToast] = useState<{msg:string;ok:boolean}|null>(null);
  const [page, setPage] = useState(1);
  // Deal Qualification
  const [qualTotalMerchBase, setQualTotalMerchBase] = useState(0);
  const [qualMonthlyNAM, setQualMonthlyNAM] = useState(0);
  const [qualReason, setQualReason] = useState("");
  const [qualAvgTPV, setQualAvgTPV] = useState(0);
  const [qualByFieldSales, setQualByFieldSales] = useState<"yes"|"no"|"">("");
  const [qualByEnterprise, setQualByEnterprise] = useState<"yes"|"no"|"">("");
  const [qualByInsideSales, setQualByInsideSales] = useState<"yes"|"no"|"">("");
  const [qualStrategic, setQualStrategic] = useState<"yes"|"no"|"">("");
  const [qualStrategicReason, setQualStrategicReason] = useState("");
  // 5A Integration Budget
  const [use5A, setUse5A] = useState(false);
  const [integrationBudget5A, setIntegrationBudget5A] = useState(0);
  const showToast = (msg:string,ok:boolean) => { setToast({msg,ok}); setTimeout(()=>setToast(null),5000); };

  useEffect(()=>{
    if(primaryCountry&&CURRENCY_MAP[primaryCountry]) setCurrency(CURRENCY_MAP[primaryCountry]);
  },[primaryCountry]);

  const getSnap = () => ({tab,submittedBy,approver,partnerName,partnerType,primaryCountry,currency,mcc,sumUpEntity,contractTerm,salesforceLink,autoRenewal,submissionDate,primary,rsA,durationA,specBuyrate,durationB,oneCRate,use2A,kickback2A,thresh2A,use2B,kickback2B,thresh2B,use3A,annual3A,use4A,budget4A,use5A,integrationBudget5A,rows,hwMethod,directMerchants,hwQty,hwPrice,histTPV,histNR,nCROs,fcastTPV,fcastMerch,mktBudgetRenewal,campaignDesc,approvalDecision,approvalDate,approvalNotes,approvalHistory,gradualAcquisition,dealNotes,websiteLink,qualTotalMerchBase,qualMonthlyNAM,qualReason,qualAvgTPV,qualByFieldSales,qualByEnterprise,qualByInsideSales,qualStrategic,qualStrategicReason});

  const restore = (s:any) => {
    if(s.tab!==undefined) setTab(s.tab);
    if(s.submittedBy!==undefined) setSubmittedBy(s.submittedBy);
    if(s.approver!==undefined) setApprover(s.approver);
    if(s.partnerName!==undefined) setPartnerName(s.partnerName);
    if(s.partnerType!==undefined) setPartnerType(s.partnerType);
    if(s.primaryCountry!==undefined) setPrimaryCountry(s.primaryCountry);
    if(s.currency!==undefined) setCurrency(s.currency);
    if(s.mcc!==undefined) setMcc(s.mcc);
    if(s.sumUpEntity!==undefined) setSumUpEntity(s.sumUpEntity);
    if(s.contractTerm!==undefined) setContractTerm(s.contractTerm);
    if(s.salesforceLink!==undefined) setSalesforceLink(s.salesforceLink);
    if(s.autoRenewal!==undefined) setAutoRenewal(s.autoRenewal);
    if(s.submissionDate!==undefined) setSubmissionDate(s.submissionDate);
    if(s.primary!==undefined) setPrimary(s.primary);
    if(s.rsA!==undefined) setRsA(s.rsA);
    if(s.durationA!==undefined) setDurationA(s.durationA);
    if(s.specBuyrate!==undefined) setSpecBuyrate(s.specBuyrate);
    if(s.durationB!==undefined) setDurationB(s.durationB);
    if(s.oneCRate!==undefined) setOneCRate(s.oneCRate);
    if(s.use2A!==undefined) setUse2A(s.use2A);
    if(s.kickback2A!==undefined) setKickback2A(s.kickback2A);
    if(s.thresh2A!==undefined) setThresh2A(s.thresh2A);
    if(s.use2B!==undefined) setUse2B(s.use2B);
    if(s.kickback2B!==undefined) setKickback2B(s.kickback2B);
    if(s.thresh2B!==undefined) setThresh2B(s.thresh2B);
    if(s.use3A!==undefined) setUse3A(s.use3A);
    if(s.annual3A!==undefined) setAnnual3A(s.annual3A);
    if(s.use4A!==undefined) setUse4A(s.use4A);
    if(s.budget4A!==undefined) setBudget4A(s.budget4A);
    if(s.rows?.length) setRows(s.rows);
    if(s.hwMethod!==undefined) setHwMethod(s.hwMethod);
    if(s.directMerchants!==undefined) setDirectMerchants(s.directMerchants);
    if(s.hwQty?.length) setHwQty(s.hwQty);
    if(s.hwPrice?.length) setHwPrice(s.hwPrice);
    if(s.histTPV!==undefined) setHistTPV(s.histTPV);
    if(s.histNR!==undefined) setHistNR(s.histNR);
    if(s.nCROs!==undefined) setNCROs(s.nCROs);
    if(s.fcastTPV!==undefined) setFcastTPV(s.fcastTPV);
    if(s.fcastMerch!==undefined) setFcastMerch(s.fcastMerch);
    if(s.mktBudgetRenewal!==undefined) setMktBudgetRenewal(s.mktBudgetRenewal);
    if(s.campaignDesc!==undefined) setCampaignDesc(s.campaignDesc);
    if(s.approvalDecision!==undefined) setApprovalDecision(s.approvalDecision);
    if(s.approvalDate!==undefined) setApprovalDate(s.approvalDate);
    if(s.approvalNotes!==undefined) setApprovalNotes(s.approvalNotes);
    if(s.approvalHistory?.length) setApprovalHistory(s.approvalHistory);
    if(s.gradualAcquisition!==undefined) setGradualAcquisition(s.gradualAcquisition);
    if(s.dealNotes!==undefined) setDealNotes(s.dealNotes);
    if(s.websiteLink!==undefined) setWebsiteLink(s.websiteLink);
    if(s.use5A!==undefined) setUse5A(s.use5A);
    if(s.integrationBudget5A!==undefined) setIntegrationBudget5A(s.integrationBudget5A);
    if(s.qualTotalMerchBase!==undefined) setQualTotalMerchBase(s.qualTotalMerchBase);
    if(s.qualMonthlyNAM!==undefined) setQualMonthlyNAM(s.qualMonthlyNAM);
    if(s.qualReason!==undefined) setQualReason(s.qualReason);
    if(s.qualAvgTPV!==undefined) setQualAvgTPV(s.qualAvgTPV);
    if(s.qualByFieldSales!==undefined) setQualByFieldSales(s.qualByFieldSales);
    if(s.qualByEnterprise!==undefined) setQualByEnterprise(s.qualByEnterprise);
    if(s.qualByInsideSales!==undefined) setQualByInsideSales(s.qualByInsideSales);
    if(s.qualStrategic!==undefined) setQualStrategic(s.qualStrategic);
    if(s.qualStrategicReason!==undefined) setQualStrategicReason(s.qualStrategicReason);
  };

  useEffect(()=>{
    try {
      const hash = window.location.hash;
      if(hash.startsWith('#deal=')){
        const s = JSON.parse(decodeURIComponent(atob(hash.slice(6))));
        restore(s);
        window.history.replaceState(null,'',window.location.pathname+window.location.search);
        return;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) restore(JSON.parse(raw));
    } catch(_ignored){}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(getSnap())); } catch(_ignored){}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[tab,submittedBy,approver,partnerName,partnerType,primaryCountry,currency,mcc,sumUpEntity,contractTerm,salesforceLink,autoRenewal,submissionDate,primary,rsA,durationA,specBuyrate,durationB,oneCRate,use2A,kickback2A,thresh2A,use2B,kickback2B,thresh2B,use3A,annual3A,use4A,budget4A,rows,hwMethod,directMerchants,hwQty,hwPrice,histTPV,histNR,nCROs,fcastTPV,fcastMerch,mktBudgetRenewal,campaignDesc,approvalDecision,approvalDate,approvalNotes,approvalHistory,gradualAcquisition]);

  const handleSave = () => {
    const p = buildPayload();
    const esc = (v:string|number|boolean|null|undefined) => `"${String(v??'').replace(/"/g,'""')}"`;
    const lines:string[] = [];
    const sec = (t:string) => { lines.push("",""); lines.push(`"=== ${t} ==="`); };
    const row = (k:string,v:string|number|boolean|null|undefined) => lines.push(`${esc(k)},${esc(v)}`);

    sec("DEAL SUBMISSION");
    Object.entries(p).filter(([k])=>!["Countries","__STATE__"].includes(k)).forEach(([k,v])=>row(k,v as string));

    sec("PER-COUNTRY BREAKDOWN");
    try {
      const countries = JSON.parse(p["Countries"] as string||"[]");
      if(countries.length>0){
        lines.push(`"Country","Total Merchant Base","% Share","nAM per year","nAM First Year","Annual TPV","TPV First Year","Sell Rate D","Sell Rate C"`);
        countries.forEach((c:Record<string,string|number>)=>lines.push(`${esc(c.country)},${esc(c.totalBase)},${esc(c.shareDistribution)},${esc(c.annualNAM)},${esc(c.namFirstYear)},${esc(c.annualTPV)},${esc(c.tpvFirstYear)},${esc(c.sellRateD)},${esc(c.sellRateC)}`));
      }
    } catch(e){}

    lines.push("","");
    lines.push(`"__STATE__","${btoa(encodeURIComponent(JSON.stringify(getSnap())))}"`);

    triggerUserFileDownload({
      content: lines.join("\n"),
      filename: `deal_${(partnerName||"draft").replace(/[^a-z0-9]/gi,"_")}_${new Date().toISOString().slice(0,10)}.csv`
    });
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/);
        const stateLine = lines.find(l=>l.startsWith("__STATE__,"));
        if(!stateLine) throw new Error("No state found");
        const encoded = stateLine.slice("__STATE__,".length).trim();
        const s = JSON.parse(decodeURIComponent(atob(encoded)));
        restoreSnap(s);
        setToast({msg:"Deal loaded successfully ✓", ok:true});
        setTimeout(()=>setToast(null), 2500);
      } catch(_) {
        setToast({msg:"Failed to load — download a fresh CSV and use that file", ok:false});
        setTimeout(()=>setToast(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch(_ignored){}
    setTab("new"); setSubmittedBy(""); setApprover("Pirmin Dubach"); setPartnerName(""); setPartnerType("ISV");
    setPrimaryCountry(""); setCurrency("EUR"); setMcc(""); setSumUpEntity("SumUp Limited");
    setContractTerm(24); setSalesforceLink(""); setAutoRenewal(false);
    setSubmissionDate(new Date().toISOString().slice(0,10));
    setPrimary("1A"); setRsA(20); setDurationA("24"); setSpecBuyrate(0.8); setDurationB("24"); setOneCRate(0.10);
    setUse2A(false); setKickback2A(50); setThresh2A(500); setUse2B(false); setKickback2B(50); setThresh2B(500);
    setUse3A(false); setAnnual3A(5000); setUse4A(false); setBudget4A(0);
    setRows([newRow()]); setHwMethod("Hardware"); setDirectMerchants(0);
    setHwQty(HW_DEVICES.map(()=>0)); setHwPrice(HW_DEVICES.map(()=>null));
    setHistTPV(0); setHistNR(0); setNCROs(0); setFcastTPV(0); setFcastMerch(0); setMktBudgetRenewal(0); setCampaignDesc("");
    setApprovalDecision(""); setApprovalDate(new Date().toISOString().slice(0,10)); setApprovalNotes(""); setApprovalHistory([]);
    setGradualAcquisition(true);
  };

  // ── MAKE.COM WEBHOOK ─────────────────────────────────────────────────────────
  // Set this in your .env file as VITE_MAKE_WEBHOOK_URL=https://hook.eu1.make.celonis.com/...
const MAKE_WEBHOOK_URL = import.meta.env.VITE_MAKE_WEBHOOK_URL as string || "";
  const MAKE_WEBHOOK_SHEETS_URL = "https://hook.eu1.make.celonis.com/lcr1nu2342wmcwu4ojz0qy9ubu2bpawy";
  const APPROVER_POSITIONS:Record<string,string> = {"Duco Trienekens":"VP Retail and Partnerships","Pirmin Dubach":"Partner Acquisition Lead","Giulia Lorenzini":"Partner Growth Lead","Karla Gordovil":"Partner Development Lead","Omar Kassem":"Head of Sales Engineering"};
  const APPROVER_SLACK:Record<string,string> = {"Duco Trienekens":"@duco.trienekens","Pirmin Dubach":"@pirmin.dubach","Giulia Lorenzini":"@giulia.lorenzini","Karla Gordovil":"@karla.gordovil","Omar Kassem":"@omar.kassem"};

  const buildPayload = () => {
    const sd=new Date(submissionDate),sy=sd.getFullYear(),sm=sd.getMonth()+1;
    const monthName=sd.toLocaleString("en-US",{month:"long"});
    const sq=`Q${Math.ceil(sm/3)}`;
    const r0=rows[0],rt0=r0?BLENDED_RATES[r0.country]:null;
    const sD=r0&&r0.sellRateD!=null?r0.sellRateD:(rt0?rt0.sellD:null);
    const sC=r0&&r0.sellRateC!=null?r0.sellRateC:(rt0?rt0.sellC:null);
    const revRate=primary==="1A"?rsA:primary==="1C"?oneCRate:specBuyrate;
    const revDur=primary==="1A"?durationA:primary==="1B"?durationB:"Lifetime";
    const hwPricing=hwMethod==="Hardware"?HW_DEVICES.reduce((acc:string[],d,i)=>hwQty[i]>0?[...acc,`${d.name}: €${hwPrice[i]??d.std}`]:acc,[]).join("; ")||"No devices":"N/A";
    const latestApproval=approvalHistory[approvalHistory.length-1];
    // 29 columns matching Google Sheet headers exactly
    return {
      "Deal Type": tab==="new"?"New Partnership":"Renewal",
      "Partner Manager": submittedBy||"",
      "Partnership Type": partnerType,
      "Account name": partnerName||"",
      "Link": salesforceLink||"",
      "Country": COUNTRY_NAMES[primaryCountry]||primaryCountry||"",
      "Submission Date": submissionDate,
      "Submission Year": sy,
      "Submission Month": monthName,
      "Submission Q": sq,
      "Commercial Model": primary,
      "Sell Rate Debit": sD!=null?sD.toFixed(4):"",
      "Buy Rate Debit": rt0?rt0.buyD.toFixed(4):"",
      "Sell Rate Credit": sC!=null?sC.toFixed(4):"",
      "Buy Rate Credit": rt0?rt0.buyC.toFixed(4):"",
      "Rev-share Rate": revRate,
      "Rev-Share Duration": revDur,
      "Activation Kickback (in EUR)": use2A?kickback2A:"",
      "Kickback Threshold": use2A?thresh2A:"",
      "Standard Hardware Pricing": hwPricing,
      "Estimated Year 1 TPV": totAnnTPV>0?Math.round(totAnnTPV):"",
      "Estimated Year 1 NR": totGrossNR>0?(totGrossNR*12).toFixed(2):"",
      "Estimated New Merchants": hwMerchants*12||totNrM,
      "Estimated Payback": effectivePayback>0?effectivePayback.toFixed(1):"",
      "Contract Length": contractTerm,
      "Autorenewal Period": autoRenewal?`${contractTerm} months`:"No",
      "MCC": mcc||"",
      "Currency": currency,
      "SumUp Entity": sumUpEntity||"",
      "Thresholds Applied": (use2A||use2B||use3A||use4A||use5A)?"true":"false",
      "Qual - Total Merchant Base": qualTotalMerchBase||"",
      "Qual - SumUp Share": sumUpSharePct>0?`${sumUpSharePct.toFixed(1)}%`:"",
      "Qual - Reason": qualReason||"",
      "Qual - Avg TPV per Merchant": qualAvgTPV||"",
      "Qual - Field Sales": qualByFieldSales||"",
      "Qual - Enterprise": qualByEnterprise||"",
      "Qual - Inside Sales": qualByInsideSales||"",
      "Qual - Strategic Relevance": qualStrategic||"",
      "Qual - Strategic Comment": qualStrategicReason||"",
      "Countries": JSON.stringify(rows.map((row,i)=>{const rc=rowCalcs[i];return {country:COUNTRY_NAMES[row.country]||row.country,totalBase:row.totalBase||0,annualNAM:row.merchantBase||0,namFirstYear:rc?rc.namYear1:0,annualTPV:rc?rc.annualTPV:0,tpvFirstYear:rc?rc.tpvYear1:0,sellRateD:row.sellRateD||"",sellRateC:row.sellRateC||""};})),
      // PAYBACK
      "Calculator Status": status,
      "Monthly Gross NR": totGrossNR.toFixed(2),
      "Partner Payout": totPartnerPay.toFixed(2),
      "Monthly SumUp NR after RS": totSumUpNR.toFixed(2),
      "NR per Merchant/Month": totNrM>0?(totSumUpNR/totNrM).toFixed(2):"0",
      "Hardware Subsidy/Mo": hwCost.toFixed(2),
      "Total Monthly CAC": totalCAC.toFixed(2),
      "PAYBACK (months)": totSumUpNR>0&&totalCAC>0?payback.toFixed(1):"N/A",
      // COMMERCIAL
      "2A — Activation Commission": use2A?`Yes — €${kickback2A}/merchant`:"No",
      "2B — Activation Commission": use2B?`Yes — €${kickback2B}/merchant`:"No",
      "3A — Annual Payment": use3A?`Yes — €${annual3A}/year`:"No",
      "4A — Marketing Budget": use4A?`Yes — €${budget4A}/year`:"No",
      "5A — Integration Budget": use5A?`Yes — €${integrationBudget5A}`:"No",
      "Milestone Thresholds": useThresholds?"Yes":"No",
      "T1 Threshold": useThresholds&&thresholdTiers[0]?.enabled?thresholdTiers[0].value:"",
      "T1 Rate": useThresholds&&thresholdTiers[0]?.enabled?thresholdTiers[0].rate:"",
      "T2 Threshold": useThresholds&&thresholdTiers[1]?.enabled?thresholdTiers[1].value:"",
      "T2 Rate": useThresholds&&thresholdTiers[1]?.enabled?thresholdTiers[1].rate:"",
      "T3 Threshold": useThresholds&&thresholdTiers[2]?.enabled?thresholdTiers[2].value:"",
      "T3 Rate": useThresholds&&thresholdTiers[2]?.enabled?thresholdTiers[2].rate:"",
      "Acquisition Mode": gradualAcquisition?"Gradual — staircase":"All at once",
      // PER-COUNTRY (expanded, 5 slots)
      ...Object.fromEntries(Array.from({length:5},(_,i)=>{
        const r=rows[i]; const rc=rowCalcs[i];
        const n=i+1;
        const tBase=qualTotalMerchBase>0&&r&&(r.shareDistribution||0)>0?Math.round(qualTotalMerchBase*(r.shareDistribution/100)):0;
        return [
          [`Country ${n}`, r?.country?COUNTRY_NAMES[r.country]||r.country:""],
          [`Country ${n} Total Base`, r?.country?tBase:""],
          [`Country ${n} % Share`, r?.country&&r.shareDistribution?`${r.shareDistribution}%`:""],
          [`Country ${n} nAM/year`, r?.country?rc?.nrM??0:""],
          [`Country ${n} nAM First Year`, r?.country?rc?.namYear1??0:""],
          [`Country ${n} Avg Annual TPV/nAM`, r?.country?r.tpvPerMerchantYearly||0:""],
          [`Country ${n} Annual TPV`, r?.country?rc?.annualTPV?.toFixed(0)??0:""],
          [`Country ${n} TPV First Year`, r?.country?rc?.tpvYear1?.toFixed(0)??0:""],
          [`Country ${n} Sell Rate D`, r?.country?(r.sellRateD!=null?`${r.sellRateD}%`:"default"):""],
          [`Country ${n} Sell Rate C`, r?.country?(r.sellRateC!=null?`${r.sellRateC}%`:"default"):""],
