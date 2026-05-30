// src/themes/sand.js
const sandTheme = {
  name: 'sand',
  background: {
    section: "bg-gradient-to-b from-yellow-50 to-amber-100",
    bookCoverSide: "bg-gradient-to-br from-yellow-100 to-amber-200",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-amber-900",
    secondary: "text-amber-700",
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

  ringEffect: "ring-1 ring-inset ring-yellow-900/10",
  opacityOverlay: "opacity-10"
};

export default sandTheme;