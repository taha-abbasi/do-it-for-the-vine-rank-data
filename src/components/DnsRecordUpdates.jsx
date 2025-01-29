// src/components/DnsRecordUpdates.jsx
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

/**
 * Utility to format the 'lastRun' in UTC
 * e.g. "29-January-2025 at 03:01 UTC"
 */
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
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
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
      <Box sx={{ marginBottom: "1rem", textAlign: "center" }}>
        <Typography variant="h5" sx={{ color: "#000", fontWeight: "bold" }}>
          DNS Record Updates
        </Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ marginBottom: "1rem", textAlign: "center" }}>
        <Typography variant="h5" sx={{ color: "#000", fontWeight: "bold" }}>
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
    <Box sx={{ marginBottom: "2rem" }}>
      <Accordion defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6" sx={{ color: "#000", fontWeight: "bold" }}>
            DNS Record Updates
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Last Scan: {formattedLastRun}
          </Typography>

          {domains.map((domainObj) => (
            <Box key={domainObj.domain} sx={{ marginBottom: "1.5rem" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#333" }}>
                {domainObj.domain}
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 350, marginTop: 1 }}>
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
                      <TableCell>Type</TableCell>
                      <TableCell>Old</TableCell>
                      <TableCell>Current</TableCell>
                      <TableCell>Changed?</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {domainObj.records.map((rec, idx) => (
                      <TableRow key={`${domainObj.domain}-${rec.type}-${idx}`}>
                        <TableCell>{rec.type}</TableCell>

                        {/* OLD: split on whitespace, map each item to its own line */}
                        <TableCell>
                          {rec.old.trim() ? (
                            rec.old
                              .trim()
                              .split(/\s+/)
                              .map((item, i) => <div key={i}>{item}</div>)
                          ) : (
                            <i>N/A</i>
                          )}
                        </TableCell>

                        {/* CURRENT: likewise */}
                        <TableCell>
                          {rec.current.trim() ? (
                            rec.current
                              .trim()
                              .split(/\s+/)
                              .map((item, i) => <div key={i}>{item}</div>)
                          ) : (
                            <i>N/A</i>
                          )}
                        </TableCell>

                        <TableCell>{rec.changed ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}