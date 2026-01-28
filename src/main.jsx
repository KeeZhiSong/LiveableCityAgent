import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AgentContextProvider } from './contexts/AgentContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AgentContextProvider>
      <App />
    </AgentContextProvider>
  </StrictMode>,
)
