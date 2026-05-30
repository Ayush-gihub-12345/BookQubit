// src/themes/forest.js
const forestTheme = {
  name: 'forest',
  background: {
    section: "bg-gradient-to-b from-green-50 to-emerald-100",
    bookCoverSide: "bg-gradient-to-br from-green-100 to-emerald-200",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-emerald-900",
    secondary: "text-emerald-700",
    highlight: "text-green-700",
    badge: "text-green-800",
    wishlistSaved: "text-rose-600",
    wishlistDefault: "text-gray-600"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-emerald-600 to-green-500",
      hoverBackground: "hover:from-emerald-700 hover:to-green-600",
      textColor: "text-white"
    },

    secondaryButton: {
      background: "border-2 border-emerald-500",
      hoverBackground: "hover:bg-emerald-50",
      textColor: "text-emerald-700"
    },

    wishlistButton: {
      savedBackground: "bg-rose-50 border-rose-400",
      defaultBackground: "border-gray-300 hover:bg-gray-50"
    }
  },

  iconColors: {
    starFilled: "text-amber-400",
    starEmpty: "text-gray-300",
    navigationArrow: "text-emerald-600 hover:text-emerald-800"
  },

  border: {
    default: "rounded-xl",
    button: "rounded-lg",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-xl",
    container: "shadow-lg",
    button: "shadow-md hover:shadow-lg",
    navigationDotContainer: "shadow-sm"
  },

  layout: {
    sectionPadding: "py-12 px-4 sm:px-6 lg:px-8",
    containerWidth: "max-w-7xl"
  },

  ringEffect: "ring-1 ring-inset ring-green-900/10",
  opacityOverlay: "opacity-10"
};

export default forestTheme;