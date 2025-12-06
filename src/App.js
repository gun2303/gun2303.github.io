import React, { useState } from 'react';
import './App.css';

const App = () => {
  // --- 全域狀態 ---
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, money
  
  // 控制 Modal (彈窗) 顯示狀態
  const [modalType, setModalType] = useState(null); // 'flight', 'hotel', 'event', 'expense'
  const [editingData, setEditingData] = useState(null); // 暫存正在編輯的資料

  // --- 核心資料：行程 (Days) ---
  const [days, setDays] = useState([
    {
      id: 1, date: '12/05', week: 'Fri',
      weather: { high: 2, low: -5, feel: -8, cond: '大雪' },
      flight: { 
        has: true, date: '2025/12/05', code: 'CI0130', time: '08:35', 
        from: 'TPE', to: 'CTS', terminal: 'T2', seat: '12A', note: '提前2小時報到' 
      },
      hotel: { 
        has: true, checkIn: '12/05', checkOut: '12/06', 
        name: '札幌格蘭大飯店', address: '札幌市中央區北1西4', phone: '011-261-3311' 
      },
      events: [
        { id: 101, time: '06:00', title: '桃園機場接送', location: '桃園機場 T2', trans: 'car', transTime: '40m' },
        { id: 102, time: '14:00', title: '搭乘 JR 前往札幌', location: '新千歲空港站', trans: 'train', transTime: '37m' }
      ]
    },
    {
      id: 2, date: '12/06', week: 'Sat',
      weather: { high: 0, low: -3, feel: -5, cond: '多雲' },
      flight: { has: false },
      hotel: { has: false },
      events: []
    }
  ]);

  // --- 記帳資料 ---
  const [expenses, setExpenses] = useState([]);
  const currencyList = ['TWD', 'JPY', 'KRW', 'USD', 'THB', 'VND', 'INR'];
  
  // 匯率狀態
  const [rates] = useState({ TWD: 1, JPY: 4.65, KRW: 42.5, USD: 0.032, THB: 1.12, VND: 760, INR: 2.6 });
  const [calc, setCalc] = useState({ amt: '', from: 'JPY', to: 'TWD' });

  // --- 操作邏輯 ---

  // 開啟編輯視窗
  const openEdit = (type, data) => {
    setModalType(type);
    setEditingData({ ...data }); // 複製一份資料來編輯，避免直接修改 State
  };

  // 儲存編輯結果
  const saveEdit = () => {
    if (modalType === 'flight' || modalType === 'hotel' || modalType === 'weather') {
      // 更新當天資訊
      const newDays = [...days];
      newDays[activeDateIndex][modalType] = editingData;
      setDays(newDays);
    } else if (modalType === 'event') {
      // 更新特定事件
      const newDays = [...days];
      const evIdx = newDays[activeDateIndex].events.findIndex(e => e.id === editingData.id);
      if (evIdx >= 0) newDays[activeDateIndex].events[evIdx] = editingData;
      else newDays[activeDateIndex].events.push({ ...editingData, id: Date.now() }); // 新增
      setDays(newDays);
    } else if (modalType === 'expense') {
      setExpenses([...expenses, { ...editingData, id: Date.now() }]);
    }
    setModalType(null);
    setEditingData(null);
  };

  // 刪除事件
  const deleteEvent = (eventId) => {
    if(!window.confirm("確定刪除此行程？")) return;
    const newDays = [...days];
    newDays[activeDateIndex].events = newDays[activeDateIndex].events.filter(e => e.id !== eventId);
    setDays(newDays);
  };

  // 導航功能
  const openMap = (keyword) => {
    if(!keyword) return alert("沒有地址資訊");
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(keyword)}`, '_blank');
  };

  const currentDay = days[activeDateIndex];
  const calcResult = calc.amt ? ((parseFloat(calc.amt) / rates[calc.from]) * rates[calc.to]).toFixed(2) : 0;

  return (
    <div className="app-shell">
      
      {/* 頂部日期切換 */}
      <div className="header-bar">
        <h2 className="app-title">Hokkaido 2026</h2>
        <div className="date-scroll">
          {days.map((d, idx) => (
            <div key={d.id} className={`date-pill ${idx === activeDateIndex ? 'active' : ''}`} onClick={() => setActiveDateIndex(idx)}>
              <span className="pill-week">{d.week}</span>
              <span className="pill-date">{d.date}</span>
            </div>
          ))}
          <button className="add-day-btn" onClick={() => alert('新增天數功能尚未實作')}>+</button>
        </div>
      </div>

      <div className="main-viewport">
        {activeTab === 'schedule' && (
          <div className="fade-in">
            
            {/* 1. 天氣區塊 (可點擊編輯) */}
            <div className="card weather-card" onClick={() => openEdit('weather', currentDay.weather)}>
              <div className="wc-main">
                <span className="wc-icon">❄️</span>
                <div>
                  <div className="wc-temp">{currentDay.weather.high}° <small>/{currentDay.weather.low}°</small></div>
                  <div className="wc-cond">{currentDay.weather.cond} (體感 {currentDay.weather.feel}°)</div>
                </div>
              </div>
              <span className="edit-hint">點擊修改</span>
            </div>

            {/* 2. 航班區塊 (有無資料切換) */}
            {currentDay.flight.has ? (
              <div className="card flight-card">
                <div className="card-top">
                  <span className="tag-flight">✈️ 航班</span>
                  <div className="card-btns">
                    <button className="icon-btn" onClick={() => openMap(`${currentDay.flight.from} ${currentDay.flight.terminal}航廈`)}>📍 航廈導航</button>
                    <button className="icon-btn" onClick={() => openEdit('flight', currentDay.flight)}>✏️ 編輯</button>
                  </div>
                </div>
                <div className="flight-info">
                  <div className="flight-route">
                    <span className="big-code">{currentDay.flight.from}</span>
                    <span className="arrow">➝</span>
                    <span className="big-code">{currentDay.flight.to}</span>
                  </div>
                  <div className="flight-detail-grid">
                    <div><label>日期</label>{currentDay.flight.date}</div>
                    <div><label>時間</label>{currentDay.flight.time}</div>
                    <div><label>班次</label>{currentDay.flight.code}</div>
                    <div><label>座位</label>{currentDay.flight.seat}</div>
                    <div><label>航廈</label>{currentDay.flight.terminal}</div>
                  </div>
                  <div className="card-note">備註：{currentDay.flight.note}</div>
                </div>
              </div>
            ) : (
              <button className="add-block-btn" onClick={() => openEdit('flight', { has: true, date: currentDay.date, code:'', seat:'', terminal:'' })}>+ 新增航班資訊</button>
            )}

            {/* 3. 住宿區塊 */}
            {currentDay.hotel.has ? (
              <div className="card hotel-card">
                <div className="card-top">
                  <span className="tag-hotel">🏨 住宿</span>
                  <div className="card-btns">
                    <button className="icon-btn" onClick={() => openMap(currentDay.hotel.address)}>📍 導航</button>
                    <button className="icon-btn" onClick={() => openEdit('hotel', currentDay.hotel)}>✏️ 編輯</button>
                  </div>
                </div>
                <div className="hotel-info">
                  <div className="hotel-name">{currentDay.hotel.name}</div>
                  <div className="hotel-dates">入住: {currentDay.hotel.checkIn} ➝ 退房: {currentDay.hotel.checkOut}</div>
                  <div className="hotel-addr">{currentDay.hotel.address}</div>
                </div>
              </div>
            ) : (
              <button className="add-block-btn" onClick={() => openEdit('hotel', { has: true, checkIn: currentDay.date, name:'', address:'' })}>+ 新增住宿資訊</button>
            )}

            {/* 4. 行程列表 */}
            <div className="timeline-section">
              {currentDay.events.map((ev) => (
                <div key={ev.id} className="event-row">
                  <div className="ev-time">{ev.time}</div>
                  <div className="ev-line">
                    <div className="ev-dot"></div>
                    <div className="ev-path"></div>
                  </div>
                  <div className="ev-card">
                    <div className="ev-title">{ev.title}</div>
                    <div className="ev-loc">📍 {ev.location}</div>
                    <div className="ev-meta">
                      <span className="trans-tag">{ev.trans} ({ev.transTime})</span>
                      <div className="ev-actions">
                        <button onClick={() => openMap(ev.location)}>導航</button>
                        <button onClick={() => openEdit('event', ev)}>修改</button>
                        <button className="danger" onClick={() => deleteEvent(ev.id)}>刪除</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button className="add-event-btn" onClick={() => openEdit('event', { time: '10:00', title: '', location: '', trans: 'walk' })}>+ 新增行程</button>
            </div>
          </div>
        )}

        {activeTab === 'money' && (
          <div className="fade-in money-view">
             <div className="card calc-card">
               <h3>匯率換算</h3>
               <div className="calc-row">
                 <input type="number" value={calc.amt} onChange={e=>setCalc({...calc, amt: e.target.value})} placeholder="金額" />
                 <select value={calc.from} onChange={e=>setCalc({...calc, from: e.target.value})}>{currencyList.map(c=><option key={c}>{c}</option>)}</select>
               </div>
               <div className="calc-arrow">⬇️</div>
               <div className="calc-row">
                 <div className="result-box">{calcResult}</div>
                 <select value={calc.to} onChange={e=>setCalc({...calc, to: e.target.value})}>{currencyList.map(c=><option key={c}>{c}</option>)}</select>
               </div>
             </div>

             <div className="expense-list">
               <h3>支出紀錄</h3>
               <button className="add-block-btn" onClick={() => openEdit('expense', { item: '', amt: '', curr: 'JPY' })}>+ 記一筆</button>
               {expenses.map(ex => (
                 <div key={ex.id} className="exp-item">
                   <span>{ex.item}</span>
                   <strong>{ex.amt} {ex.curr}</strong>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>

      {/* --- 彈窗編輯器 (MODAL) --- */}
      {modalType && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>編輯內容</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* 航班編輯表單 */}
              {modalType === 'flight' && (
                <>
                  <label>日期</label><input type="text" value={editingData.date} onChange={e=>setEditingData({...editingData, date:e.target.value})} />
                  <div className="row">
                    <div><label>起飛地</label><input value={editingData.from} onChange={e=>setEditingData({...editingData, from:e.target.value})} /></div>
                    <div><label>抵達地</label><input value={editingData.to} onChange={e=>setEditingData({...editingData, to:e.target.value})} /></div>
                  </div>
                  <div className="row">
                    <div><label>班次</label><input value={editingData.code} onChange={e=>setEditingData({...editingData, code:e.target.value})} /></div>
                    <div><label>時間</label><input type="time" value={editingData.time} onChange={e=>setEditingData({...editingData, time:e.target.value})} /></div>
                  </div>
                  <div className="row">
                    <div><label>航廈</label><input value={editingData.terminal} onChange={e=>setEditingData({...editingData, terminal:e.target.value})} /></div>
                    <div><label>座位</label><input value={editingData.seat} onChange={e=>setEditingData({...editingData, seat:e.target.value})} /></div>
                  </div>
                  <label>備註</label><textarea value={editingData.note} onChange={e=>setEditingData({...editingData, note:e.target.value})} />
                </>
              )}

              {/* 住宿編輯表單 */}
              {modalType === 'hotel' && (
                <>
                  <label>旅館名稱</label><input value={editingData.name} onChange={e=>setEditingData({...editingData, name:e.target.value})} />
                  <label>地址 (供導航用)</label><input value={editingData.address} onChange={e=>setEditingData({...editingData, address:e.target.value})} />
                  <div className="row">
                    <div><label>入住</label><input value={editingData.checkIn} onChange={e=>setEditingData({...editingData, checkIn:e.target.value})} /></div>
                    <div><label>退房</label><input value={editingData.checkOut} onChange={e=>setEditingData({...editingData, checkOut:e.target.value})} /></div>
                  </div>
                </>
              )}

              {/* 天氣編輯表單 */}
              {modalType === 'weather' && (
                <>
                   <div className="row">
                     <div><label>最高溫</label><input type="number" value={editingData.high} onChange={e=>setEditingData({...editingData, high:e.target.value})} /></div>
                     <div><label>最低溫</label><input type="number" value={editingData.low} onChange={e=>setEditingData({...editingData, low:e.target.value})} /></div>
                   </div>
                   <label>天氣狀況</label><input value={editingData.cond} onChange={e=>setEditingData({...editingData, cond:e.target.value})} />
                   <label>體感溫度</label><input value={editingData.feel} onChange={e=>setEditingData({...editingData, feel:e.target.value})} />
                </>
              )}

              {/* 行程編輯表單 */}
              {modalType === 'event' && (
                <>
                   <label>時間</label><input type="time" value={editingData.time} onChange={e=>setEditingData({...editingData, time:e.target.value})} />
                   <label>標題</label><input value={editingData.title} onChange={e=>setEditingData({...editingData, title:e.target.value})} />
                   <label>地點</label><input value={editingData.location} onChange={e=>setEditingData({...editingData, location:e.target.value})} />
                   <div className="row">
                      <div><label>交通方式</label>
                        <select value={editingData.trans} onChange={e=>setEditingData({...editingData, trans:e.target.value})}>
                          <option value="walk">步行</option><option value="train">火車</option><option value="car">汽車</option><option value="flight">飛機</option>
                        </select>
                      </div>
                      <div><label>耗時</label><input value={editingData.transTime} onChange={e=>setEditingData({...editingData, transTime:e.target.value})} /></div>
                   </div>
                </>
              )}
              
              {/* 記帳編輯表單 */}
              {modalType === 'expense' && (
                <>
                   <label>項目</label><input value={editingData.item} onChange={e=>setEditingData({...editingData, item:e.target.value})} />
                   <div className="row">
                     <div><label>金額</label><input type="number" value={editingData.amt} onChange={e=>setEditingData({...editingData, amt:e.target.value})} /></div>
                     <div><label>幣別</label>
                       <select value={editingData.curr} onChange={e=>setEditingData({...editingData, curr:e.target.value})}>
                          {currencyList.map(c=><option key={c}>{c}</option>)}
                       </select>
                     </div>
                   </div>
                </>
              )}
            </div>
            
            <button className="save-modal-btn" onClick={saveEdit}>儲存變更</button>
          </div>
        </div>
      )}

      {/* 底部導航 */}
      <div className="bottom-nav">
        <button className={activeTab==='schedule'?'active':''} onClick={()=>setActiveTab('schedule')}>🗓️ 行程</button>
        <button className={activeTab==='money'?'active':''} onClick={()=>setActiveTab('money')}>💰 記帳</button>
      </div>
    </div>
  );
};

export default App;
