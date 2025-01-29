// src/components/DnsDetailedPage.jsx
import React from "react";
import { Container, Typography } from "@mui/material";
import ZoneUpdates from "./ZoneUpdates";
import DnsRecordUpdates from "./DnsRecordUpdates";

export default function DnsDetailedPage() {
  return (
    <Container maxWidth="lg" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <Typography variant="h4" style={{ marginBottom: "1rem" }}>
        DNS Detailed Page
      </Typography>

      {/* Show the full zone updates */}
      <ZoneUpdates />

      {/* Show the full DNS record updates */}
      <DnsRecordUpdates />
    </Container>
  );
}