// src/themes/sepia.js
const sepiaTheme = {
  name: 'sepia',
  background: {
    section: "bg-[#f8f3e8]",
    card: "bg-[#fffaf0]",
    input: "bg-[#fffaf0]",
    bookCoverSide: "bg-gradient-to-br from-[#f0e2c2] to-[#f8f3e8]",
    navigationDots: "bg-[#fffaf0]"
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
    default: "border border-[#d8c6a4] rounded-lg",
    button: "rounded-md",
    navigationDot: "rounded-full"
  },

  shadow: {
    book: "shadow-lg shadow-stone-900/10",
    container: "shadow-md shadow-stone-900/10",
    button: "shadow-sm hover:shadow-md",
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
