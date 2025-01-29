// src/components/DnsDetailedPage.jsx
import React from "react";
import { Container, Typography } from "@mui/material";
import ZoneUpdates from "./ZoneUpdates";
import DnsRecordUpdates from "./DnsRecordUpdates";

export default function DnsDetailedPage() {
  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 2 }}>
        Detailed DNS Information
      </Typography>

      {/* Show the big zone updates */}
      <ZoneUpdates />

      {/* Show the big DNS record updates */}
      <DnsRecordUpdates />
    </Container>
  );
}