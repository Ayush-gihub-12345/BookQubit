// src/themes/ocean.js
const oceanTheme = {
  name: 'ocean',
  background: {
    section: "bg-slate-50",
    card: "bg-white",
    input: "bg-white",
    bookCoverSide: "bg-gradient-to-br from-sky-100 to-cyan-100",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-slate-950",
    secondary: "text-slate-600",
    highlight: "text-cyan-700",
    badge: "text-cyan-800",
    wishlistSaved: "text-rose-600",
    wishlistDefault: "text-gray-600"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-blue-600 to-cyan-500",
      hoverBackground: "hover:from-blue-700 hover:to-cyan-600",
      textColor: "text-white"
    },
    secondaryButton: {
      background: "border-2 border-cyan-500",
      hoverBackground: "hover:bg-cyan-50",
      textColor: "text-cyan-700"
    },
    wishlistButton: {
      savedBackground: "bg-rose-50 border-rose-400",
      defaultBackground: "border-gray-300 hover:bg-gray-50"
    }
  },

  iconColors: {
    starFilled: "text-amber-400",
    starEmpty: "text-gray-300",
    navigationArrow: "text-cyan-600 hover:text-cyan-800"
  },

  border: {
    default: "border border-cyan-100 rounded-lg",
    button: "rounded-md",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-lg shadow-cyan-950/10",
    container: "shadow-md shadow-cyan-950/10",
    button: "shadow-sm hover:shadow-md",
    navigationDotContainer: "shadow-sm"
  },

  layout: {
    sectionPadding: "py-12 px-4 sm:px-6 lg:px-8",
    containerWidth: "max-w-7xl"
  },

  ringEffect: "ring-1 ring-inset ring-blue-900/10",
  opacityOverlay: "opacity-10"
};

export default oceanTheme;
