import React from 'react';
// 如果你的專案中有 App.css，請保留這行；如果沒有，請刪除這行
import './App.css'; 

function App() {
  return (
    <div className="App">
      <header style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Travel Dash</h1>
        <p>系統建置成功，目前頁面運作正常。</p>
      </header>
      
      <main style={{ padding: '20px' }}>
        {/* 之後可以在這裡加入你的旅行儀表板組件 */}
        <p>在這裡開始構建你的功能...</p>
      </main>
    </div>
  );
}

export default App;
