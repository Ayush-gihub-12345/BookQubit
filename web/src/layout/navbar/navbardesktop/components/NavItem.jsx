"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams, usePathname } from "next/navigation";
import {
  FaHome,
  FaBook,
  FaBoxes,
  FaUser,
  FaInfoCircle,
  FaChevronDown,
  FaStar,
  FaFire,
  FaNewspaper,
  FaGraduationCap,
  FaCogs,
  FaLaptopCode,
  FaBriefcase,
  FaFlask,
} from "react-icons/fa";
import { FaUserDoctor } from "react-icons/fa6";
import { FaSquareRootAlt } from "react-icons/fa";
import { MoreDropdown } from "./MoreDropdown";
import { useTheme } from "@/themes/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

// Navigation Configuration with translation keys and language-aware paths
const getNavigationConfig = (t, currentLang) => ({
  items: [
    {
      name: t("nav.home"),
      icon: <FaHome />,
      path: `/${currentLang}/homepages`,
      translationKey: "nav.home",
    },
    {
      name: t("nav.books"),
      icon: <FaBook />,
      path: `/${currentLang}/books`,
      translationKey: "nav.books",
      dropdown: [
        {
          name: t("nav.bestsellers"),
          path: `/${currentLang}/books/bestsellers`,
          icon: <FaStar />,
          translationKey: "nav.bestsellers",
        },
        {
          name: t("nav.new_releases"),
          path: `/${currentLang}/books/newreleases`,
          icon: <FaFire />,
          translationKey: "nav.new_releases",
        },
        {
          name: t("nav.top_rated"),
          path: `/${currentLang}/books/toprated`,
          icon: <FaStar />,
          translationKey: "nav.top_rated",
        },
      ],
    },
    {
      name: t("nav.academic_books"),
      icon: <FaGraduationCap />,
      path: `/${currentLang}/academicbooks`,
      translationKey: "nav.academic_books",
      dropdown: [
        {
          name: t("nav.engineering"),
          path: `/${currentLang}/academic-books/engineering`,
          icon: <FaCogs />,
          translationKey: "nav.engineering",
        },
        {
          name: t("nav.computer_science"),
          path: `/${currentLang}/academic-books/computer-science`,
          icon: <FaLaptopCode />,
          translationKey: "nav.computer_science",
        },
        {
          name: t("nav.medical"),
          path: `/${currentLang}/academic-books/medical`,
          icon: <FaUserDoctor />,
          translationKey: "nav.medical",
        },
        {
          name: t("nav.business_management"),
          path: `/${currentLang}/academic-books/business`,
          icon: <FaBriefcase />,
          translationKey: "nav.business_management",
        },
        {
          name: t("nav.science"),
          path: `/${currentLang}/academic-books/science`,
          icon: <FaFlask />,
          translationKey: "nav.science",
        },
        {
          name: t("nav.mathematics"),
          path: `/${currentLang}/academic-books/mathematics`,
          icon: <FaSquareRootAlt />,
          translationKey: "nav.mathematics",
        },
      ],
    },
    {
      name: t("nav.comics"),
      icon: <FaBook />,
      path: `/${currentLang}/comics`,
      translationKey: "nav.comics",
      dropdown: [
        {
          name: t("nav.marvel"),
          path: `/${currentLang}/comics/marvel`,
          icon: <FaFire />,
          translationKey: "nav.marvel",
        },
        {
          name: t("nav.dc"),
          path: `/${currentLang}/comics/dc`,
          icon: <FaStar />,
          translationKey: "nav.dc",
        },
        {
          name: t("nav.manga"),
          path: `/${currentLang}/comics/manga`,
          icon: <FaBook />,
          translationKey: "nav.manga",
        },
      ],
    },
    {
      name: t("nav.genre_category"),
      icon: <FaBoxes />,
      path: `/${currentLang}/category`,
      translationKey: "nav.genre_category",
      dropdown: [
        {
          name: t("nav.fiction"),
          path: `/${currentLang}/category/fiction`,
          translationKey: "nav.fiction",
        },
        {
          name: t("nav.non_fiction"),
          path: `/${currentLang}/category/non-fiction`,
          translationKey: "nav.non_fiction",
        },
        {
          name: t("nav.sci_fi"),
          path: `/${currentLang}/category/sci-fi`,
          translationKey: "nav.sci_fi",
        },
        {
          name: t("nav.fantasy"),
          path: `/${currentLang}/category/fantasy`,
          translationKey: "nav.fantasy",
        },
        {
          name: t("nav.mystery"),
          path: `/${currentLang}/category/mystery`,
          translationKey: "nav.mystery",
        },
        {
          name: t("nav.romance"),
          path: `/${currentLang}/category/romance`,
          translationKey: "nav.romance",
        },
        {
          name: t("nav.biography"),
          path: `/${currentLang}/category/biography`,
          translationKey: "nav.biography",
        },
      ],
    },
    {
      name: t("nav.collections"),
      icon: <FaBoxes />,
      path: `/${currentLang}/collections`,
      translationKey: "nav.collections",
      dropdown: [
        {
          name: t("nav.all_collections"),
          path: `/${currentLang}/collections`,
          icon: <FaBoxes />,
          translationKey: "nav.all_collections",
        },
        {
          name: t("nav.featured"),
          path: `/${currentLang}/collections/featured`,
          icon: <FaStar />,
          translationKey: "nav.featured",
        },
        {
          name: t("nav.summer_reads"),
          path: `/${currentLang}/collections/summer`,
          icon: <FaFire />,
          translationKey: "nav.summer_reads",
        },
        {
          name: t("nav.award_winners"),
          path: `/${currentLang}/collections/awards`,
          icon: <FaStar />,
          translationKey: "nav.award_winners",
        },
      ],
    },
    {
      name: t("nav.authors"),
      icon: <FaUser />,
      path: `/${currentLang}/authors`,
      translationKey: "nav.authors",
      dropdown: [
        {
          name: t("nav.all_authors"),
          path: `/${currentLang}/authors`,
          icon: <FaUser />,
          translationKey: "nav.all_authors",
        },
        {
          name: t("nav.popular_authors"),
          path: `/${currentLang}/authors/popular`,
          icon: <FaStar />,
          translationKey: "nav.popular_authors",
        },
        {
          name: t("nav.new_authors"),
          path: `/${currentLang}/authors/new`,
          icon: <FaFire />,
          translationKey: "nav.new_authors",
        },
        {
          name: t("nav.featured_authors"),
          path: `/${currentLang}/authors/featured`,
          icon: <FaStar />,
          translationKey: "nav.featured_authors",
        },
      ],
    },
    {
      name: t("nav.publications"),
      icon: <FaBook />,
      path: `/${currentLang}/publications`,
      translationKey: "nav.publications",
      dropdown: [
        {
          name: t("nav.all_publications"),
          path: `/${currentLang}/publications`,
          icon: <FaBook />,
          translationKey: "nav.all_publications",
        },
        {
          name: t("nav.magazines"),
          path: `/${currentLang}/publications/magazines`,
          icon: <FaNewspaper />,
          translationKey: "nav.magazines",
        },
        {
          name: t("nav.journals"),
          path: `/${currentLang}/publications/journals`,
          icon: <FaBook />,
          translationKey: "nav.journals",
        },
        {
          name: t("nav.newspapers"),
          path: `/${currentLang}/publications/newspapers`,
          icon: <FaNewspaper />,
          translationKey: "nav.newspapers",
        },
      ],
    },
    {
      name: t("nav.about"),
      icon: <FaInfoCircle />,
      path: `/${currentLang}/about`,
      translationKey: "nav.about",
    },
  ],
});

