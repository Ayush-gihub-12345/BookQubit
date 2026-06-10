"use client";

import "./DashboardSidebar.css";

export default function DashboardSidebar({
  activeMenu,
  setActiveMenu,
}) {
  const menus = [
    "Dashboard",
    "Books",
    "Reading",
    "Reviews",
    "Followers",
    "Settings",
  ];

  return (
    <aside className="dashboard-sidebar">
      <h3>Menu</h3>

      <ul>
        {menus.map((menu) => (
          <li
            key={menu}
            className={
              activeMenu === menu ? "active" : ""
            }
            onClick={() => setActiveMenu(menu)}
          >
            {menu}
          </li>
        ))}
      </ul>
    </aside>
  );
}