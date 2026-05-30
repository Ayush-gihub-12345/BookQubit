"use client";

import React from "react";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaXTwitter,
  FaWhatsapp,
  FaPinterest,
} from "react-icons/fa6";
import { useTheme } from "@/themes/useTheme";

const SocialFooter = () => {
  const { theme, themeName } = useTheme();

  if (!theme) return null;

  const isDarkMode = themeName === 'dark' || themeName === 'midnight' || themeName === 'cyberpunk';

  const socialLinks = [
    { icon: <FaYoutube />, href: "https://www.youtube.com/@BookQubit", name: "YouTube" },
    { icon: <FaInstagram />, href: "https://www.instagram.com/bookqubit?igsh=MnE1OGEwYW94eDZ3", name: "Instagram" },
    { icon: <FaFacebook />, href: "https://facebook.com/bookqubit", name: "Facebook" },
    { icon: <FaXTwitter />, href: "https://x.com/bookqubit", name: "X (Twitter)" },
    { icon: <FaWhatsapp />, href: "https://wa.me/1234567890", name: "WhatsApp Channel" },
    { icon: <FaPinterest />, href: "https://www.pinterest.com/bookqubit", name: "Pinterest" },
  ];

  return (
    <section className={`${theme.background?.section || 'bg-white dark:bg-gray-900'}`}>
      <div className="flex justify-center space-x-6 py-6">
        {socialLinks.map((social, index) => (
          <a
            key={index}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              ${theme.textColors?.secondary || (isDarkMode ? 'text-gray-400' : 'text-gray-600')}
              ${isDarkMode ? 'hover:text-sky-400' : 'hover:text-sky-600'}
              transition-all duration-300
              text-2xl
              hover:scale-110
              focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
              ${isDarkMode ? "focus:ring-offset-gray-900" : "focus:ring-offset-white"}
            `}
            aria-label={`Visit our ${social.name} page`}
          >
            {social.icon}
          </a>
        ))}
      </div>
    </section>
  );
};

export default SocialFooter;