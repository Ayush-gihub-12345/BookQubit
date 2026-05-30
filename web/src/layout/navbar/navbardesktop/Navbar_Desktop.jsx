

"use client";

import React from "react";
import Navbar_Desktop_First_Row from "./Navbar_Desktop_First_Row";
import Navbar_Desktop_Second_Row from "./Navbar_Desktop_Second_Row";
import "./Navbar_Desktop.css";

const Navbar_Desktop = () => {
  return (
    <div className="navbar-desktop-wrapper">
      <Navbar_Desktop_First_Row />
      <Navbar_Desktop_Second_Row />
    </div>
  );
};

export default Navbar_Desktop;