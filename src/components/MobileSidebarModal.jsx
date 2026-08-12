import React from "react";
import Sidebar from "./Sidebar.jsx";
import { useTheme } from "../Contexts/ThemeContext.jsx";

export default function MobileSidebarModal({ isOpen, onClose }) {
  const { themeColors } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed h-[100vh] inset-0 z-[100] lg:hidden flex"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="bg-black/50 absolute inset-0 backdrop-blur-sm transition-opacity"></div>

      {/* Drawer */}
      <div
        className="w-4/5 max-w-sm h-full overflow-y-auto relative p-4 flex flex-col gap-4 shadow-2xl transition-transform"
        style={{ backgroundColor: themeColors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex justify-between items-center mb-2 pb-2 border-b"
          style={{ borderColor: themeColors.primary + "20" }}
        >
          <h2
            className="text-xl font-bold"
            style={{ color: themeColors.primary }}
          >
            Explore Options
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <i
              className="fas fa-arrow-left"
              style={{ color: themeColors.text }}
            ></i>
          </button>
        </div>

        <div className="flex-1 pb-10">
          <Sidebar position="mobile" />
        </div>
      </div>
    </div>
  );
}
