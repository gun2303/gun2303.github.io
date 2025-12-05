import React, { useState, useEffect } from 'react';
import './App.css'; // 假設你有基本的 CSS，若無可使用下方的簡易樣式

const App = () => {
  // --- 1. 核心資料與狀態設定 ---
  
  // 標題與總日期區間 (可編輯)
  const [tripTitle, setTripTitle] = useState("東京冬旅 Tokyo");
  const [tripDateRange, setTripDateRange] = useState("DEC 05 - DEC 09, 2025");

  // 行程天數 (預設資料，可增刪)
  const [days, setDays] = useState([
    { id: 1, dateLabel: '12/05', dayLabel: 'D1' },
    { id: 2, dateLabel: '12/06', dayLabel: 'D2' },
    { id: 3, dateLabel: '12/07', dayLabel: 'D3' },
    { id: 4, dateLabel: '12/08', dayLabel: 'D4' },
    { id: 5, dateLabel: '12/09', dayLabel: 'D5' },
  ]);

  // 支出列表
  const [expenses, setExpenses] = useState([]);

  // 新增支出的表單狀態
  const [newExpense, setNewExpense] = useState({
    dateId: '', 
    category: '住宿',
    amount: '',
    currency: 'JPY',
    note: ''
  });

  // 匯率換算器狀態
  const [converter, setConverter] = useState({
    amount: '',
    from: 'TWD',
    to: 'JPY',
    result: null
  });

  // 參考匯率 (以 TWD 為基準: 1 TWD = ?)
  const rates = {
    TWD: 1,
    USD: 0.031,
    KRW: 42.5,
    JPY: 4.65,
    THB: 1.12,
    VND: 760,
    INR: 2.6
  };

  // --- 2. 功能邏輯函數 ---

  // 新增天數
  const addDay = () => {
    const newDate = prompt("請輸入日期 (例如: 12/10)");
    if (newDate) {
      const newId = days.length > 0 ? days[days.length - 1].id + 1 : 1;
      const newDayLabel = `D${days.length + 1}`;
      setDays([...days, { id: newId, dateLabel: newDate, dayLabel: newDayLabel }]);
    }
  };

  // 刪除天數
  const deleteDay = (id) => {
    if (window.confirm("確定刪除這天行程嗎？")) {
      setDays(days.filter(day => day.id !== id));
    }
  };

  // 處理匯率換算
  const handleConvert = () => {
    const amount = parseFloat(converter.amount);
    if (isNaN(amount)) return;
    
    // 邏輯: 先轉回 TWD，再轉目標幣別
    const baseTwd = amount / rates[converter.from];
    const finalVal = baseTwd * rates[converter.to];
    setConverter({ ...converter, result: finalVal.toFixed(2) });
  };

  // 新增支出
  const handleAddExpense = () => {
    if (!newExpense.dateId || !newExpense.amount) {
      alert("請選擇日期並輸入金額");
      return;
    }

    // 找到對應日期的文字顯示
    const selectedDay = days.find(d => d.id.toString() === newExpense.dateId);
    const dateStr = selectedDay ? `${selectedDay.dateLabel} (${selectedDay.dayLabel})` : '未知日期';

    const item = {
      id: Date.now(),
      dateStr: dateStr,
      ...newExpense
    };

    setExpenses([...expenses, item]);
    // 重置表單，保留部分預設值方便連續輸入
    setNewExpense({ ...newExpense, amount: '', note: '' });
  };

  // 刪除支出
  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // --- 3. 畫面渲染 (JSX) ---
  return (
    <div className="app-container">
      
      {/* 標題區塊 (可編輯 input) */}
      <header className="header-section">
        <input 
          className="editable-title"
          value={tripTitle} 
          onChange={(e) => setTripTitle(e.target.value)} 
        />
        <input 
          className="editable-date"
          value={tripDateRange} 
          onChange={(e) => setTripDateRange(e.target.value)} 
        />
      </header>

      {/* 行程日期管理 */}
      <section className="card">
        <h3>行程日期</h3>
        <div className="days-grid">
          {days.map((day) => (
            <div key={day.id} className="day-tag">
              <span>{day.dateLabel} <small>{day.dayLabel}</small></span>
              <button onClick={() => deleteDay(day.id)} className="x-btn">×</button>
            </div>
          ))}
          <button onClick={addDay} className="add-btn">+ 新增日期</button>
        </div>
      </section>

      {/* 匯率換算器 */}
      <section className="card converter-card">
        <h3>匯率換算</h3>
        <div className="converter-inputs">
          <input 
            type="number" 
            placeholder="金額" 
            value={converter.amount}
            onChange={(e) => setConverter({...converter, amount: e.target.value})}
          />
          <select value={converter.from} onChange={(e) => setConverter({...converter, from: e.target.value})}>
            {Object.keys(rates).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span>⮕</span>
          <select value={converter.to} onChange={(e) => setConverter({...converter, to: e.target.value})}>
            {Object.keys(rates).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={handleConvert}>計算</button>
        </div>
        {converter.result && (
          <div className="converter-result">
            約為: {converter.result} {converter.to}
          </div>
        )}
      </section>

      {/* 新增支出區塊 */}
      <section className="card">
        <h3>新增支出</h3>
        <div className="expense-form">
          <div className="form-row">
            <select 
              value={newExpense.dateId} 
              onChange={(e) => setNewExpense({...newExpense, dateId: e.target.value})}
            >
              <option value="">選擇日期</option>
              {days.map(day => (
                <option key={day.id} value={day.id}>{day.dateLabel} ({day.dayLabel})</option>
              ))}
            </select>
            
            <select 
              value={newExpense.category} 
              onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
            >
              <option value="住宿">住宿</option>
              <option value="交通">交通</option>
              <option value="雜項">雜項</option>
              <option value="飲食">飲食</option>
              <option value="購物">購物</option>
            </select>
          </div>

          <div className="form-row">
            <input 
              type="number" 
              placeholder="金額" 
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
            />
            <select 
              value={newExpense.currency} 
              onChange={(e) => setNewExpense({...newExpense, currency: e.target.value})}
            >
              {Object.keys(rates).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <input 
            type="text" 
            placeholder="備註 (選填)" 
            value={newExpense.note}
            onChange={(e) => setNewExpense({...newExpense, note: e.target.value})}
            className="full-width-input"
          />
          
          <button onClick={handleAddExpense} className="save-btn">記錄支出</button>
        </div>
      </section>

      {/* 支出明細列表 */}
      <section className="card">
        <h3>支出明細</h3>
        <div className="expense-list">
          {expenses.length === 0 ? <p style={{color:'#888'}}>尚無支出紀錄</p> : null}
          {expenses.map((exp) => (
            <div key={exp.id} className="expense-item">
              <div className="exp-left">
                <div className="exp-date-cat">
                  <span className="badge">{exp.category}</span> {exp.dateStr}
                </div>
                <div className="exp-note">{exp.note}</div>
              </div>
              <div className="exp-right">
                <div className="exp-amount">{exp.amount} <small>{exp.currency}</small></div>
                <button onClick={() => deleteExpense(exp.id)} className="del-text-btn">刪除</button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default App;
