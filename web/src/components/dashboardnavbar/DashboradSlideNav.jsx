"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiChevronDown } from "react-icons/hi";
import navItems from "./DashboardHubSidebarNavitemData";

const DashboardHubSideNav = ({ collapsed }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const pathname = usePathname();

  const toggleMenu = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  const isActive = (path) => pathname === path;

  return (
    <div
      className={`
        bg-gradient-to-br from-green-100 to-white
        shadow-lg
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
        h-[calc(100vh-4rem)]
        overflow-y-auto
      `}
    >
      <div className="mt-4 space-y-1 px-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isOpen = openMenu === index;

          return (
            <div key={index}>
              {/* MAIN MENU */}
              {item.children ? (
                // If item has children, toggle submenu
                <div
                  onClick={() => toggleMenu(index)}
                  className={`
                    flex items-center justify-between 
                    px-3 py-3 cursor-pointer
                    rounded-lg
                    hover:bg-green-50
                    transition
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-xl text-green-600" />
                    {!collapsed && (
                      <span className="text-sm font-medium text-gray-800">
                        {item.title}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <HiChevronDown
                      className={`transition-transform ${isOpen ? "rotate-180" : ""} text-gray-600`}
                    />
                  )}
                </div>
              ) : (
                // If no children, make the main menu clickable
                <Link
                  href={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-3 cursor-pointer
                    rounded-lg
                    transition
                    ${
                      isActive(item.path)
                        ? "bg-gradient-to-r from-green-600 to-green-500 text-white"
                        : "text-gray-800 hover:bg-green-50"
                    }
                  `}
                >
                  <Icon
                    className={`text-xl ${isActive(item.path) ? "text-white" : "text-green-600"}`}
                  />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </Link>
              )}

              {/* SUB MENU */}
              {!collapsed && item.children && isOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child, i) => (
                    <Link
                      key={i}
                      href={child.path}
                      className={`
                        block px-3 py-2 text-sm
                        rounded-lg
                        transition
                        ${
                          isActive(child.path)
                            ? "bg-gradient-to-r from-green-600 to-green-500 text-white"
                            : "text-gray-600 hover:bg-green-50"
                        }
                      `}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHubSideNav;
