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

function formatUTCDate(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const day = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2,"0");
  const minutes = String(date.getUTCMinutes()).padStart(2,"0");
  const monthName = months[monthIndex];
  return `${day}-${monthName}-${year} at ${hours}:${minutes} UTC`;
}

export default function DnsRecordUpdates() {
  const [recordData, setRecordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/dns_record_updates.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch DNS record updates: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setRecordData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching DNS record data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ mb: 1, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          DNS Record Updates
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 1, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          DNS Record Updates
        </Typography>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!recordData) return null;

  const { lastRun, domains } = recordData;
  const formattedLastRun = formatUTCDate(lastRun);

  return (
    <Box sx={{ mb: 2, textAlign: "left" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
        DNS Record Updates
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Last Scan: {formattedLastRun}
      </Typography>

      {domains.map((domainObj) => (
        <Box key={domainObj.domain} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
            {domainObj.domain}
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              mt: 1,
              // Optionally set a maxWidth or horizontal scroll:
              // maxWidth: 900,
              // overflowX: "auto",
            }}
          >
            <Table
              stickyHeader
              sx={{
                // Force fixed layout so widths are respected
                tableLayout: "fixed",
                width: "100%",
              }}
            >
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
                  {/* We allocate 10% to Type, 35% to Old, 35% to Current, 20% to Changed? */}
                  <TableCell
                    sx={{
                      width: "10%",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    Type
                  </TableCell>

                  <TableCell
                    sx={{
                      width: "35%",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    Old
                  </TableCell>

                  <TableCell
                    sx={{
                      width: "35%",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    Current
                  </TableCell>

                  <TableCell
                    sx={{
                      width: "20%",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    Changed?
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {domainObj.records.map((rec, idx) => {
                  const oldTrimmed = rec.old.trim();
                  const currentTrimmed = rec.current.trim();
                  return (
                    <TableRow key={`${domainObj.domain}-${rec.type}-${idx}`}>
                      <TableCell>{rec.type}</TableCell>

                      {/* OLD data, split lines or show N/A */}
                      <TableCell
                        sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                      >
                        {oldTrimmed
                          ? oldTrimmed.split(/\s+/).map((item, i) => (
                              <div key={i}>{item}</div>
                            ))
                          : <i>N/A</i>}
                      </TableCell>

                      {/* CURRENT data */}
                      <TableCell
                        sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
                      >
                        {currentTrimmed
                          ? currentTrimmed.split(/\s+/).map((item, i) => (
                              <div key={i}>{item}</div>
                            ))
                          : <i>N/A</i>}
                      </TableCell>

                      <TableCell>{rec.changed ? "Yes" : "No"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}