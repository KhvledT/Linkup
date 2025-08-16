import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import NavbarComponent from '../components/Navbar'
import { useTheme } from '../Contexts/ThemeContext.jsx'
import Sidebar from '../components/Sidebar.jsx';
import { AuthContext } from '../Contexts/AuthContext.jsx';

export default function MainLayout() {
  const { themeColors } = useTheme();
  const { isloggedIn } = useContext(AuthContext);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: themeColors.background }}
    >
      <NavbarComponent/>
      <main className="flex-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          {isloggedIn ? (
            // Show sidebars and main content in responsive grid layout when logged in
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 xl:gap-8">
              {/* Left Sidebar */}
              <Sidebar position="left" />

              {/* Main Content Area */}
              <div className="lg:col-span-6 xl:col-span-6">
                <Outlet/>
              </div>

              {/* Right Sidebar */}
              <Sidebar position="right" />
            </div>
          ) : (
            // Show only main content centered when not logged in
            <div className="flex justify-center">
              <div className="w-full max-w-4xl px-2 sm:px-4">
                <Outlet/>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
