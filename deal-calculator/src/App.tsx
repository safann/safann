// DealApprovalCalculator.tsx
// Dependencies: npm install lucide-react
// Tailwind CSS must be configured in your project

import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, Plus, Trash2, XCircle } from "lucide-react";

// ─── FILE DOWNLOAD (replaces Dust-specific hook) ─────────────────────────────
function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── EMBEDDED RATES (Apr 2026 Snowflake) ─────────────────────────────────────
const BLENDED_RATES: Record<
  string,
  { buyD: number; buyC: number; sellD: number; sellC: number; buyCNP: number; sellCNP: number }
> = {
  AT: { buyD: 0.3012, buyC: 0.6845, sellD: 1.4231, sellC: 1.5876, buyCNP: 0.8234, sellCNP: 1.9876 },
  BE: { buyD: 0.2987, buyC: 0.6123, sellD: 1.3845, sellC: 1.4932, buyCNP: 0.7123, sellCNP: 1.8234 },
  BG: { buyD: 0.3234, buyC: 0.7012, sellD: 1.5234, sellC: 1.6123, buyCNP: 0.9234, sellCNP: 2.1234 },
  CH: { buyD: 0.3456, buyC: 0.7234, sellD: 1.4567, sellC: 1.5678, buyCNP: 0.8567, sellCNP: 1.9123 },
  CY: { buyD: 0.4204, buyC: 1.1727, sellD: 1.7918, sellC: 1.8628, buyCNP: 0.9466, sellCNP: 2.3317 },
  CZ: { buyD: 0.3678, buyC: 0.7891, sellD: 1.6234, sellC: 1.7123, buyCNP: 0.8901, sellCNP: 2.0567 },
  DE: { buyD: 0.3189, buyC: 0.7999, sellD: 1.1285, sellC: 1.3149, buyCNP: 0.7234, sellCNP: 1.7891 },
  DK: { buyD: 0.2876, buyC: 0.6234, sellD: 1.3456, sellC: 1.4789, buyCNP: 0.6789, sellCNP: 1.8456 },
  EE: { buyD: 0.3456, buyC: 0.6789, sellD: 1.5678, sellC: 1.6234, buyCNP: 0.7456, sellCNP: 1.8901 },
  ES: { buyD: 0.3937, buyC: 0.5871, sellD: 1.3126, sellC: 1.3326, buyCNP: 1.0493, sellCNP: 1.8784 },
  FI: { buyD: 0.2982, buyC: 0.5655, sellD: 1.2293, sellC: 1.6215, buyCNP: 0.8927, sellCNP: 1.5233 },
  FR: { buyD: 0.3455, buyC: 0.6730, sellD: 1.5275, sellC: 1.5947, buyCNP: 0.9568, sellCNP: 2.3007 },
  GB: { buyD: 0.3397, buyC: 0.6277, sellD: 1.4194, sellC: 1.4985, buyCNP: 0.9046, sellCNP: 2.1500 },
  GR: { buyD: 0.3789, buyC: 0.7456, sellD: 1.5890, sellC: 1.6789, buyCNP: 0.8901, sellCNP: 2.0234 },
  HR: { buyD: 0.5449, buyC: 0.9248, sellD: 1.0281, sellC: 1.3536, buyCNP: 2.0183, sellCNP: 2.5093 },
  HU: { buyD: 0.7452, buyC: 1.0245, sellD: 1.9096, sellC: 1.9188, buyCNP: 1.2685, sellCNP: 2.5099 },
  IE: { buyD: 0.3123, buyC: 0.6456, sellD: 1.4567, sellC: 1.5234, buyCNP: 0.8234, sellCNP: 1.9567 },
  IT: { buyD: 0.4278, buyC: 0.7936, sellD: 1.4764, sellC: 1.5736, buyCNP: 1.7695, sellCNP: 2.4296 },
  LT: { buyD: 0.3781, buyC: 0.7682, sellD: 1.6623, sellC: 1.6211, buyCNP: 0.3977, sellCNP: 0.0622 },
  LU: { buyD: 0.2172, buyC: 0.4718, sellD: 2.5073, sellC: 2.4304, buyCNP: 0.6842, sellCNP: 2.6981 },
  LV: { buyD: 0.4030, buyC: 0.6664, sellD: 1.6244, sellC: 1.6395, buyCNP: 0.7603, sellCNP: 1.7451 },
  MT: { buyD: 0.3567, buyC: 0.7234, sellD: 1.5890, sellC: 1.6789, buyCNP: 0.8123, sellCNP: 2.0456 },
  NL: { buyD: 0.2129, buyC: 0.8035, sellD: 1.7240, sellC: 1.8305, buyCNP: 0.9827, sellCNP: 2.0927 },
  NO: { buyD: 0.3062, buyC: 0.5627, sellD: 1.1920, sellC: 1.3883, buyCNP: 0.9288, sellCNP: 1.5348 },
  PL: { buyD: 0.3456, buyC: 0.7234, sellD: 1.5678, sellC: 1.6789, buyCNP: 0.8234, sellCNP: 2.0123 },
  PT: { buyD: 0.4752, buyC: 0.9384, sellD: 1.6763, sellC: 1.7700, buyCNP: 1.8066, sellCNP: 2.7034 },
  RO: { buyD: 0.3890, buyC: 0.7567, sellD: 1.6234, sellC: 1.7123, buyCNP: 0.9123, sellCNP: 2.1234 },
  SE: { buyD: 0.4649, buyC: 0.8448, sellD: 1.0547, sellC: 1.3189, buyCNP: 0.5906, sellCNP: 1.3582 },
  SI: { buyD: 0.4233, buyC: 0.6822, sellD: 1.8601, sellC: 1.8749, buyCNP: 1.2233, sellCNP: 2.5080 },
  SK: { buyD: 0.4790, buyC: 0.9364, sellD: 1.8657, sellC: 1.8310, buyCNP: 0.8872, sellCNP: 2.5194 },
};
const DC_SPLIT: Record<string, [number, number]> = {
  AT: [92, 82], BE: [92, 78], BG: [93, 82], CH: [90, 75], CY: [90, 78], CZ: [94, 84], DE: [90, 83], DK: [98, 90],
  EE: [90, 85], ES: [91, 78], FI: [90, 80], FR: [89, 75], GB: [93, 76], GR: [91, 79], HR: [92, 80], HU: [93, 83],
  IE: [88, 86], IT: [90, 80], LT: [45, 86], LU: [91, 78], LV: [95, 77], MT: [91, 79], NL: [98, 92], NO: [91, 79],
  PL: [96, 85], PT: [94, 73], RO: [93, 82], SE: [90, 75], SI: [97, 84], SK: [93, 83],
};
const COUNTRY_NAMES: Record<string, string> = {
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", CH: "Switzerland", CY: "Cyprus", CZ: "Czech Republic",
  DE: "Germany", DK: "Denmark", EE: "Estonia", ES: "Spain", FI: "Finland", FR: "France",
  GB: "United Kingdom", GR: "Greece", HR: "Croatia", HU: "Hungary", IE: "Ireland", IT: "Italy",
  LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", MT: "Malta", NL: "Netherlands", NO: "Norway",
  PL: "Poland", PT: "Portugal", RO: "Romania", SE: "Sweden", SI: "Slovenia", SK: "Slovakia",
};
const CURRENCY_MAP: Record<string, string> = {
  AT: "EUR", BE: "EUR", BG: "BGN", CH: "CHF", CY: "EUR", CZ: "CZK", DE: "EUR", DK: "DKK", EE: "EUR",
  ES: "EUR", FI: "EUR", FR: "EUR", GB: "GBP", GR: "EUR", HR: "EUR", HU: "HUF", IE: "EUR", IT: "EUR",
  LT: "EUR", LU: "EUR", LV: "EUR", MT: "EUR", NL: "EUR", NO: "NOK", PL: "PLN", PT: "EUR", RO: "RON",
  SE: "SEK", SI: "EUR", SK: "EUR",
};
const MCC_CATEGORIES = [
  "Restaurants & Food (5812)", "Retail — General (5999)", "Hotels & Accommodation (7011)",
  "Transportation & Taxi (4121)", "Health & Beauty (7299)", "Electronics (5734)",
  "Clothing & Apparel (5621)", "Entertainment & Events (7922)", "Professional Services (8099)",
  "Supermarkets & Groceries (5411)", "Automotive (5511)", "Sports & Recreation (5941)",
  "Education (8299)", "Medical & Healthcare (8049)", "Other",
];
const HW_DEVICES = [
  { name: "Solo Lite", std: 34, cogs: 39.72 }, { name: "Solo Lite Bundle", std: 44, cogs: 44 },
  { name: "Solo", std: 79, cogs: 82.21 }, { name: "Solo Bundle", std: 139, cogs: 144 },
  { name: "Solo Cradle", std: 34, cogs: 8.42 }, { name: "POS Lite", std: 299, cogs: 287.47 },
  { name: "POS Lite + Solo", std: 299, cogs: 349 },
];
const RATES = Object.entries(BLENDED_RATES)
  .map(([code, r]) => ({
    code,
    buyD: r.buyD,
    buyC: r.buyC,
    sellD: r.sellD,
    sellC: r.sellC,
    netD: r.sellD - r.buyD,
    netC: r.sellC - r.buyC,
    buyCNP: r.buyCNP,
    sellCNP: r.sellCNP,
  }))
  .sort((a, b) => (COUNTRY_NAMES[a.code] || a.code).localeCompare(COUNTRY_NAMES[b.code] || b.code));
