import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem,
} from "@heroui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Contexts/AuthContext.jsx";
import { useTheme } from "../Contexts/ThemeContext.jsx";
import LogoutConfirmModal from "./LogoutConfirmModal.jsx";
import MobileSidebarModal from "./MobileSidebarModal.jsx";
import toast from "react-hot-toast";
import NotificationsModal from "./NotificationsModal.jsx";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../Services/NotificationServices.js";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function NavbarComponent() {
  const {
    isloggedIn,
    setIsloggedIn,
    setUserID,
    profilePageIsOpen,
    setProfilePageIsOpen,
  } = useContext(AuthContext);
  const { themeColors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    enabled: isloggedIn,
    refetchInterval: 5000,
  });
  const unreadCount =
    notificationsData?.data?.data?.notifications?.filter((n) => !n.isRead)
      ?.length || 0;

  // هذا useEffect لتحديث حالة profilePageIsOpen حسب الصفحة الحالية
  useEffect(() => {
    if (location.pathname === "/profile") {
      setProfilePageIsOpen(true);
    } else {
      setProfilePageIsOpen(false);
    }
  }, [location.pathname, setProfilePageIsOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userID");
    setIsloggedIn(false);
    setUserID("");
    setProfilePageIsOpen(false);
    navigate("/login");
    toast.success("Logged out");
  };

  const openLogoutConfirm = () => setIsLogoutModalOpen(true);
  const closeLogoutConfirm = () => setIsLogoutModalOpen(false);

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <Navbar
      className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100/50 sticky top-0 z-50 py-2"
      style={{ backgroundColor: `${themeColors.background}E6` }}
      maxWidth="xl"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* Left: Logo Area */}
      <NavbarBrand>
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">
          <Link
            onClick={() => setProfilePageIsOpen(false)}
            className="font-bold text-xl sm:text-2xl transition-all duration-300"
            style={{ color: themeColors.primary }}
            to="/"
          >
            <i className="fa-solid fa-link pe-8"></i>
            Linkup
          </Link>
        </div>
      </NavbarBrand>
      {/* Center: Profile Link (only show when logged in) */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {isloggedIn && (
          <NavbarItem>
            <button
              onClick={() => {
                navigate("/profile");
                setProfilePageIsOpen(true);
              }}
              className={`profile-nav-button relative px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300`}
              style={{
                color: themeColors.text,
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
              }}
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <i
                  className="fas fa-user-circle text-base sm:text-lg"
                  style={{ color: themeColors.primary }}
                ></i>
                <span className="hidden sm:inline">Profile</span>
              </span>
              {/* الخط الأحمر الفعلي كعنصر DOM */}
              {profilePageIsOpen && (
                <span
                  className="absolute bottom-0 left-0 w-full h-1 rounded-full"
                  style={{ backgroundColor: themeColors.primary }}
                ></span>
              )}
            </button>
          </NavbarItem>
        )}
      </NavbarContent>
      {/* Mobile Menu Toggle */}
      <NavbarContent className="sm:hidden gap-1 flex items-center" justify="end">
        {isloggedIn && (
          <>
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <i
                className="fas fa-bell text-xl"
                style={{ color: themeColors.primary }}
              ></i>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsMobileSidebarOpen(true);
              }}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: themeColors.primary }}
              aria-label="Open Explore Sidebar"
            >
              <i className="fas fa-compass text-xl"></i>
            </button>
          </>
        )}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
          style={{ color: themeColors.primary }}
        />
      </NavbarContent>
      {/* Right: Login/Logout Buttons (Desktop) */}
      <NavbarContent className="hidden sm:flex" justify="end">
        {isloggedIn ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <i
                className="fas fa-bell text-xl"
                style={{ color: themeColors.primary }}
              ></i>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <Button
              onPress={openLogoutConfirm}
              className="font-semibold px-3 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm sm:text-base"
              style={{
                backgroundColor: themeColors.primary,
                color: "white",
              }}
            >
              <i className="fas fa-sign-out-alt mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              onPress={handleLogin}
              variant="bordered"
              className="font-semibold px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md text-sm sm:text-base"
              style={{
                borderColor: themeColors.primary,
                color: themeColors.primary,
              }}
            >
              <i className="fas fa-sign-in-alt mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Login</span>
              <span className="sm:hidden">In</span>
            </Button>
            <Link
              to="/register"
              className="font-semibold px-3 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg flex items-center transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm sm:text-base"
              style={{
                backgroundColor: themeColors.primary,
                color: "white",
              }}
            >
              <i className="fas fa-user-plus mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Sign Up</span>
              <span className="sm:hidden">Up</span>
            </Link>
          </div>
        )}
      </NavbarContent>
      {/* Mobile Menu */}
      <NavbarMenu
        className="pt-4 pb-4"
        style={{
          backgroundColor: themeColors.background,
          height: "auto",
          minHeight: "auto",
        }}
      >
        {isloggedIn ? (
          <>
            <NavbarMenuItem>
              <Link
                to="/profile"
                onClick={() => {
                  setIsMenuOpen(false);
                  setProfilePageIsOpen(true);
                }}
                className="w-full block p-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                style={{
                  color: themeColors.text,
                  backgroundColor: profilePageIsOpen
                    ? `${themeColors.primary}15`
                    : "transparent",
                }}
              >
                <i
                  className="fas fa-user-circle text-xl"
                  style={{ color: themeColors.primary }}
                ></i>
                <span className="font-semibold text-lg">Profile</span>
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  setIsNotificationsOpen(true);
                }}
                className="w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center justify-between gap-3"
                style={{ color: themeColors.text }}
              >
                <div className="flex items-center gap-3">
                  <i
                    className="fas fa-bell text-xl"
                    style={{ color: themeColors.primary }}
                  ></i>
                  <span className="font-semibold text-lg">Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  openLogoutConfirm();
                }}
                className="w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                style={{ color: themeColors.text }}
              >
                <i
                  className="fas fa-sign-out-alt text-xl"
                  style={{ color: themeColors.primary }}
                ></i>
                <span className="font-semibold text-lg">Logout</span>
              </button>
            </NavbarMenuItem>
          </>
        ) : (
          <>
            <NavbarMenuItem>
              <Link
                to="/login"
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className="w-full block p-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                style={{ color: themeColors.text }}
              >
                <i
                  className="fas fa-sign-in-alt text-xl"
                  style={{ color: themeColors.primary }}
                ></i>
                <span className="font-semibold text-lg">Login</span>
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link
                to="/register"
                onClick={() => {
                  setIsMenuOpen(false);
                }}
                className="w-full block p-4 rounded-xl transition-all duration-300 flex items-center gap-3"
                style={{ color: themeColors.text }}
              >
                <i
                  className="fas fa-user-plus text-xl"
                  style={{ color: themeColors.primary }}
                ></i>
                <span className="font-semibold text-lg">Sign Up</span>
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
      {/* Logout Confirm Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutConfirm}
        onConfirm={() => {
          closeLogoutConfirm();
          handleLogout();
        }}
      />
      <MobileSidebarModal
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
    </Navbar>
  );
}
