import React from 'react';

// 這裡定義樣式物件，確保程式碼整潔且不會遺失 CSS 檔
const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
    padding: '20px',
  },
  header: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  grid: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    width: '250px',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '10px',
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: 0,
  },
  listContainer: {
    marginTop: '30px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  listItem: {
    borderBottom: '1px solid #eee',
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'space-between',
  }
};

function App() {
  // 模擬一些假資料
  const trips = [
    { id: 1, destination: '日本東京', date: '2023-11-20', status: '已規劃' },
    { id: 2, destination: '韓國首爾', date: '2024-01-15', status: '預訂中' },
    { id: 3, destination: '泰國曼谷', date: '2024-03-10', status: '計畫中' },
  ];

  return (
    <div style={styles.container}>
      {/* 標題區域 */}
      <header style={styles.header}>
        <h1 style={styles.title}>✈️ Travel Dash 儀表板</h1>
        <p>歡迎回來，準備好你的下一次冒險了嗎？</p>
      </header>

      {/* 統計卡片區域 */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>即將到來的行程</div>
          <p style={styles.cardValue}>3 個</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>年度旅遊預算</div>
          <p style={styles.cardValue}>$50,000</p>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>已拜訪國家</div>
          <p style={styles.cardValue}>12 國</p>
        </div>
      </div>

      {/* 行程列表區域 */}
      <div style={styles.listContainer}>
        <h3>📅 近期行程規劃</h3>
        <div>
          {trips.map((trip) => (
            <div key={trip.id} style={styles.listItem}>
              <span style={{fontWeight: 'bold'}}>{trip.destination}</span>
              <span>{trip.date}</span>
              <span style={{color: '#666'}}>({trip.status})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