const STORAGE_KEY = "sumup_deal_calc_v3";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type PrimaryModel = "1A" | "1B" | "1C";
type HwMethod = "Hardware" | "Tap-to-Pay" | "Online";
type Tab = "new" | "renewal";
type ApprovalDecision = "Approved" | "Rejected" | "Request Changes" | "";
interface CountryRow {
  id: number;
  country: string;
  merchantBase: number;
  targetPct: number;
  tpvPerMerchantYearly: number;
  sellRateD: number | null;
  sellRateC: number | null;
}
interface ApprovalEntry {
  id: number;
  round: number;
  decision: string;
  approverName: string;
  date: string;
}

type YellowInputProps = {
  value: string | number;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  error?: boolean;
} & (
  | { type: "text"; onChange: (v: string) => void }
  | { type?: "number"; onChange: (v: number) => void }
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let _id = 0;
const newRow = (): CountryRow => ({
  id: ++_id,
  country: "",
  merchantBase: 0,
  targetPct: 5,
  tpvPerMerchantYearly: 0,
  sellRateD: null,
  sellRateC: null,
});
const fE = (n: number, short = false): string => {
  if (!isFinite(n) || isNaN(n)) return "—";
  if (short) {
    if (Math.abs(n) >= 1e6) return `€${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `€${(n / 1e3).toFixed(1)}K`;
    return `€${n.toFixed(0)}`;
  }
  return `€${n.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const f1 = (n: number) => (isFinite(n) && !isNaN(n) ? n.toFixed(1) : "—");

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
const YI = (props: YellowInputProps) => {
  const { value, step, min, max, placeholder, error = false } = props;
  const type = props.type ?? "number";
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        if (props.type === "text") {
          props.onChange(e.target.value);
          return;
        }
        props.onChange(parseFloat(e.target.value) || 0);
      }}
      onFocus={(e) => (e.target as HTMLInputElement).select()}
      step={step}
      min={min}
      max={max}
      className={`w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 ${error ? "border-red-400 bg-red-50" : "border-yellow-400 bg-yellow-50"}`}
    />
  );
};
const GreyBox = ({ v }: { v: string }) => (
  <div className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500">{v}</div>
);
const Lbl = ({ text, tip }: { text: string; tip?: string }) => (
  <label className="block text-xs font-medium text-gray-500 mb-1" title={tip}>
    {text}
  </label>
);
function SCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-200 ${className}`}>{children}</div>;
}
function SCardH({ children }: { children: React.ReactNode }) {
  return <div className="px-5 pt-5 pb-3">{children}</div>;
}
function SCardT({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{children}</h2>;
}
function SCardB({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function DealApprovalCalculator() {
  const [tab, setTab] = useState<Tab>("new");
  const [submittedBy, setSubmittedBy] = useState("");
  const [approver, setApprover] = useState("Pirmin Dubach");
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState("ISV");
  const [primaryCountry, setPrimaryCountry] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [mcc, setMcc] = useState("");
  const [sumUpEntity, setSumUpEntity] = useState("SumUp Limited");
  const [contractTerm, setContractTerm] = useState(24);
  const [salesforceLink, setSalesforceLink] = useState("");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().slice(0, 10));
  const [primary, setPrimary] = useState<PrimaryModel>("1A");
  const [rsA, setRsA] = useState(20);
  const [durationA, setDurationA] = useState("24");
  const [specBuyrate, setSpecBuyrate] = useState(0.8);
  const [durationB, setDurationB] = useState("24");
  const [oneCRate, setOneCRate] = useState(0.10);
  const [use2A, setUse2A] = useState(false);
  const [kickback2A, setKickback2A] = useState(50);
  const [thresh2A, setThresh2A] = useState(500);
  const [use2B, setUse2B] = useState(false);
  const [kickback2B, setKickback2B] = useState(50);
  const [thresh2B, setThresh2B] = useState(500);
  const [use3A, setUse3A] = useState(false);
  const [annual3A, setAnnual3A] = useState(5000);
  const [use4A, setUse4A] = useState(false);
  const [budget4A, setBudget4A] = useState(0);
  const [rows, setRows] = useState<CountryRow[]>([newRow()]);
  const [hwMethod, setHwMethod] = useState<HwMethod>("Hardware");
  const [directMerchants, setDirectMerchants] = useState(0);
  const [hwQty, setHwQty] = useState<number[]>(HW_DEVICES.map(() => 0));
  const [hwPrice, setHwPrice] = useState<(number | null)[]>(HW_DEVICES.map(() => null));
  const [histTPV, setHistTPV] = useState(0);
  const [histNR, setHistNR] = useState(0);
  const [nCROs, setNCROs] = useState(0);
  const [fcastTPV, setFcastTPV] = useState(0);
  const [fcastMerch, setFcastMerch] = useState(0);
  const [mktBudgetRenewal, setMktBudgetRenewal] = useState(0);
  const [campaignDesc, setCampaignDesc] = useState("");
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision>("");
  const [approvalDate, setApprovalDate] = useState(new Date().toISOString().slice(0, 10));
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvalHistory, setApprovalHistory] = useState<ApprovalEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [gradualAcquisition, setGradualAcquisition] = useState(false);

  // ── MAKE.COM WEBHOOK ────────────────────────────────────────────────────────
  // Paste your Make.com webhook URL here when ready:
  const MAKE_WEBHOOK_URL = ""; // e.g. "https://hook.eu2.make.com/xxxxxxxxxxxx"

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (primaryCountry && CURRENCY_MAP[primaryCountry]) setCurrency(CURRENCY_MAP[primaryCountry]);
  }, [primaryCountry]);

  const getSnap = () => ({
    tab,
    submittedBy,
    approver,
    partnerName,
    partnerType,
    primaryCountry,
    currency,
    mcc,
    sumUpEntity,
    contractTerm,
    salesforceLink,
    autoRenewal,
    submissionDate,
    primary,
    rsA,
    durationA,
    specBuyrate,
    durationB,
    oneCRate,
    use2A,
    kickback2A,
    thresh2A,
    use2B,
    kickback2B,
    thresh2B,
    use3A,
    annual3A,
    use4A,
    budget4A,
    rows,
    hwMethod,
    directMerchants,
    hwQty,
    hwPrice,
    histTPV,
    histNR,
    nCROs,
    fcastTPV,
    fcastMerch,
    mktBudgetRenewal,
    campaignDesc,
    approvalDecision,
    approvalDate,
    approvalNotes,
    approvalHistory,
    gradualAcquisition,
  });

  type Snapshot = ReturnType<typeof getSnap>;

  const restore = (s: Partial<Snapshot>) => {
    if (s.tab !== undefined) setTab(s.tab);
    if (s.submittedBy !== undefined) setSubmittedBy(s.submittedBy);
    if (s.approver !== undefined) setApprover(s.approver);
    if (s.partnerName !== undefined) setPartnerName(s.partnerName);
    if (s.partnerType !== undefined) setPartnerType(s.partnerType);
    if (s.primaryCountry !== undefined) setPrimaryCountry(s.primaryCountry);
    if (s.currency !== undefined) setCurrency(s.currency);
    if (s.mcc !== undefined) setMcc(s.mcc);
    if (s.sumUpEntity !== undefined) setSumUpEntity(s.sumUpEntity);
    if (s.contractTerm !== undefined) setContractTerm(s.contractTerm);
    if (s.salesforceLink !== undefined) setSalesforceLink(s.salesforceLink);
    if (s.autoRenewal !== undefined) setAutoRenewal(s.autoRenewal);
    if (s.submissionDate !== undefined) setSubmissionDate(s.submissionDate);
    if (s.primary !== undefined) setPrimary(s.primary);
    if (s.rsA !== undefined) setRsA(s.rsA);
    if (s.durationA !== undefined) setDurationA(s.durationA);
    if (s.specBuyrate !== undefined) setSpecBuyrate(s.specBuyrate);
    if (s.durationB !== undefined) setDurationB(s.durationB);
    if (s.oneCRate !== undefined) setOneCRate(s.oneCRate);
    if (s.use2A !== undefined) setUse2A(s.use2A);
    if (s.kickback2A !== undefined) setKickback2A(s.kickback2A);
    if (s.thresh2A !== undefined) setThresh2A(s.thresh2A);
    if (s.use2B !== undefined) setUse2B(s.use2B);
    if (s.kickback2B !== undefined) setKickback2B(s.kickback2B);
    if (s.thresh2B !== undefined) setThresh2B(s.thresh2B);
    if (s.use3A !== undefined) setUse3A(s.use3A);
    if (s.annual3A !== undefined) setAnnual3A(s.annual3A);
    if (s.use4A !== undefined) setUse4A(s.use4A);
    if (s.budget4A !== undefined) setBudget4A(s.budget4A);
    if (s.rows?.length) setRows(s.rows);
    if (s.hwMethod !== undefined) setHwMethod(s.hwMethod);
    if (s.directMerchants !== undefined) setDirectMerchants(s.directMerchants);
    if (s.hwQty?.length) setHwQty(s.hwQty);
    if (s.hwPrice?.length) setHwPrice(s.hwPrice);
    if (s.histTPV !== undefined) setHistTPV(s.histTPV);
    if (s.histNR !== undefined) setHistNR(s.histNR);
    if (s.nCROs !== undefined) setNCROs(s.nCROs);
    if (s.fcastTPV !== undefined) setFcastTPV(s.fcastTPV);
    if (s.fcastMerch !== undefined) setFcastMerch(s.fcastMerch);
    if (s.mktBudgetRenewal !== undefined) setMktBudgetRenewal(s.mktBudgetRenewal);
    if (s.campaignDesc !== undefined) setCampaignDesc(s.campaignDesc);
    if (s.approvalDecision !== undefined) setApprovalDecision(s.approvalDecision);
    if (s.approvalDate !== undefined) setApprovalDate(s.approvalDate);
    if (s.approvalNotes !== undefined) setApprovalNotes(s.approvalNotes);
    if (s.approvalHistory?.length) setApprovalHistory(s.approvalHistory);
    if (s.gradualAcquisition !== undefined) setGradualAcquisition(s.gradualAcquisition);
  };

  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith("#deal=")) {
        const s = JSON.parse(decodeURIComponent(atob(hash.slice(6)))) as Partial<Snapshot>;
        restore(s);
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        return;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) restore(JSON.parse(raw) as Partial<Snapshot>);
    } catch {
      // Ignore invalid share links or stale local storage snapshots.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getSnap()));
    } catch {
      // Ignore storage quota/private mode failures.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, submittedBy, approver, partnerName, partnerType, primaryCountry, currency, mcc, sumUpEntity, contractTerm, salesforceLink, autoRenewal, submissionDate, primary, rsA, durationA, specBuyrate, durationB, oneCRate, use2A, kickback2A, thresh2A, use2B, kickback2B, thresh2B, use3A, annual3A, use4A, budget4A, rows, hwMethod, directMerchants, hwQty, hwPrice, histTPV, histNR, nCROs, fcastTPV, fcastMerch, mktBudgetRenewal, campaignDesc, approvalDecision, approvalDate, approvalNotes, approvalHistory, gradualAcquisition]);

  const handleShare = async () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(getSnap())));
      await navigator.clipboard.writeText(`${window.location.href.split("#")[0]}#deal=${encoded}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleClear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
    setTab("new"); setSubmittedBy(""); setApprover("Pirmin Dubach"); setPartnerName(""); setPartnerType("ISV");
    setPrimaryCountry(""); setCurrency("EUR"); setMcc(""); setSumUpEntity("SumUp Limited");
    setContractTerm(24); setSalesforceLink(""); setAutoRenewal(false);
    setSubmissionDate(new Date().toISOString().slice(0, 10));
    setPrimary("1A"); setRsA(20); setDurationA("24"); setSpecBuyrate(0.8); setDurationB("24"); setOneCRate(0.10);
    setUse2A(false); setKickback2A(50); setThresh2A(500); setUse2B(false); setKickback2B(50); setThresh2B(500);
    setUse3A(false); setAnnual3A(5000); setUse4A(false); setBudget4A(0);
    setRows([newRow()]); setHwMethod("Hardware"); setDirectMerchants(0);
    setHwQty(HW_DEVICES.map(() => 0)); setHwPrice(HW_DEVICES.map(() => null));
    setHistTPV(0); setHistNR(0); setNCROs(0); setFcastTPV(0); setFcastMerch(0); setMktBudgetRenewal(0); setCampaignDesc("");
    setApprovalDecision(""); setApprovalDate(new Date().toISOString().slice(0, 10)); setApprovalNotes(""); setApprovalHistory([]);
    setGradualAcquisition(false);
  };

  const updateRow = (id: number, field: keyof CountryRow, val: CountryRow[keyof CountryRow]) => {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const u = { ...r, [field]: val };
      if (field === "country") {
        const rt = BLENDED_RATES[String(val)];
        if (rt) {
          u.sellRateD = rt.sellD;
          u.sellRateC = rt.sellC;
        }
      }
      return u;
    }));
  };

  const rowCalcs = useMemo(() => rows.map((row) => {
    const rt = BLENDED_RATES[row.country];
    if (!rt || !row.merchantBase || !row.tpvPerMerchantYearly) return { nrM: 0, annTPV: 0, moTPV: 0, grossNR: 0, partnerPayout: 0, sumUpNR: 0, netMargin: 0 };
    const dc = DC_SPLIT[row.country] || [85, 80];
    const dF = dc[1] / 100, cF = 1 - dF;
    const cpF = hwMethod === "Online" ? 0 : hwMethod === "Tap-to-Pay" ? 1 : dc[0] / 100;
    const cnpF = 1 - cpF;
    const sD = row.sellRateD ?? rt.sellD, sC = row.sellRateC ?? rt.sellC;
    const netD = sD / 100 - rt.buyD / 100, netC = sC / 100 - rt.buyC / 100, netCNP = rt.sellCNP / 100 - rt.buyCNP / 100;
    const blended = cpF * (dF * netD + cF * netC) + cnpF * netCNP;
    const nrM = Math.round(row.merchantBase * (row.targetPct / 100));
    const gradCoeff = gradualAcquisition ? 0.5 : 1;
    const annTPV = nrM * row.tpvPerMerchantYearly * gradCoeff, moTPV = annTPV / 12, grossNR = moTPV * blended;
    let partnerPayout = 0;
    if (primary === "1A") partnerPayout = grossNR * (rsA / 100);
    if (primary === "1B") partnerPayout = moTPV * cpF * Math.max(0, sD / 100 - specBuyrate / 100);
    if (primary === "1C") partnerPayout = moTPV * (oneCRate / 100);
    return { nrM, annTPV, moTPV, grossNR, partnerPayout, sumUpNR: grossNR - partnerPayout, netMargin: blended * 100 };
  }), [rows, primary, rsA, specBuyrate, oneCRate, hwMethod, gradualAcquisition]);

  const totNrM = rowCalcs.reduce((s, r) => s + r.nrM, 0);
  const totGrossNR = rowCalcs.reduce((s, r) => s + r.grossNR, 0);
  const totPartnerPay = rowCalcs.reduce((s, r) => s + r.partnerPayout, 0);
  const totSumUpNR = rowCalcs.reduce((s, r) => s + r.sumUpNR, 0);
  const hwCost = hwMethod === "Hardware" ? HW_DEVICES.reduce((s, d, i) => { const sp = hwPrice[i] ?? d.std; return s + Math.max(0, d.cogs - sp) * hwQty[i]; }, 0) : 0;
  const hwMerchants = hwMethod === "Hardware" ? hwQty.reduce((s, q) => s + q, 0) : totNrM;
  const cac2A = use2A ? hwMerchants * kickback2A : 0;
  const cac2B = use2B ? hwMerchants * kickback2B : 0;
  const cac3A = use3A ? annual3A / 12 : 0;
  const cac4A = use4A ? budget4A / 12 : 0;
  const cacMkt = tab === "renewal" && contractTerm > 0 ? mktBudgetRenewal / contractTerm : 0;
  const totalCAC = hwCost + cac2A + cac2B + cac3A + cac4A + cacMkt;
  const nrPerMerchant = totNrM > 0 ? totSumUpNR / totNrM : 0;
  const rsPerMerchant = totNrM > 0 ? totPartnerPay / totNrM : 0;
  const cacPerMerchant = hwMerchants > 0 ? totalCAC / hwMerchants : 0;
  const totalCacPerMerchant = cacPerMerchant + rsPerMerchant;
  const rampFactor = (totNrM > 0 && hwMerchants > 0) ? (totNrM + hwMerchants) / (2 * totNrM) : 1;
  const rampAdjNrPerMerchant = nrPerMerchant * rampFactor;
  const payback = totalCacPerMerchant > 0 && rampAdjNrPerMerchant > 0 ? totalCacPerMerchant / rampAdjNrPerMerchant : 0;
  const pbOk = payback <= 12 && payback > 0, pbWarn = payback > 12 && payback <= 16, pbBad = (payback > 16 && totSumUpNR > 0) || (totalCAC > 0 && totSumUpNR <= 0);
  const pbColor = pbOk ? "text-emerald-600" : pbWarn ? "text-yellow-600" : "text-red-600";
  const pbBorder = pbOk ? "border-emerald-300" : pbWarn ? "border-yellow-300" : "border-red-300";
  const partnerPctMargin = totGrossNR > 0 ? (totPartnerPay / totGrossNR) * 100 : 0;
  const avgNRperMerch = nCROs > 0 && histNR > 0 ? histNR / 12 / nCROs : 0;
  const errors: string[] = [], warnings: string[] = [];
  rows.forEach((row) => {
    const rt = BLENDED_RATES[row.country]; if (!rt) return;
    const sD = row.sellRateD ?? rt.sellD, sC = row.sellRateC ?? rt.sellC;
    if (sD / 100 < rt.buyD / 100) errors.push(`${COUNTRY_NAMES[row.country] || row.country}: Sell Rate (Debit) below Buy Rate`);
    if (sC / 100 < rt.buyC / 100) errors.push(`${COUNTRY_NAMES[row.country] || row.country}: Sell Rate (Credit) below Buy Rate`);
    if (primary === "1B" && specBuyrate / 100 < rt.buyD / 100) errors.push(`${COUNTRY_NAMES[row.country]}: 1B buyrate below actual buy rate`);
  });
  if (primary === "1A" && (rsA < 5 || rsA > 50)) errors.push("1A: Revenue Share must be 5%–50%");
  if (primary === "1C" && (oneCRate < 0.05 || oneCRate > 0.25)) errors.push("1C: Rate must be 0.05%–0.25%");
  if (primary === "1C" && totSumUpNR < 0) errors.push("CRITICAL: 1C payout exceeds SumUp margin — deal is loss-making");
  if (use2A && (kickback2A < 20 || kickback2A > 200)) errors.push("2A Kickback must be 20–200");
  if (use2A && (thresh2A < 300 || thresh2A > 3000)) errors.push("2A Threshold must be 300–3,000");
  if (use2B && (kickback2B < 20 || kickback2B > 600)) errors.push("2B Amount must be 20–600");
  if (use3A && (annual3A < 2000 || annual3A > 15000)) errors.push("3A must be 2,000–15,000");
  if (pbBad && totSumUpNR > 0) errors.push(`Payback ${f1(payback)}M exceeds 16-month maximum`);
  if (pbWarn) warnings.push(`Payback ${f1(payback)}M requires manager approval (12–16M range)`);
  if (primary === "1C" && partnerPctMargin > 80 && partnerPctMargin <= 100) warnings.push(`Partner takes ${f1(partnerPctMargin)}% of SumUp margin — very thin`);
  const status = errors.length > 0 ? "NOT APPROVED" : totSumUpNR <= 0 || totalCAC === 0 ? "PENDING" : pbOk ? "PRE-APPROVED" : pbWarn ? "NEEDS APPROVAL" : "NOT APPROVED";
  const sBg = status === "PRE-APPROVED" ? "bg-green-100 text-green-800" : status === "NEEDS APPROVAL" ? "bg-yellow-100 text-yellow-800" : status === "NOT APPROVED" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600";
  const hasData = rows.some((r) => r.country && r.merchantBase > 0 && r.tpvPerMerchantYearly > 0);

  // ── APPROVER POSITIONS ──────────────────────────────────────────────────────
  const APPROVER_POSITIONS: Record<string, string> = {
    "Duco Trienekens": "VP Retail and Partnerships",
    "Pirmin Dubach": "Partner Acquisition Lead",
    "Giulia Lorenzini": "Partner Growth Lead",
    "Karla Gordovil": "Partner Development Lead",
    "Omar Kassem": "Head of Sales Engineering",
  };

  // ── BUILD SHEET PAYLOAD (shared by CSV and Make.com webhook) ────────────────
  const buildPayload = () => {
    const _sd = new Date(submissionDate), _sy = _sd.getFullYear(), _sm = _sd.getMonth() + 1, _sq = Math.ceil(_sm / 3);
    const _r0 = rows[0], _rt0 = _r0 ? BLENDED_RATES[_r0.country] : null;
    const _sD = _r0 && _r0.sellRateD != null ? _r0.sellRateD : (_rt0 ? _rt0.sellD : null);
    const _sC = _r0 && _r0.sellRateC != null ? _r0.sellRateC : (_rt0 ? _rt0.sellC : null);
    return {
      // Submission
      "Partner Manager": submittedBy || "",
      "Partnership Type": partnerType,
      "Account Name": partnerName || "",
      "Country": COUNTRY_NAMES[primaryCountry] || primaryCountry || "",
      "Submission Date": submissionDate,
      "Submission Year": _sy,
      "Submission Month": _sm,
      "Submission Q": `Q${_sq}`,
      "Submission Year-Month": `${_sy}-${String(_sm).padStart(2, "0")}`,
      "Submission Year-Q": `${_sy}-Q${_sq}`,
      // Commercial
      "Commercial Model": primary,
      "Sell Rate Debit %": _sD != null ? _sD.toFixed(4) : "",
      "Buy Rate Debit %": _rt0 ? _rt0.buyD.toFixed(4) : "",
      "Sell Rate Credit %": _sC != null ? _sC.toFixed(4) : "",
      "Buy Rate Credit %": _rt0 ? _rt0.buyC.toFixed(4) : "",
      "Rev-Share %": primary === "1A" ? `${rsA}%` : "",
      "Rev-Share Duration": primary === "1A" ? durationA : primary === "1B" ? durationB : "",
      "Activation Commission (EUR)": use2A ? kickback2A : "",
      "Activation Commission Threshold": use2A ? thresh2A : "",
      "Standard Hardware Pricing": hwMethod === "Hardware"
        ? HW_DEVICES.reduce((acc: string[], d, i) => (hwQty[i] > 0 ? [...acc, `${d.name}: €${hwPrice[i] ?? d.std}`] : acc), []).join("; ") || "No devices selected"
        : "N/A",
      // Estimates
      "Estimated Year 1 TPV": rowCalcs.reduce((s, r) => s + r.annTPV, 0).toFixed(0),
      "Estimated Year 1 NR": (totSumUpNR * 12).toFixed(2),
      "Estimated New Merchants": totNrM,
      "Estimated Payback": totSumUpNR > 0 && totalCAC > 0 ? payback.toFixed(1) : "N/A",
      // Contract
      "Contract Length (months)": contractTerm,
      "Autorenewal": autoRenewal ? "Yes" : "No",
      "Autorenewal Period": autoRenewal ? `${contractTerm} months` : "N/A",
      // Approval
      "Approval Status": approvalDecision || "Awaiting decision",
      "Approval Note": approvalNotes || "",
      "Rejection Note": approvalDecision === "Rejected" ? approvalNotes || "" : " N/A",
      "Approver": approver || "",
      "Position": APPROVER_POSITIONS[approver] || "",
      "Approval Date": approvalDecision ? approvalDate : "",
    };
  };

  // ── SAVE TO HISTORY (+ optional Make.com webhook) ───────────────────────────
  const handleSaveToHistory = async () => {
    if (approvalHistory.length >= 5) return;
    setApprovalHistory((prev) => [...prev, {
      id: Date.now(), round: prev.length + 1,
      decision: approvalDecision || "Pending",
      approverName: approver, date: approvalDate,
    }]);
    // Send to Google Sheets via Make.com webhook if URL is configured
    if (MAKE_WEBHOOK_URL) {
      try {
        await fetch(MAKE_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
      } catch (err) { console.error("Webhook failed:", err); }
    }
  };

  // ── CSV DOWNLOAD ─────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const L: string[] = [];
    const kv = (k: string, v: unknown) => L.push(`${q(k)},${q(v)}`);
    const blank = () => L.push("");
    const title = (t: string) => { blank(); L.push(t); };
    const row = (...c: unknown[]) => L.push(c.map(q).join(","));
    const payload = buildPayload();
    L.push(`"SumUp Deal Approval Calculator — Export"`);
    kv("Generated", new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));
    kv("Calculator Status", status);
    blank();
    title("APPROVAL DECISION");
    kv("Approval Status", payload["Approval Status"]);
    kv("Approver", payload["Approver"] || "—");
    kv("Position", payload["Position"] || "—");
    kv("Approval Date", payload["Approval Date"] || "—");
    kv("Approval Note", payload["Approval Note"] || "—");
    kv("Rejection Note", payload["Rejection Note"]);
    if (approvalHistory.length > 0) { blank(); title("APPROVAL HISTORY"); row("Round", "Decision", "Approver", "Date"); approvalHistory.forEach((h) => row(`#${h.round}`, h.decision, h.approverName, h.date)); }
    blank(); title("1. DEAL SUBMISSION");
    kv("Partner Manager", payload["Partner Manager"] || "—");
    kv("Submission Date", payload["Submission Date"]);
    kv("Submission Year", payload["Submission Year"]);
    kv("Submission Month", payload["Submission Month"]);
    kv("Submission Q", payload["Submission Q"]);
    kv("Submission Year-Month", payload["Submission Year-Month"]);
    kv("Submission Year-Q", payload["Submission Year-Q"]);
    kv("Salesforce Link", salesforceLink || "—"); blank();
    kv("Account Name", payload["Account Name"] || "—");
    kv("Partnership Type", payload["Partnership Type"]);
    kv("SumUp Entity", sumUpEntity || "—");
    kv("Country", payload["Country"] || "—");
    kv("Currency", currency); kv("MCC", mcc || "—");
    kv("Contract Length (months)", payload["Contract Length (months)"]);
    kv("Autorenewal", payload["Autorenewal"]);
    kv("Autorenewal Period", payload["Autorenewal Period"]);
    kv("Tab", tab === "new" ? "New Partnership" : "Partnership Renewal");
    if (tab === "renewal") { blank(); title("1B. RENEWAL — HISTORICAL DATA"); kv("Monthly TPV avg", histTPV > 0 ? histTPV : "—"); kv("NR Total 12M", histNR > 0 ? histNR : "—"); kv("nCROs", nCROs > 0 ? nCROs : "—"); kv("Avg Monthly NR/Merchant", avgNRperMerch > 0 ? avgNRperMerch.toFixed(2) : "—"); blank(); kv("Forecast Monthly TPV", fcastTPV > 0 ? fcastTPV : "—"); kv("Forecast New Merchants", fcastMerch > 0 ? fcastMerch : "—"); if (mktBudgetRenewal > 0) { kv("Marketing Budget", mktBudgetRenewal); kv("Campaign", campaignDesc || "—"); } }
    blank(); title("2. COMMERCIAL STRUCTURE");
    kv("Commercial Model", payload["Commercial Model"]);
    if (payload["Sell Rate Debit %"]) kv("Sell Rate Debit %", payload["Sell Rate Debit %"]);
    if (payload["Sell Rate Credit %"]) kv("Sell Rate Credit %", payload["Sell Rate Credit %"]);
    if (payload["Buy Rate Debit %"]) kv("Buy Rate Debit %", payload["Buy Rate Debit %"]);
    if (payload["Buy Rate Credit %"]) kv("Buy Rate Credit %", payload["Buy Rate Credit %"]);
    if (primary === "1A") { kv("Rev-Share %", payload["Rev-Share %"]); kv("Rev-Share Duration", payload["Rev-Share Duration"]); }
    if (primary === "1B") { kv("1B Specified Buyrate %", `${specBuyrate}%`); kv("1B Duration", durationB); }
    if (primary === "1C") { kv("1C Rate % of TPV", `${oneCRate}%`); kv("1C Duration", "Lifetime — Card Present only"); }
    blank(); kv("2A Active", use2A ? "Yes" : "No"); if (use2A) { kv("Activation Commission (EUR)", payload["Activation Commission (EUR)"]); kv("Activation Commission Threshold", payload["Activation Commission Threshold"]); }
    kv("2B Active", use2B ? "Yes" : "No"); if (use2B) { kv("2B Amount", kickback2B); kv("2B Threshold", thresh2B); }
    kv("3A Active", use3A ? "Yes" : "No"); if (use3A) kv("3A Annual", annual3A);
    kv("4A Active", use4A ? "Yes" : "No"); if (use4A) kv("4A Budget", budget4A);
    blank(); title("3. COUNTRY BREAKDOWN");
    kv("Acquisition Mode", gradualAcquisition ? "Gradual — TPV ×0.5 (merchants join throughout year)" : "All at once — full TPV from day 1");
    row("Country", "Code", "Merchant Base (annual)", "Activation rate %", "Nr Merchants", "Avg Yearly TPV/Merchant", "Annual TPV", "Monthly TPV", "Sell Rate D %", "Sell Rate C %", "Net Margin %", "Monthly Gross NR", "Partner Payout/Mo", "SumUp NR/Mo");
    rows.forEach((r, i) => { const rc = rowCalcs[i]; const rt = BLENDED_RATES[r.country]; row(COUNTRY_NAMES[r.country] || "—", r.country || "—", r.merchantBase, `${r.targetPct}%`, rc.nrM, r.tpvPerMerchantYearly, rc.annTPV > 0 ? rc.annTPV.toFixed(0) : "—", rc.moTPV > 0 ? rc.moTPV.toFixed(0) : "—", r.sellRateD != null ? `${r.sellRateD.toFixed(4)}%` : (rt ? `${rt.sellD.toFixed(4)}%` : "—"), r.sellRateC != null ? `${r.sellRateC.toFixed(4)}%` : (rt ? `${rt.sellC.toFixed(4)}%` : "—"), rc.netMargin > 0 ? `${rc.netMargin.toFixed(4)}%` : "—", rc.grossNR > 0 ? rc.grossNR.toFixed(2) : "—", rc.partnerPayout > 0 ? rc.partnerPayout.toFixed(2) : "—", rc.sumUpNR !== 0 ? rc.sumUpNR.toFixed(2) : "—"); });
    row("TOTAL", "", rows.reduce((s, r) => s + r.merchantBase, 0), "", totNrM, "", "", "", "", "", "", totGrossNR.toFixed(2), totPartnerPay.toFixed(2), totSumUpNR.toFixed(2));
    blank(); title("4. HARDWARE"); kv("Payment Method", hwMethod);
    kv("Standard Hardware Pricing", payload["Standard Hardware Pricing"]);
    if (hwMethod !== "Hardware") { kv("Merchants/Month", directMerchants); }
    else { blank(); row("Device", "COGS", "Std Price", "Sell Price", "Monthly Qty", "Unit Subsidy", "Monthly Cost"); let anyHw = false; HW_DEVICES.forEach((d, i) => { if (hwQty[i] > 0) { anyHw = true; const sp = hwPrice[i] ?? d.std; const sub = Math.max(0, d.cogs - sp); row(d.name, d.cogs, d.std, sp, hwQty[i], sub.toFixed(2), (sub * hwQty[i]).toFixed(2)); } }); if (!anyHw) L.push(`"(no hardware)"`); blank(); kv("Total Monthly HW Cost", hwCost.toFixed(2)); }
    blank(); title("5. PAYBACK ANALYSIS"); blank();
    kv("Monthly Gross NR", totGrossNR > 0 ? totGrossNR.toFixed(2) : "—");
    kv(`Partner Payout — ${primary}`, totPartnerPay > 0 ? `-${totPartnerPay.toFixed(2)}` : "—");
    kv("Monthly SumUp NR after RS", totSumUpNR.toFixed(2));
    kv("NR per Merchant/Month", totNrM > 0 ? (totSumUpNR / totNrM).toFixed(2) : "—");
    kv("Estimated Year 1 TPV", payload["Estimated Year 1 TPV"]);
    kv("Estimated New Merchants", payload["Estimated New Merchants"]);
    kv("Estimated Year 1 NR", payload["Estimated Year 1 NR"]); blank();
    kv("Hardware Subsidy/Mo", hwCost.toFixed(2));
    if (use2A) kv(`2A Commissions (${hwMerchants}x${kickback2A})`, cac2A.toFixed(2));
    if (use2B) kv(`2B Commissions (${hwMerchants}x${kickback2B})`, cac2B.toFixed(2));
    if (use3A) kv(`3A Annual Payment / 12M`, cac3A.toFixed(2));
    if (use4A) kv(`4A Marketing Budget / 12M`, cac4A.toFixed(2));
    kv("Total Monthly CAC", totalCAC.toFixed(2)); blank();
    kv("PAYBACK (months)", payload["Estimated Payback"]);
    kv("APPROVAL STATUS", status);
    if (primary === "1C" && totGrossNR > 0) { blank(); title("5B. 1C RISK CHECK"); kv("SumUp Gross Margin/Mo", totGrossNR.toFixed(2)); kv("Partner 1C Payout/Mo", totPartnerPay.toFixed(2)); kv("SumUp Keeps/Mo", totSumUpNR.toFixed(2)); kv("Partner % of SumUp Margin", `${partnerPctMargin.toFixed(1)}%`); }
    if (errors.length > 0 || warnings.length > 0) { blank(); title("6. VALIDATION"); errors.forEach((e) => kv("ERROR", e)); warnings.forEach((w) => kv("WARNING", w)); }
    downloadTextFile(L.join("\r\n"), `Deal_${(partnerName || "Partner").replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 text-left">
      <div className="max-w-5xl mx-auto px-4 space-y-5">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deal Approval Calculator</h1>
            <p className="text-xs text-gray-400 mt-0.5">Yellow = manual input · Grey = auto-calculated · Blended rates Apr 2026</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {hasData && <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${sBg}`}>{status}</span>}
              <span className="text-xs text-gray-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>Auto-saved</span>
              <button onClick={handleSaveToHistory} className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"><Plus size={13} />Save to History</button>
              <button onClick={downloadCSV} className="flex items-center gap-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-medium px-3 py-2 rounded-lg transition-colors"><Download size={12} />Download CSV</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${copied ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}>{copied ? "✓ Link copied!" : "Share Deal"}</button>
              <button onClick={handleClear} className="text-xs font-medium px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors">+ New Deal</button>
            </div>
          </div>
        </div>

        {/* DEAL SUBMISSION */}
        <SCard>
          <SCardH><SCardT>Deal Submission</SCardT></SCardH>
          <SCardB className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div><Lbl text="Submitted by" /><YI value={submittedBy} onChange={setSubmittedBy} type="text" placeholder="Your name" /></div>
              <div><Lbl text="Submission Date" /><input type="date" value={submissionDate} onChange={(e) => setSubmissionDate(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" /></div>
              <div><Lbl text="Salesforce Link" /><YI value={salesforceLink} onChange={setSalesforceLink} type="text" placeholder="https://..." /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Lbl text="Partner Name" /><YI value={partnerName} onChange={setPartnerName} type="text" placeholder="e.g. Hello Cash GmbH" /></div>
              <div><Lbl text="Partnership Type" /><select value={partnerType} onChange={(e) => setPartnerType(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"><option>ISV</option><option>Reseller</option><option>Referral</option></select></div>
              <div><Lbl text="SumUp Entity" />
                <select value={sumUpEntity} onChange={(e) => setSumUpEntity(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="SumUp Limited">SumUp Limited</option>
                  <option value="SumUp Payments Limited">SumUp Payments Limited</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><Lbl text="Country" /><select value={primaryCountry} onChange={(e) => setPrimaryCountry(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"><option value="">Select...</option>{RATES.map((r) => <option key={r.code} value={r.code}>{COUNTRY_NAMES[r.code]} ({r.code})</option>)}</select></div>
              <div><Lbl text="Currency" /><GreyBox v={currency} /></div>
              <div><Lbl text="MCC" /><select value={mcc} onChange={(e) => setMcc(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"><option value="">Select MCC...</option>{MCC_CATEGORIES.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
              <div><Lbl text="Contract Term (months)" /><input type="number" value={contractTerm} min={12} max={60} onChange={(e) => setContractTerm(parseInt(e.target.value) || 24)} onFocus={(e) => (e.target as HTMLInputElement).select()} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div><Lbl text="Approver" />
                <select value={approver} onChange={(e) => setApprover(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select approver...</option>
                  <option value="Duco Trienekens">Duco Trienekens — VP Retail and Partnerships</option>
                  <option value="Pirmin Dubach">Pirmin Dubach — Partner Acquisition Lead</option>
                  <option value="Giulia Lorenzini">Giulia Lorenzini — Partner Growth Lead</option>
                  <option value="Karla Gordovil">Karla Gordovil — Partner Development Lead</option>
                  <option value="Omar Kassem">Omar Kassem — Head of Sales Engineering</option>
                </select>
              </div>
              <div className="pb-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={autoRenewal} onChange={(e) => setAutoRenewal(e.target.checked)} className="w-4 h-4 accent-blue-600" /><span className="text-sm font-medium text-gray-700">Autorenewal</span><span className="text-xs text-gray-400">{autoRenewal ? "Renews automatically" : "No autorenewal"}</span></label></div>
            </div>
          </SCardB>
        </SCard>

        {/* APPROVAL DECISION */}
        <SCard className={`border-2 ${approvalDecision === "Approved" ? "border-emerald-300" : approvalDecision === "Rejected" ? "border-red-300" : approvalDecision === "Request Changes" ? "border-yellow-300" : "border-gray-200"}`}>
          <SCardH>
            <div className="flex items-center justify-between">
              <SCardT>Approval Decision</SCardT>
              {approvalDecision ? <span className={`text-xs font-bold px-3 py-1 rounded-full ${approvalDecision === "Approved" ? "bg-emerald-100 text-emerald-800" : approvalDecision === "Rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{approvalDecision}</span> : <span className="text-xs text-gray-400 italic">Awaiting decision</span>}
            </div>
          </SCardH>
          <SCardB className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Decision <span className="text-gray-400 font-normal">(to be filled by approver)</span></p>
              <div className="flex gap-2 flex-wrap">
                {(["Approved", "Rejected", "Request Changes"] as const).map((d) => (
                  <button key={d} onClick={() => setApprovalDecision(approvalDecision === d ? "" : d)} className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${approvalDecision === d ? d === "Approved" ? "border-emerald-400 bg-emerald-100 text-emerald-800" : d === "Rejected" ? "border-red-400 bg-red-100 text-red-800" : "border-yellow-400 bg-yellow-100 text-yellow-800" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}>
                    {d === "Approved" ? "✓ Approve" : d === "Rejected" ? "✗ Reject" : "↩ Request Changes"}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Lbl text="Approver" />
                <select value={approver} onChange={(e) => setApprover(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select approver...</option>
                  <option value="Duco Trienekens">Duco Trienekens</option>
                  <option value="Pirmin Dubach">Pirmin Dubach</option>
                  <option value="Giulia Lorenzini">Giulia Lorenzini</option>
                  <option value="Karla Gordovil">Karla Gordovil</option>
                  <option value="Omar Kassem">Omar Kassem</option>
                </select>
              </div>
              <div><Lbl text="Decision Date" /><input type="date" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" /></div>
            </div>
            <div><Lbl text="Notes (optional)" /><input type="text" value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} placeholder="e.g. Approved subject to 18-month minimum term" className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" /></div>
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approval History</p>
                <button onClick={handleSaveToHistory} className="text-xs text-blue-600 border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 transition-colors flex items-center gap-1"><Plus size={11} />Save to History</button>
              </div>
              {approvalHistory.length === 0 ? <p className="text-xs text-gray-400 italic">No history yet. Fill in a decision above and click Save to History.</p> :
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-gray-200"><th className="text-left py-1 pr-2 text-gray-400 font-medium w-12">Round</th><th className="text-left py-1 px-2 text-gray-400 font-medium">Decision</th><th className="text-left py-1 px-2 text-gray-400 font-medium">Approver</th><th className="text-left py-1 px-2 text-gray-400 font-medium">Date</th><th className="w-5"></th></tr></thead>
                  <tbody>{approvalHistory.map((h) => (<tr key={h.id} className="border-b border-gray-100"><td className="py-1.5 pr-2 font-semibold text-gray-600">#{h.round}</td><td className="py-1.5 px-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${h.decision === "Approved" ? "bg-emerald-100 text-emerald-700" : h.decision === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{h.decision}</span></td><td className="py-1.5 px-2 text-gray-600">{h.approverName}</td><td className="py-1.5 px-2 text-gray-500">{h.date}</td><td className="py-1.5 pl-1"><button onClick={() => setApprovalHistory((p) => p.filter((x) => x.id !== h.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={11} /></button></td></tr>))}</tbody>
                </table>}
            </div>
          </SCardB>
        </SCard>

        {/* PAYBACK */}
        <SCard className={`border-2 ${pbBorder}`}>
          <SCardH><div className="flex items-center justify-between"><SCardT>Payback Analysis</SCardT>{hasData && <span className={`text-xs font-bold px-3 py-1 rounded-full ${sBg}`}>{status}</span>}</div></SCardH>
          <SCardB className="space-y-5">
            <div className="text-center py-2">
              <div className={`text-5xl font-black ${!hasData ? "text-gray-200" : pbColor}`}>{!hasData ? "—" : totSumUpNR > 0 ? `${f1(payback)}M` : "no NR"}</div>
              <div className="text-sm text-gray-500 mt-1">months to recover investment</div>
              {!hasData ? <p className="text-xs text-gray-400 mt-1">Fill in the country table below to calculate</p> : <p className={`text-xs font-semibold mt-1 ${pbColor}`}>{pbOk && "Healthy — under 12 months"}{pbWarn && "Caution — 12–16 months, needs approval"}{pbBad && totSumUpNR > 0 && "Exceeds 16-month maximum"}{totSumUpNR <= 0 && totalCAC > 0 && "No positive NR — check rates and model"}</p>}
            </div>
            {hasData && totSumUpNR > 0 && payback > 0 && payback <= 36 && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Month 0</span><span>Month 12</span><span>Month 24</span><span>Month 36</span></div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className={`h-full rounded-full transition-all ${pbOk ? "bg-emerald-400" : pbWarn ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${Math.min(100, (payback / 36) * 100)}%` }} />
                  <div className="absolute top-0 h-full border-l-2 border-emerald-600 border-dashed opacity-60" style={{ left: "33.3%" }} />
                  <div className="absolute top-0 h-full border-l-2 border-red-400 border-dashed opacity-60" style={{ left: "44.4%" }} />
                </div>
                <div className="flex text-xs mt-1"><span style={{ marginLeft: "33%" }} className="text-emerald-600">12M</span><span style={{ marginLeft: "3%" }} className="text-red-500">16M</span></div>
              </div>
            )}
            {hasData && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-600 mb-3">Payback = (Hardware + 2A + 4A + Revenue Share payout per new merchant) ÷ Monthly SumUp Net Revenue per merchant</p>
                <div className="grid grid-cols-2 gap-6 text-xs">
                  <div><p className="font-semibold text-gray-500 mb-2">Monthly CAC</p><div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-gray-500">Hardware subsidies</span><span className="font-medium">{fE(hwCost)}</span></div>
                    {use2A && <div className="flex justify-between"><span className="text-gray-500">2A Commissions</span><span className="font-medium">{fE(cac2A)}</span></div>}
                    {use2B && <div className="flex justify-between"><span className="text-gray-500">2B Commissions</span><span className="font-medium">{fE(cac2B)}</span></div>}
                    {use3A && <div className="flex justify-between"><span className="text-gray-500">3A Annual Payment / 12M</span><span className="font-medium">{fE(cac3A)}</span></div>}
                    {use4A && <div className="flex justify-between"><span className="text-gray-500">4A Marketing Budget / 12M</span><span className="font-medium">{fE(cac4A)}</span></div>}
                    {tab === "renewal" && mktBudgetRenewal > 0 && <div className="flex justify-between"><span className="text-gray-500">Renewal Mkt / {contractTerm}M</span><span className="font-medium">{fE(cacMkt)}</span></div>}
                    <div className="flex justify-between font-bold border-t border-gray-200 pt-1.5"><span>Total Monthly CAC</span><span>{fE(totalCAC)}</span></div>
                    {totPartnerPay > 0 && <div className="flex justify-between"><span className="text-gray-500">Revenue Share payout / new merchant</span><span className="font-medium text-amber-700">{fE(rsPerMerchant)}</span></div>}
                    <div className="flex justify-between text-gray-400 border-t border-gray-100 pt-1"><span>New merchants / month</span><span>{hwMerchants}</span></div>
                    <div className="flex justify-between text-blue-700 font-semibold"><span>Total CAC per new merchant</span><span>{fE(totalCacPerMerchant)}</span></div>
                  </div></div>
                  <div><p className="font-semibold text-gray-500 mb-2">Monthly Net Revenue</p><div className="space-y-1.5">
                    <div className="flex justify-between"><span className="text-gray-500">Gross NR (all countries)</span><span className="font-medium">{fE(totGrossNR)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Partner payout ({primary})</span><span className="font-medium text-amber-700">-{fE(totPartnerPay)}</span></div>
                    <div className="flex justify-between font-bold border-t border-gray-200 pt-1.5"><span>SumUp NR after Rev Share</span><span className={totSumUpNR < 0 ? "text-red-700" : "text-emerald-700"}>{fE(totSumUpNR)}</span></div>
                    <div className="flex justify-between text-blue-700 font-semibold"><span>NR / merchant / month</span><span>{totNrM > 0 ? fE(nrPerMerchant) : "—"}</span></div>
                    <div className="flex justify-between text-gray-400"><span>First year NR</span><span>{fE(totSumUpNR * 12)}</span></div>
                  </div></div>
                </div>
              </div>
            )}
            {hasData && primary === "1C" && totPartnerPay > 0 && (
              <div className={`rounded-xl p-4 border text-xs ${totSumUpNR < 0 ? "border-red-300 bg-red-50" : partnerPctMargin > 80 ? "border-yellow-300 bg-yellow-50" : "border-emerald-300 bg-emerald-50"}`}>
                <p className="font-semibold mb-2 text-gray-700">1C Risk Check</p>
                <div className="grid grid-cols-3 gap-4">
                  <div><div className="text-gray-400">SumUp Gross Margin</div><div className="font-semibold">{fE(totGrossNR)}</div></div>
                  <div><div className="text-gray-400">1C Partner Payout</div><div className="font-semibold text-amber-700">{fE(totPartnerPay)}</div></div>
                  <div><div className="text-gray-400">SumUp Keeps</div><div className={`font-semibold ${totSumUpNR < 0 ? "text-red-700" : "text-emerald-700"}`}>{fE(totSumUpNR)}</div></div>
                </div>
                <p className="mt-2 text-gray-500">Partner takes <strong>{f1(partnerPctMargin)}%</strong> of SumUp margin. Equivalent to <strong>{f1(partnerPctMargin)}% revenue share</strong> under current fees.</p>
              </div>
            )}
          </SCardB>
        </SCard>

        {/* TABS */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(["new", "renewal"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg transition-all ${tab === t ? "bg-white text-blue-700 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"}`}>
              {t === "new" ? "New Partnership" : "Partnership Renewal"}
            </button>
          ))}
        </div>

        {/* RENEWAL */}
        {tab === "renewal" && (
          <SCard>
            <SCardH><SCardT>Historical Performance — Last 12 Months</SCardT></SCardH>
            <SCardB className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div><Lbl text="Monthly TPV avg (€)" tip="From Tableau" /><YI value={histTPV} onChange={setHistTPV} placeholder="From Tableau" /></div>
                <div><Lbl text="NR Total 12M (€)" tip="From Tableau" /><YI value={histNR} onChange={setHistNR} placeholder="From Tableau" /></div>
                <div><Lbl text="nCROs (12M cohort)" /><YI value={nCROs} onChange={setNCROs} /></div>
                <div><Lbl text="Avg Monthly NR / Merchant" /><GreyBox v={avgNRperMerch > 0 ? fE(avgNRperMerch) : "—"} /></div>
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">Forward-Looking — Next 12 Months</p>
              <div className="grid grid-cols-2 gap-4">
                <div><Lbl text="Forecast Monthly TPV (€)" /><YI value={fcastTPV} onChange={setFcastTPV} /></div>
                <div><Lbl text="Forecast New Merchants (12M)" /><YI value={fcastMerch} onChange={setFcastMerch} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div><Lbl text="Marketing Budget (€) — optional" /><YI value={mktBudgetRenewal} onChange={setMktBudgetRenewal} /></div>
                <div><Lbl text="Campaign Description" /><YI value={campaignDesc} onChange={setCampaignDesc} type="text" placeholder="e.g. Q3 merchant activation" /></div>
              </div>
            </SCardB>
          </SCard>
        )}

        {/* COMMERCIAL STRUCTURE */}
        <SCard>
          <SCardH><SCardT>Commercial Structure</SCardT></SCardH>
          <SCardB className="space-y-5">
            <div>
              <p className="text-xs text-gray-500 mb-2">Primary Revenue Model <span className="text-gray-400">(pick one)</span></p>
              <div className="grid grid-cols-3 gap-3">
                {(["1A", "1B", "1C"] as PrimaryModel[]).map((m) => (
                  <button key={m} onClick={() => setPrimary(m)} className={`p-3 rounded-lg border text-left transition-colors ${primary === m ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <div className={`text-sm font-bold ${primary === m ? "text-blue-700" : "text-gray-700"}`}>{m}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{m === "1A" && "Rev share above buyrate (5%–50%)"}{m === "1B" && "100% rev share above specified buyrate"}{m === "1C" && "TPV-based flat rate (0.05%–0.25%)"}</div>
                  </button>
                ))}
              </div>
            </div>
            {primary === "1A" && (<div className="grid grid-cols-2 gap-4 pl-4 border-l-4 border-blue-200"><div><Lbl text="Revenue Share % (5–50)" /><YI value={rsA} onChange={setRsA} step={1} min={5} max={50} error={rsA < 5 || rsA > 50} /></div><div><Lbl text="Duration (months or Lifetime)" /><input type="text" value={durationA} onChange={(e) => setDurationA(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none" /></div></div>)}
            {primary === "1B" && (<div className="grid grid-cols-2 gap-4 pl-4 border-l-4 border-blue-200"><div><Lbl text="Specified Buyrate % (partner gets 100% above this)" /><YI value={specBuyrate} onChange={setSpecBuyrate} step={0.01} /></div><div><Lbl text="Duration" /><input type="text" value={durationB} onChange={(e) => setDurationB(e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded-md px-3 py-2 text-sm outline-none" /></div></div>)}
            {primary === "1C" && (<div className="grid grid-cols-2 gap-4 pl-4 border-l-4 border-blue-200"><div><Lbl text="1C Rate % of TPV (0.05–0.25)" /><YI value={oneCRate} onChange={setOneCRate} step={0.01} min={0.05} max={0.25} error={oneCRate < 0.05 || oneCRate > 0.25} /><p className="text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle size={10} />Card Present only · Lifetime</p></div><div><Lbl text="Duration" /><GreyBox v="Lifetime (fixed)" /></div></div>)}
            <div>
              <p className="text-xs text-gray-500 mb-2">Optional Add-Ons</p>
              <div className="grid grid-cols-2 gap-3">
                {([{ id: "2A", label: "2A — Activation Commission", sub: "€20–€200 per merchant", state: use2A, set: setUse2A }, { id: "2B", label: "2B — Integration Commission", sub: "€20–€600 per merchant", state: use2B, set: setUse2B }, { id: "3A", label: "3A — Annual Payment", sub: "€2,000–€15,000", state: use3A, set: setUse3A }, { id: "4A", label: "4A — Marketing Budget", sub: "Performance-based", state: use4A, set: setUse4A }]).map(({ id, label, sub, state, set }) => (
                  <label key={id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${state ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="checkbox" checked={state} onChange={(e) => set(e.target.checked)} className="mt-0.5 accent-blue-600" />
                    <div><div className={`text-sm font-medium ${state ? "text-blue-800" : "text-gray-700"}`}>{label}</div><div className="text-xs text-gray-400">{sub}</div></div>
                  </label>
                ))}
              </div>
            </div>
            {use2A && (<div className="grid grid-cols-2 gap-4 pl-4 border-l-4 border-purple-200"><div><Lbl text="2A Kickback (€20–€200)" /><YI value={kickback2A} onChange={setKickback2A} min={20} max={200} error={kickback2A < 20 || kickback2A > 200} /></div><div><Lbl text="2A TPV Threshold (€300–€3,000)" /><YI value={thresh2A} onChange={setThresh2A} min={300} max={3000} error={thresh2A < 300 || thresh2A > 3000} /></div></div>)}
            {use2B && (<div className="grid grid-cols-2 gap-4 pl-4 border-l-4 border-purple-200"><div><Lbl text="2B Amount (€20–€600)" /><YI value={kickback2B} onChange={setKickback2B} min={20} max={600} error={kickback2B < 20 || kickback2B > 600} /></div><div><Lbl text="2B TPV Threshold" /><YI value={thresh2B} onChange={setThresh2B} min={300} max={5000} /></div></div>)}
            {use3A && (<div className="pl-4 border-l-4 border-purple-200"><Lbl text="3A Annual Payment (€2,000–€15,000)" /><YI value={annual3A} onChange={setAnnual3A} min={2000} max={15000} error={annual3A < 2000 || annual3A > 15000} /></div>)}
            {use4A && (<div className="pl-4 border-l-4 border-purple-200 space-y-1"><Lbl text="4A Marketing Budget — Annual (€)" tip="Enter total expected first-year marketing investment. Include all planned campaigns, not just the launch. Recommended minimum: €3,000." /><YI value={budget4A} onChange={setBudget4A} min={0} /><p className="text-xs text-amber-700 flex items-center gap-1"><AlertTriangle size={10} />Annual budget. Include full first-year spend — not just the launch. Minimum recommended: <strong>€3,000</strong>.</p></div>)}
          </SCardB>
        </SCard>

        {/* COUNTRY TABLE */}
        <SCard>
          <SCardH><div className="flex items-center justify-between"><div><SCardT>Merchant Base and TPV — Multi-Country</SCardT><p className="text-xs text-gray-400 mt-0.5">Sell D % and Sell C % auto-fill from blended data — override to test custom / negotiated pricing.</p></div><div className="flex items-center gap-2"><label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${gradualAcquisition ? "border-amber-400 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`} title="Enable for reseller/acquisition partnerships where merchants join gradually throughout the year (e.g. 10/month). Applies a 0.5x coefficient to annual TPV."><input type="checkbox" checked={gradualAcquisition} onChange={(e) => setGradualAcquisition(e.target.checked)} className="accent-amber-600 w-3 h-3" />{gradualAcquisition ? "Gradual acquisition ✓" : "Gradual acquisition"}</label><button onClick={() => setRows((r) => [...r, newRow()])} className="flex items-center gap-1 text-xs text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors"><Plus size={12} />Add Country</button></div></div></SCardH>
          <SCardB>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-medium">
                    <th className="text-left py-2 pr-2">Country</th><th className="text-right py-2 px-2">Merchant Base (annual)</th><th className="text-right py-2 px-2" title="Realistic % of projected merchant base expected to activate SumUp. Resellers: 80–100%. ISVs: 5–30%. Also models churn (e.g. 80% = 20% churn).">Activation rate %</th><th className="text-right py-2 px-2">Avg Yearly TPV / Merchant</th><th className="text-right py-2 px-2" title="Sell rate for debit cards. Auto-filled from country blended data — override to reflect actual negotiated pricing.">Sell D %</th><th className="text-right py-2 px-2" title="Sell rate for credit cards. Auto-filled from country blended data — override to reflect actual negotiated pricing.">Sell C %</th><th className="text-right py-2 px-2 bg-gray-50">Nr Merchants</th><th className="text-right py-2 px-2 bg-gray-50">Annual TPV</th><th className="text-right py-2 px-2 bg-gray-50">Net Margin %</th><th className="text-right py-2 px-2 bg-gray-50">SumUp NR/Mo</th><th className="text-right py-2 px-2 bg-gray-50">Partner Payout/Mo</th><th className="w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => { const rc = rowCalcs[i]; return (
                    <tr key={row.id} className="border-b border-gray-100">
                      <td className="py-1.5 pr-2"><select value={row.country} onChange={(e) => updateRow(row.id, "country", e.target.value)} className="w-full border border-yellow-400 bg-yellow-50 rounded px-2 py-1 text-xs outline-none"><option value="">Select...</option>{RATES.map((r) => <option key={r.code} value={r.code}>{COUNTRY_NAMES[r.code]}</option>)}</select></td>
                      <td className="py-1.5 px-2"><input type="number" value={row.merchantBase || ""} placeholder="0" onChange={(e) => updateRow(row.id, "merchantBase", parseInt(e.target.value) || 0)} onFocus={(e) => (e.target as HTMLInputElement).select()} className="w-full border border-yellow-400 bg-yellow-50 rounded px-2 py-1 text-xs text-right outline-none" /></td>
                      <td className="py-1.5 px-2"><input type="number" value={row.targetPct} min={0} max={100} step={1} onChange={(e) => updateRow(row.id, "targetPct", parseFloat(e.target.value) || 0)} onFocus={(e) => (e.target as HTMLInputElement).select()} className="w-20 border border-yellow-400 bg-yellow-50 rounded px-2 py-1 text-xs text-right outline-none" /></td>
                      <td className="py-1.5 px-2"><input type="number" value={row.tpvPerMerchantYearly || ""} placeholder="0" onChange={(e) => updateRow(row.id, "tpvPerMerchantYearly", parseFloat(e.target.value) || 0)} onFocus={(e) => (e.target as HTMLInputElement).select()} className="w-full border border-yellow-400 bg-yellow-50 rounded px-2 py-1 text-xs text-right outline-none" /></td>
                      <td className="py-1.5 px-2">{row.country ? <input type="number" step={0.01} value={row.sellRateD ?? ""} placeholder="—" onChange={(e) => updateRow(row.id, "sellRateD", parseFloat(e.target.value) || 0)} onFocus={(e) => (e.target as HTMLInputElement).select()} className="w-20 border border-yellow-400 bg-yellow-50 rounded px-2 py-1 text-xs text-right outline-none" /> : <span className="text-gray-300 text-xs block text-center">—</span>}</td>
                      <td className="py-1.5 px-2">{row.country ? <input type="number" step={0.01} value={row.sellRateC ?? ""} placeholder="—" onChange={(e) => updateRow(row.id, "sellRateC", parseFloat(e.target.value) || 0)} onFocus={(e) => (e.target as HTMLInputElement).select()} className="w-20 border border-yellow-400 bg-yellow-50 rounded px-2 py-1 text-xs text-right outline-none" /> : <span className="text-gray-300 text-xs block text-center">—</span>}</td>
                      <td className="py-1.5 px-2 bg-gray-50 text-right text-gray-700">{rc.nrM > 0 ? rc.nrM.toLocaleString() : "—"}</td>
                      <td className="py-1.5 px-2 bg-gray-50 text-right text-gray-700">{rc.annTPV > 0 ? fE(rc.annTPV, true) : "—"}</td>
                      <td className="py-1.5 px-2 bg-gray-50 text-right text-gray-700">{rc.netMargin > 0 ? `${rc.netMargin.toFixed(2)}%` : "—"}</td>
                      <td className={`py-1.5 px-2 bg-gray-50 text-right font-medium ${rc.sumUpNR < 0 ? "text-red-600" : "text-emerald-700"}`}>{rc.sumUpNR !== 0 ? fE(rc.sumUpNR, true) : "—"}</td>
                      <td className="py-1.5 px-2 bg-gray-50 text-right text-amber-700">{rc.partnerPayout > 0 ? fE(rc.partnerPayout, true) : "—"}</td>
                      <td className="py-1.5 pl-2">{rows.length > 1 && (<button onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))} className="text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>)}</td>
                    </tr>
                  ); })}
                  <tr className="bg-gray-100 font-semibold text-xs">
                    <td className="py-2 pr-2 text-gray-600">TOTAL</td>
                    <td className="py-2 px-2 text-right text-gray-600">{rows.reduce((s, r) => s + r.merchantBase, 0).toLocaleString()}</td>
                    <td colSpan={4} className="py-2 px-2 text-right text-gray-400">—</td>
                    <td className="py-2 px-2 text-right text-gray-700">{totNrM.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{fE(rowCalcs.reduce((s, r) => s + r.annTPV, 0), true)}</td>
                    <td className="py-2 px-2 text-right text-gray-400">—</td>
                    <td className={`py-2 px-2 text-right font-bold ${totSumUpNR < 0 ? "text-red-700" : "text-emerald-700"}`}>{fE(totSumUpNR, true)}/mo</td>
                    <td className="py-2 px-2 text-right font-bold text-amber-700">{fE(totPartnerPay, true)}/mo</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {gradualAcquisition && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2"><AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-600" /><span><strong>Gradual acquisition active:</strong> Annual TPV reduced by 50% — merchants join throughout the year rather than all at once.</span></div>}
            <p className="text-xs text-gray-400 mt-3 flex items-start gap-1.5"><span className="text-blue-400 font-bold mt-0.5">ℹ</span>Sell Rate D % and Sell Rate C % are pre-filled with <strong>blended country averages</strong> sourced from Snowflake (Apr 2026). Override the fields above to reflect actual negotiated pricing for this partner.</p>
          </SCardB>
        </SCard>

        {/* HARDWARE */}
        <SCard>
          <SCardH><SCardT>Hardware</SCardT></SCardH>
          <SCardB className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {(["Hardware", "Tap-to-Pay", "Online"] as HwMethod[]).map((m) => (
                <button key={m} onClick={() => setHwMethod(m)} className={`p-2.5 rounded-lg border text-xs text-center transition-colors ${hwMethod === m ? "border-blue-400 bg-blue-50 text-blue-700 font-medium" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{m}{m !== "Hardware" && <div className="text-gray-400 font-normal mt-0.5">No hardware cost</div>}</button>
              ))}
            </div>
            {hwMethod !== "Hardware"
              ? <div className="space-y-3">
                <div>
                  <Lbl text="Merchants / month (from country table)" />
                  <GreyBox v={totNrM > 0 ? `${totNrM.toLocaleString()} merchants` : "— fill in the country table above"} />
                  <p className="text-xs text-gray-400 mt-1.5">Total Nr Merchants across all active countries. Used for 2A / 2B commission calculations.</p>
                </div>
                <div className={`rounded-lg p-3 text-xs border ${hwMethod === "Tap-to-Pay" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-blue-100 bg-blue-50 text-blue-700"}`}>
                  {hwMethod === "Tap-to-Pay"
                    ? <><strong>Rate used: 100% Card Present (CP)</strong> — lower interchange, EU regulated.<br />
                      <span className="mt-1 block text-amber-700"><strong>Note:</strong> Apple charges an additional TTP fee for iOS and Android devices. This is <strong>not included</strong> in this calculation.</span></>
                    : <><strong>Rate used: 100% Card Not Present (CNP)</strong> — higher interchange than CP transactions.</>
                  }
                </div>
              </div>
              : <div className="space-y-1.5">
                <div className="grid grid-cols-5 text-xs text-gray-400 font-medium pb-1 border-b border-gray-100 gap-2"><div>Device</div><div className="text-right">COGS €</div><div className="text-right">Std Price €</div><div className="text-right">Override €</div><div className="text-right">Monthly Qty</div></div>
                {HW_DEVICES.map((d, i) => (
                  <div key={d.name} className="grid grid-cols-5 gap-2 items-center">
                    <div className="text-xs text-gray-700">{d.name}</div>
                    <div className="text-xs text-right text-gray-400">{d.cogs}</div>
                    <div className="text-xs text-right text-gray-400">{d.std}</div>
                    <input type="number" placeholder={`${d.std}`} value={hwPrice[i] ?? ""} onChange={(e) => { const a = [...hwPrice]; a[i] = e.target.value ? parseFloat(e.target.value) : null; setHwPrice(a); }} onFocus={(e) => (e.target as HTMLInputElement).select()} className="border border-yellow-400 bg-yellow-50 rounded px-2 py-1 text-xs text-right outline-none w-full" />
                    <input type="number" min={0} value={hwQty[i]} onChange={(e) => { const a = [...hwQty]; a[i] = parseInt(e.target.value) || 0; setHwQty(a); }} onFocus={(e) => (e.target as HTMLInputElement).select()} className="border border-yellow-400 bg-yellow-50 rounded px-2 py-1 text-xs text-right outline-none w-full" />
                  </div>
                ))}
              </div>
            }
          </SCardB>
        </SCard>

        {/* VALIDATION */}
        {(errors.length > 0 || warnings.length > 0) && (
          <SCard>
            <SCardH><SCardT>Validation</SCardT></SCardH>
            <SCardB className="space-y-2">
              {errors.map((e, i) => (<div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg p-3"><XCircle size={14} className="shrink-0 mt-0.5" />{e}</div>))}
              {warnings.map((w, i) => (<div key={i} className="flex items-start gap-2 text-sm text-yellow-700 bg-yellow-50 rounded-lg p-3"><AlertTriangle size={14} className="shrink-0 mt-0.5" />{w}</div>))}
            </SCardB>
          </SCard>
        )}

      </div>
    </div>
  );
}
