import React from 'react'
import { Outlet } from 'react-router-dom'
import { useTheme } from '../Contexts/ThemeContext.jsx'

export default function AuthLayout() {
  const { themeColors } = useTheme();

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: themeColors.background }}
    >
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large Circle */}
        <div 
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-20 floating-shape"
          style={{ backgroundColor: themeColors.primary }}
        ></div>
        
        {/* Medium Square */}
        <div 
          className="absolute top-1/2 -left-16 w-32 h-32 opacity-15 floating-shape"
          style={{ backgroundColor: themeColors.secondary }}
        ></div>
        
        {/* Small Circle */}
        <div 
          className="absolute bottom-20 right-1/4 w-24 h-24 rounded-full opacity-25 floating-shape"
          style={{ backgroundColor: themeColors.primary }}
        ></div>
        
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{ 
            background: `radial-gradient(circle at 20% 80%, ${themeColors.primary}15, transparent 50%),
                        radial-gradient(circle at 80% 20%, ${themeColors.secondary}10, transparent 50%)`
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
