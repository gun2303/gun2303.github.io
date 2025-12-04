import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { 
  Plane, Train, Hotel, MapPin, Utensils, ShoppingBag, 
  Plus, Navigation, Wallet, Calendar, Clock, Map as MapIcon, 
  X, Settings, Camera, RefreshCw, Sun, Cloud, CloudRain, 
  CloudSnow, CloudLightning, Wind, LocateFixed, ArrowLeftRight,
  ArrowRight, ChevronRight, Home, FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

// --- 1. Firebase 設定 (請填入你的設定) ---
// ⚠️ 重要：請去 Firebase Console 複製你的設定覆蓋下方
const firebaseConfig = {
  apiKey: "你的_API_KEY",
  authDomain: "你的_PROJECT_ID.firebaseapp.com",
  projectId: "你的_PROJECT_ID",
  storageBucket: "你的_PROJECT_ID.appspot.com",
  messagingSenderId: "你的_SENDER_ID",
  appId: "你的_APP_ID"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'travel-dash-v1'; // App 版本識別碼

// --- 2. 工具函式 & Gemini AI ---

const CURRENCIES = [
    { code: 'TWD', name: '台幣', flag: '🇹🇼', rate: 1 },
    { code: 'JPY', name: '日幣', flag: '🇯🇵', rate: 0.215 },
    { code: 'USD', name: '美元', flag: '🇺🇸', rate: 32.5 },
    { code: 'KRW', name: '韓元', flag: '🇰🇷', rate: 0.024 },
    { code: 'EUR', name: '歐元', flag: '🇪🇺', rate: 35.0 },
    { code: 'CNY', name: '人民幣', flag: '🇨🇳', rate: 4.5 },
];

const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
};

const getDayOfWeek = (dateStr) => {
    if (!dateStr) return '';
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return days[new Date(dateStr).getDay()];
};

// Gemini AI 掃描函式
const scanReceiptWithGemini = async (file, apiKey) => {
  if (!apiKey) throw new Error("請在設定中輸入 Gemini API Key");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  try {
    const prompt = `你是一個專業的會計助理。請分析這張收據圖片。
      任務：
      1. 辨識日期、所有消費品項、數量、金額。
      2. 如果品項是外文，請將其「翻譯成繁體中文」。
      3. 回傳純 JSON 格式，不要 Markdown 標記，格式如下：
      {
        "date": "YYYY-MM-DD",
        "items": [
          { "name": "翻譯品名 (原文)", "quantity": 1, "amount": 100 }
        ]
      }`;

    const imagePart = {
      inlineData: { data: base64Data, mimeType: file.type || "image/jpeg" },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Gemini 辨識失敗: " + error.message);
  }
};

// Excel 匯出函式
const exportToExcel = (tripName, items) => {
  const expenses = items.filter(i => i.type === 'expense');
  if (expenses.length === 0) { alert('沒有支出資料可匯出'); return; }
  
  const data = expenses.map(item => ({
      '日期': item.date ? formatDate(item.date) : '---',
      '品項': item.title,
      '分類': item.category || '一般',
      '金額': item.amount,
      '備註': item.location || ''
  }));

  const total = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  data.push({ '日期': '總計', '品項': '', '分類': '', '金額': total, '備註': '' });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "支出明細");
  XLSX.writeFile(wb, `${tripName || 'Travel'}_支出明細.xlsx`);
};

// --- 3. UI 元件 ---

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-400">
    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <p className="mt-4 text-sm font-medium animate-pulse">正在同步旅程資料...</p>
  </div>
);

const LandingPage = ({ onCreate }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600 rounded-full blur-[100px] opacity-30"></div>
    </div>
    <div className="relative z-10 text-center max-w-md w-full">
      <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl rotate-3">
        <Plane className="w-10 h-10 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">Travel Dash</h1>
      <p className="text-slate-400 mb-8">極簡、直覺的旅程規劃助手</p>
      <button onClick={onCreate} className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 shadow-lg">
        <Plus className="w-5 h-5 text-indigo-600" /> 建立新行程
      </button>
    </div>
  </div>
);

const TabNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: '首頁' },
    { id: 'timeline', icon: Calendar, label: '行程' },
    { id: 'wallet', icon: Wallet, label: '記帳' },
    { id: 'nav', icon: Navigation, label: '導航' },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between z-40">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-2 transition-all ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}`}>
          <tab.icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const Header = ({ title, subtitle, onSettings }) => (
  <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
    <div className="flex-1 min-w-0 mr-4">
      <h1 className="text-xl font-bold text-slate-800 truncate">{title || '載入中...'}</h1>
      {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
    </div>
    <button onClick={onSettings} className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
        <Settings className="w-5 h-5" />
    </button>
  </header>
);

const WeatherWidget = () => {
    // 簡化版天氣，僅示意
    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg flex items-center justify-between mb-4">
            <div>
                <div className="flex items-center gap-2 mb-1"><MapPin className="w-3 h-3 opacity-80" /><span className="text-sm font-bold">目前位置</span></div>
                <div className="text-3xl font-bold">24°<span className="text-xs font-normal">C</span></div>
            </div>
            <Sun className="w-8 h-8 text-yellow-300" />
        </div>
    );
};

// --- View Components ---

const DashboardView = ({ items, settings, onEditItem }) => {
  const flights = items.filter(i => i.type === 'flight').sort((a, b) => (a.date + a.startTime) > (b.date + b.startTime) ? 1 : -1);
  const hotels = items.filter(i => i.type === 'hotel').sort((a, b) => a.date > b.date ? 1 : -1);

  return (
    <div className="p-4 pb-28 space-y-6 animate-fade-in">
        <WeatherWidget />
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800">{settings.destination || '目的地'}</h2>
            <div className="flex gap-2 mt-4">
                <div className="bg-slate-50 px-3 py-2 rounded-lg text-xs font-bold text-slate-600">
                    💰 預算 ¥{Number(settings.budget).toLocaleString()}
                </div>
            </div>
        </div>

        <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3">航班資訊</h3>
            {flights.map(f => (
                <div key={f.id} onClick={() => onEditItem(f)} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Plane className="w-5 h-5"/></div>
                        <div>
                            <div className="font-bold">{f.originCode} ➔ {f.destCode}</div>
                            <div className="text-xs text-slate-400">{f.date} {f.startTime}</div>
                        </div>
                    </div>
                </div>
            ))}
            {flights.length === 0 && <div className="text-center text-slate-400 text-sm py-4 border border-dashed rounded-xl">無航班資料</div>}
        </div>
    </div>
  );
};

const TimelineView = ({ items, onEditItem }) => {
  const sortedItems = useMemo(() => items.filter(i => i.type !== 'expense').sort((a, b) => (a.date + a.startTime) > (b.date + b.startTime) ? 1 : -1), [items]);
  
  return (
    <div className="p-4 pb-28">
        {sortedItems.map((item, idx) => (
            <div key={item.id} onClick={() => onEditItem(item)} className="flex gap-4 mb-6 relative group cursor-pointer">
                <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full z-10"></div>
                    {idx !== sortedItems.length - 1 && <div className="w-0.5 h-full bg-slate-200 absolute top-3"></div>}
                </div>
                <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:scale-95 transition">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{item.startTime}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(item.date)}</span>
                    </div>
                    <h3 className="font-bold text-slate-800">{item.title}</h3>
                    {item.location && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/>{item.location}</div>}
                </div>
            </div>
        ))}
        {sortedItems.length === 0 && <div className="text-center text-slate-400 mt-10">尚無行程</div>}
    </div>
  );
};

