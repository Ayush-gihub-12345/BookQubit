// src/themes/midnight.js
const midnightTheme = {
  name: 'midnight',
  background: {
    section: "bg-[#0a0f1f]",
    card: "bg-[#111827]",
    input: "bg-[#111827]",
    bookCoverSide: "bg-gradient-to-br from-[#141c34] to-[#1c2546]",
    navigationDots: "bg-[#1a2138]"
  },

  textColors: {
    primary: "text-blue-100",
    secondary: "text-blue-300",
    highlight: "text-cyan-400",
    badge: "text-cyan-300",
    wishlistSaved: "text-rose-400",
    wishlistDefault: "text-gray-500"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-blue-600 to-cyan-500",
      hoverBackground: "hover:from-blue-500 hover:to-cyan-400",
      textColor: "text-white"
    },

    secondaryButton: {
      background: "border border-blue-500",
      hoverBackground: "hover:bg-blue-500/10",
      textColor: "text-blue-400"
    },

    wishlistButton: {
      savedBackground: "bg-[#2b0f15] border-rose-500",
      defaultBackground: "border-gray-700 hover:bg-gray-800"
    }
  },

  iconColors: {
    starFilled: "text-amber-300",
    starEmpty: "text-gray-600",
    navigationArrow: "text-blue-400 hover:text-cyan-300"
  },

  border: {
    default: "border border-slate-800 rounded-lg",
    button: "rounded-md border-slate-700",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-lg shadow-black/40",
    container: "shadow-md shadow-black/35",
    button: "shadow-sm hover:shadow-md",
    navigationDotContainer: "shadow-[0_0_10px_rgba(0,0,0,0.5)]"
  },

  layout: {
    sectionPadding: "py-12 px-4 sm:px-6 lg:px-8",
    containerWidth: "max-w-7xl"
  },

  ringEffect: "ring-1 ring-inset ring-white/10",
  opacityOverlay: "opacity-20"
};

export default midnightTheme;
