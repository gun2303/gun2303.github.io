import React, { useState } from 'react';
import './App.css';

const App = () => {
  // --- 資料狀態 ---
  const [tripTitle, setTripTitle] = useState("Hokkaido 2026");
  const [tripDateRange, setTripDateRange] = useState("DEC 05 - DEC 09");
  
  // 模擬導覽按鈕狀態 (目前僅做視覺切換)
  const [activeTab, setActiveTab] = useState('itinerary'); 

  const [days, setDays] = useState([
    { id: 1, dateLabel: '12/05', dayLabel: 'D1', location: '新千歲機場', weather: 'snow' },
    { id: 2, dateLabel: '12/06', dayLabel: 'D2', location: '札幌市區', weather: 'cloud' },
    { id: 3, dateLabel: '12/07', dayLabel: 'D3', location: '小樽運河', weather: 'sun' },
  ]);

  const [expenses, setExpenses] = useState([]);
  const [converter, setConverter] = useState({ amount: '', from: 'JPY', to: 'TWD', result: null });

  // 匯率
  const rates = { TWD: 1, JPY: 4.65, USD: 0.031, KRW: 42.5 };

  // --- 功能函數 ---
  const handleConvert = () => {
    const val = parseFloat(converter.amount);
    if (isNaN(val)) return;
    const res = (val / rates[converter.from]) * rates[converter.to]; // 簡易換算邏輯需視實際匯率方向調整
    setConverter({ ...converter, result: res.toFixed(0) });
  };

  const addExpense = (e) => {
    e.preventDefault();
    const amt = e.target.amount.value;
    const note = e.target.note.value;
    if(!amt) return;
    setExpenses([...expenses, { id: Date.now(), amount: amt, note: note }]);
    e.target.reset();
  };

  // --- 畫面渲染 ---
  return (
    <div className="mobile-container">
      
      {/* 1. 頂部插畫區 (模仿截圖的 Header) */}
      <div className="hero-header">
        <div className="hero-content">
          <input 
            className="hero-title" 
            value={tripTitle} 
            onChange={(e) => setTripTitle(e.target.value)} 
          />
          <input 
            className="hero-date" 
            value={tripDateRange} 
            onChange={(e) => setTripDateRange(e.target.value)} 
          />
        </div>
        
        {/* 懸浮功能球 (模仿截圖中的圓形按鈕) */}
        <div className="floating-nav">
          <button className={`nav-circle ${activeTab==='itinerary'?'active':''}`} onClick={()=>setActiveTab('itinerary')}>
            🗺️
          </button>
          <button className={`nav-circle ${activeTab==='info'?'active':''}`} onClick={()=>setActiveTab('info')}>
            ℹ️
          </button>
          <button className={`nav-circle ${activeTab==='shop'?'active':''}`} onClick={()=>setActiveTab('shop')}>
            🛍️
          </button>
          <button className={`nav-circle ${activeTab==='money'?'active':''}`} onClick={()=>setActiveTab('money')}>
            🪙
          </button>
        </div>
      </div>

      <div className="main-content">
        
        {/* 內容 A: 行程表 (模仿截圖3) */}
        {activeTab === 'itinerary' && (
          <div className="fade-in">
            {/* 模擬日期 Tabs */}
            <div className="date-tabs-scroll">
              {days.map(d => (
                <div key={d.id} className="date-tab">
                  <span className="dt-day">{d.dayLabel}</span>
                  <span className="dt-date">{d.dateLabel}</span>
                </div>
              ))}
              <div className="date-tab add-new">+</div>
            </div>

            {/* 天氣卡片 */}
            <div className="weather-card">
              <div className="wc-icon">❄️</div>
              <div className="wc-info">
                <div className="wc-temp">0° <span className="wc-sub">/-5°</span></div>
                <div className="wc-desc">大雪 / 降雪</div>
              </div>
            </div>

            {/* 行程列表 */}
            <div className="timeline-list">
              {days.map((day, idx) => (
                <div key={day.id} className="timeline-item">
                  <div className="tl-icon">✈️</div>
                  <div className="tl-content card-white">
                    <div className="tl-time">08:00 - 10:00</div>
                    <div className="tl-title">{day.location}</div>
                    <div className="tl-desc">備註：記得帶護照</div>
                    <div className="tl-actions">
                      <button className="sm-btn">📍 導航</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 懸浮新增按鈕 */}
            <button className="fab-btn">+</button>
          </div>
        )}

        {/* 內容 B: 匯率換算 (模仿截圖4) */}
        {activeTab === 'money' && (
          <div className="fade-in">
            <div className="currency-card-blue">
              <div className="cc-title">🧮 匯率換算</div>
              <div className="cc-row">
                <div className="cc-input-group">
                  <label>JPY (日幣)</label>
                  <input 
                    type="number" 
                    value={converter.amount}
                    onChange={(e)=>setConverter({...converter, amount: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                <div className="cc-arrow">⇄</div>
                <div className="cc-input-group">
                  <label>TWD (台幣)</label>
                  <div className="cc-result-box">
                     $ {converter.result || 0}
                  </div>
                </div>
              </div>
              <button className="cc-calc-btn" onClick={handleConvert}>換算</button>
            </div>

            <div className="section-title">記帳明細</div>
            <form className="card-white form-card" onSubmit={addExpense}>
               <input name="amount" type="number" placeholder="金額 (JPY)" className="minimal-input" />
               <input name="note" type="text" placeholder="消費項目 (例如: 白色戀人)" className="minimal-input" />
               <button type="submit" className="blue-block-btn">新增支出</button>
            </form>

            <div className="expense-list">
              {expenses.map(exp => (
                <div key={exp.id} className="expense-row">
                  <span>{exp.note}</span>
                  <strong>¥{exp.amount}</strong>
                </div>
              ))}import React, { useState } from 'react';
import './App.css';

const App = () => {
  // --- 資料狀態 ---
  const [tripTitle, setTripTitle] = useState("Hokkaido 2026");
  const [tripDateRange, setTripDateRange] = useState("DEC 05 - DEC 09");
  
  // 模擬導覽按鈕狀態 (目前僅做視覺切換)
  const [activeTab, setActiveTab] = useState('itinerary'); 

  const [days, setDays] = useState([
    { id: 1, dateLabel: '12/05', dayLabel: 'D1', location: '新千歲機場', weather: 'snow' },
    { id: 2, dateLabel: '12/06', dayLabel: 'D2', location: '札幌市區', weather: 'cloud' },
    { id: 3, dateLabel: '12/07', dayLabel: 'D3', location: '小樽運河', weather: 'sun' },
  ]);

  const [expenses, setExpenses] = useState([]);
  const [converter, setConverter] = useState({ amount: '', from: 'JPY', to: 'TWD', result: null });

  // 匯率
  const rates = { TWD: 1, JPY: 4.65, USD: 0.031, KRW: 42.5 };

  // --- 功能函數 ---
  const handleConvert = () => {
    const val = parseFloat(converter.amount);
    if (isNaN(val)) return;
    const res = (val / rates[converter.from]) * rates[converter.to]; // 簡易換算邏輯需視實際匯率方向調整
    setConverter({ ...converter, result: res.toFixed(0) });
  };

  const addExpense = (e) => {
    e.preventDefault();
    const amt = e.target.amount.value;
    const note = e.target.note.value;
    if(!amt) return;
    setExpenses([...expenses, { id: Date.now(), amount: amt, note: note }]);
    e.target.reset();
  };

  // --- 畫面渲染 ---
  return (
    <div className="mobile-container">
      
      {/* 1. 頂部插畫區 (模仿截圖的 Header) */}
      <div className="hero-header">
        <div className="hero-content">
          <input 
            className="hero-title" 
            value={tripTitle} 
            onChange={(e) => setTripTitle(e.target.value)} 
          />
          <input 
            className="hero-date" 
            value={tripDateRange} 
            onChange={(e) => setTripDateRange(e.target.value)} 
          />
        </div>
        
        {/* 懸浮功能球 (模仿截圖中的圓形按鈕) */}
        <div className="floating-nav">
          <button className={`nav-circle ${activeTab==='itinerary'?'active':''}`} onClick={()=>setActiveTab('itinerary')}>
            🗺️
          </button>
          <button className={`nav-circle ${activeTab==='info'?'active':''}`} onClick={()=>setActiveTab('info')}>
            ℹ️
          </button>
          <button className={`nav-circle ${activeTab==='shop'?'active':''}`} onClick={()=>setActiveTab('shop')}>
            🛍️
          </button>
          <button className={`nav-circle ${activeTab==='money'?'active':''}`} onClick={()=>setActiveTab('money')}>
            🪙
          </button>
        </div>
      </div>

      <div className="main-content">
        
        {/* 內容 A: 行程表 (模仿截圖3) */}
        {activeTab === 'itinerary' && (
          <div className="fade-in">
            {/* 模擬日期 Tabs */}
            <div className="date-tabs-scroll">
              {days.map(d => (
                <div key={d.id} className="date-tab">
                  <span className="dt-day">{d.dayLabel}</span>
                  <span className="dt-date">{d.dateLabel}</span>
                </div>
              ))}
              <div className="date-tab add-new">+</div>
            </div>

            {/* 天氣卡片 */}
            <div className="weather-card">
              <div className="wc-icon">❄️</div>
              <div className="wc-info">
                <div className="wc-temp">0° <span className="wc-sub">/-5°</span></div>
                <div className="wc-desc">大雪 / 降雪</div>
              </div>
            </div>

            {/* 行程列表 */}
            <div className="timeline-list">
              {days.map((day, idx) => (
                <div key={day.id} className="timeline-item">
                  <div className="tl-icon">✈️</div>
                  <div className="tl-content card-white">
                    <div className="tl-time">08:00 - 10:00</div>
                    <div className="tl-title">{day.location}</div>
                    <div className="tl-desc">備註：記得帶護照</div>
                    <div className="tl-actions">
                      <button className="sm-btn">📍 導航</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 懸浮新增按鈕 */}
            <button className="fab-btn">+</button>
          </div>
        )}

        {/* 內容 B: 匯率換算 (模仿截圖4) */}
        {activeTab === 'money' && (
          <div className="fade-in">
            <div className="currency-card-blue">
              <div className="cc-title">🧮 匯率換算</div>
              <div className="cc-row">
                <div className="cc-input-group">
                  <label>JPY (日幣)</label>
                  <input 
                    type="number" 
                    value={converter.amount}
                    onChange={(e)=>setConverter({...converter, amount: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                <div className="cc-arrow">⇄</div>
                <div className="cc-input-group">
                  <label>TWD (台幣)</label>
                  <div className="cc-result-box">
                     $ {converter.result || 0}
                  </div>
                </div>
              </div>
              <button className="cc-calc-btn" onClick={handleConvert}>換算</button>
            </div>

            <div className="section-title">記帳明細</div>
            <form className="card-white form-card" onSubmit={addExpense}>
               <input name="amount" type="number" placeholder="金額 (JPY)" className="minimal-input" />
               <input name="note" type="text" placeholder="消費項目 (例如: 白色戀人)" className="minimal-input" />
               <button type="submit" className="blue-block-btn">新增支出</button>
            </form>

            <div className="expense-list">
              {expenses.map(exp => (
                <div key={exp.id} className="expense-row">
                  <span>{exp.note}</span>
                  <strong>¥{exp.amount}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

         {/* 內容 C: 購物清單 (模仿截圖5 - Modal樣式) */}
         {activeTab === 'shop' && (
          <div className="fade-in">
             <div className="card-white" style={{padding: '30px 20px', textAlign:'center'}}>
                <h3>新增購物清單</h3>
                <input type="text" placeholder="商品名稱" className="minimal-input" style={{background:'#F7F9FC'}}/>
                <div className="photo-upload-placeholder">
                  📷 上傳照片
                </div>
                <div className="modal-actions">
                  <button className="grey-btn">取消</button>
                  <button className="blue-btn">新增</button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
            </div>
          </div>
        )}

         {/* 內容 C: 購物清單 (模仿截圖5 - Modal樣式) */}
         {activeTab === 'shop' && (
          <div className="fade-in">
             <div className="card-white" style={{padding: '30px 20px', textAlign:'center'}}>
                <h3>新增購物清單</h3>
                <input type="text" placeholder="商品名稱" className="minimal-input" style={{background:'#F7F9FC'}}/>
                <div className="photo-upload-placeholder">
                  📷 上傳照片
                </div>
                <div className="modal-actions">
                  <button className="grey-btn">取消</button>
                  <button className="blue-btn">新增</button>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
