// components/dashboardnavbar/DashboardHubNavbar.jsx
"use client";

import Link from "next/link";
import { HiMenu, HiBell, HiSearch } from "react-icons/hi";

const DashboardHubNavbar = ({ toggleSidebar }) => {
  return (
    <header
      className="
        h-16 bg-white shadow-md
        flex items-center justify-between px-6
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="text-2xl text-blue-600 transition duration-200"
        >
          <HiMenu />
        </button>

        {/* Clickable Dashboard Title */}
        <Link href="/dashboardhub" className="cursor-pointer">
          <h1
            className="
              text-lg font-semibold text-gray-800
              hover:underline underline-offset-2
              decoration-green-600 decoration-2
            "
          >
            BookQubit Dashboard Hub
          </h1>
        </Link>
      </div>

      {/* CENTER SEARCH */}
      <div
        className="
          hidden md:flex items-center 
          bg-white rounded-lg px-3 py-2 w-96
          ring-1 ring-inset ring-black/10
        "
      >
        <HiSearch className="text-gray-500 text-lg mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-6">
        {/* Notification */}
        <div className="relative cursor-pointer">
          <HiBell className="text-2xl text-blue-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            3
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="https://i.pravatar.cc/40"
            alt="profile"
            className="w-9 h-9 object-cover rounded-xl"
          />
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHubNavbar;
