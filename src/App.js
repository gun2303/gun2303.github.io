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
  Plane, MapPin, Plus, Navigation, Wallet, Calendar, 
  X, Settings, Camera, RefreshCw, Sun, BedDouble, Train,
  ArrowRight, Home, FileSpreadsheet, Share2, Locate, Utensils
} from 'lucide-react';
import * as XLSX from 'xlsx';

// --- 1. Firebase 設定 ---
const firebaseConfig = {
  apiKey: "AIzaSyA1Fjs5tej6iJzEIM9b5xWm9Te3sGsxASk",
  authDomain: "travel-dash-9815c.firebaseapp.com",
  projectId: "travel-dash-9815c",
  storageBucket: "travel-dash-9815c.firebasestorage.app",
  messagingSenderId: "147395409268",
  appId: "1:147395409268:web:828e5c49943845511f6821",
  measurementId: "G-GF6Y4RP4S4"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'travel-dash-v1';

// --- 2. 工具函式 ---

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

const scanReceiptWithGemini = async (file, apiKey) => {
  if (!apiKey) throw new Error("請先點擊右上角設定，輸入 Gemini API Key");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
  try {
    const prompt = `你是一個專業的會計助理。請分析這張收據圖片。辨識日期、品項、金額。回傳純 JSON: { "date": "YYYY-MM-DD", "items": [{ "name": "品名", "amount": 100 }] }`;
    const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: file.type || "image/jpeg" } }]);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Gemini 辨識失敗: " + error.message);
  }
};

