// 앱 진입점
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

// root DOM 엘리먼트에 React 앱을 마운트한다
const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('root 엘리먼트를 찾을 수 없습니다');
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
