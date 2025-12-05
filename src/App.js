import React, { useState } from 'react';

// --- 1. 圖標庫 (新增天氣與編輯相關圖標) ---
const Icons = {
  Translate: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 8l6 6M4 14h6M2 5h12M7 2h1"/><path d="M22 22l-5-10-5 10M14 18h6"/></svg>,
  Schedule: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Map: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Budget: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Train: () => <svg width="14" height="14" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M2 8h20"/></svg>,
  Plus: () => <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ExternalLink: () => <svg width="16" height="16" fill="none" stroke="#666" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  Sun: () => <svg width="16" height="16" fill="orange" stroke="orange" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  Close: () => <svg width="24" height="24" fill="none" stroke="#333" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: () => <svg width="20" height="20" fill="none" stroke="red" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
};

// --- 2. 初始資料 ---
const initialSchedule = [
  { id: 1, time: '08:30', title: '前往機場', location: '新北產業園區站', note: '搭乘直達車', temp: '22', weather: 'sunny' },
  { id: 2, time: '09:30', title: '機場 Check-in', location: '桃園機場 T1', note: 'SL394 航班', temp: '21', weather: 'cloudy' },
  { id: 3, time: '16:15', title: '抵達成田機場', location: '成田機場 T1', note: '記得換 JR Pass', temp: '12', weather: 'sunny' },
];

const dates = [
  { day: 'D1', date: '12/05' }, { day: 'D2', date: '12/06' }, { day: 'D3', date: '12/07' }, { day: 'D4', date: '12/08' }, { day: 'D5', date: '12/09' }
];

