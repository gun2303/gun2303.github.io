import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 抓取網頁上的 root 元素
const root = ReactDOM.createRoot(document.getElementById('root'));

// 將 App 元件渲染出來
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
