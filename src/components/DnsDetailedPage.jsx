// src/components/DnsDetailedPage.jsx

import React from "react";
import {
  CssBaseline,
  Container,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Header from "./Header";
import Footer from "./Footer";
import ZoneUpdates from "./ZoneUpdates";
import DnsRecordUpdates from "./DnsRecordUpdates";

/**
 * 1) Define the same MUI theme as in VineTable.
 *    (You can extract this into a shared "theme.js" if desired.)
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#02be8e",
    },
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

export default function DnsDetailedPage() {
  return (
    /**
     * 2) Wrap everything in <ThemeProvider> + <CssBaseline>
     *    so we get the same color palette and typography as VineTable.
     */
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* 3) Same Header and Footer layout */}
      <Header />

      {/* 4) Main container with your zone + record updates */}
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Detailed DNS Information
        </Typography>

        {/* Show the big zone updates */}
        <ZoneUpdates />

        {/* Show the big DNS record updates */}
        <DnsRecordUpdates />
      </Container>

      <Footer />
    </ThemeProvider>
  );
}