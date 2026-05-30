// src/themes/sand.js
const sandTheme = {
  name: 'sand',
  background: {
    section: "bg-slate-50",
    card: "bg-white",
    input: "bg-white",
    bookCoverSide: "bg-gradient-to-br from-amber-100 to-stone-50",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-slate-950",
    secondary: "text-slate-600",
    highlight: "text-yellow-700",
    badge: "text-yellow-800",
    wishlistSaved: "text-rose-600",
    wishlistDefault: "text-gray-600"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-yellow-600 to-amber-500",
      hoverBackground: "hover:from-yellow-700 hover:to-amber-600",
      textColor: "text-white"
    },
    secondaryButton: {
      background: "border-2 border-yellow-500",
      hoverBackground: "hover:bg-yellow-50",
      textColor: "text-yellow-700"
    },
    wishlistButton: {
      savedBackground: "bg-rose-50 border-rose-400",
      defaultBackground: "border-gray-300 hover:bg-gray-50"
    }
  },

  iconColors: {
    starFilled: "text-amber-400",
    starEmpty: "text-gray-300",
    navigationArrow: "text-yellow-600 hover:text-yellow-800"
  },

  border: {
    default: "border border-amber-100 rounded-lg",
    button: "rounded-md",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-lg shadow-amber-950/10",
    container: "shadow-md shadow-amber-950/10",
    button: "shadow-sm hover:shadow-md",
    navigationDotContainer: "shadow-sm"
  },

  layout: {
    sectionPadding: "py-12 px-4 sm:px-6 lg:px-8",
    containerWidth: "max-w-7xl"
  },

  ringEffect: "ring-1 ring-inset ring-yellow-900/10",
  opacityOverlay: "opacity-10"
};

export default sandTheme;
