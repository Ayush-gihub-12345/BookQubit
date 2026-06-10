"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/layout/navbar/Navbar";
import Footer from "@/layout/footer/Footer";
import GoToUp from "@/utils/GoToUp";
import ScrollToTop from "@/utils/ScrollToTop";

export default function PublicLayout({ children }) {
  const pathname = usePathname();

  const isSocialApp = pathname.includes("/drift");

  return (
    <>
      <ScrollToTop
        behavior="smooth"
        onMount={true}
        onRouteChange={true}
      />

      <Navbar hideSecondRow={isSocialApp} />

      <main>
        {children}
      </main>

      {!isSocialApp && <Footer />}

      {!isSocialApp && (
        <GoToUp
          showAfter={300}
          smooth={true}
        />
      )}
    </>
  );
}