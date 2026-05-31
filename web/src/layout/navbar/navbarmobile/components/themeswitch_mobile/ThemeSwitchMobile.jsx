"use client";

import React from "react";
import { FaCheck } from "react-icons/fa";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";

const ThemeSwitchMobile = ({ onClose }) => {
  const { themeName, changeTheme, theme } = useTheme();
  const { direction, isRTL, textAlign } = useRTL();

  const isDarkMode =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  // Tailwind classes
  const cardBg = isDarkMode ? "bg-gray-800" : "bg-white";
  const borderClass = isDarkMode ? "border-gray-700" : "border-gray-200";
  const textPrimary =
    theme?.textColors?.primary ||
    (isDarkMode ? "text-white" : "text-gray-900");
  const textSecondary =
    theme?.textColors?.secondary ||
    (isDarkMode ? "text-gray-400" : "text-gray-500");
  const activeCard =
    theme?.buttonColors?.primaryButton?.background ||
    "bg-gradient-to-r from-sky-600 to-sky-500";

  const themesList = [
    { key: "light", icon: "☀️", name: "Light", nameAr: "فاتح" },
    { key: "dark", icon: "🌙", name: "Dark", nameAr: "داكن" },
    { key: "forest", icon: "🌲", name: "Forest", nameAr: "غابة" },
    { key: "cyberpunk", icon: "🎮", name: "Cyberpunk", nameAr: "سايبربانك" },
    { key: "lavender", icon: "🌸", name: "Lavender", nameAr: "لافندر" },
    { key: "midnight", icon: "🌃", name: "Midnight", nameAr: "منتصف الليل" },
    { key: "ocean", icon: "🌊", name: "Ocean", nameAr: "محيط" },
    { key: "rose", icon: "🌹", name: "Rose", nameAr: "ورد" },
    { key: "sand", icon: "🏖️", name: "Sand", nameAr: "رمل" },
    { key: "sepia", icon: "📜", name: "Sepia", nameAr: "سيبيا" },
  ];

  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey);
    if (onClose) setTimeout(() => onClose(), 300);
  };

  const getThemeName = (theme, isRTL) => {
    return (isRTL && theme.nameAr) ? theme.nameAr : theme.name;
  };

  return (
    <div className="w-full" dir={direction}>
      <div className="max-h-[60vh] overflow-y-auto" style={{ padding: "0 0.25rem" }}>
        <div className="grid grid-cols-2 gap-3" dir={direction}>
          {themesList.map((item) => {
            const isActive = themeName === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleThemeChange(item.key)}
                // Force consistent flex direction (icon always left, checkmark always right)
                style={{ display: "flex", flexDirection: "row" }}
                className={`items-center gap-2 p-3 rounded-xl border transition-all duration-200 active:scale-95 w-full shadow-sm ${
                  isActive
                    ? `${activeCard} border-transparent shadow-lg`
                    : `${cardBg} ${borderClass}`
                }`}
              >
                {/* Icon - always first (visual left) */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-white/20"
                        : isDarkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                  </div>
                </div>

                {/* Text info - always second, with RTL text alignment */}
                <div className={`flex-1 overflow-hidden ${isRTL ? "text-right" : "text-left"}`}>
                  <div
                    className={`text-sm font-semibold truncate ${isActive ? "text-white" : textPrimary}`}
                    style={{ textAlign: isRTL ? "right" : "left" }}
                  >
                    {getThemeName(item, isRTL)}
                  </div>
                  <div
                    className={`text-[10px] truncate ${isActive ? "text-white/80" : textSecondary}`}
                    style={{ textAlign: isRTL ? "right" : "left" }}
                  >
                    {isActive
                      ? (isRTL ? "نشط" : "Active")
                      : (isRTL ? "انقر للتطبيق" : "Tap to apply")}
                  </div>
                </div>

                {/* Checkmark - always last (visual right) */}
                {isActive && <FaCheck size={12} className="text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitchMobile;