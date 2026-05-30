"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaStar, FaFire, FaArrowRight, FaClock, FaInfoCircle } from "react-icons/fa";

const ThirdPartyAD = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const book = {
    title: "Shraddhuism",
    slug: "shraddhuism",
    author: "Sachin Chakrawarti",
    price: "$12.99",
    rating: 4.8,
    description: "A unique philosophical and spiritual expression of true love — Shraddhuism is Sachin Chakrawarti's lifelong devotion to Shraddha Kapoor since 2013.",
    imageUrl: "https://i.pinimg.com/736x/c4/90/2b/c4902b3a05912f217a7c8a1508259892.jpg",
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8 group relative">
      {/* Small "AD" Label above the card */}
      <div className="flex justify-end mb-1 mr-2">
        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <FaInfoCircle className="text-[8px]" /> Sponsored Ad
        </span>
      </div>

      {/* Main Card Container */}
      <div className="relative p-[2px] overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 animate-gradient-x shadow-2xl">
        
        <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-[14px] p-5 flex flex-col md:flex-row gap-6">
          
          {/* Ad Badge Over Image */}
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-black/40 backdrop-blur-md border border-white/10 text-white/70 text-[9px] font-bold px-2 py-0.5 rounded">
              AD
            </span>
          </div>

          {/* Book Cover */}
          <div className="relative w-32 h-44 mx-auto md:mx-0 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
            <div className="absolute -inset-1 bg-orange-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition"></div>
            <img
              src={book.imageUrl}
              alt={book.title}
              className="relative w-full h-full object-cover rounded-lg border border-white/10 shadow-2xl"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded italic">
                    HOT
                  </span>
                  <span className="text-orange-400 text-[11px] font-bold tracking-tighter flex items-center gap-1">
                    <FaFire className="animate-bounce" /> NEW RELEASE
                  </span>
                </div>

                {/* Live Timer */}
                <div className="text-right">
                  <p className="text-gray-500 text-[9px] font-bold uppercase tracking-tight mb-1">Ends in</p>
                  <div className="flex gap-1 font-mono text-xs text-white">
                    <span className="bg-white/5 border border-white/10 px-1 rounded">{timeLeft.hours}h</span>
                    <span className="text-orange-500 animate-pulse">:</span>
                    <span className="bg-white/5 border border-white/10 px-1 rounded">{timeLeft.minutes}m</span>
                    <span className="text-orange-500 animate-pulse">:</span>
                    <span className="bg-white/5 border border-white/10 px-1 rounded text-orange-400">{timeLeft.seconds}s</span>
                  </div>
                </div>
              </div>

              <h4 className="text-white font-black text-2xl mt-1 leading-tight tracking-tight">
                {book.title}
              </h4>
              <p className="text-gray-400 text-xs mt-1">By <span className="text-gray-200 font-semibold">{book.author}</span></p>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex text-yellow-500 text-[10px]">
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
                <span className="text-white/40 text-[10px] font-bold underline decoration-orange-500/50 underline-offset-4">Top Rated Choice</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-white font-black text-2xl tracking-tighter">
                  {book.price}
                </span>
                <span className="text-green-500 text-[10px] font-bold italic">Free Shipping</span>
              </div>

              <Link
                href={`/book/${book.slug}`}
                className="group/btn relative overflow-hidden bg-white text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Claim Deal <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyAD;