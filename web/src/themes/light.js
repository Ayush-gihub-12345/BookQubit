// src/themes/light.js
const lightTheme = {
  name: 'light',
  background: {
    section: "bg-gradient-to-b from-sky-50 to-white",
    bookCoverSide: "bg-gradient-to-br from-sky-100 to-white",
    navigationDots: "bg-white"
  },

  textColors: {
    primary: "text-gray-900",
    secondary: "text-gray-700",
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
    default: "rounded-xl",
    button: "rounded-lg",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-2xl",
    container: "shadow-xl",
    button: "shadow-md hover:shadow-lg",
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