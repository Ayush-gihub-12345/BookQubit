// src/themes/dark.js
const darkTheme = {
  name: 'dark',
  background: {
    section: "bg-slate-950",
    card: "bg-slate-900",
    input: "bg-slate-900",
    bookCoverSide: "bg-gradient-to-br from-slate-900 to-slate-800",
    navigationDots: "bg-slate-900"
  },

  textColors: {
    primary: "text-slate-50",
    secondary: "text-slate-300",
    highlight: "text-sky-400",
    badge: "text-sky-300",
    wishlistSaved: "text-rose-400",
    wishlistDefault: "text-gray-400"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-sky-500 to-sky-400",
      hoverBackground: "hover:from-sky-600 hover:to-sky-500",
      textColor: "text-white"
    },
    secondaryButton: {
      background: "border-2 border-sky-400",
      hoverBackground: "hover:bg-sky-900",
      textColor: "text-sky-400"
    },
    wishlistButton: {
      savedBackground: "bg-rose-900 border-rose-700",
      defaultBackground: "border-gray-700 hover:bg-gray-800"
    }
  },

  iconColors: {
    starFilled: "text-amber-400",
    starEmpty: "text-gray-600",
    navigationArrow: "text-sky-400 hover:text-sky-300"
  },

  border: {
    default: "border border-slate-800 rounded-lg",
    button: "rounded-md",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-lg shadow-black/35",
    container: "shadow-md shadow-black/30",
    button: "shadow-sm hover:shadow-md shadow-black/25",
    navigationDotContainer: "shadow-sm shadow-black/10"
  },

  layout: {
    sectionPadding: "py-12 px-4 sm:px-6 lg:px-8",
    containerWidth: "max-w-7xl"
  },

  ringEffect: "ring-1 ring-inset ring-white/10",
  opacityOverlay: "opacity-20"
};

export default darkTheme;
