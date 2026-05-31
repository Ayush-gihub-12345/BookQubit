// src/themes/dark.js
const darkTheme = {
  name: 'dark',
  background: {
    section: "bg-gradient-to-b from-gray-900 to-gray-800",
    bookCoverSide: "bg-gradient-to-br from-gray-800 to-gray-900",
    navigationDots: "bg-gray-800"
  },

  textColors: {
    primary: "text-gray-100",
    secondary: "text-gray-300",
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
    default: "rounded-xl",
    button: "rounded-lg",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-2xl shadow-black/30",
    container: "shadow-xl shadow-black/20",
    button: "shadow-md hover:shadow-lg shadow-black/20",
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