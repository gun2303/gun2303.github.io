import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // --- 核心資料狀態 (State) ---
  
  // 1. 標題與日期 (可編輯)
  const [tripTitle, setTripTitle] = useState("Hokkaido 2026");
  const [tripDate, setTripDate] = useState("DEC 05 - DEC 09");
  
  // 2. 導航頁籤狀態 (預設顯示行程)
  const [activeTab, setActiveTab] = useState('schedule'); 

  // 3. 行程資料 (動態陣列)
  const [days, setDays] = useState([
    { id: 1, date: '12/05', week: '五', location: '新千歲機場', note: '記得領取 JR Pass' },
    { id: 2, date: '12/06', week: '六', location: '札幌大通公園', note: '參觀聖誕市集' },
    { id: 3, date: '12/07', week: '日', location: '小樽運河', note: '必吃 LeTAO' },
  ]);

  // 4. 記帳資料
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', curr: 'JPY', type: '飲食' });

  // 5. 匯率計算機狀態
  const [calc, setCalc] = useState({ amount: '', result: null });
  const rates = { JPY: 0.215, KRW: 0.024, USD: 31.5, THB: 0.9 }; // 簡單範例匯率 (外幣 -> 台幣)

  // 6. 翻譯設定
  const [trans, setTrans] = useState({ from: 'zh-TW', to: 'ja' });

  // --- 功能邏輯函數 ---

  // 行程：新增/刪除/更新
  const addDay = () => {
    const newId = Date.now();
    setDays([...days, { id: newId, date: 'MM/DD', week: '-', location: '新地點', note: '點擊編輯備註' }]);
  };
  const deleteDay = (id) => setDays(days.filter(d => d.id !== id));
  const updateDay = (id, field, val) => {
    setDays(days.map(d => d.id === id ? { ...d, [field]: val } : d));
  };

  // 工具連結
  const openMap = (loc) => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`, '_blank');
  const openWeather = (loc) => window.open(`https://www.google.com/search?q=${encodeURIComponent(loc + " 天氣")}`, '_blank');
  const openTranslate = () => window.open(`https://translate.google.com/?sl=${trans.from}&tl=${trans.to}&op=translate`, '_blank');

  // 匯率計算
  const handleCalc = (val) => {
    setCalc({ amount: val, result: val ? (parseFloat(val) * rates.JPY).toFixed(0) : null });
  };

  // 記帳
  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.name) return alert("請輸入金額與項目");
    setExpenses([...expenses, { id: Date.now(), ...newExpense }]);
    setNewExpense({ ...newExpense, name: '', amount: '' });
  };
  const deleteExpense = (id) => setExpenses(expenses.filter(e => e.id !== id));

  // --- 畫面渲染 (Render) ---
  return (
    <div className="mobile-wrapper">
      
      {/* 頂部 Hero 區塊 (可編輯標題) */}
      <div className="hero-section">
        <div className="hero-overlay">
          <input className="hero-title" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} />
          <input className="hero-subtitle" value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
        </div>

        {/* 懸浮導航球 (Tab 切換) */}
        <div className="floating-nav">
          <button className={`nav-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>🗺️</button>
          <button className={`nav-btn ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}>🛠️</button>
          <button className={`nav-btn ${activeTab === 'money' ? 'active' : ''}`} onClick={() => setActiveTab('money')}>💰</button>
        </div>
      </div>

      <div className="content-area">

        {/* --- 1. 行程表 Tab --- */}
        {activeTab === 'schedule' && (
          <div className="fade-in">
            {days.map((day, index) => (
              <div key={day.id} className="card schedule-card">
                <div className="card-header">
                  <div className="date-badge">
                    <input className="input-date" value={day.date} onChange={(e) => updateDay(day.id, 'date', e.target.value)} />
                    <span className="week-label">{`D${index+1}`}</span>
                  </div>
                  <button className="btn-delete-sm" onClick={() => deleteDay(day.id)}>×</button>
                </div>
                
                <div className="card-body">
                  <input 
                    className="input-location" 
                    value={day.location} 
                    onChange={(e) => updateDay(day.id, 'location', e.target.value)} 
                    placeholder="輸入地點..."
                  />
                  <input 
                    className="input-note" 
                    value={day.note} 
                    onChange={(e) => updateDay(day.id, 'note', e.target.value)} 
                    placeholder="備註..."
                  />
                </div>

                <div className="card-actions">
                  <button className="btn-action blue" onClick={() => openMap(day.location)}>📍 導航</button>
                  <button className="btn-action yellow" onClick={() => openWeather(day.location)}>⛅ 天氣</button>
                </div>
              </div>
            ))}
            <button className="fab-add" onClick={addDay}>+</button>
            <div style={{height:'60px'}}></div> {/* 墊高底部防遮擋 */}
          </div>
        )}

        {/* --- 2. 工具 Tab (翻譯) --- */}
        {activeTab === 'tools' && (
          <div className="fade-in">
            <div className="card tool-card">
              <h3>🗣️ 多國語言翻譯</h3>
              <div className="trans-row">
                <select value={trans.from} onChange={e=>setTrans({...trans, from:e.target.value})}>
                  <option value="zh-TW">中文</option><option value="en">英文</option><option value="ja">日文</option>
                </select>
                <span>⮕</span>
                <select value={trans.to} onChange={e=>setTrans({...trans, to:e.target.value})}>
                  <option value="ja">日文</option><option value="en">英文</option><option value="zh-TW">中文</option><option value="ko">韓文</option>
                </select>
              </div>
              <button className="btn-full blue" onClick={openTranslate}>開啟 Google 翻譯</button>
            </div>
            
            <div className="card tool-card">
              <h3>☁️ 實用連結</h3>
              <p style={{color:'#666', fontSize:'14px'}}>整合地圖、天氣與匯率查詢。</p>
            </div>
          </div>
        )}

        {/* --- 3. 記帳與匯率 Tab --- */}
        {activeTab === 'money' && (
          <div className="fade-in">
            {/* 匯率計算機 (深藍色卡片) */}
            <div className="exchange-card">
              <h3>🧮 匯率換算 (JPY to TWD)</h3>
              <div className="ex-row">
                <input type="number" placeholder="日幣金額" value={calc.amount} onChange={(e)=>handleCalc(e.target.value)} />
                <span className="arrow">⇄</span>
                <div className="ex-result">$ {calc.result || 0}</div>
              </div>
              <small style={{opacity:0.7, marginTop:'10px', display:'block'}}>匯率基準: 0.215</small>
            </div>

            {/* 新增支出表單 */}
            <div className="card expense-form">
              <h3>📝 新增支出</h3>
              <div className="form-group">
                <input placeholder="項目 (如: 拉麵)" value={newExpense.name} onChange={e=>setNewExpense({...newExpense, name:e.target.value})} />
                <select value={newExpense.type} onChange={e=>setNewExpense({...newExpense, type:e.target.value})}>
                  <option>飲食</option><option>交通</option><option>購物</option><option>住宿</option>
                </select>
              </div>
              <div className="form-group">
                 <input type="number" placeholder="金額" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount:e.target.value})} />
                 <select value={newExpense.curr} onChange={e=>setNewExpense({...newExpense, curr:e.target.value})}>
                   <option value="JPY">JPY</option><option value="TWD">TWD</option><option value="USD">USD</option>
                 </select>
              </div>
              <button className="btn-full dark" onClick={handleAddExpense}>加入帳本</button>
            </div>

            {/* 支出列表 */}
            <div className="expense-list">
              {expenses.map(exp => (
                <div key={exp.id} className="expense-item">
                  <div className="exp-left">
                    <span className="exp-tag">{exp.type}</span>
                    <span className="exp-name">{exp.name}</span>
                  </div>
                  <div className="exp-right">
                    <span className="exp-amount">{exp.amount} <small>{exp.curr}</small></span>
                    <button className="btn-del-text" onClick={()=>deleteExpense(exp.id)}>刪除</button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && <p style={{textAlign:'center', color:'#aaa'}}>目前沒有支出紀錄</p>}
            </div>
            <div style={{height:'60px'}}></div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
