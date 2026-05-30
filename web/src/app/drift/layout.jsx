// src/app/drift/layout.jsx

import DriftSlider from "@/components_drift/layout/slider";
import DriftNavbar from "@/components_drift/layout/navbar";
import DriftRightSlider from "@/components_drift/layout/rightslider";

export const metadata = {
  title: "Drift | BookQubit",
  description:
    "Drift is the social discovery platform by BookQubit where readers, authors, and creators connect through books, comics, ideas, and trends.",
  openGraph: {
    title: "Drift | BookQubit",
    description:
      "Join Drift — the social side of BookQubit.",
    siteName: "Drift",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drift | BookQubit",
    description:
      "The social reading and discovery platform by BookQubit.",
  },
};

export default function DriftLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DriftSlider />
      
      <div className="lg:ml-[280px]">
        <DriftNavbar />
        
        <div className="flex justify-center">
          <main className="flex-1 max-w-2xl bg-white border-x border-gray-200 min-h-[calc(100vh-60px)]">
            {children}
          </main>
          
          <DriftRightSlider />
        </div>
      </div>
    </div>
  );
}