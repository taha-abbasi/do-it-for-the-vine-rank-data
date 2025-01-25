// src/components/QuickSummaryHighlights.jsx

import React from "react";
import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";

/**
 * Props:
 * - holdersViewItems: an array of 3 objects, each { rank: <number>, token: <tokenData> }
 * - volumeViewItems: an array of 3 objects, each { rank: <number>, token: <tokenData> }
 * - onRowClick: a function called when clicking any row (if desired)
 */
function QuickSummaryHighlights({
  holdersViewItems,
  volumeViewItems,
  onRowClick,
}) {
  return (
    <Grid container spacing={3} sx={{ marginBottom: 3 }}>
      {/* Left Column -> Rank by Holders */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            // Set total column height
            height: 372,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" sx={{ paddingY: 1 }}>
            Rank by Holders
          </Typography>

          {/* Scrollable area below the heading */}
          <Box sx={{ flex: 1, overflow: "auto" }}>
            <TableContainer component={Paper} sx={{ height: "100%" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#02be8e" }}>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Rank
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Symbol
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Holders
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Market Cap ($)
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      24H Volume ($)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holdersViewItems.map(({ rank, token }) => (
                    <TableRow
                      key={token.address}
                      onClick={() => onRowClick?.(token)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor:
                          token.name === "Vine Coin" ? "#e8f8f3" : "inherit",
                      }}
                    >
                      <TableCell>{rank}</TableCell>
                      <TableCell>
                        {token.icon && (
                          <img
                            src={token.icon}
                            alt={token.name}
                            style={{
                              width: 24,
                              height: 24,
                              marginRight: 8,
                              verticalAlign: "middle",
                            }}
                          />
                        )}
                        {token.name}
                      </TableCell>
                      <TableCell>{token.symbol}</TableCell>
                      <TableCell>{token.holders.toLocaleString()}</TableCell>
                      <TableCell>
                        {token.market_cap?.toLocaleString() || "N/A"}
                      </TableCell>
                      <TableCell>
                        {token.volume_24h?.toLocaleString() || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Grid>

      {/* Right Column -> Rank by Volume */}
      <Grid item xs={12} md={6}>
        <Box
          sx={{
            height: 372,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h5" sx={{ paddingY: 1 }}>
            Rank by Volume
          </Typography>

          <Box sx={{ flex: 1, overflow: "auto" }}>
            <TableContainer component={Paper} sx={{ height: "100%" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#02be8e" }}>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Rank
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Symbol
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Holders
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      Market Cap ($)
                    </TableCell>
                    <TableCell sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      24H Volume ($)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volumeViewItems.map(({ rank, token }) => (
                    <TableRow
                      key={token.address}
                      onClick={() => onRowClick?.(token)}
                      sx={{
                        cursor: "pointer",
                        backgroundColor:
                          token.name === "Vine Coin" ? "#e8f8f3" : "inherit",
                      }}
                    >
                      <TableCell>{rank}</TableCell>
                      <TableCell>
                        {token.icon && (
                          <img
                            src={token.icon}
                            alt={token.name}
                            style={{
                              width: 24,
                              height: 24,
                              marginRight: 8,
                              verticalAlign: "middle",
                            }}
                          />
                        )}
                        {token.name}
                      </TableCell>
                      <TableCell>{token.symbol}</TableCell>
                      <TableCell>{token.holders.toLocaleString()}</TableCell>
                      <TableCell>
                        {token.market_cap?.toLocaleString() || "N/A"}
                      </TableCell>
                      <TableCell>
                        {token.volume_24h?.toLocaleString() || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default QuickSummaryHighlights;