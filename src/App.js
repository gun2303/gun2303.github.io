import React, { useState } from 'react';
import './App.css'; // 確保這行存在，用來讀取樣式

const App = () => {
  // --- 狀態管理 ---
  const [tripTitle, setTripTitle] = useState("Hokkaido 2026");
  const [tripDate, setTripDate] = useState("DEC 05 - DEC 09");
  const [activeTab, setActiveTab] = useState('schedule'); // 控制下方顯示內容: schedule, info, shop, money

  // 行程資料
  const [days, setDays] = useState([
    { id: 1, date: '12/05', week: '五', location: '桃園機場報導', time: '06:00', type: 'flight', note: '中華航空 CI0130' },
    { id: 2, date: '12/05', week: '五', location: '新千歲機場 (CTS) 抵達', time: '13:15', type: 'flight', note: '記得拿行李' },
    { id: 3, date: '12/06', week: '六', location: '札幌市區觀光', time: '09:00', type: 'spot', note: '大通公園散步' },
  ]);

  // 匯率計算
  const [amount, setAmount] = useState('');
  const [converted, setConverted] = useState(null);
  const rate = 0.215; // 參考截圖中的匯率

  // 購物清單
  const [items, setItems] = useState([
    { id: 1, name: '六花亭 奶油葡萄乾夾心', img: '' },
    { id: 2, name: 'LeTAO 雙層起司蛋糕', img: '' },
  ]);

  // --- 功能函數 ---
  const handleCalculate = (val) => {
    setAmount(val);
    if(val) setConverted(Math.floor(val * rate));
    else setConverted(null);
  };

  const openMap = (loc) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`);
  };

  // --- 畫面渲染 ---
  return (
    <div className="mobile-wrapper">
      
      {/* 1. 頂部 Hero 區塊 (模仿截圖插畫背景) */}
      <div className="hero-section">
        <div className="hero-text-area">
          <input 
            className="hero-title" 
            value={tripTitle} 
            onChange={(e) => setTripTitle(e.target.value)} 
          />
          <input 
            className="hero-subtitle" 
            value={tripDate} 
            onChange={(e) => setTripDate(e.target.value)} 
          />
        </div>

        {/* 懸浮導航按鈕 (依照截圖) */}
        <div className="floating-nav">
          <button className={`nav-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
            🗺️
          </button>
          <button className={`nav-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            ℹ️
          </button>
          <button className={`nav-btn ${activeTab === 'shop' ? 'active' : ''}`} onClick={() => setActiveTab('shop')}>
            🛍️
          </button>
          <button className={`nav-btn ${activeTab === 'money' ? 'active' : ''}`} onClick={() => setActiveTab('money')}>
            🪙
          </button>
        </div>
      </div>

      {/* 2. 下方內容區塊 */}
      <div className="content-area">
        
        {/* A. 行程表模式 */}
        {activeTab === 'schedule' && (
          <div className="fade-in">
            {/* 天氣卡片 */}
            <div className="weather-card">
              <div className="wc-icon">❄️</div>
              <div className="wc-info">
                <div className="wc-temp">0° <small>/-5°</small></div>
                <div className="wc-desc">大雪 / 降雪</div>
              </div>
            </div>

            {/* 行程列表 */}
            {days.map(day => (
              <div key={day.id} className="schedule-card">
                <div className="sc-left">
                  <div className="sc-icon">{day.type === 'flight' ? '🛫' : '📍'}</div>
                  <div className="sc-time">{day.time}</div>
                </div>
                <div className="sc-right">
                  <div className="sc-title">{day.location}</div>
                  <div className="sc-note">{day.note}</div>
                  <button className="sc-map-btn" onClick={() => openMap(day.location)}>
                    導航
                  </button>
                </div>
              </div>
            ))}
            {/* 懸浮新增按鈕 */}
            <button className="fab-add">+</button>
          </div>
        )}

        {/* B. 匯率模式 (依照截圖樣式) */}
        {activeTab === 'money' && (
          <div className="fade-in">
            <div className="exchange-card-blue">
              <h3>🧮 匯率換算</h3>
              <div className="ex-row">
                <div className="ex-col">
                  <label>JPY (日幣)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => handleCalculate(e.target.value)} 
                    placeholder="5000"
                  />
                </div>
                <div className="ex-arrow">⇄</div>
                <div className="ex-col">
                  <label>TWD (台幣)</label>
                  <div className="ex-result">$ {converted || 0}</div>
                </div>
              </div>
              <div className="ex-rate-info">匯率基準: {rate}</div>
            </div>
            
            <div className="section-header">記帳紀錄</div>
            <div className="schedule-card" style={{justifyContent:'center', color:'#888'}}>
              尚無支出紀錄
            </div>
          </div>
        )}

        {/* C. 購物模式 */}
        {activeTab === 'shop' && (
          <div className="fade-in grid-view">
             {items.map(item => (
               <div key={item.id} className="shop-item">
                 <div className="shop-img-placeholder"></div>
                 <div className="shop-name">{item.name}</div>
               </div>
             ))}
             <button className="fab-add" style={{bottom: '90px'}}>+</button>
          </div>
        )}

      </div>
    </div>
  );
}; // <--- 這裡就是之前缺少的結尾分號與括號

export default App;
