import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LfN2lcsAAAAAHfsfpzUIwXJUZe7uLS42TFwQyE8"}
      language="en"
    >
      <App />
    </GoogleReCaptchaProvider>
  </StrictMode>,
)


