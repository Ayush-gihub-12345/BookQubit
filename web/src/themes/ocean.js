// src/themes/ocean.js
const oceanTheme = {
  name: 'ocean',
  background: {
    section: "bg-gradient-to-b from-blue-50 to-cyan-100",
    bookCoverSide: "bg-gradient-to-br from-blue-100 to-cyan-200",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-blue-900",
    secondary: "text-blue-700",
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

  ringEffect: "ring-1 ring-inset ring-blue-900/10",
  opacityOverlay: "opacity-10"
};

export default oceanTheme;