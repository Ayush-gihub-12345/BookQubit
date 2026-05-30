// src/themes/light.js
const lightTheme = {
  name: 'light',
  background: {
    section: "bg-slate-50",
    card: "bg-white",
    input: "bg-white",
    bookCoverSide: "bg-gradient-to-br from-slate-100 to-sky-50",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-slate-950",
    secondary: "text-slate-600",
    highlight: "text-sky-700",
    badge: "text-sky-800",
    wishlistSaved: "text-rose-600",
    wishlistDefault: "text-gray-600"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-sky-600 to-sky-500",
      hoverBackground: "hover:from-sky-700 hover:to-sky-600",
      textColor: "text-white"
    },
    secondaryButton: {
      background: "border-2 border-sky-500",
      hoverBackground: "hover:bg-sky-50",
      textColor: "text-sky-600"
    },
    wishlistButton: {
      savedBackground: "bg-rose-50 border-rose-400",
      defaultBackground: "border-gray-300 hover:bg-gray-50"
    }
  },

  iconColors: {
    starFilled: "text-amber-400",
    starEmpty: "text-gray-300",
    navigationArrow: "text-sky-600 hover:text-sky-800"
  },

  border: {
    default: "border border-slate-200 rounded-lg",
    button: "rounded-md",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-lg shadow-slate-900/10",
    container: "shadow-md shadow-slate-900/10",
    button: "shadow-sm hover:shadow-md",
    navigationDotContainer: "shadow-sm"
  },

  layout: {
    sectionPadding: "py-12 px-4 sm:px-6 lg:px-8",
    containerWidth: "max-w-7xl"
  },

  ringEffect: "ring-1 ring-inset ring-black/10",
  opacityOverlay: "opacity-10"
};

export default lightTheme;