const exportToExcel = (tripName, items) => {
  const expenses = items.filter(i => i.type === 'expense');
  if (expenses.length === 0) { alert('沒有支出資料可匯出'); return; }
  const data = expenses.map(item => ({ '日期': item.date, '品項': item.title, '分類': item.category, '金額': item.amount }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "支出");
  XLSX.writeFile(wb, `${tripName}_支出.xlsx`);
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
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0"><div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600 rounded-full blur-[100px] opacity-30"></div></div>
    <div className="relative z-10 text-center max-w-md w-full">
      <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl rotate-3"><Plane className="w-10 h-10 text-white" /></div>
      <h1 className="text-4xl font-bold text-white mb-2">Travel Dash</h1>
      <p className="text-slate-400 mb-8">極簡、直覺的旅程規劃助手</p>
      <button onClick={onCreate} className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"><Plus className="w-5 h-5 text-indigo-600" /> 建立新行程</button>
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
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe pt-2 px-6 flex justify-between z-40">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-2 transition-all ${activeTab === tab.id ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}>
          <tab.icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const Header = ({ title, subtitle, onSettings }) => (
  <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-5 py-3 flex justify-between items-center shadow-sm">
    <div className="flex-1 min-w-0 mr-4">
      <h1 className="text-xl font-bold text-slate-800 truncate">{title || '載入中...'}</h1>
      {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
    </div>
    <div className="flex gap-2">
        <button onClick={() => {navigator.clipboard.writeText(window.location.href); alert('連結已複製！');}} className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 active:bg-indigo-100"><Share2 className="w-4 h-4" /></button>
        <button onClick={onSettings} className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 active:bg-slate-200"><Settings className="w-5 h-5" /></button>
    </div>
  </header>
);

const WeatherWidget = () => {
    const [loc, setLoc] = useState({ name: '點擊定位', temp: '--' });
    const handleLocate = () => {
        if (!navigator.geolocation) return alert('瀏覽器不支援定位');
        setLoc({ name: '定位中...', temp: '--' });
        navigator.geolocation.getCurrentPosition(
          (p) => setLoc({ name: `已定位`, temp: '25' }),
          (e) => setLoc({ name: '定位失敗', temp: '--' })
        );
    };
    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-200 flex items-center justify-between mb-6 cursor-pointer active:scale-[0.98] transition" onClick={handleLocate}>
            <div>
                <div className="flex items-center gap-2 mb-1"><Locate className="w-3 h-3" /><span className="text-sm font-bold">{loc.name}</span></div>
                <div className="text-4xl font-bold tracking-tight">{loc.temp}°<span className="text-lg font-normal opacity-80">C</span></div>
            </div>
            <Sun className="w-10 h-10 text-yellow-300 animate-pulse-slow" />
        </div>
    );
};

// 💎 重寫：首頁儀表板，還原卡片與專屬區塊
const DashboardView = ({ items, settings, onEditItem }) => {
  const flights = items.filter(i => i.type === 'flight').sort((a, b) => a.date > b.date ? 1 : -1);
  const hotels = items.filter(i => i.type === 'hotel').sort((a, b) => a.date > b.date ? 1 : -1);
  
  return (
    <div className="p-5 pb-32 space-y-6 animate-fade-in">
        <WeatherWidget />
        
        {/* 目的地卡片 (還原設計) */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-50">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-full">進行中</span>
                    <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{settings.destination || '目的地'}</h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">{settings.startDate || '日期未定'}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
                <a href={`https://www.google.com/maps/search/${settings.destination}`} target="_blank" rel="noreferrer" className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm transition"><MapIcon className="w-4 h-4" /> 地圖總覽</a>
                <div className="bg-slate-50 text-slate-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-sm"><Wallet className="w-4 h-4" /> ¥{Number(settings.budget).toLocaleString()}</div>
            </div>
        </div>

        {/* 航班資訊區塊 */}
        <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 ml-1">航班資訊</h3>
            {flights.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400">尚無航班資料，請新增行程</p>
                </div>
            ) : (
                flights.map(f => (
                    <div key={f.id} onClick={() => onEditItem(f)} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 flex items-center gap-4 active:scale-95 transition">
                        <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0"><Plane className="w-5 h-5"/></div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-800 text-lg">{f.originCode} <span className="text-slate-300">➔</span> {f.destCode}</div>
                            <div className="text-xs text-slate-400">{f.date} {f.startTime}</div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* 住宿安排區塊 */}
        <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 ml-1">住宿安排</h3>
            {hotels.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200">
                    <p className="text-sm text-slate-400">尚無住宿資料</p>
                </div>
            ) : (
                hotels.map(h => (
                    <div key={h.id} onClick={() => onEditItem(h)} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-3 flex items-center gap-4 active:scale-95 transition">
                        <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 flex-shrink-0"><BedDouble className="w-5 h-5"/></div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-800">{h.title}</div>
                            <div className="text-xs text-slate-400">{h.location}</div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

const TimelineView = ({ items, onEditItem }) => {
  const sorted = useMemo(() => items.filter(i => i.type !== 'expense').sort((a, b) => (a.date + a.startTime) > (b.date + b.startTime) ? 1 : -1), [items]);
  return (
    <div className="p-5 pb-32">
        {sorted.map((item, idx) => (
            <div key={item.id} onClick={() => onEditItem(item)} className="flex gap-4 mb-6 relative group cursor-pointer">
                <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full z-10 ${item.type === 'flight' ? 'bg-blue-500' : item.type === 'hotel' ? 'bg-orange-500' : 'bg-indigo-600'}`}></div>
                    {idx !== sorted.length - 1 && <div className="w-0.5 h-full bg-slate-100 absolute top-3"></div>}
                </div>
                <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 active:scale-[0.98] transition">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">{item.startTime}</span>
                        <span className="text-[10px] text-slate-400">{formatDate(item.date)}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{item.title}</h3>
                    {item.location && <div className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/>{item.location}</div>}
                </div>
            </div>
        ))}
        {sorted.length === 0 && <div className="text-center text-slate-400 mt-20 opacity-50">行程表是空的，去新增一些活動吧！</div>}
    </div>
  );
};

const WalletView = ({ items, settings, onEditItem, tripId }) => {
  const expenses = items.filter(i => i.type === 'expense').sort((a, b) => b.createdAt - a.createdAt);
  const total = expenses.reduce((acc, c) => acc + Number(c.amount || 0), 0);
  const [isScanning, setIsScanning] = useState(false);
  
  const handleFileUpload = async (e) => {
      const apiKey = localStorage.getItem('gemini_key');
      if (!apiKey) return alert('請先設定 API Key');
      const file = e.target.files[0];
      if (!file) return;
      setIsScanning(true);
      try {
          const result = await scanReceiptWithGemini(file, apiKey);
          await Promise.all(result.items.map(i => addDoc(collection(db, 'artifacts', appId, 'trips', tripId, 'items'), { type: 'expense', title: i.name, amount: i.amount, date: result.date, category: '買', location: 'AI', createdAt: serverTimestamp() })));
          alert(`成功匯入 ${result.items.length} 筆`);
      } catch (err) { alert(err.message); } finally { setIsScanning(false); }
  };

  return (
    <div className="p-5 pb-32 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-50">
            <div className="flex justify-between text-sm text-slate-500 mb-2"><span>總支出</span></div>
            <div className="text-4xl font-extrabold text-slate-800">¥{total.toLocaleString()}</div>
            <div className="mt-4 flex gap-2">
                 <label className={`flex-1 bg-indigo-600 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-indigo-200 active:scale-95 transition ${isScanning?'opacity-50':''}`}>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isScanning} />
                    {isScanning ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4"/>} 掃描收據
                 </label>
                 <button onClick={() => exportToExcel(settings.title, items)} className="px-4 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center active:scale-95 transition"><FileSpreadsheet className="w-5 h-5"/></button>
            </div>
        </div>
        <div className="space-y-3">
            {expenses.map(ex => (
                <div key={ex.id} onClick={() => onEditItem(ex)} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex justify-between items-center active:bg-slate-50">
                    <div><div className="font-bold text-slate-800">{ex.title}</div><div className="text-xs text-slate-400">{ex.date} • {ex.category}</div></div>
                    <div className="font-bold text-slate-700">¥{ex.amount.toLocaleString()}</div>
                </div>
            ))}
        </div>
    </div>
  );
};

const NavView = ({ items }) => {
    const locations = items.filter(i => i.location).map(i => ({ title: i.title, query: i.location }));
    const presets = [{t:'超商',q:'convenience store'}, {t:'車站',q:'station'}, {t:'藥妝',q:'drug store'}, {t:'咖啡',q:'cafe'}];
    return (
        <div className="p-5 pb-32">
            <h3 className="font-bold mb-4">快速搜尋</h3>
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {presets.map((p,i) => (
                    <a key={i} href={`https://www.google.com/maps/search/${p.q}`} target="_blank" rel="noreferrer" className="bg-white px-5 py-4 rounded-2xl border border-slate-100 font-bold text-sm whitespace-nowrap shadow-sm text-slate-600 active:bg-slate-50">{p.t}</a>
                ))}
            </div>
            <h3 className="font-bold mb-4">行程地點</h3>
            <div className="space-y-3">
                {locations.map((loc, idx) => (
                    <a key={idx} href={`https://www.google.com/maps/search/${loc.query}`} target="_blank" rel="noreferrer" className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm active:bg-slate-50">
                        <div className="flex items-center gap-3 overflow-hidden"><MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" /><div className="truncate font-bold text-slate-700">{loc.title}</div></div>
                        <Navigation className="w-4 h-4 text-slate-400" />
                    </a>
                ))}
            </div>
        </div>
    );
};

// 💎 重寫：新增項目 Modal，還原圖示選單
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full active:bg-slate-100"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// 小圖示元件
const MapIcon = ({className}) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" /></svg>;

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('trip');
    if (idFromUrl) setTripId(idFromUrl);
  }, []);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  useEffect(() => {
    if (!user || !tripId) return;
    const settingsRef = doc(db, 'artifacts', appId, 'trips', tripId, 'settings', 'main');
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
        if (snap.exists()) setSettings(snap.data());
        else {
            const def = { title: '我的旅程', budget: 100000, startDate: '', endDate: '', destination: 'Taipei' };
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
      const ref = editItem ? doc(db, 'artifacts', appId, 'trips', tripId, 'items', editItem.id) : collection(db, 'artifacts', appId, 'trips', tripId, 'items');
      editItem ? await updateDoc(ref, payload) : await addDoc(ref, payload);
      setShowEditor(false);
      setEditItem(null);
  };

  const handleDeleteItem = async () => {
      if (!window.confirm('刪除此項目？')) return;
      await deleteDoc(doc(db, 'artifacts', appId, 'trips', tripId, 'items', editItem.id));
      setShowEditor(false);
  };

  const openAdd = (type) => { setEditItem(null); setAddType(type); setShowEditor(true); };
  const openEdit = (item) => { setEditItem(item); setAddType(item.type); setShowEditor(true); };

  if (!tripId) return <LandingPage onCreate={createNewTrip} />;
  if (!user || !settings) return <LoadingScreen />;

  const typeIcons = { activity: MapPin, flight: Plane, hotel: BedDouble, transport: Train, expense: Wallet };
  const typeLabels = { activity: '活動', flight: '航班', hotel: '住宿', transport: '交通', expense: '支出' };

  return (
    <div className="bg-[#f8f9fc] min-h-screen text-slate-800 font-sans pb-safe selection:bg-indigo-100">
      <Header title={settings.title} subtitle={settings.destination} onSettings={() => setShowSettings(true)} />

      <main className="max-w-lg mx-auto min-h-screen relative">
        {activeTab === 'dashboard' && <DashboardView items={items} settings={settings} onEditItem={openEdit} />}
        {activeTab === 'timeline' && <TimelineView items={items} onEditItem={openEdit} />}
        {activeTab === 'wallet' && <WalletView items={items} settings={settings} onEditItem={openEdit} tripId={tripId} />}
        {activeTab === 'nav' && <NavView items={items} />}
      </main>

      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <button onClick={() => openAdd('activity')} className="fixed bottom-24 right-6 w-16 h-16 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 ring-4 ring-indigo-50">
        <Plus className="w-8 h-8" />
      </button>

      {/* 設定 Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="旅程設定">
          <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">旅程名稱</label><input name="title" defaultValue={settings.title} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition" required /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">目的地</label><input name="destination" defaultValue={settings.destination} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">預算 (JPY)</label><input name="budget" type="number" defaultValue={settings.budget} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition" /></div>
              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Gemini API Key</label><input type="password" defaultValue={localStorage.getItem('gemini_key') || ''} onChange={e => localStorage.setItem('gemini_key', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="輸入 API Key 以啟用掃描..." /></div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition shadow-lg shadow-indigo-200 mt-2">儲存變更</button>
          </form>
      </Modal>

      {/* 新增/編輯 Modal (還原圖示選單) */}
      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)} title={editItem ? '編輯項目' : '新增項目'}>
          <form onSubmit={handleSaveItem} className="space-y-5">
              {!editItem && (
                  <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {['activity', 'flight', 'hotel', 'transport', 'expense'].map(type => {
                          const Icon = typeIcons[type];
                          return (
                              <button key={type} type="button" onClick={() => setAddType(type)} className={`flex flex-col items-center gap-2 min-w-[60px] p-3 rounded-2xl transition-all ${addType === type ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                  <Icon className="w-6 h-6" />
                                  <span className="text-[10px] font-bold">{typeLabels[type]}</span>
                              </button>
                          );
                      })}
                  </div>
              )}

              <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">標題</label><input name="title" defaultValue={editItem?.title} placeholder="請輸入標題..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition" required /></div>
              
              {addType === 'expense' && (
                 <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">金額</label><input name="amount" type="number" defaultValue={editItem?.amount} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
                     <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">分類</label><select name="category" defaultValue={editItem?.category} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 appearance-none outline-none"><option value="食">食</option><option value="買">買</option><option value="行">行</option><option value="住">住</option></select></div>
                 </div>
              )}
              
              {addType === 'flight' && (
                 <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">出發 (代碼)</label><input name="originCode" placeholder="TPE" defaultValue={editItem?.originCode} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                     <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">抵達 (代碼)</label><input name="destCode" placeholder="NRT" defaultValue={editItem?.destCode} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono uppercase focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                 </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">日期</label><input name="date" type="date" defaultValue={editItem?.date} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none" required /></div>
                  {addType !== 'expense' && <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">時間</label><input name="startTime" type="time" defaultValue={editItem?.startTime} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>}
              </div>

               {addType !== 'expense' && addType !== 'flight' && (
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500 ml-1">地點 (Google Maps)</label><input name="location" placeholder="輸入地點關鍵字" defaultValue={editItem?.location} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
              )}

              <div className="flex gap-3 pt-4">
                  {editItem && <button type="button" onClick={handleDeleteItem} className="flex-1 bg-red-50 text-red-500 font-bold py-4 rounded-2xl active:scale-95 transition">刪除</button>}
                  <button type="submit" className="flex-[2] bg-indigo-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition shadow-lg shadow-indigo-200">確認</button>
              </div>
          </form>
      </Modal>
      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
