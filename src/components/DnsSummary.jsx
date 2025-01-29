// src/components/DnsSummary.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function DnsSummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoneChangedCount, setZoneChangedCount] = useState(0);
  const [recordChangedCount, setRecordChangedCount] = useState(0);

  useEffect(() => {
    // 1) minimal fetch of zone_updates.json
    fetch("/zone_updates.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch zone updates");
        return r.json();
      })
      .then((data) => {
        // data.domains => each domain item { domain, changed, ... }
        const changed = data.domains.filter((d) => d.changed).length;
        setZoneChangedCount(changed);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    // 2) minimal fetch of dns_record_updates.json (if you want that summary)
    // (We can do them in separate effect or same effect, up to you.)
    fetch("/dns_record_updates.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch dns record updates");
        return r.json();
      })
      .then((data) => {
        // data.domains => each domain has array of records, 
        // check how many have changed records
        let totalChanged = 0;
        data.domains.forEach((dom) => {
          dom.records.forEach((rec) => {
            if (rec.changed) totalChanged++;
          });
        });
        setRecordChangedCount(totalChanged);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <Typography color="error">
        DNS Summary Error: {error}
      </Typography>
    );
  }

  if (loading) {
    return <div>Loading DNS summary...</div>;
  }

  return (
    <Box sx={{ marginBottom: 2, textAlign: "center" }}>
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        DNS Changes Detected: 
      </Typography>
      <Typography variant="body2">
        Zone changes: {zoneChangedCount}
      </Typography>
      <Typography variant="body2">
        Record changes: {recordChangedCount}
      </Typography>

      <Box sx={{ marginTop: 1 }}>
        <Link to="/dns" style={{ textDecoration: "none", color: "#02be8e", fontWeight: "bold" }}>
          View Detailed DNS Info
        </Link>
      </Box>
    </Box>
  );
}