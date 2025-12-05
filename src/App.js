import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  // --- 1. 全域設定與狀態 ---
  const [tripTitle, setTripTitle] = useState("東京冬旅 Tokyo");
  const [tripDateRange, setTripDateRange] = useState("DEC 05 - DEC 09, 2025");

  // 行程資料 (包含地點，用於導航)
  const [days, setDays] = useState([
    { id: 1, dateLabel: '12/05', dayLabel: 'D1', location: '成田機場' },
    { id: 2, dateLabel: '12/06', dayLabel: 'D2', location: '淺草寺' },
    { id: 3, dateLabel: '12/07', dayLabel: 'D3', location: '東京迪士尼' },
    { id: 4, dateLabel: '12/08', dayLabel: 'D4', location: '澀谷 Sky' },
    { id: 5, dateLabel: '12/09', dayLabel: 'D5', location: '上野公園' },
  ]);

  // 支出列表
  const [expenses, setExpenses] = useState([]);
  
  // 翻譯設定
  const [transLang, setTransLang] = useState({ from: 'zh-TW', to: 'ja' });

  // 匯率換算器
  const [converter, setConverter] = useState({ amount: '', from: 'TWD', to: 'JPY', result: null });

  // 參考匯率
  const rates = { TWD: 1, USD: 0.031, KRW: 42.5, JPY: 4.65, THB: 1.12, VND: 760, INR: 2.6 };

  // --- 2. 功能函數 ---

  // 開啟 Google Maps 導航
  const openMap = (location) => {
    if (!location) return alert("請先輸入地點名稱");
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  // 開啟天氣查詢 (搜尋該地天氣)
  const openWeather = (location) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(location + " 天氣")}`;
    window.open(url, '_blank');
  };

  // 開啟 Google 翻譯
  const openTranslate = () => {
    const url = `https://translate.google.com/?sl=${transLang.from}&tl=${transLang.to}&op=translate`;
    window.open(url, '_blank');
  };

  // 行程管理
  const addDay = () => {
    const newDate = prompt("輸入日期 (例如: 12/10):");
    if (newDate) {
      const newId = Date.now();
      setDays([...days, { id: newId, dateLabel: newDate, dayLabel: `D${days.length + 1}`, location: '新地點' }]);
    }
  };

  const updateLocation = (id, newLoc) => {
    setDays(days.map(d => d.id === id ? { ...d, location: newLoc } : d));
  };

  const deleteDay = (id) => {
    if (window.confirm("確定刪除此行程卡片？")) setDays(days.filter(d => d.id !== id));
  };

  // 記帳與匯率
  const handleConvert = () => {
    const val = parseFloat(converter.amount);
    if (isNaN(val)) return;
    const res = (val / rates[converter.from]) * rates[converter.to];
    setConverter({ ...converter, result: res.toFixed(2) });
  };

  const [newExpense, setNewExpense] = useState({ dateId: '', category: '飲食', amount: '', currency: 'JPY', note: '' });

  const addExpense = () => {
    if (!newExpense.dateId || !newExpense.amount) return alert("請填寫完整資訊");
    const dayObj = days.find(d => d.id.toString() === newExpense.dateId);
    setExpenses([...expenses, { 
      id: Date.now(), 
      dateStr: dayObj ? dayObj.dateLabel : '未知', 
      ...newExpense 
    }]);
    setNewExpense({ ...newExpense, amount: '', note: '' });
  };

  // --- 3. 畫面渲染 ---
  return (
    <div className="app-container">
      
      {/* 頂部標題與翻譯工具 */}
      <header className="header-section">
        <input className="editable-title" value={tripTitle} onChange={(e) => setTripTitle(e.target.value)} />
        <input className="editable-date" value={tripDateRange} onChange={(e) => setTripDateRange(e.target.value)} />
        
        <div className="tool-bar">
          <div className="trans-box">
            <span>翻譯：</span>
            <select value={transLang.from} onChange={e=>setTransLang({...transLang, from:e.target.value})}>
              <option value="zh-TW">中文</option><option value="en">英文</option>
              <option value="ko">韓文</option><option value="ja">日文</option>
              <option value="th">泰文</option><option value="vi">越文</option>
            </select>
            <span>⮕</span>
            <select value={transLang.to} onChange={e=>setTransLang({...transLang, to:e.target.value})}>
              <option value="ja">日文</option><option value="zh-TW">中文</option>
              <option value="en">英文</option><option value="ko">韓文</option>
              <option value="th">泰文</option><option value="vi">越文</option>
            </select>
            <button onClick={openTranslate} className="tool-btn">Go</button>
          </div>
        </div>
      </header>

      {/* 匯率換算 */}
      <section className="card">
        <h3>💱 即時匯率換算</h3>
        <div className="converter-inputs">
          <input type="number" placeholder="金額" value={converter.amount} onChange={e=>setConverter({...converter, amount:e.target.value})} />
          <select value={converter.from} onChange={e=>setConverter({...converter, from:e.target.value})}>{Object.keys(rates).map(r=><option key={r} value={r}>{r}</option>)}</select>
          <span>⮕</span>
          <select value={converter.to} onChange={e=>setConverter({...converter, to:e.target.value})}>{Object.keys(rates).map(r=><option key={r} value={r}>{r}</option>)}</select>
          <button onClick={handleConvert} className="tool-btn">計算</button>
        </div>
        {converter.result && <div className="converter-result">≈ {converter.result} {converter.to}</div>}
      </section>

      {/* 行程卡片 (含導航與天氣) */}
      <section className="card">
        <h3>📅 行程導航與規劃</h3>
        <div className="days-list">
          {days.map(day => (
            <div key={day.id} className="day-card">
              <div className="day-header">
                <strong>{day.dateLabel}</strong> <span className="tag">{day.dayLabel}</span>
                <button onClick={() => deleteDay(day.id)} className="x-btn">×</button>
              </div>
              <div className="day-body">
                <input 
                  className="location-input" 
                  value={day.location} 
                  onChange={(e) => updateLocation(day.id, e.target.value)}
                  placeholder="輸入地點..."
                />
                <div className="day-actions">
                  <button onClick={() => openMap(day.location)} className="action-btn map-btn">📍 導航</button>
                  <button onClick={() => openWeather(day.location)} className="action-btn weather-btn">⛅ 天氣</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={addDay} className="add-btn">+ 新增行程卡片</button>
        </div>
      </section>

      {/* 記帳功能 */}
      <section className="card">
        <h3>💰 新增支出</h3>
        <div className="expense-form">
          <div className="form-row">
            <select value={newExpense.dateId} onChange={e=>setNewExpense({...newExpense, dateId:e.target.value})}>
              <option value="">選擇行程日期</option>
              {days.map(d=><option key={d.id} value={d.id}>{d.dateLabel}</option>)}
            </select>
            <select value={newExpense.category} onChange={e=>setNewExpense({...newExpense, category:e.target.value})}>
              <option>住宿</option><option>交通</option><option>飲食</option><option>購物</option><option>雜項</option>
            </select>
          </div>
          <div className="form-row">
            <input type="number" placeholder="金額" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount:e.target.value})} />
            <select value={newExpense.currency} onChange={e=>setNewExpense({...newExpense, currency:e.target.value})}>
               {Object.keys(rates).map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <input type="text" placeholder="備註..." value={newExpense.note} onChange={e=>setNewExpense({...newExpense, note:e.target.value})} className="full-width-input"/>
          <button onClick={addExpense} className="save-btn">儲存支出</button>
        </div>
      </section>

      {/* 支出明細 */}
      <section className="card">
        <h3>📝 支出列表</h3>
        {expenses.map(exp => (
          <div key={exp.id} className="expense-item">
            <div>
              <span className="badge">{exp.category}</span> 
              <strong>{exp.dateStr}</strong> 
              <span className="exp-note"> - {exp.note}</span>
            </div>
            <div>
              <strong>{exp.amount} {exp.currency}</strong>
              <button onClick={() => setExpenses(expenses.filter(e=>e.id!==exp.id))} className="del-text-btn">刪除</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default App;
