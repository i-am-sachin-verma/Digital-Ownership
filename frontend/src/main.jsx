import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Polyfills for Web3 libraries in Vite environment
if (typeof window !== 'undefined') {
  window.global = window;
  window.process = window.process || { env: {} };
}

import { WalletProvider } from './context/WalletContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </StrictMode>,
)

