// src/components_drift/explore/ExploreHeader.jsx

"use client";

import { useRouter } from "next/navigation";

export default function ExploreHeader() {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        <button 
          onClick={() => router.back()}
          className="lg:hidden text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Explore
        </h1>
        
        <button className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}