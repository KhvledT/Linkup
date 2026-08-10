import { createContext, useState, useContext, useEffect } from "react";

export const ThemeContext = createContext();

const lightTheme = {
  primary: "#8B0000", // Dark red - main brand color
  secondary: "#DC143C", // Crimson - secondary brand color
  accent: "#8B0000", // Dark red for accent elements
  background: "#F5F5F5", // Light gray background
  surface: "#FFFFFF", // White surface for cards and components
  text: "#1A1A1A", // Dark text for good contrast
  textSecondary: "#65676B", // Secondary text for less emphasis
};

// Dark theme color palette
// Provides softer, more muted colors for dark mode
const darkTheme = {
  primary: "#FF6B6B", // Lighter red for dark mode visibility
  secondary: "#FF8E8E", // Light crimson for secondary elements
  accent: "#FF6B6B", // Light red for accent elements
  background: "#1A1A1A", // Dark background for reduced eye strain
  surface: "#2D2D2D", // Dark surface for cards and components
  text: "#FFFFFF", // White text for good contrast
  textSecondary: "#B0B0B0", // Light secondary text for less emphasis
};

export function ThemeContextProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [primaryColor, setPrimaryColor] = useState(
    isDarkMode ? darkTheme.primary : lightTheme.primary
  );
  const [secondaryColor, setSecondaryColor] = useState(
    isDarkMode ? darkTheme.secondary : lightTheme.secondary
  );
  const [accentColor, setAccentColor] = useState(
    isDarkMode ? darkTheme.accent : lightTheme.accent
  );
  const [backgroundColor, setBackgroundColor] = useState(
    isDarkMode ? darkTheme.background : lightTheme.background
  );
  const [surfaceColor, setSurfaceColor] = useState(
    isDarkMode ? darkTheme.surface : lightTheme.surface
  );
  const [textColor, setTextColor] = useState(
    isDarkMode ? darkTheme.text : lightTheme.text
  );
  const [textSecondaryColor, setTextSecondaryColor] = useState(
    isDarkMode ? darkTheme.textSecondary : lightTheme.textSecondary
  );

  const themeColors = {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    background: backgroundColor,
    surface: surfaceColor,
    text: textColor,
    textSecondary: textSecondaryColor,
  };

  useEffect(() => {
    const theme = isDarkMode ? darkTheme : lightTheme;

    // Update all color states to match the selected theme
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
    setAccentColor(theme.accent);
    setBackgroundColor(theme.background);
    setSurfaceColor(theme.surface);
    setTextColor(theme.text);
    setTextSecondaryColor(theme.textSecondary);

    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));

    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const updateTheme = (newColors) => {
    // Only update colors that are provided in the newColors object
    if (newColors.primary) setPrimaryColor(newColors.primary);
    if (newColors.secondary) setSecondaryColor(newColors.secondary);
    if (newColors.accent) setAccentColor(newColors.accent);
    if (newColors.background) setBackgroundColor(newColors.background);
    if (newColors.surface) setSurfaceColor(newColors.surface);
    if (newColors.text) setTextColor(newColors.text);
    if (newColors.textSecondary) setTextSecondaryColor(newColors.textSecondary);
  };

  // Provide theme context values to all child components
  return (
    <ThemeContext.Provider
      value={{
        themeColors, // Object containing all current theme colors
        updateTheme, // Function to update individual theme colors
        isDarkMode, // Boolean indicating current dark mode state
        toggleDarkMode, // Function to toggle between dark and light modes
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  // Ensure the hook is used within a ThemeContextProvider
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }

  return context;
};
