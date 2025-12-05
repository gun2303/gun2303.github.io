import React, { useState, useEffect } from 'react';

// --- 1. 圖標庫 (新增導航、各類天氣、附件相關圖標) ---
const Icons = {
  Translate: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 8l6 6M4 14h6M2 5h12M7 2h1"/><path d="M22 22l-5-10-5 10M14 18h6"/></svg>,
  Schedule: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Map: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Budget: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Train: () => <svg width="14" height="14" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M2 8h20"/></svg>,
  Plus: () => <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ExternalLink: () => <svg width="16" height="16" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Sun: () => <svg width="16" height="16" fill="orange" stroke="orange" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Cloud: () => <svg width="16" height="16" fill="#aaa" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>,
  Rain: () => <svg width="16" height="16" fill="#4c6ef5" stroke="#4c6ef5" strokeWidth="2" viewBox="0 0 24 24"><line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/><line x1="12" y1="15" x2="12" y2="23"/><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="#333" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: () => <svg width="20" height="20" fill="none" stroke="red" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Nav: () => <svg width="16" height="16" fill="none" stroke="#4c6ef5" strokeWidth="2" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  Attachment: () => <svg width="16" height="16" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
};

// --- 2. 模擬氣象服務 ---
// 在真實專案中，這裡會呼叫 OpenWeatherMap API
// 為了讓你複製即用，我寫了一個模擬器，根據地點亂數產生合理天氣
const getWeatherMock = (location) => {
  const weathers = ['sunny', 'cloudy', 'rainy'];
  // 使用地點字串長度來決定天氣，讓同一地點每次顯示一樣，比較真實
  const seed = location ? location.length : 0;
  const weatherType = weathers[seed % 3];
  const temp = 10 + (seed % 15); // 產生 10~25 度的氣溫
  return { type: weatherType, temp: temp };
};

const WeatherIcon = ({ type }) => {
  if (type === 'rainy') return <Icons.Rain />;
  if (type === 'cloudy') return <Icons.Cloud />;
  return <Icons.Sun />;
};

// --- 3. 初始資料 ---
const initialSchedule = [
  { id: 1, time: '08:30', title: '前往機場', location: '新北產業園區站', note: '搭乘直達車', temp: null, weather: null },
  { id: 2, time: '09:30', title: '機場 Check-in', location: '桃園機場 T1', note: 'SL394 航班', temp: null, weather: null },
];

const initialBudget = [
  { id: 1, name: '機票墊付', amount: 8000, payer: '豪豪' },
  { id: 2, name: '網卡', amount: 500, payer: '柔柔' },
];

const dates = [
  { day: 'D1', date: '12/05' }, { day: 'D2', date: '12/06' }, { day: 'D3', date: '12/07' }, { day: 'D4', date: '12/08' }, { day: 'D5', date: '12/09' }
];

