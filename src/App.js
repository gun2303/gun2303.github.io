import React, { useState } from 'react';
import './App.css';

const App = () => {
  // --- 1. 全域狀態 ---
  const [tripTitle, setTripTitle] = useState("Hokkaido 2026");
  const [activeTab, setActiveTab] = useState('schedule'); 
  const [activeDateIndex, setActiveDateIndex] = useState(0); 

  // --- 2. 行程核心資料 ---
  const [days, setDays] = useState([
    {
      id: 1, date: '12/05', week: 'Fri',
      weather: { high: 2, low: -5, feel: -8, cond: '大雪' },
      // 航班資訊：新增 flightDate 與 termLoc (用於精準導航)
      flight: { 
        flightDate: '2025/12/05', 
        code: 'CI0130', 
        time: '08:35', 
        seat: '12A', 
        term: 'T2', 
        termLoc: '桃園機場第二航廈', // 專門給導航用的關鍵字
        note: '記得預辦登機' 
      },
      // 住宿資訊：新增 checkIn/Out 日期
      hotel: { 
        checkIn: '12/05', 
        checkOut: '12/06', 
        name: '札幌格蘭大飯店', 
        addr: '札幌市中央區北1西4' 
      },
      events: [
        { id: 101, time: '06:00', loc: '桃園機場', type: 'transport', transType: 'flight', transTime: '4h 40m' },
        { id: 102, time: '13:15', loc: '新千歲機場', type: 'spot', transType: 'train', transTime: '40m' },
        { id: 103, time: '15:00', loc: '飯店 Check-in', type: 'stay', transType: 'walk', transTime: '10m' },
        { id: 104, time: '18:00', loc: '大通公園聖誕市集', type: 'spot', transType: '', transTime: '' }
      ]
    },
    {
      id: 2, date: '12/06', week: 'Sat',
      weather: { high: 0, low: -3, feel: -5, cond: '多雲' },
      flight: null, 
      hotel: { 
        checkIn: '12/06', 
        checkOut: '12/07', 
        name: '小樽多米酒店', 
        addr: '小樽市色內2-11' 
      },
      events: [
        { id: 201, time: '09:00', loc: '二條市場早餐', type: 'food', transType: 'metro', transTime: '15m' },
        { id: 202, time: '10:30', loc: '前往小樽', type: 'spot', transType: 'train', transTime: '45m' },
        { id: 203, time: '12:00', loc: '小樽運河食堂', type: 'food', transType: 'walk', transTime: '5m' }
      ]
    },
    { id: 3, date: '12/07', week: 'Sun', weather: { high: 5, low: 1, feel: 0, cond: '晴天' }, flight: null, hotel: null, events: [] },
  ]);

  // --- 3. 匯率與記帳狀態 ---
  const currencyList = ['TWD', 'JPY', 'KRW', 'USD', 'THB', 'VND', 'INR'];
  const [rates] = useState({ TWD: 1, JPY: 4.65, KRW: 42.5, USD: 0.032, THB: 1.12, VND: 760, INR: 2.6 });
  
  const [converter, setConverter] = useState({ amount: '', from: 'JPY', to: 'TWD', res: null });
  const [expenses, setExpenses] = useState([]);
  const [newExp, setNewExp] = useState({ item: '', amt: '', curr: 'JPY', type: '購物' });

  // --- 4. 輔助函數 ---
  const getTransIcon = (type) => {
    switch(type) {
      case 'flight': return '✈️ 飛機';
      case 'hsr': return '🚅 高鐵';
      case 'train': return '🚆 火車';
      case 'metro': return '🚇 捷運';
      case 'walk': return '🚶 步行';
      case 'bus': return '🚌 巴士';
      default: return '🚗 移動';
    }
  };

  // 導航功能 (通用)
  const openMap = (loc) => {
    if(!loc) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, '_blank');
  };

  const handleConvert = () => { /* 自動計算，邏輯在 render */ }; 
  // 修正：即時計算，這裡僅保留結構
  
  const addExpense = () => {
    if(!newExp.item || !newExp.amt) return;
    setExpenses([...expenses, { id: Date.now(), ...newExp }]);
    setNewExp({...newExp, item: '', amt: ''});
  };

  const addEvent = () => {
    const newLoc = prompt("輸入地點名稱:");
    if(newLoc) {
      const updatedDays = [...days];
      updatedDays[activeDateIndex].events.push({
        id: Date.now(), time: '00:00', loc: newLoc, type: 'spot', transType: 'walk', transTime: '10m'
      });
      setDays(updatedDays);
    }
  };

  // 即時匯率計算邏輯
  const convertedResult = converter.amount 
    ? ((parseFloat(converter.amount) / rates[converter.from]) * rates[converter.to]).toLocaleString(undefined, {maximumFractionDigits: 2})
    : 0;

  const currentDay = days[activeDateIndex];

  return (
    <div className="mobile-wrapper">
      
      {/* 頂部 Hero & 日期導航 */}
      <div className="hero-header">
        <input className="hero-title" value={tripTitle} onChange={(e)=>setTripTitle(e.target.value)} />
        <div className="date-tabs-container">
          {days.map((day, idx) => (
            <button 
              key={day.id} 
              className={`date-tab ${idx === activeDateIndex ? 'active' : ''}`}
              onClick={() => setActiveDateIndex(idx)}
            >
              <div className="week">{day.week}</div>
              <div className="date">{day.date}</div>
            </button>
          ))}
          <button className="date-tab add-day">+</button>
        </div>
      </div>

      <div className="content-body">
        
        {/* --- 模式 A: 行程表 --- */}
        {activeTab === 'schedule' && (
          <div className="fade-in">
            
            {/* 1. 天氣卡片 */}
            <div className="info-card weather-card">
              <div className="wc-left">
                <div className="wc-icon">❄️</div>
                <div className="wc-text">
                  <div className="temp">{currentDay.weather.high}° <span className="low">/{currentDay.weather.low}°</span></div>
                  <div className="feel">體感: {currentDay.weather.feel}°</div>
                </div>
              </div>
              <div className="wc-right">{currentDay.weather.cond}</div>
            </div>

            {/* 2. 航班資訊 (升級版) */}
            {currentDay.flight && (
              <div className="info-card flight-card">
                <div className="card-label-row">
                  <span className="card-label">✈️ 航班資訊</span>
                  <span className="flight-date-tag">{currentDay.flight.flightDate}</span>
                </div>
                
                <div className="flight-main">
                  <div className="flight-code">{currentDay.flight.code}</div>
                  <div className="flight-time">{currentDay.flight.time} 起飛</div>
                </div>
                
                <div className="flight-details">
                  <div className="flight-detail-item">
                    <span>航廈: {currentDay.flight.term}</span>
                    {/* 航廈導航按鈕 */}
                    <button className="icon-btn-sm" onClick={() => openMap(currentDay.flight.termLoc)}>📍</button>
                  </div>
                  <div className="flight-detail-item">座位: {currentDay.flight.seat}</div>
                </div>
                <div className="note-text">備註: {currentDay.flight.note}</div>
              </div>
            )}

            {/* 3. 住宿資訊 (升級版) */}
            {currentDay.hotel && (
              <div className="info-card hotel-card">
                 <div className="card-label-row">
                    <span className="card-label">🏨 今晚住宿</span>
                    <span className="hotel-date-tag">
                      {currentDay.hotel.checkIn} - {currentDay.hotel.checkOut}
                    </span>
                 </div>
                 <div className="hotel-name">{currentDay.hotel.name}</div>
                 <div className="hotel-addr-row">
                   <div className="hotel-addr">📍 {currentDay.hotel.addr}</div>
                   <button className="sm-btn map-outline" onClick={() => openMap(currentDay.hotel.name + " " + currentDay.hotel.addr)}>
                     導航
                   </button>
                 </div>
              </div>
            )}

            {/* 4. 行程時間軸 */}
            <div className="timeline-container">
              {currentDay.events.map((ev, i) => (
                <div key={ev.id} className="timeline-item">
                  <div className="tl-time">{ev.time}</div>
                  <div className="tl-line-col">
                    <div className="tl-dot"></div>
                    {i < currentDay.events.length - 1 && (
                      <div className="tl-line">
                         {ev.transType && (
                           <div className="trans-badge">
                             {getTransIcon(ev.transType)} <span className="trans-min">{ev.transTime}</span>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                  <div className="tl-content">
                     <div className="tl-card">
                       <div className="tl-loc">{ev.loc}</div>
                       <div className="tl-actions">
                         <button className="sm-btn map" onClick={() => openMap(ev.loc)}>導航</button>
                         <button className="sm-btn edit">編輯</button>
                       </div>
                     </div>
                  </div>
                </div>
              ))}
              
              <div className="timeline-item add-btn-row">
                 <div className="tl-time"></div>
                 <div className="tl-line-col"><div className="tl-dot add">+</div></div>
                 <div className="tl-content">
                    <button className="btn-add-event" onClick={addEvent}>新增行程地點</button>
                 </div>
              </div>
            </div>

          </div>
        )}

        {/* --- 模式 B: 記帳與匯率 --- */}
        {activeTab === 'money' && (
          <div className="fade-in">
             <div className="currency-converter">
                <h3>💱 萬能匯率換算</h3>
                <div className="conv-row">
                   <input type="number" placeholder="金額" value={converter.amount} onChange={e=>setConverter({...converter, amount:e.target.value})}/>
                   <select value={converter.from} onChange={e=>setConverter({...converter, from:e.target.value})}>
                      {currencyList.map(c=><option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                <div className="conv-arrow">⬇️ 轉換為 ⬇️</div>
                <div className="conv-row">
                   <div className="conv-result">{convertedResult}</div>
                   <select value={converter.to} onChange={e=>setConverter({...converter, to:e.target.value})}>
                      {currencyList.map(c=><option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
             </div>

             <div className="expense-section">
                <h3>💰 新增支出</h3>
                <div className="exp-form">
                   <input placeholder="消費項目" value={newExp.item} onChange={e=>setNewExp({...newExp, item:e.target.value})} />
                   <div className="exp-row">
                      <input type="number" placeholder="金額" value={newExp.amt} onChange={e=>setNewExp({...newExp, amt:e.target.value})} />
                      <select value={newExp.curr} onChange={e=>setNewExp({...newExp, curr:e.target.value})}>
                        {currencyList.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <button className="btn-save" onClick={addExpense}>記一筆</button>
                </div>

                <div className="exp-list">
                  {expenses.map(ex => (
                    <div key={ex.id} className="exp-item">
                       <span>{ex.item}</span>
                       <strong>{ex.amt} <small>{ex.curr}</small></strong>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

      </div>

      {/* 底部導航列 */}
      <div className="bottom-nav">
         <button className={`nav-item ${activeTab==='schedule'?'active':''}`} onClick={()=>setActiveTab('schedule')}>
           🗓️ 行程
         </button>
         <button className={`nav-item ${activeTab==='money'?'active':''}`} onClick={()=>setActiveTab('money')}>
           🪙 錢包
         </button>
      </div>

    </div>
  );
};

export default App;
