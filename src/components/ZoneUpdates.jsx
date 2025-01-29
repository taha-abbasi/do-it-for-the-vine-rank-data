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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  // MUI needs these icons:
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * Helper function to format "lastChecked" in UTC
 *   e.g. "25-January-2025 at 13:05 UTC"
 */
function formatUTCDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);

  // Prepare arrays for months
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getUTCDate(); // 1-31
  const monthIndex = date.getUTCMonth(); // 0-11
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours(); // 0-23
  const minutes = date.getUTCMinutes();

  const monthName = months[monthIndex];
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedHours = String(hours).padStart(2, "0");

  return `${day}-${monthName}-${year} at ${paddedHours}:${paddedMinutes} UTC`;
}

export default function ZoneUpdates() {
  const [zoneData, setZoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/zone_updates.json") // Adjust path if needed
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
    // Show a spinner or text while loading
    return (
      <Box sx={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <Typography
          variant="h5"
          sx={{ color: "#000", fontWeight: "bold" }}
          gutterBottom
        >
          🕵️‍♂️ DNS Zone updates
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ marginBottom: "1.5rem", textAlign: "center" }}>
        <Typography
          variant="h5"
          sx={{ color: "#000", fontWeight: "bold" }}
          gutterBottom
        >
          🕵️‍♂️ DNS Zone updates
        </Typography>
        <Typography color="error">
          Error loading zone updates: {error}
        </Typography>
      </Box>
    );
  }

  if (!zoneData) {
    return null;
  }

  const { lastRun, domains } = zoneData;

  return (
    <Box sx={{ marginBottom: "2rem" }}>
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: "#f5f5f5" }}
        >
          <Typography variant="h6" sx={{ color: "#000", fontWeight: "bold" }}>
            🕵️‍♂️ DNS Zone updates
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Last Check: {formatUTCDate(lastRun)}
          </Typography>

          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      backgroundColor: "#02be8e",
                      color: "#ffffff",
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
                {domains.map((item) => {
                  const displayLastChecked = formatUTCDate(item.lastChecked);
                  return (
                    <TableRow key={item.domain}>
                      <TableCell>{item.domain}</TableCell>
                      <TableCell>{item.serial || "N/A"}</TableCell>
                      <TableCell>
                        {item.changed ? "Yes" : "No"}
                        {item.error && ` (Error: ${item.error})`}
                      </TableCell>
                      <TableCell>{displayLastChecked}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