// --- 4. 樣式系統 (CSS-in-JS) ---
const s = {
  app: { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh', paddingBottom: '90px' },
  header: { background: 'linear-gradient(135deg, #4c6ef5, #5c7cfa)', color: 'white', padding: '20px 20px 10px 20px', borderBottomLeftRadius: '25px', borderBottomRightRadius: '25px', boxShadow: '0 4px 20px rgba(76, 110, 245, 0.3)' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  titleGroup: { display: 'flex', flexDirection: 'column' },
  mainTitle: { fontSize: '26px', fontWeight: 'bold', margin: 0 },
  subTitle: { fontSize: '14px', opacity: 0.9, marginTop: '4px' },
  navGroup: { display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '14px', backdropFilter: 'blur(5px)' },
  navBtn: (active) => ({ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', border: 'none', cursor: 'pointer', backgroundColor: active ? 'white' : 'transparent', color: active ? '#4c6ef5' : 'white', transition: 'all 0.2s', boxShadow: active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }),
  
  dateScroll: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px', marginTop: '15px', scrollbarWidth: 'none' },
  dateCard: (active) => ({ minWidth: '64px', height: '76px', backgroundColor: active ? 'white' : 'rgba(255,255,255,0.15)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? '#4c6ef5' : 'white', flexShrink: 0, transition: 'transform 0.1s' }),
  content: { padding: '20px' },
  
  // Schedule
  timelineItem: { display: 'flex', marginBottom: '20px', position: 'relative' },
  timeCol: { width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px' },
  timeText: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  timeAmPm: { fontSize: '12px', color: '#888' },
  timelineLine: { position: 'absolute', left: '29px', top: '50px', bottom: '-30px', width: '2px', backgroundColor: '#e0e0e0', zIndex: 0 },
  dot: { width: '12px', height: '12px', backgroundColor: '#4c6ef5', borderRadius: '50%', position: 'absolute', left: '24px', top: '24px', zIndex: 1, border: '3px solid white', boxShadow: '0 0 0 1px #e0e0e0' },
  card: { flex: 1, backgroundColor: 'white', borderRadius: '18px', padding: '18px', marginLeft: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'relative', cursor: 'pointer', transition: 'transform 0.1s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  cardTitle: { margin: 0, fontSize: '17px', fontWeight: 'bold', color: '#333' },
  cardLoc: { fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' },
  cardNote: { fontSize: '12px', color: '#e67e22', backgroundColor: '#fff8f0', padding: '4px 10px', borderRadius: '8px', display: 'inline-block' },
  weatherTag: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 'bold', color: '#555', backgroundColor: '#f1f3f5', padding: '4px 8px', borderRadius: '20px' },
  navBtnSmall: { display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #4c6ef5', color: '#4c6ef5', fontSize: '12px', fontWeight: 'bold', marginTop: '10px', textDecoration: 'none', width: 'fit-content' },

  // Budget
  budgetCard: { background: 'linear-gradient(135deg, #4c6ef5, #364fc7)', color: 'white', padding: '25px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 8px 20px rgba(76, 110, 245, 0.3)' },
  budgetItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', marginBottom: '10px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
  
  // Translate
  transContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
  transRow: { display: 'flex', gap: '10px' },
  transSelect: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '16px', backgroundColor: 'white' },
  transBtn: { backgroundColor: '#4c6ef5', color: 'white', border: 'none', padding: '15px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(76, 110, 245, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },

  // FAB & Modal
  fab: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', backgroundColor: '#4c6ef5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 25px rgba(76, 110, 245, 0.4)', cursor: 'pointer', zIndex: 100, color: 'white' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' },
  modalContent: { backgroundColor: 'white', width: '85%', maxWidth: '400px', borderRadius: '24px', padding: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #eee', fontSize: '16px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f9f9f9', marginBottom: '15px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '13px', color: '#888', fontWeight: 'bold' },
};

// --- 5. 主程式 ---
function App() {
  const [activeTab, setActiveTab] = useState('schedule'); 
  const [activeDate, setActiveDate] = useState(0);
  
  // 資料狀態
  const [scheduleData, setScheduleData] = useState(initialSchedule);
  const [budgetItems, setBudgetItems] = useState(initialBudget);

  // 翻譯狀態
  const [sourceLang, setSourceLang] = useState('zh-TW'); // 中文
  const [targetLang, setTargetLang] = useState('ja');    // 日文

  // 編輯視窗狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('schedule'); // 'schedule' or 'budget'
  const [currentEditItem, setCurrentEditItem] = useState(null);

  // 自動更新天氣 (模擬 API 呼叫)
  useEffect(() => {
    const updatedSchedule = scheduleData.map(item => {
      // 只有當沒有氣溫資料且有地點時才去抓取
      if (!item.temp && item.location) {
        const weather = getWeatherMock(item.location);
        return { ...item, ...weather };
      }
      return item;
    });
    // 避免無限迴圈，簡單比對是否需要更新
    if (JSON.stringify(updatedSchedule) !== JSON.stringify(scheduleData)) {
      setScheduleData(updatedSchedule);
    }
  }, [scheduleData]);

  // 開啟編輯視窗
  const openModal = (type, item) => {
    setModalMode(type);
    if (type === 'schedule') {
      setCurrentEditItem(item ? { ...item } : { id: null, time: '10:00', title: '', location: '', note: '', temp: null, weather: null });
    } else {
      setCurrentEditItem(item ? { ...item } : { id: null, name: '', amount: '', payer: '豪豪' });
    }
    setIsModalOpen(true);
  };

  // 儲存邏輯
  const handleSave = () => {
    if (modalMode === 'schedule') {
      if (!currentEditItem.title) return alert("請輸入標題");
      // 更新時順便重新抓一次該地點天氣
      const weather = getWeatherMock(currentEditItem.location);
      const newItem = { ...currentEditItem, ...weather };

      if (currentEditItem.id) {
        setScheduleData(prev => prev.map(i => i.id === currentEditItem.id ? newItem : i));
      } else {
        const newId = Date.now();
        setScheduleData(prev => [...prev, { ...newItem, id: newId }].sort((a,b) => a.time.localeCompare(b.time)));
      }
    } else {
      // Budget Save
      if (!currentEditItem.name || !currentEditItem.amount) return alert("請輸入項目與金額");
      const newItem = { ...currentEditItem, amount: parseInt(currentEditItem.amount) };
      if (currentEditItem.id) {
        setBudgetItems(prev => prev.map(i => i.id === currentEditItem.id ? newItem : i));
      } else {
        setBudgetItems(prev => [...prev, { ...newItem, id: Date.now() }]);
      }
    }
    setIsModalOpen(false);
  };

  // 刪除邏輯
  const handleDelete = () => {
    if (window.confirm('確定要刪除嗎？')) {
      if (modalMode === 'schedule') {
        setScheduleData(prev => prev.filter(i => i.id !== currentEditItem.id));
      } else {
        setBudgetItems(prev => prev.filter(i => i.id !== currentEditItem.id));
      }
      setIsModalOpen(false);
    }
  };

  // 翻譯跳轉
  const handleTranslate = () => {
    const url = `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&op=translate`;
    window.open(url, '_blank');
  };

  // 渲染行程
  const renderSchedule = () => (
    <div style={s.content}>
      {scheduleData.map((item, index) => (
        <div key={item.id} style={s.timelineItem}>
          {index !== scheduleData.length - 1 && <div style={s.timelineLine}></div>}
          <div style={s.dot}></div>
          <div style={s.timeCol}>
            <div style={s.timeAmPm}>{parseInt(item.time) >= 12 ? 'PM' : 'AM'}</div>
            <div style={s.timeText}>{item.time}</div>
          </div>
          <div style={s.card} onClick={() => openModal('schedule', item)}>
            <div style={s.cardHeader}>
              <h3 style={s.cardTitle}>{item.title}</h3>
              {item.temp && (
                <div style={s.weatherTag}>
                  <WeatherIcon type={item.weather} />
                  <span>{item.temp}°C</span>
                </div>
              )}
            </div>
            <div style={s.cardLoc}>📍 {item.location}</div>
            {item.note && <div style={s.cardNote}>📝 {item.note}</div>}
            
            {/* Google Map 導航連結 */}
            {item.location && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${item.location}`} 
                target="_blank" 
                rel="noreferrer"
                style={s.navBtnSmall}
                onClick={(e) => e.stopPropagation()} // 避免觸發編輯卡片
              >
                <Icons.Nav /> 導航
              </a>
            )}
          </div>
        </div>
      ))}
      <div style={s.fab} onClick={() => openModal('schedule', null)}><Icons.Plus /></div>
    </div>
  );

  // 渲染記帳
  const renderBudget = () => {
    const total = budgetItems.reduce((acc, cur) => acc + cur.amount, 0);
    const split = Math.round(total / 2);
    
    return (
      <div style={s.content}>
        <div style={s.budgetCard}>
           <div style={{opacity: 0.8, fontSize:'14px'}}>總支出 Total</div>
           <div style={{fontSize: '40px', fontWeight: 'bold', margin: '10px 0'}}>¥ {total.toLocaleString()}</div>
           <div style={{opacity: 0.8, fontSize:'14px'}}>每人分攤: ¥ {split.toLocaleString()}</div>
        </div>
        
        <h3 style={{color: '#666', marginBottom: '15px'}}>消費明細</h3>
        {budgetItems.map(item => (
          <div key={item.id} style={s.budgetItem} onClick={() => openModal('budget', item)}>
             <div>
               <div style={{fontWeight: 'bold', fontSize: '16px'}}>{item.name}</div>
               <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
                 {item.payer} 墊付
               </div>
             </div>
             <div style={{fontWeight: 'bold', color: '#4c6ef5', fontSize: '18px'}}>
               ¥ {item.amount.toLocaleString()}
             </div>
          </div>
        ))}
         <div style={s.fab} onClick={() => openModal('budget', null)}><Icons.Plus /></div>
      </div>
    );
  };

  // 渲染翻譯
  const renderTranslate = () => (
    <div style={s.content}>
      <h3 style={{textAlign:'center', color:'#333', marginBottom:'20px'}}>多國語言翻譯助手</h3>
      <div style={s.transContainer}>
        <div style={s.transRow}>
           <div style={{flex:1}}>
             <label style={s.label}>我說 (來源)</label>
             <select style={s.transSelect} value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
               <option value="zh-TW">中文 (繁體)</option>
               <option value="en">English</option>
               <option value="ja">日本語</option>
               <option value="ko">한국어 (韓語)</option>
               <option value="vi">Tiếng Việt (越語)</option>
               <option value="th">ไทย (泰語)</option>
             </select>
           </div>
           <div style={{display:'flex', alignItems:'center', paddingTop:'20px'}}>➝</div>
           <div style={{flex:1}}>
             <label style={s.label}>對方說 (目標)</label>
             <select style={s.transSelect} value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
               <option value="ja">日本語</option>
               <option value="en">English</option>
               <option value="zh-TW">中文 (繁體)</option>
               <option value="ko">한국어 (韓語)</option>
               <option value="vi">Tiếng Việt (越語)</option>
               <option value="th">ไทย (泰語)</option>
             </select>
           </div>
        </div>
        <button style={s.transBtn} onClick={handleTranslate}>
          <span>開啟 Google 翻譯</span>
          <Icons.ExternalLink />
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div style={s.topRow}>
          <div style={s.titleGroup}>
            <h1 style={s.mainTitle}>東京冬旅 Tokyo</h1>
            <span style={s.subTitle}>DEC 05 - DEC 09, 2025</span>
          </div>
          <div style={s.navGroup}>
            <button style={s.navBtn(activeTab === 'translate')} onClick={() => setActiveTab('translate')}><Icons.Translate /></button>
            <button style={s.navBtn(activeTab === 'schedule')} onClick={() => setActiveTab('schedule')}><Icons.Schedule /></button>
            <button style={s.navBtn(activeTab === 'map')} onClick={() => setActiveTab('map')}><Icons.Map /></button>
            <button style={s.navBtn(activeTab === 'budget')} onClick={() => setActiveTab('budget')}><Icons.Budget /></button>
          </div>
        </div>
        <div style={s.dateScroll}>
          {dates.map((d, index) => (
            <div key={index} style={s.dateCard(activeDate === index)} onClick={() => setActiveDate(index)}>
              <span style={{fontSize: '12px', opacity: 0.8}}>{d.date}</span>
              <span style={{fontSize: '18px', fontWeight: 'bold'}}>{d.day}</span>
            </div>
          ))}
        </div>
      </header>

      <main>
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'budget' && renderBudget()}
        {activeTab === 'translate' && renderTranslate()}
        {activeTab === 'map' && (
           <div style={{width: '100%', height: 'calc(100vh - 180px)'}}>
             <iframe 
               title="Tokyo Map"
               width="100%" 
               height="100%" 
               frameBorder="0" 
               style={{border:0}} 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d207446.97724391648!2d139.6007827827989!3d35.66816252981977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b857628235d%3A0xcdd8aef709a2b520!2z5p2x5Lqs!5e0!3m2!1szh-TW!2stw!4v1700000000000!5m2!1szh-TW!2stw" 
               allowFullScreen
             ></iframe>
           </div>
        )}
      </main>

      {/* 通用編輯視窗 */}
      {isModalOpen && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
               <h3 style={{margin:0, fontSize:'20px'}}>{currentEditItem.id ? '編輯項目' : '新增項目'}</h3>
               <div onClick={() => setIsModalOpen(false)} style={{cursor:'pointer'}}><Icons.Close /></div>
            </div>

            {modalMode === 'schedule' ? (
              <>
                <label style={s.label}>時間</label>
                <input style={s.input} type="time" value={currentEditItem.time} onChange={e => setCurrentEditItem({...currentEditItem, time: e.target.value})} />
                <label style={s.label}>標題</label>
                <input style={s.input} placeholder="例: 晴空塔觀光" value={currentEditItem.title} onChange={e => setCurrentEditItem({...currentEditItem, title: e.target.value})} />
                <label style={s.label}>地點 (自動查詢天氣/導航)</label>
                <input style={s.input} placeholder="例: 晴空塔" value={currentEditItem.location} onChange={e => setCurrentEditItem({...currentEditItem, location: e.target.value})} />
                <label style={s.label}>附件備註 (票券號碼/連結)</label>
                <input style={s.input} placeholder="例: KKday 憑證 #123456" value={currentEditItem.note} onChange={e => setCurrentEditItem({...currentEditItem, note: e.target.value})} />
              </>
            ) : (
              <>
                <label style={s.label}>消費項目</label>
                <input style={s.input} placeholder="例: 燒肉晚餐" value={currentEditItem.name} onChange={e => setCurrentEditItem({...currentEditItem, name: e.target.value})} />
                <label style={s.label}>金額 (¥)</label>
                <input style={s.input} type="number" placeholder="0" value={currentEditItem.amount} onChange={e => setCurrentEditItem({...currentEditItem, amount: e.target.value})} />
                <label style={s.label}>墊付人</label>
                <select style={s.input} value={currentEditItem.payer} onChange={e => setCurrentEditItem({...currentEditItem, payer: e.target.value})}>
                  <option value="豪豪">豪豪</option>
                  <option value="柔柔">柔柔</option>
                </select>
              </>
            )}

            <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
              {currentEditItem.id && (
                <button style={{...s.navBtn(false), borderColor:'red', color:'red', border:'1px solid red', width:'50px'}} onClick={handleDelete}><Icons.Trash /></button>
              )}
              <button style={{flex:1, backgroundColor:'#4c6ef5', color:'white', padding:'14px', borderRadius:'12px', border:'none', fontSize:'16px', fontWeight:'bold'}} onClick={handleSave}>儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
