// src/components/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";

/**
 * Header with:
 *   - Left: Clickable logo => Home
 *   - Center: "Do it for the Vine"
 *   - Right: multiple links
 */
function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#02be8e" }}>
      <Toolbar sx={{ position: "relative" }}>
        {/* Left-Aligned Logo => home page */}
        <a href="/" style={{ textDecoration: "none" }}>
          <img
            src="/vine_logo_white.svg"
            alt="Vine Logo"
            style={{ height: 40, marginRight: 12 }}
          />
        </a>

        {/* Centered Text */}
        <Typography
          variant="h6"
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: "bold",
            color: "#ffffff",
          }}
        >
          Do it for the Vine
        </Typography>

        {/* Right-Aligned Links */}
        <Box
          sx={{
            position: "absolute",
            right: 16,
            display: "flex",
            gap: "1rem",
          }}
        >
          <a
            href="https://github.com/taha-abbasi/do-it-for-the-vine-rank-data"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Edit on GitHub
          </a>

          <a
            href="https://github.com/taha-abbasi/do-it-for-the-vine-rank-data/discussions/categories/ideas"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Submit Vine Ideas
          </a>

          <a
            href="https://x.com/i/communities/1882668779890500022"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            Vine Tribe
          </a>

          {/* Internal link to /dns */}
          <a
            href="/dns"
            style={{ color: "#fff", textDecoration: "none" }}
          >
            DNS
          </a>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;