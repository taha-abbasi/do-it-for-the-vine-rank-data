// src/components/ZoneSummary.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function ZoneSummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ changedCount: 0, total: 0 });

  useEffect(() => {
    fetch("/zone_updates.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch zone summary");
        return res.json();
      })
      .then((data) => {
        // data.domains => each has { domain, changed, ... }
        const changedCount = data.domains.filter((d) => d.changed).length;
        const total = data.domains.length;
        setSummary({ changedCount, total });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading zone summary...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const { changedCount, total } = summary;
  return (
    <Box sx={{ marginBottom: "1rem" }}>
      <Typography variant="body1">
        DNS Zone: {changedCount} / {total} domains changed
      </Typography>
      <Typography variant="body2">
        <Link to="/dns">View DNS Details</Link>
      </Typography>
    </Box>
  );
}