// src/themes/rose.js
const roseTheme = {
  name: 'rose',
  background: {
    section: "bg-gradient-to-b from-rose-50 to-pink-100",
    bookCoverSide: "bg-gradient-to-br from-rose-100 to-pink-200",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-rose-900",
    secondary: "text-rose-700",
    highlight: "text-pink-700",
    badge: "text-pink-800",
    wishlistSaved: "text-rose-600",
    wishlistDefault: "text-gray-600"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-rose-600 to-pink-500",
      hoverBackground: "hover:from-rose-700 hover:to-pink-600",
      textColor: "text-white"
    },
    secondaryButton: {
      background: "border-2 border-pink-500",
      hoverBackground: "hover:bg-pink-50",
      textColor: "text-pink-700"
    },
    wishlistButton: {
      savedBackground: "bg-rose-50 border-rose-400",
      defaultBackground: "border-gray-300 hover:bg-gray-50"
    }
  },

  iconColors: {
    starFilled: "text-amber-400",
    starEmpty: "text-gray-300",
    navigationArrow: "text-pink-600 hover:text-pink-800"
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

  ringEffect: "ring-1 ring-inset ring-rose-900/10",
  opacityOverlay: "opacity-10"
};

export default roseTheme;