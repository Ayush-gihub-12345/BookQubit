// src/themes/lavender.js
const lavenderTheme = {
  name: 'lavender',
  background: {
    section: "bg-gradient-to-b from-purple-50 to-violet-100",
    bookCoverSide: "bg-gradient-to-br from-purple-100 to-violet-200",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-purple-900",
    secondary: "text-purple-700",
    highlight: "text-violet-700",
    badge: "text-violet-800",
    wishlistSaved: "text-rose-600",
    wishlistDefault: "text-gray-600"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-purple-600 to-violet-500",
      hoverBackground: "hover:from-purple-700 hover:to-violet-600",
      textColor: "text-white"
    },
    secondaryButton: {
      background: "border-2 border-violet-500",
      hoverBackground: "hover:bg-violet-50",
      textColor: "text-violet-700"
    },
    wishlistButton: {
      savedBackground: "bg-rose-50 border-rose-400",
      defaultBackground: "border-gray-300 hover:bg-gray-50"
    }
  },

  iconColors: {
    starFilled: "text-amber-400",
    starEmpty: "text-gray-300",
    navigationArrow: "text-violet-600 hover:text-violet-800"
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

  ringEffect: "ring-1 ring-inset ring-purple-900/10",
  opacityOverlay: "opacity-10"
};

export default lavenderTheme;