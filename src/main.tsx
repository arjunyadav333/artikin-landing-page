import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx: Starting app...');
console.log('main.tsx: React available?', typeof React !== 'undefined' ? 'Yes' : 'No');

createRoot(document.getElementById("root")!).render(<App />);
