import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { VideoProvider } from './contexts/VideoContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <VideoProvider>
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
          toastClassName="!bg-surface-container-lowest !text-on-surface !rounded-xl !font-body !shadow-2xl !border !border-outline-variant/20"
        />
      </VideoProvider>
    </AuthProvider>
  </StrictMode>,
)
