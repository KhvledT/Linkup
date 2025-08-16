import { useNavigate } from "react-router-dom";
import { useTheme } from '../Contexts/ThemeContext.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { themeColors } = useTheme();

  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl shadow-xl border border-gray-200 text-center p-8">
        {/* 404 Number */}
        <h1 
          className="text-9xl font-extrabold drop-shadow-lg"
          style={{ color: themeColors.primary }}
        >
          404
        </h1>
        
        {/* Message */}
        <h2 
          className="text-3xl font-bold mt-4"
          style={{ color: themeColors.text }}
        >
          Page Not Found
        </h2>
        <p 
          className="mt-2 max-w-md"
          style={{ color: themeColors.textSecondary }}
        >
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 text-white text-lg rounded-full shadow-md hover:scale-105 transition-all duration-300"
          style={{ backgroundColor: themeColors.primary }}
        >
          Back to Home
        </button>

        {/* Small Illustration */}
        <div className="mt-10">
          <i 
            className="fas fa-exclamation-triangle text-5xl"
            style={{ color: themeColors.secondary }}
          ></i>
        </div>
      </div>
    </div>
  );
}
