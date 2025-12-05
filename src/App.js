import React, { useState } from 'react';

// --- 1. SVG 圖標元件 (避免依賴外部套件，確保執行成功) ---
const Icons = {
  Translate: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 8l6 6M4 14h6M2 5h12M7 2h1"/><path d="M22 22l-5-10-5 10M14 18h6"/></svg>,
  Schedule: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Map: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Budget: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Train: () => <svg width="14" height="14" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M2 8h20"/></svg>,
  Plane: () => <svg width="14" height="14" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 12h20M12 2l3 10-3 10"/></svg>,
  Plus: () => <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ExternalLink: () => <svg width="16" height="16" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
};

// --- 2. 模擬資料 (Data) ---
const scheduleData = [
  { id: 1, time: '08:30', title: '前往機場 (計程車+機捷)', location: '新北產業園區站', type: 'transport', note: '計程車至機捷站，搭乘直達車' },
  { id: 2, time: '09:30', title: '機場 Check-in', location: '桃園機場第一航廈', type: 'transport', note: 'SL394 (12:10起飛)' },
  { id: 3, time: '16:15', title: '抵達成田機場 T1 (SL394)', location: '成田機場第一航廈', type: 'location', note: '備註 (例如: 換票/轉乘)' },
];

const dates = [
  { day: 'D1', date: '12/05' }, { day: 'D2', date: '12/06' },
  { day: 'D3', date: '12/07' }, { day: 'D4', date: '12/08' },
  { day: 'D5', date: '12/09' }
];

// --- 3. 樣式系統 (Styles) ---
// 使用 JS Object 作為 CSS，模擬 Styled Components 的效果
const s = {
  app: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh', paddingBottom: '80px' },
  header: { background: 'linear-gradient(135deg, #4c6ef5, #5c7cfa)', color: 'white', padding: '20px 20px 10px 20px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', boxShadow: '0 4px 15px rgba(76, 110, 245, 0.3)' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  titleGroup: { display: 'flex', flexDirection: 'column' },
  mainTitle: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  subTitle: { fontSize: '14px', opacity: 0.9, marginTop: '4px' },
  navGroup: { display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '12px' },
  navBtn: (active) => ({ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: active ? 'white' : 'transparent', color: active ? '#4c6ef5' : 'white', transition: 'all 0.2s' }),
  
  dateScroll: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginTop: '10px', scrollbarWidth: 'none' },
  dateCard: (active) => ({ minWidth: '60px', height: '70px', backgroundColor: active ? 'white' : 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? '#4c6ef5' : 'white', flexShrink: 0 }),
  dateText: { fontSize: '12px', opacity: 0.8 },
  dayText: { fontSize: '18px', fontWeight: 'bold' },

  content: { padding: '20px' },
  
  // Schedule Styles
  timelineItem: { display: 'flex', marginBottom: '20px', position: 'relative' },
  timeCol: { width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px' },
  timeText: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  timeAmPm: { fontSize: '12px', color: '#888' },
  timelineLine: { position: 'absolute', left: '29px', top: '50px', bottom: '-30px', width: '2px', backgroundColor: '#e0e0e0', zIndex: 0 },
  dot: { width: '10px', height: '10px', backgroundColor: '#4c6ef5', borderRadius: '50%', position: 'absolute', left: '25px', top: '25px', zIndex: 1, border: '2px solid white' },
  card: { flex: 1, backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginLeft: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative' },
  cardTitle: { margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' },
  cardLoc: { fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' },
  cardNote: { fontSize: '12px', color: '#e67e22', backgroundColor: '#fff5e6', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' },

  // Budget Styles
  budgetCard: { backgroundColor: '#5c7cfa', color: 'white', padding: '25px', borderRadius: '20px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 4px 15px rgba(92, 124, 250, 0.4)' },
  budgetTotalLabel: { fontSize: '14px', opacity: 0.9, marginBottom: '5px' },
  budgetAmount: { fontSize: '36px', fontWeight: 'bold', margin: '0' },
  budgetSub: { fontSize: '14px', opacity: 0.8, marginTop: '5px' },
  rateTag: { position: 'absolute', right: '20px', top: '20px', backgroundColor: 'white', color: '#5c7cfa', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  splitSection: { display: 'flex', gap: '15px', marginBottom: '20px' },
  splitCard: { flex: 1, backgroundColor: 'white', padding: '15px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  splitName: { fontSize: '12px', color: '#888', marginBottom: '5px' },
  splitAmount: { fontSize: '18px', fontWeight: 'bold', color: '#5c7cfa' },
  addBtn: { position: 'fixed', bottom: '25px', right: '25px', width: '56px', height: '56px', backgroundColor: '#5c7cfa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(92, 124, 250, 0.5)', cursor: 'pointer' },

  // Translate Styles
  transBtn: { width: '100%', backgroundColor: 'white', border: '1px solid #eee', padding: '20px', borderRadius: '16px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' },
  transText: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  
  // Map Placeholder
  mapPlaceholder: { width: '100%', height: '400px', backgroundColor: '#e0e0e0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }
};

// --- 4. 主程式 (Main Component) ---
function App() {
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, translate, map, budget
  const [activeDate, setActiveDate] = useState(0);

  // 渲染不同的內容區塊
  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <div style={s.content}>
             {scheduleData.map((item, index) => (
               <div key={item.id} style={s.timelineItem}>
                 {/* 只有不是最後一個項目才顯示連線 */}
                 {index !== scheduleData.length - 1 && <div style={s.timelineLine}></div>}
                 <div style={s.dot}></div>
                 
                 <div style={s.timeCol}>
                   <div style={s.timeAmPm}>上午</div>
                   <div style={s.timeText}>{item.time}</div>
                   <div style={{marginTop: '5px'}}><Icons.Train /></div>
                 </div>
                 <div style={s.card}>
                   <div style={s.cardTitle}>{item.title}</div>
                   <div style={s.cardLoc}>📍 {item.location}</div>
                   <div style={s.cardNote}>ℹ️ {item.note}</div>
                 </div>
               </div>
             ))}
          </div>
        );
      case 'budget':
        return (
          <div style={s.content}>
            <div style={{...s.budgetCard, position: 'relative'}}>
              <div style={s.rateTag}>匯率 0.215</div>
              <div style={s.budgetTotalLabel}>總支出 Total</div>
              <h2 style={s.budgetAmount}>¥ 12,500</h2>
              <div style={s.budgetSub}>≈ NT$ 2,688</div>
              <div style={s.budgetSub}>(2人均分: ¥ 6,250)</div>
            </div>
            
            <div style={s.splitSection}>
              <div style={s.splitCard}>
                <div style={s.splitName}>豪豪 墊付</div>
                <div style={s.splitAmount}>¥ 8,000</div>
                <div style={{fontSize:'12px', color:'#ccc'}}>≈ NT$ 1,720</div>
              </div>
              <div style={s.splitCard}>
                <div style={s.splitName}>柔柔 墊付</div>
                <div style={s.splitAmount}>¥ 4,500</div>
                <div style={{fontSize:'12px', color:'#ccc'}}>≈ NT$ 968</div>
              </div>
            </div>

            <div style={{marginTop: '20px'}}>
              <h3 style={{fontSize: '16px', color: '#666', marginBottom: '10px'}}>新增消費</h3>
              <input type="text" placeholder="項目 (例: 燒肉)" style={{width: '100%', padding: '15px', borderRadius: '12px', border: 'none', marginBottom: '10px', backgroundColor: 'white'}} />
              <div style={{display:'flex', gap:'10px'}}>
                 <input type="number" placeholder="¥ 0" style={{flex: 1, padding: '15px', borderRadius: '12px', border: 'none', backgroundColor: 'white'}} />
                 <button style={{backgroundColor: '#5c7cfa', color: 'white', border: 'none', padding: '0 20px', borderRadius: '12px', fontWeight:'bold'}}>確認</button>
              </div>
            </div>
          </div>
        );
      case 'translate':
        return (
          <div style={s.content}>
            <h3 style={{textAlign: 'center', marginBottom: '30px', color: '#333'}}>Google 翻譯捷徑</h3>
            <div style={s.transBtn}>
              <div>
                <div style={{fontSize: '12px', color: '#888'}}>我說中文 (轉日文)</div>
                <div style={s.transText}>CH ➝ JP</div>
              </div>
              <Icons.ExternalLink />
            </div>
            <div style={s.transBtn}>
              <div>
                <div style={{fontSize: '12px', color: '#888'}}>對方說日文 (轉中文)</div>
                <div style={s.transText}>JP ➝ CH</div>
              </div>
              <Icons.ExternalLink />
            </div>
          </div>
        );
      case 'map':
        return (
          <div style={s.content}>
             <div style={s.mapPlaceholder}>
                <div style={{textAlign: 'center'}}>
                  <Icons.Map />
                  <p>地圖載入中...<br/>(可串接 Google Maps API)</p>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={s.app}>
      {/* 頂部 Header 區域 */}
      <header style={s.header}>
        <div style={s.topRow}>
          <div style={s.titleGroup}>
            <h1 style={s.mainTitle}>東京冬旅 Tokyo</h1>
            <span style={s.subTitle}>DEC 05 - DEC 09, 2025</span>
          </div>
          {/* 功能切換 Tabs */}
          <div style={s.navGroup}>
            <button style={s.navBtn(activeTab === 'translate')} onClick={() => setActiveTab('translate')}><Icons.Translate /></button>
            <button style={s.navBtn(activeTab === 'schedule')} onClick={() => setActiveTab('schedule')}><Icons.Schedule /></button>
            <button style={s.navBtn(activeTab === 'map')} onClick={() => setActiveTab('map')}><Icons.Map /></button>
            <button style={s.navBtn(activeTab === 'budget')} onClick={() => setActiveTab('budget')}><Icons.Budget /></button>
          </div>
        </div>

        {/* 日期選擇器 */}
        <div style={s.dateScroll}>
          {dates.map((d, index) => (
            <div 
              key={index} 
              style={s.dateCard(activeDate === index)}
              onClick={() => setActiveDate(index)}
            >
              <span style={s.dateText}>{d.date}</span>
              <span style={s.dayText}>{d.day}</span>
            </div>
          ))}
        </div>
      </header>

      {/* 主要內容區 */}
      <main>
        {renderContent()}
      </main>

      {/* 浮動新增按鈕 (只在記帳頁面顯示) */}
      {activeTab === 'budget' && (
        <div style={s.addBtn}>
          <Icons.Plus />
        </div>
      )}
    </div>
  );
}

export default App;