const WalletView = ({ items, settings, onEditItem, tripId }) => {
  const expenses = items.filter(i => i.type === 'expense').sort((a, b) => b.createdAt - a.createdAt);
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const remaining = Math.max(0, settings.budget - totalSpent);
  
  const [isScanning, setIsScanning] = useState(false);
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('JPY');

  const handleFileUpload = async (e) => {
      const apiKey = localStorage.getItem('gemini_key');
      if (!apiKey) { alert('請先在設定中輸入 Gemini API Key！'); return; }
      
      const file = e.target.files[0];
      if (!file) return;

      setIsScanning(true);
      try {
          const result = await scanReceiptWithGemini(file, apiKey);
          const batchPromises = result.items.map(async (item) => {
              await addDoc(collection(db, 'artifacts', appId, 'trips', tripId, 'items'), {
                  type: 'expense',
                  title: item.name,
                  amount: item.amount,
                  date: result.date || new Date().toISOString().split('T')[0],
                  category: '買',
                  location: 'AI 掃描',
                  createdAt: serverTimestamp()
              });
          });
          await Promise.all(batchPromises);
          alert(`成功匯入 ${result.items.length} 筆項目！`);
      } catch (err) { alert(err.message); } 
      finally { setIsScanning(false); }
  };

  const rate = CURRENCIES.find(c => c.code === fromCurrency)?.rate || 1;
  const calcResult = amount ? (parseFloat(amount) * rate).toLocaleString() : '0';

  return (
    <div className="p-4 pb-28 space-y-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between text-sm text-slate-500 mb-1"><span>剩餘預算</span><span>{((totalSpent/settings.budget)*100).toFixed(0)}%</span></div>
            <div className="text-3xl font-bold text-emerald-600">¥{remaining.toLocaleString()}</div>
            <div className="h-2 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, (totalSpent/settings.budget)*100)}%` }}></div>
            </div>
        </div>

        {/* 匯率計算 */}
        <div className="bg-slate-800 rounded-2xl p-5 text-white">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold flex gap-1"><RefreshCw className="w-4 h-4"/> 快速換算</span>
                <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="bg-white/20 rounded px-2 py-1 text-xs">
                    {CURRENCIES.map(c => <option key={c.code} value={c.code} className="text-black">{c.code}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-3">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="bg-transparent text-2xl font-bold w-full focus:outline-none placeholder-white/30" />
                <ArrowRight className="w-5 h-5 text-slate-400" />
                <div className="text-2xl font-bold text-emerald-400">NT$ {calcResult}</div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <label className={`bg-indigo-600 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg cursor-pointer ${isScanning ? 'opacity-50' : ''}`}>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} disabled={isScanning} />
                {isScanning ? <RefreshCw className="w-6 h-6 animate-spin"/> : <Camera className="w-6 h-6"/>}
                <span className="text-xs font-bold">{isScanning ? 'AI 分析中...' : '掃描收據'}</span>
            </label>
            <button onClick={() => exportToExcel(settings.title, items)} className="bg-emerald-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg">
                <FileSpreadsheet className="w-6 h-6" />
                <span className="text-xs font-bold">匯出 Excel</span>
            </button>
        </div>

        <div className="space-y-2">
            {expenses.map(ex => (
                <div key={ex.id} onClick={() => onEditItem(ex)} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                        <div className="font-bold text-slate-800">{ex.title}</div>
                        <div className="text-xs text-slate-400">{ex.date}</div>
                    </div>
                    <div className="font-bold">¥{ex.amount}</div>
                </div>
            ))}
        </div>
    </div>
  );
};

const NavView = ({ items }) => {
    const locations = items.filter(i => i.location).map(i => ({ title: i.title, query: i.location }));
    const presets = [{t:'超商',q:'convenience store'}, {t:'車站',q:'station'}, {t:'藥妝',q:'drug store'}];

    return (
        <div className="p-4 pb-28">
            <h3 className="font-bold mb-4">快速搜尋</h3>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {presets.map((p,i) => (
                    <a key={i} href={`https://www.google.com/maps/search/?api=1&query=${p.q}`} target="_blank" rel="noreferrer" className="bg-white px-4 py-3 rounded-xl border border-slate-100 font-bold text-sm whitespace-nowrap shadow-sm">
                        {p.t}
                    </a>
                ))}
            </div>
            <h3 className="font-bold mb-4">行程地點</h3>
            <div className="space-y-3">
                {locations.map((loc, idx) => (
                    <a key={idx} href={`https://www.google.com/maps/search/?api=1&query=${loc.query}`} target="_blank" rel="noreferrer" className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                            <div className="truncate font-bold text-slate-700">{loc.title}</div>
                        </div>
                        <Navigation className="w-4 h-4 text-slate-400" />
                    </a>
                ))}
            </div>
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-0 pointer-events-auto max-h-[90vh] flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function TravelDashApp() {
  const [user, setUser] = useState(null);
  const [tripId, setTripId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [addType, setAddType] = useState('activity');

  // 1. 初始化 Trip ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('trip');
    if (idFromUrl) setTripId(idFromUrl);
  }, []);

  // 2. Firebase Auth
  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  // 3. 監聽資料
  useEffect(() => {
    if (!user || !tripId) return;
    const settingsRef = doc(db, 'artifacts', appId, 'trips', tripId, 'settings', 'main');
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
        if (snap.exists()) setSettings(snap.data());
        else {
            const def = { title: '新旅程', budget: 100000, startDate: '', endDate: '' };
            setDoc(settingsRef, def);
            setSettings(def);
            setShowSettings(true);
        }
    });
    const q = query(collection(db, 'artifacts', appId, 'trips', tripId, 'items'), orderBy('createdAt', 'desc'));
    const unsubItems = onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubSettings(); unsubItems(); };
  }, [user, tripId]);

  const createNewTrip = () => {
      const newId = 'trip_' + Math.random().toString(36).substr(2, 9);
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?trip=' + newId;
      window.history.pushState({path: newUrl}, '', newUrl);
      setTripId(newId);
  };

  const handleSaveSettings = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      await setDoc(doc(db, 'artifacts', appId, 'trips', tripId, 'settings', 'main'), { ...data, budget: Number(data.budget) });
      setShowSettings(false);
  };

  const handleSaveItem = async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      const type = editItem ? editItem.type : addType;
      const payload = { ...data, type, amount: Number(data.amount || 0), updatedAt: serverTimestamp() };
      if (!editItem) payload.createdAt = serverTimestamp();
      
      const ref = editItem 
        ? doc(db, 'artifacts', appId, 'trips', tripId, 'items', editItem.id)
        : collection(db, 'artifacts', appId, 'trips', tripId, 'items');
      
      editItem ? await updateDoc(ref, payload) : await addDoc(ref, payload);
      setShowEditor(false);
      setEditItem(null);
  };

  const handleDeleteItem = async () => {
      if (!confirm('刪除此項目？')) return;
      await deleteDoc(doc(db, 'artifacts', appId, 'trips', tripId, 'items', editItem.id));
      setShowEditor(false);
  };

  const openAdd = (type) => { setEditItem(null); setAddType(type); setShowEditor(true); };
  const openEdit = (item) => { setEditItem(item); setAddType(item.type); setShowEditor(true); };

  if (!tripId) return <LandingPage onCreate={createNewTrip} />;
  if (!user || !settings) return <LoadingScreen />;

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 font-sans selection:bg-indigo-100 pb-safe">
      <Header title={settings.title} subtitle={settings.startDate} onSettings={() => setShowSettings(true)} />
      
      <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-bold text-center cursor-pointer" onClick={() => {navigator.clipboard.writeText(window.location.href); alert('網址已複製！');}}>
          🔗 點此複製分享連結
      </div>

      <main className="max-w-lg mx-auto min-h-screen relative">
        {activeTab === 'dashboard' && <DashboardView items={items} settings={settings} onEditItem={openEdit} />}
        {activeTab === 'timeline' && <TimelineView items={items} onEditItem={openEdit} />}
        {activeTab === 'wallet' && <WalletView items={items} settings={settings} onEditItem={openEdit} tripId={tripId} />}
        {activeTab === 'nav' && <NavView items={items} />}
      </main>

      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <button onClick={() => openAdd('activity')} className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 rounded-full text-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <Plus className="w-7 h-7" />
      </button>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="旅程設定">
          <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">旅程名稱</label><input name="title" defaultValue={settings.title} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">預算</label><input name="budget" type="number" defaultValue={settings.budget} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" /></div>
              <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Gemini API Key (存在本機)</label>
                  <input type="password" defaultValue={localStorage.getItem('gemini_key') || ''} onChange={e => localStorage.setItem('gemini_key', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs" placeholder="AIza..." />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">儲存</button>
          </form>
      </Modal>

      {/* Editor Modal */}
      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)} title={editItem ? '編輯' : '新增'}>
          <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500">標題</label><input name="title" defaultValue={editItem?.title} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required /></div>
              {addType === 'expense' && (
                 <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1"><label className="text-xs font-bold text-slate-500">金額</label><input name="amount" type="number" defaultValue={editItem?.amount} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required /></div>
                     <div className="space-y-1"><label className="text-xs font-bold text-slate-500">分類</label><select name="category" defaultValue={editItem?.category} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3"><option value="食">食</option><option value="買">買</option><option value="行">行</option></select></div>
                 </div>
              )}
              {addType !== 'expense' && (
                 <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1"><label className="text-xs font-bold text-slate-500">日期</label><input name="date" type="date" defaultValue={editItem?.date} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required /></div>
                     <div className="space-y-1"><label className="text-xs font-bold text-slate-500">時間</label><input name="startTime" type="time" defaultValue={editItem?.startTime} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" required /></div>
                 </div>
              )}
               {addType !== 'expense' && addType !== 'flight' && (
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500">地點</label><input name="location" defaultValue={editItem?.location} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3" /></div>
              )}
              <div className="flex gap-2 pt-2">
                  {editItem && <button type="button" onClick={handleDeleteItem} className="flex-1 bg-red-50 text-red-500 font-bold py-3 rounded-xl">刪除</button>}
                  <button type="submit" className="flex-[2] bg-indigo-600 text-white font-bold py-3 rounded-xl">儲存</button>
              </div>
          </form>
      </Modal>
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
