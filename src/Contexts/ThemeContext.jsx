import { createContext, useState, useContext, useEffect } from "react";

export const ThemeContext = createContext();

// Light theme colors
const lightTheme = {
  primary: "#8B0000", // Dark red
  secondary: "#DC143C", // Crimson
  accent: "#8B0000", // Dark red for accents
  background: "#F5F5F5", // Light gray background
  surface: "#FFFFFF", // White surface
  text: "#1A1A1A", // Dark text
  textSecondary: "#65676B", // Secondary text
};

// Dark theme colors
const darkTheme = {
  primary: "#FF6B6B", // Lighter red for dark mode
  secondary: "#FF8E8E", // Light crimson
  accent: "#FF6B6B", // Light red for accents
  background: "#1A1A1A", // Dark background
  surface: "#2D2D2D", // Dark surface
  text: "#FFFFFF", // White text
  textSecondary: "#B0B0B0", // Light secondary text
};

export function ThemeContextProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [primaryColor, setPrimaryColor] = useState(isDarkMode ? darkTheme.primary : lightTheme.primary);
  const [secondaryColor, setSecondaryColor] = useState(isDarkMode ? darkTheme.secondary : lightTheme.secondary);
  const [accentColor, setAccentColor] = useState(isDarkMode ? darkTheme.accent : lightTheme.accent);
  const [backgroundColor, setBackgroundColor] = useState(isDarkMode ? darkTheme.background : lightTheme.background);
  const [surfaceColor, setSurfaceColor] = useState(isDarkMode ? darkTheme.surface : lightTheme.surface);
  const [textColor, setTextColor] = useState(isDarkMode ? darkTheme.text : lightTheme.text);
  const [textSecondaryColor, setTextSecondaryColor] = useState(isDarkMode ? darkTheme.textSecondary : lightTheme.textSecondary);

  const themeColors = {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    background: backgroundColor,
    surface: surfaceColor,
    text: textColor,
    textSecondary: textSecondaryColor,
  };

  // Update theme colors when dark mode changes
  useEffect(() => {
    const theme = isDarkMode ? darkTheme : lightTheme;
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
    setAccentColor(theme.accent);
    setBackgroundColor(theme.background);
    setSurfaceColor(theme.surface);
    setTextColor(theme.text);
    setTextSecondaryColor(theme.textSecondary);
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Update document body class for global styling
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const updateTheme = (newColors) => {
    if (newColors.primary) setPrimaryColor(newColors.primary);
    if (newColors.secondary) setSecondaryColor(newColors.secondary);
    if (newColors.accent) setAccentColor(newColors.accent);
    if (newColors.background) setBackgroundColor(newColors.background);
    if (newColors.surface) setSurfaceColor(newColors.surface);
    if (newColors.text) setTextColor(newColors.text);
    if (newColors.textSecondary) setTextSecondaryColor(newColors.textSecondary);
  };

  return (
    <ThemeContext.Provider value={{ 
      themeColors, 
      updateTheme, 
      isDarkMode, 
      toggleDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};
