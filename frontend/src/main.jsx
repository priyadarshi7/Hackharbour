import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom"
import {Auth0Provider} from "@auth0/auth0-react"
import StoreContextProvider from './Context/StoreContext.jsx'

createRoot(document.getElementById('root')).render(
<StoreContextProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  </StoreContextProvider>
)
