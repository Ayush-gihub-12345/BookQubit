import React from "react";

const CollectionHeader = ({ title, theme, isDarkMode }) => {
  return (
    <h1
      className={`text-4xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-8 text-center`}
    >
      {title}
    </h1>
  );
};

export default CollectionHeader;