import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ThemeProvider } from 'next-themes'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/context/AuthContext'
import { MT5Provider } from '@/context/MT5Context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="tradelens-theme">
        <AuthProvider>
          <MT5Provider>
            <App />
          </MT5Provider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
