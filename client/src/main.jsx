import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";
import {EarthquakeAlertProvider} from "./context/EarthquakeAlertContext.jsx";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Make SweetAlert2 available globally
window.Swal = Swal;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
        <AuthProvider>
          <EarthquakeAlertProvider>
            <App />
          </EarthquakeAlertProvider>
        </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
