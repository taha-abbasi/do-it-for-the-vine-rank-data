// src/components/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

function Header() {
  return (
    <AppBar position="static" style={{ backgroundColor: "#02be8e" }}>
      {/* Use a Toolbar with position: relative so we can absolutely center the text */}
      <Toolbar style={{ position: "relative" }}>
        {/* Left-Aligned Logo */}
        <img
          src="/vine_logo_white.svg"
          alt="Vine Logo"
          style={{
            height: 40,
            marginRight: 12,
          }}
        />

        {/* Absolutely Centered Text */}
        <Typography
          variant="h6"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: "bold",
            color: "#ffffff",
          }}
        >
          Do it for the Vine
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;