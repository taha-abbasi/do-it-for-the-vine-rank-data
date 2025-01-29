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
  CircularProgress,
} from "@mui/material";

/**
 * Attempts to parse either:
 *  - An ISO string like "2025-01-28T20:43:22Z"
 *  - A MySQL-ish string like "2025-01-28 20:43:22"
 * Returns a JS Date or null if invalid.
 */
function parseDateString(dateStr) {
  if (!dateStr) return null;
  // If it looks ISO (has 'T'), try new Date() directly
  if (dateStr.includes("T")) {
    const parsed = new Date(dateStr);
    return isNaN(parsed) ? null : parsed;
  }

  // Else assume "YYYY-MM-DD HH:mm:ss"
  // e.g. "2025-01-28 20:43:22"
  const [ymd, hms] = dateStr.split(" ");
  if (!ymd || !hms) return null;
  const [year, month, day] = ymd.split("-");
  const [hour, min, sec] = hms.split(":");
  // Construct a date in UTC
  const d = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(min),
      Number(sec)
    )
  );
  return isNaN(d) ? null : d;
}

/**
 * Format a date/time (ISO or fallback) into "DD-Month-YYYY at HH:mm UTC"
 * e.g. "28-January-2025 at 20:43 UTC"
 */
function formatUTCDate(dateStr) {
  const dt = parseDateString(dateStr);
  if (!dt) return "";

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const day = dt.getUTCDate(); 
  const monthName = months[dt.getUTCMonth()];
  const year = dt.getUTCFullYear();
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mm = String(dt.getUTCMinutes()).padStart(2, "0");

  return `${day}-${monthName}-${year} at ${hh}:${mm} UTC`;
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