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

/**
 * This component fetches "/zone_updates.json" from public/zone_updates.json
 * and displays domain info in a MUI table. 
 */
export default function ZoneUpdates() {
  const [zoneData, setZoneData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/zone_updates.json")  // Adjust path if needed
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
      <Box sx={{ marginBottom: "1.5rem" }}>
        <Typography variant="h6" color="primary" gutterBottom>
          DNS Zone Updates
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ marginBottom: "1.5rem" }}>
        <Typography variant="h6" color="primary" gutterBottom>
          DNS Zone Updates
        </Typography>
        <Typography color="error">
          Error loading zone updates: {error}
        </Typography>
      </Box>
    );
  }

  if (!zoneData) {
    return null; // or some fallback
  }

  const { lastRun, domains } = zoneData;

  return (
    <Box sx={{ marginBottom: "2rem" }}>
      <Typography variant="h5" color="primary" gutterBottom>
        DNS Zone Updates
      </Typography>
      <Typography variant="body2" sx={{ marginBottom: 2 }}>
        Last Check: {lastRun}
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
              {/* Or show "error" if you want a column for that */}
            </TableRow>
          </TableHead>
          <TableBody>
            {domains.map((item) => (
              <TableRow key={item.domain}>
                <TableCell>{item.domain}</TableCell>
                <TableCell>{item.serial || "N/A"}</TableCell>
                <TableCell>
                  {item.changed ? "Yes" : "No"}
                  {item.error && ` (Error: ${item.error})`}
                </TableCell>
                <TableCell>{item.lastChecked}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}