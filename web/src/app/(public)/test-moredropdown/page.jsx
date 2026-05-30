"use client";

import MoreDropdown from "@/layout/navbar/navbardesktop/components/MoreDropdown";

export default function TestMoreDropdownPage() {
  const handleItemClick = () => {
    console.log("Item clicked");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Testing MoreDropdown</h1>
      <MoreDropdown onItemClick={handleItemClick} darkMode={false} />
    </div>
  );
}
