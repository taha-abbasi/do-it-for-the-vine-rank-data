// src/components/ZoneUpdates.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress
} from "@mui/material";

// No more <Accordion> or <AccordionSummary> or <AccordionDetails>
// We'll do a plain table.

function formatUTCDate(isoString) {
  // your date format code
}

export default function ZoneUpdates() {
  const [zoneData, setZoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/zone_updates.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch zone updates: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setZoneData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching zone updates:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ my: 2, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          DNS Zone Updates
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          DNS Zone Updates
        </Typography>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!zoneData) return null;

  return (
    <Box sx={{ mb: 3, textAlign: "left" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
        DNS Zone (SOA) Updates
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        Last Check: {formatUTCDate(zoneData.lastRun)}
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  backgroundColor: "#02be8e",
                  color: "#fff",
                  fontWeight: "bold",
                },
              }}
            >
              <TableCell>Domain</TableCell>
              <TableCell>Serial</TableCell>
              <TableCell>Changed</TableCell>
              <TableCell>Last Checked</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zoneData.domains.map((item) => {
              const checkedTime = formatUTCDate(item.lastChecked);
              return (
                <TableRow key={item.domain}>
                  <TableCell>{item.domain}</TableCell>
                  <TableCell>{item.serial || "N/A"}</TableCell>
                  <TableCell>
                    {item.changed ? "Yes" : "No"}
                    {item.error && ` (Error: ${item.error})`}
                  </TableCell>
                  <TableCell>{checkedTime}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}