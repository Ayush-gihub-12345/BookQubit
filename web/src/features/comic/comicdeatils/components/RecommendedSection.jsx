"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import ComicCard from "./ComicCard";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const RecommendedSection = ({
  title,
  comics,
  isDarkMode,
  theme,
  t,
  type = "carousel",
}) => {
  if (!comics || comics.length === 0) return null;

  if (type === "grid") {
    return (
      <div className="mt-12">
        <h2
          className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-6`}
        >
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {comics.map((comic) => (
            <ComicCard
              key={comic.id || comic.slug}
              comic={comic}
              isDarkMode={isDarkMode}
              theme={theme}
              t={t}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2
        className={`text-2xl font-bold ${theme.textColors?.primary || (isDarkMode ? "text-white" : "text-gray-900")} mb-6`}
      >
        {title}
      </h2>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="pb-12"
      >
        {comics.map((comic) => (
          <SwiperSlide key={comic.id || comic.slug}>
            <ComicCard
              comic={comic}
              isDarkMode={isDarkMode}
              theme={theme}
              t={t}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default RecommendedSection;
