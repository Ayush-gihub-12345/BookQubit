// src/themes/cyberpunk.js
const cyberpunkTheme = {
  name: 'cyberpunk',
  background: {
    section: "bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]",
    bookCoverSide: "bg-gradient-to-br from-[#1a1740] to-[#2a1d5a]",
    navigationDots: "bg-[#1c1a3a]"
  },

  textColors: {
    primary: "text-purple-100",
    secondary: "text-purple-300",
    highlight: "text-cyan-400",
    badge: "text-pink-400",
    wishlistSaved: "text-rose-400",
    wishlistDefault: "text-gray-400"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-cyan-500 to-purple-500",
      hoverBackground: "hover:from-cyan-400 hover:to-purple-400",
      textColor: "text-white"
    },
    secondaryButton: {
      background: "border border-purple-400",
      hoverBackground: "hover:bg-purple-400/10",
      textColor: "text-purple-300"
    },
    wishlistButton: {
      savedBackground: "bg-[#2d0b0b] border-rose-500",
      defaultBackground: "border-gray-700 hover:bg-gray-800"
    }
  },

  iconColors: {
    starFilled: "text-pink-400",
    starEmpty: "text-gray-600",
    navigationArrow: "text-cyan-400 hover:text-cyan-300"
  },

  border: {
    default: "rounded-xl border-purple-700",
    button: "rounded-lg border-purple-600",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-[0_0_30px_rgba(0,255,255,0.4)]",
    container: "shadow-[0_0_20px_rgba(255,0,255,0.3)]",
    button: "shadow-md hover:shadow-lg",
    navigationDotContainer: "shadow-[0_0_10px_rgba(0,255,255,0.3)]"
  },

  layout: {
    sectionPadding: "py-12 px-4 sm:px-6 lg:px-8",
    containerWidth: "max-w-7xl"
  },

  ringEffect: "ring-1 ring-inset ring-purple-400/20",
  opacityOverlay: "opacity-20"
};

export default cyberpunkTheme;