// --- 3. 樣式系統 ---
const s = {
  app: { fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', backgroundColor: '#f5f7fa', minHeight: '100vh', paddingBottom: '80px' },
  header: { background: 'linear-gradient(135deg, #4c6ef5, #5c7cfa)', color: 'white', padding: '20px 20px 10px 20px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', boxShadow: '0 4px 15px rgba(76, 110, 245, 0.3)' },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' },
  titleGroup: { display: 'flex', flexDirection: 'column' },
  mainTitle: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  subTitle: { fontSize: '14px', opacity: 0.9, marginTop: '4px' },
  navGroup: { display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '12px' },
  navBtn: (active) => ({ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: active ? 'white' : 'transparent', color: active ? '#4c6ef5' : 'white', transition: 'all 0.2s' }),
  dateScroll: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginTop: '10px', scrollbarWidth: 'none' },
  dateCard: (active) => ({ minWidth: '60px', height: '70px', backgroundColor: active ? 'white' : 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: active ? '#4c6ef5' : 'white', flexShrink: 0 }),
  content: { padding: '20px' },
  
  // Timeline
  timelineItem: { display: 'flex', marginBottom: '20px', position: 'relative' },
  timeCol: { width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '15px' },
  timeText: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  timeAmPm: { fontSize: '12px', color: '#888' },
  timelineLine: { position: 'absolute', left: '29px', top: '50px', bottom: '-30px', width: '2px', backgroundColor: '#e0e0e0', zIndex: 0 },
  dot: { width: '10px', height: '10px', backgroundColor: '#4c6ef5', borderRadius: '50%', position: 'absolute', left: '25px', top: '25px', zIndex: 1, border: '2px solid white' },
  card: { flex: 1, backgroundColor: 'white', borderRadius: '16px', padding: '16px', marginLeft: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative', cursor: 'pointer', transition: 'transform 0.1s' },
  cardTitle: { margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' },
  cardLoc: { fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' },
  cardNote: { fontSize: '12px', color: '#e67e22', backgroundColor: '#fff5e6', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' },
  weatherTag: { position: 'absolute', right: '15px', top: '15px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 'bold', color: '#f39c12' },

  // Floating Action Button
  fab: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', backgroundColor: '#4c6ef5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(76, 110, 245, 0.4)', cursor: 'pointer', zIndex: 100 },

  // Modal (Overlay)
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', width: '90%', maxWidth: '400px', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', animation: 'popIn 0.3s ease' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: 'bold' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontSize: '12px', color: '#888', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', boxSizing: 'border-box' },
  row: { display: 'flex', gap: '15px' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '20px' },
  saveBtn: { flex: 1, backgroundColor: '#4c6ef5', color: 'white', padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
  deleteBtn: { backgroundColor: 'transparent', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '12px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

// --- 4. 主程式 ---
function App() {
  const [activeTab, setActiveTab] = useState('schedule'); 
  const [activeDate, setActiveDate] = useState(0);
  
  // State: 行程資料
  const [scheduleData, setScheduleData] = useState(initialSchedule);

  // State: 編輯視窗控制
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null); // null 代表新增，有物件代表編輯

  // 開啟編輯視窗
  const openEditModal = (item) => {
    setCurrentEditItem(item ? { ...item } : { id: null, time: '10:00', title: '', location: '', note: '', temp: '20', weather: 'sunny' });
    setIsModalOpen(true);
  };

  // 儲存邏輯 (新增或修改)
  const handleSave = () => {
    if (!currentEditItem.title) return alert("請輸入標題");

    if (currentEditItem.id) {
      // 編輯現有
      setScheduleData(prev => prev.map(item => item.id === currentEditItem.id ? currentEditItem : item));
    } else {
      // 新增
      const newId = Math.max(...scheduleData.map(i => i.id), 0) + 1;
      setScheduleData(prev => [...prev, { ...currentEditItem, id: newId }].sort((a,b) => a.time.localeCompare(b.time)));
    }
    setIsModalOpen(false);
  };

  // 刪除邏輯
  const handleDelete = () => {
    if (window.confirm('確定要刪除這個行程嗎？')) {
      setScheduleData(prev => prev.filter(item => item.id !== currentEditItem.id));
      setIsModalOpen(false);
    }
  };

  // 渲染行程列表
  const renderSchedule = () => (
    <div style={s.content}>
      {scheduleData.length === 0 ? <p style={{textAlign:'center', color:'#888', marginTop:'50px'}}>點擊右下角 + 新增行程</p> : null}
      {scheduleData.map((item, index) => (
        <div key={item.id} style={s.timelineItem} onClick={() => openEditModal(item)}>
          {index !== scheduleData.length - 1 && <div style={s.timelineLine}></div>}
          <div style={s.dot}></div>
          
          <div style={s.timeCol}>
            <div style={s.timeAmPm}>{parseInt(item.time) >= 12 ? '下午' : '上午'}</div>
            <div style={s.timeText}>{item.time}</div>
            <div style={{marginTop: '5px'}}><Icons.Train /></div>
          </div>
          <div style={s.card}>
            <div style={s.weatherTag}>
               <Icons.Sun />
               <span>{item.temp}°C</span>
            </div>
            <div style={s.cardTitle}>{item.title}</div>
            <div style={s.cardLoc}>📍 {item.location}</div>
            {item.note && <div style={s.cardNote}>ℹ️ {item.note}</div>}
          </div>
        </div>
      ))}
      {/* 新增按鈕 FAB */}
      <div style={s.fab} onClick={() => openEditModal(null)}>
        <Icons.Plus />
      </div>
    </div>
  );

  return (
    <div style={s.app}>
      {/* Header */}
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
              <span style={s.dateText}>{d.date}</span>
              <span style={s.dayText}>{d.day}</span>
            </div>
          ))}
        </div>
      </header>

      <main>
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'translate' && <div style={{padding:'20px', textAlign:'center', color:'#888'}}>翻譯功能開發中...</div>}
        {activeTab === 'map' && <div style={{padding:'20px', textAlign:'center', color:'#888'}}>地圖功能開發中...</div>}
        {activeTab === 'budget' && <div style={{padding:'20px', textAlign:'center', color:'#888'}}>記帳功能開發中...</div>}
      </main>

      {/* 編輯/新增 彈出視窗 (Modal) */}
      {isModalOpen && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>{currentEditItem.id ? '編輯行程' : '新增行程'}</h3>
              <div onClick={() => setIsModalOpen(false)} style={{cursor: 'pointer'}}><Icons.Close /></div>
            </div>
            
            <div style={s.row}>
               <div style={{...s.inputGroup, flex: 1}}>
                  <label style={s.label}>時間</label>
                  <input type="time" style={s.input} value={currentEditItem.time} onChange={(e) => setCurrentEditItem({...currentEditItem, time: e.target.value})} />
               </div>
               <div style={{...s.inputGroup, flex: 1}}>
                  <label style={s.label}>預報氣溫 (°C)</label>
                  <input type="number" style={s.input} value={currentEditItem.temp} onChange={(e) => setCurrentEditItem({...currentEditItem, temp: e.target.value})} />
               </div>
            </div>

            <div style={s.inputGroup}>
               <label style={s.label}>標題</label>
               <input type="text" placeholder="例: 前往迪士尼" style={s.input} value={currentEditItem.title} onChange={(e) => setCurrentEditItem({...currentEditItem, title: e.target.value})} />
            </div>

            <div style={s.inputGroup}>
               <label style={s.label}>地點</label>
               <input type="text" placeholder="例: 舞濱站" style={s.input} value={currentEditItem.location} onChange={(e) => setCurrentEditItem({...currentEditItem, location: e.target.value})} />
            </div>

            <div style={s.inputGroup}>
               <label style={s.label}>備註</label>
               <input type="text" placeholder="例: 記得帶票" style={s.input} value={currentEditItem.note} onChange={(e) => setCurrentEditItem({...currentEditItem, note: e.target.value})} />
            </div>

            <div style={s.btnRow}>
               {currentEditItem.id && (
                 <button style={s.deleteBtn} onClick={handleDelete}><Icons.Trash /></button>
               )}
               <button style={s.saveBtn} onClick={handleSave}>儲存行程</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
