"use client";

import Navbar_Desktop from "./navbardesktop/Navbar_Desktop";
import Navbar_Mobile from "./navbarmobile/Navbar_Mobile";
import { useRTL } from "@/contexts/RTLContext";

const Navbar = ({ hideSecondRow = false }) => {
  const { direction } = useRTL();

  return (
    <>
      <div className="block md:hidden" dir={direction}>
        <Navbar_Mobile />
      </div>

      <div className="hidden md:block" dir={direction}>
        <Navbar_Desktop hideSecondRow={hideSecondRow} />
      </div>
    </>
  );
};

export default Navbar;