"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FaBoxes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCategories } from "./useCategories";
import { useTheme } from "@/themes/useTheme";
import { useRTL } from "@/contexts/RTLContext";
import { useFont } from "@/contexts/FontContext";
import "./MoreDropdown.css";

export const MoreDropdown = ({ onItemClick, mobile = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const categories = useCategories();
  const { theme, themeName } = useTheme();
  const { isRTL } = useRTL();
  const { currentFont } = useFont();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = () => {
    setIsOpen(false);
    onItemClick?.();
  };

  const getDisplayItems = (category) => {
    const itemsToShow = category.items.slice(0, 8);
    const hasMoreItems = category.items.length > 8;
    return { items: itemsToShow, hasMore: hasMoreItems };
  };

  if (mobile) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center w-full px-4 py-3 text-sm font-medium
            border-b border-gray-200 dark:border-gray-700
            ${theme.textColors.primary}
          `}
          style={{ fontFamily: currentFont?.family }}
        >
          <span className={`mr-3 ${theme.textColors.highlight}`}>
            <FaBoxes />
          </span>
          <span className="flex-1 text-left">More</span>
          <span className={theme.textColors.secondary}>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </button>

        {isOpen && (
          <div className={`pl-12 pr-4 py-2 ${theme.background.navigationDots}`}>
            {categories.map((category, index) => {
              const { items, hasMore } = getDisplayItems(category);
              return (
                <div key={category.id || index} className="py-2">
                  <h3
                    className={`text-sm font-semibold mb-2 ${theme.textColors.primary}`}
                  >
                    {category.title}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {items.map((item) => (
                      <Link
                        key={`${category.id}-${item.path}`}
                        href={item.path}
                        className={`block py-1 text-sm ${theme.textColors.secondary} hover:${theme.textColors.highlight}`}
                        onClick={handleItemClick}
                        style={{ fontFamily: currentFont?.family }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                  {hasMore && category.viewAllPath && (
                    <Link
                      href={category.viewAllPath}
                      className={`block mt-2 text-sm font-medium ${theme.textColors.highlight}`}
                      onClick={handleItemClick}
                      style={{ fontFamily: currentFont?.family }}
                    >
                      View All →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex justify-center h-full" ref={dropdownRef}>
      <div className="static inline-block h-full">
        <button
          type="button"
          className={`
            flex items-center px-3 py-2 text-sm font-medium whitespace-nowrap
            transition-colors duration-200 cursor-pointer h-full bg-transparent border-none
            ${theme.textColors.primary} hover:${theme.textColors.highlight}
          `}
          style={{ fontFamily: currentFont?.family }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
            onItemClick?.();
          }}
          onMouseEnter={() => setIsOpen(true)}
        >
          <span
            className={`mr-1.5 text-sm flex items-center ${theme.textColors.highlight}`}
          >
            <FaBoxes />
          </span>
          <span style={{ fontWeight: "500" }}>More</span>
          <span
            className={`ml-1 text-xs flex items-center transition-transform duration-200 ${theme.textColors.secondary}`}
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <FaChevronDown size={12} />
          </span>
        </button>

        {isOpen && (
          <div
            className={`
              fixed left-1/2 -translate-x-1/2 top-[130px] rounded-lg shadow-lg
              w-[95vw] max-w-[1259px] z-50 p-6 border flex flex-col max-h-[70vh]
              ${theme.background.section} ${theme.border.default} ${theme.shadow.container}
              animate-slideDownFade
            `}
            style={{ fontFamily: currentFont?.family }}
            onClick={(e) => e.stopPropagation()}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div
              className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4
                scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-gray-800
                scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
            >
              {categories.map((category, index) => {
                const { items, hasMore } = getDisplayItems(category);
                return (
                  <div key={category.id || index} className="flex flex-col">
                    <div className="flex flex-col">
                      <h3
                        className={`
                          text-sm font-semibold mb-3 pb-1.5 border-b
                          ${theme.textColors.primary} ${theme.border.default}
                        `}
                        style={{ fontWeight: "700" }}
                      >
                        {category.title}
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        {items.map((item) => (
                          <Link
                            key={`${category.id}-${item.path}`}
                            href={item.path}
                            className={`
                              block p-2 text-xs leading-tight rounded transition-all duration-150
                              ${theme.textColors.secondary} hover:${theme.textColors.highlight}
                              hover:bg-gray-100 dark:hover:bg-gray-800
                            `}
                            onClick={handleItemClick}
                            style={{ fontFamily: currentFont?.family }}
                          >
                            <span className="text-xs font-medium">
                              {item.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                      {hasMore && category.viewAllPath && (
                        <Link
                          href={category.viewAllPath}
                          className={`
                            block mt-2 py-1.5 px-2 text-xs font-medium rounded border text-center
                            transition-colors duration-150
                            bg-gray-50 border-gray-200 hover:bg-sky-50 hover:border-sky-300
                            dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700
                            ${theme.textColors.highlight}
                          `}
                          onClick={handleItemClick}
                          style={{ fontFamily: currentFont?.family }}
                        >
                          View All {category.title} →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`flex-shrink-0 mt-4 pt-4 border-t ${theme.border.default} text-center`}
            >
              <Link
                href="/browsecategories"
                className={`
                  inline-block px-6 py-2 rounded-md font-medium
                  transition-all duration-200 shadow-md hover:-translate-y-0.5
                  hover:shadow-lg active:translate-y-0 active:shadow-sm
                  ${theme.buttonColors?.primaryButton?.background || "bg-blue-500"}
                  ${theme.buttonColors?.primaryButton?.hoverBackground || "hover:bg-blue-600"}
                  text-white
                `}
                onClick={handleItemClick}
                style={{ fontFamily: currentFont?.family }}
              >
                Browse All Categories →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoreDropdown;
