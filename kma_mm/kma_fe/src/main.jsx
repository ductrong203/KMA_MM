import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@fontsource/roboto'; // Import Roboto font

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <App />
)
