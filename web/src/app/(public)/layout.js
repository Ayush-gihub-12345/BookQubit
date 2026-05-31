"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/layout/navbar/Navbar";
import Footer from "@/layout/footer/Footer";
import GoToUp from "@/utils/GoToUp";
import ScrollToTop from "@/utils/ScrollToTop";

export default function PublicLayout({ children }) {
  const pathname = usePathname();
  
  // Check if current route should hide navbar and footer
  const isSocialApp = pathname === "/drift" || pathname.startsWith("/drift/");
  
  return (
    <>
      <ScrollToTop behavior="smooth" onMount={true} onRouteChange={true} />
      {!isSocialApp && <Navbar />}
      <main className={isSocialApp ? "no-navbar-footer" : ""}>
        {children}
      </main>
      {!isSocialApp && <Footer />}
      {!isSocialApp && <GoToUp showAfter={300} smooth={true} />}
    </>
  );
}