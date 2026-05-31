import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { applyTheme } from './utils/theme.js'
import { initVoices } from './utils/voice.js'
import App from './App.jsx'

applyTheme()
initVoices()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