// Dropdown Component for Desktop with RTL support and language-aware routing
const DesktopDropdown = ({ item, onItemClick, currentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const router = useRouter();
  const { theme, themeName } = useTheme();
  const { isRTL } = useLanguage();

  // Check if current theme is dark mode variant
  const isDarkTheme =
    themeName === "dark" ||
    themeName === "midnight" ||
    themeName === "cyberpunk";

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const handleParentClick = () => {
    if (item.path) {
      router.push(item.path);
      if (onItemClick) onItemClick();
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Clickable parent item */}
      <div
        onClick={handleParentClick}
        className={`
          inline-flex items-center px-3 py-2 rounded-md cursor-pointer
          ${theme.textColors?.primary || "text-gray-700 dark:text-gray-200"}
          hover:${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}
          transition-colors duration-200
        `}
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
        }}
      >
        <span
          className={`${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} ${isRTL ? "ml-1.5" : "mr-1.5"}`}
        >
          {item.icon}
        </span>
        <span>{item.name}</span>
        <FaChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isRTL ? "mr-1" : "ml-1"}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && item.dropdown && (
        <div
          className={`
            absolute top-full mt-1 min-w-[200px] z-50
            ${theme.background?.section || "bg-white dark:bg-gray-800"}
            ${theme.border?.default || "border border-gray-200 dark:border-gray-700"}
            ${theme.shadow?.container || "shadow-lg"}
            rounded-lg overflow-hidden
          `}
          style={{
            left: isRTL ? "auto" : "0",
            right: isRTL ? "0" : "auto",
            backgroundColor: isDarkTheme
              ? theme.background?.section
              : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {item.dropdown.map((dropdownItem, index) => (
            <Link
              key={`${item.name}-${dropdownItem.path || index}`}
              href={dropdownItem.path}
              className={`
                flex items-center px-4 py-2 w-full transition-colors duration-150
                ${theme.textColors?.primary || "text-gray-700 dark:text-gray-200"}
                hover:${theme.background?.hover || "bg-gray-50 dark:bg-gray-700"}
              `}
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onItemClick) onItemClick();
              }}
            >
              {dropdownItem.icon && (
                <span
                  className={`${isRTL ? "ml-3" : "mr-3"} ${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}`}
                >
                  {dropdownItem.icon}
                </span>
              )}
              <span>{dropdownItem.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Main NavItem Component for Desktop with language support
export const NavItem = ({ mobile = false, onItemClick }) => {
  const { theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const params = useParams();
  const pathname = usePathname();

  // Get current language from URL params
  const getCurrentLanguage = () => {
    const segments = pathname?.split("/").filter(Boolean);
    const firstSegment = segments?.[0];
    const supportedLanguages = [
      "en",
      "es",
      "fr",
      "de",
      "ja",
      "zh",
      "hi",
      "ar",
      "ur",
      "bn",
      "pt",
      "ru",
      "it",
      "ko",
      "nl",
      "tr",
      "vi",
      "th",
      "pl",
      "sv",
      "ta",
      "te",
      "ml",
      "kn",
      "mr",
    ];
    if (firstSegment && supportedLanguages.includes(firstSegment)) {
      return firstSegment;
    }
    return params?.lang || "en";
  };

  const currentLang = getCurrentLanguage();
  const navigationConfig = getNavigationConfig(t, currentLang);

  return (
    <div
      className="flex items-center gap-1 h-full"
      style={{
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {navigationConfig.items
        .filter(
          (item) =>
            !(
              item.translationKey === "nav.about" &&
              (!item.name || item.name.trim() === "")
            ),
        )
        .map((item) => (
          <div key={item.translationKey} className="h-full flex items-center">
            {item.dropdown ? (
              <DesktopDropdown
                item={item}
                onItemClick={onItemClick}
                currentLang={currentLang}
              />
            ) : (
              <Link
                href={item.path || "#"}
                className={`
                  inline-flex items-center px-3 py-2 rounded-md
                  ${theme.textColors?.primary || "text-gray-700 dark:text-gray-200"}
                  hover:${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"}
                  transition-colors duration-200
                `}
                style={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                }}
                onClick={() => onItemClick?.()}
              >
                <span
                  className={`${theme.textColors?.highlight || "text-sky-600 dark:text-sky-400"} ${isRTL ? "ml-1.5" : "mr-1.5"}`}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}

      <MoreDropdown
        mobile={false}
        onItemClick={onItemClick}
        currentLang={currentLang}
      />
    </div>
  );
};

// Helper functions with language support
export const addDropdownItem = (parentName, newItem, currentLang = "en") => {
  console.warn(
    "addDropdownItem: This function needs to be updated to work with the translation system",
  );
};

export const removeDropdownItem = (parentName, itemPath) => {
  console.warn(
    "removeDropdownItem: This function needs to be updated to work with the translation system",
  );
};

export const addNavItem = (newItem, currentLang = "en") => {
  console.warn(
    "addNavItem: This function needs to be updated to work with the translation system",
  );
};

export const removeNavItem = (itemName) => {
  console.warn(
    "removeNavItem: This function needs to be updated to work with the translation system",
  );
};
