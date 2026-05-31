// src/themes/sepia.js
const sepiaTheme = {
  name: 'sepia',
  background: {
    section: "bg-gradient-to-b from-[#f4ecd8] to-[#e6d8b8]",
    bookCoverSide: "bg-gradient-to-br from-[#f0e2c2] to-[#e2d2ac]",
    navigationDots: "bg-[#efe2c2]"
  },

  textColors: {
    primary: "text-[#3e2f1c]",
    secondary: "text-[#5a4631]",
    highlight: "text-[#8a5a2b]",
    badge: "text-[#7a4f24]",
    wishlistSaved: "text-[#a94442]",
    wishlistDefault: "text-[#6b5a45]"
  },

  buttonColors: {
    primaryButton: {
      background: "bg-gradient-to-r from-[#c28b4c] to-[#b37a3d]",
      hoverBackground: "hover:from-[#b1783b] hover:to-[#9e6730]",
      textColor: "text-white"
    },

    secondaryButton: {
      background: "border-2 border-[#b37a3d]",
      hoverBackground: "hover:bg-[#f3e6c8]",
      textColor: "text-[#8a5a2b]"
    },

    wishlistButton: {
      savedBackground: "bg-[#f5dcdc] border-[#b04a4a]",
      defaultBackground: "border-[#bca47d] hover:bg-[#efe2c5]"
    }
  },

  iconColors: {
    starFilled: "text-amber-500",
    starEmpty: "text-[#d6c5a3]",
    navigationArrow: "text-[#8a5a2b] hover:text-[#6f431c]"
  },

  border: {
    default: "rounded-xl border-[#d2c1a0]",
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

  ringEffect: "ring-1 ring-inset ring-[#8a6a3d]/20",
  opacityOverlay: "opacity-10"
};

export default sepiaTheme;