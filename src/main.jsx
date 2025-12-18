import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {HeroUIProvider} from "@heroui/react";

// Import context providers for global state management
import { AuthContextProvider } from './Contexts/AuthContext.jsx';
import { ThemeContextProvider } from './Contexts/ThemeContext.jsx';

import '@fortawesome/fontawesome-free/css/all.min.css';

// Create and render the React application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HeroUIProvider>
      <ThemeContextProvider>
        <AuthContextProvider >
          <App />
        </AuthContextProvider>
      </ThemeContextProvider>
    </HeroUIProvider>
  </StrictMode>,
)
