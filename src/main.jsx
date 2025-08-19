// Import React core libraries
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Import global CSS styles
import './index.css'

// Import the main App component
import App from './App.jsx'

// Import HeroUI provider for UI components
import {HeroUIProvider} from "@heroui/react";

// Import context providers for global state management
import { AuthContextProvider } from './Contexts/AuthContext.jsx';
import { ThemeContextProvider } from './Contexts/ThemeContext.jsx';

// Import FontAwesome icons CSS
import '@fortawesome/fontawesome-free/css/all.min.css';

// Create and render the React application
// The component hierarchy provides context and providers to the entire app
createRoot(document.getElementById('root')).render(
  // StrictMode helps identify potential problems in development
  <StrictMode>
    {/* HeroUI provider for UI component library */}
    <HeroUIProvider>
      {/* Theme context provider for dynamic theming and color management */}
      <ThemeContextProvider>
        {/* Auth context provider for authentication state management */}
        <AuthContextProvider >
          {/* Main App component */}
          <App />
        </AuthContextProvider>
      </ThemeContextProvider>
    </HeroUIProvider>
  </StrictMode>,
)
