import React, { useEffect, useState, useRef } from "react";
import {
  CssBaseline,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Box,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import Header from "./Header";
import Footer from "./Footer";
import QuickSummaryHighlights from "./QuickSummaryHighlights";

// 1) Define the MUI theme with Vine colors
const theme = createTheme({
  palette: {
    primary: {
      main: "#02be8e",
    },
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

// 2) Path to the JSON data file
const DATA_FILE = "/top_tokens_with_holders.json";

// 3) VineTable Component
export default function VineTable() {
  // States for data, columns, search, etc.
  const [tokenData, setTokenData] = useState([]); // Raw token data
  const [displayedTokens, setDisplayedTokens] = useState([]); // After filtering by cap
  const [searchTokens, setSearchTokens] = useState([]); // After searching
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const [lastUpdated, setLastUpdated] = useState("");

  // Columns, with CA hidden by default
  const [columns, setColumns] = useState({
    name: true,
    symbol: true,
    holders: true,
    market_cap: true,
    price: false,
    volume_24h: true,
    supply: false,
    ca: false, // contract address column
  });

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  // Sorting
  const [sortField, setSortField] = useState("holders");
  const [sortOrder, setSortOrder] = useState("desc");

  // For column filter menu
  const [anchorEl, setAnchorEl] = useState(null);
  // For scrolling to Vine row
  const vineRef = useRef(null);

  //
  // -----------------------------
  // 4) Fetch data from the JSON file
  // -----------------------------
  //
  useEffect(() => {
    fetch(DATA_FILE)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch token data");
        }
        return response.json();
      })
      .then((data) => {
        // data is expected to have shape: { lastUpdated: string, tokens: array }

        // 1) Save lastUpdated to state
        if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated);
        }

        // 2) Sort tokens by holders desc initially
        const sortedTokens = data.tokens.sort((a, b) => b.holders - a.holders);
        setTokenData(sortedTokens);

        // 3) By default, filter out tokens < 1M cap
        const initialDisplayed = sortedTokens.filter(
          (t) => t.market_cap > 1_000_000
        );
        setDisplayedTokens(initialDisplayed);
        setSearchTokens(initialDisplayed);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  //
  // -----------------------------
  // 5) Sorting helper
  // -----------------------------
  //
  const sortTokens = (arr, field, order) => {
    return [...arr].sort((a, b) => {
      if (order === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  };

  //
  // -----------------------------
  // 6) Show All / Hide tokens < 1M
  // -----------------------------
  //
  const handleShowAll = () => {
    let newDisplayed;
    if (!showAll) {
      // Show everything
      newDisplayed = [...tokenData];
    } else {
      // Hide <1M
      newDisplayed = tokenData.filter((t) => t.market_cap > 1_000_000);
    }

    const sorted = sortTokens(newDisplayed, sortField, sortOrder);
    setDisplayedTokens(sorted);

    // Re-apply search
    const filteredSearch = sorted.filter((t) => matchesSearch(t, searchQuery));
    setSearchTokens(filteredSearch);

    setShowAll(!showAll);
  };

  //
  // -----------------------------
  // 7) Searching by name, symbol, or address (CA)
  // -----------------------------
  //
  const matchesSearch = (token, query) => {
    // Combine name + symbol + address
    const combined = `${token.name.toLowerCase()} ${token.symbol.toLowerCase()} ${token.address.toLowerCase()}`;
    return combined.includes(query);
  };

  const handleSearch = (event) => {
    const q = event.target.value.toLowerCase();
    setSearchQuery(q);

    const filtered = displayedTokens.filter((t) => matchesSearch(t, q));
    setSearchTokens(filtered);
  };

  //
  // -----------------------------
  // 8) Sorting
  // -----------------------------
  //
  const handleSort = (field) => {
    const newOrder =
      sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newOrder);

    const sorted = sortTokens(displayedTokens, field, newOrder);
    // Then re-filter by search
    const filtered = sorted.filter((t) => matchesSearch(t, searchQuery));
    setDisplayedTokens(sorted);
    setSearchTokens(filtered);
  };

  //
  // -----------------------------
  // 9) Toggle columns (including CA)
  // -----------------------------
  //
  const handleColumnToggle = (column) => {
    setColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  //
  // -----------------------------
  // 10) Filter Menu
  // -----------------------------
  //
  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  //
  // -----------------------------
  // 11) Build 3-Item Arrays for QuickSummaryHighlights
  //     (one for holders, one for volume)
  // -----------------------------
  //
  // Use displayedTokens so the rank updates if user toggles <1M
  // => This ensures the mini-tables reflect the current subset
  //

  // *Holders*
  const holdersSorted = [...displayedTokens].sort((a, b) => b.holders - a.holders);
  const vineIndexHolders = holdersSorted.findIndex((t) => t.name === "Vine Coin");
  const threeByHolders = [
    holdersSorted[vineIndexHolders - 1],
    holdersSorted[vineIndexHolders],
    holdersSorted[vineIndexHolders + 1],
  ].filter(Boolean);

  // Attach rank within displayedTokens
  const holdersViewItems = threeByHolders.map((tok) => {
    const absoluteIndex = holdersSorted.findIndex((x) => x.address === tok.address);
    return {
      rank: absoluteIndex + 1, // local rank among displayed holders
      token: tok,
    };
  });

  // *Volume*
  const volumeSorted = [...displayedTokens].sort((a, b) => b.volume_24h - a.volume_24h);
  const vineIndexVolume = volumeSorted.findIndex((t) => t.name === "Vine Coin");
  const threeByVolume = [
    volumeSorted[vineIndexVolume - 1],
    volumeSorted[vineIndexVolume],
    volumeSorted[vineIndexVolume + 1],
  ].filter(Boolean);

  const volumeViewItems = threeByVolume.map((tok) => {
    const absoluteIndex = volumeSorted.findIndex((x) => x.address === tok.address);
    return {
      rank: absoluteIndex + 1, // local rank among displayed by volume
      token: tok,
    };
  });

  // If needed, define a function to handle row click in mini-tables
  const handleMiniTableClick = (token) => {
    // For example, scroll to the row in main table:
    const mainIndex = displayedTokens.findIndex((x) => x.address === token.address);
    if (mainIndex !== -1 && vineRef.current) {
      vineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  //
  // -----------------------------
  // 12) Render
  // -----------------------------
  //
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />

      <Container
        maxWidth="lg"
        style={{
          textAlign: "center",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        <Typography variant="h3" color="primary" gutterBottom>
          Explore the world of Vine Coin and other top tokens.
        </Typography>

        {/* Two 3-item mini-tables: left by holders, right by volume */}
        <QuickSummaryHighlights
          holdersViewItems={holdersViewItems}
          volumeViewItems={volumeViewItems}
          onRowClick={handleMiniTableClick}
        />

        {/* EXAMPLE: Display "Last Updated" (if any) just below quick summaries, top-right */}
        {!loading && lastUpdated && (
          <Box style={{ textAlign: "right", fontStyle: "italic", marginBottom: "1rem" }}>
            Last Updated: {lastUpdated}
          </Box>
        )}

        {/* Main Table Header (includes small search bar) */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{
            marginBottom: "0rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" style={{ flex: 1, textAlign: "center" }}>
            Rank by {sortField.replace("_", " ").toUpperCase()}
          </Typography>

          {/* Updated placeholder for searching name, symbol, or CA */}
          <TextField
            label="Search by name, symbol, or CA"
            variant="outlined"
            size="small"
            style={{ marginRight: "1rem", width: "200px" }}
            value={searchQuery}
            onChange={handleSearch}
          />

          <Tooltip title="Toggle Columns">
            <IconButton onClick={handleOpenMenu}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            onClick={handleShowAll}
            style={{ marginLeft: "1rem" }}
          >
            {showAll ? "Hide Tokens < 1M Cap" : "Show All"}
          </Button>
        </Box>

        {/* Main Table (sticky header) */}
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 800,
            overflow: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow
                sx={{
                  // ensures each header cell is green, text is white
                  "& th": {
                    backgroundColor: "#02be8e",
                    color: "#ffffff",
                    fontWeight: "bold",
                  },
                }}
              >
                <TableCell>Rank</TableCell>

                {columns.name && (
                  <TableCell
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Name{" "}
                    {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}

                {columns.symbol && (
                  <TableCell
                    onClick={() => handleSort("symbol")}
                    style={{ cursor: "pointer" }}
                  >
                    Symbol{" "}
                    {sortField === "symbol" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}

                {columns.holders && (
                  <TableCell
                    onClick={() => handleSort("holders")}
                    style={{ cursor: "pointer" }}
                  >
                    Holders{" "}
                    {sortField === "holders" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}

                {columns.market_cap && (
                  <TableCell
                    onClick={() => handleSort("market_cap")}
                    style={{ cursor: "pointer" }}
                  >
                    Market Cap ($){" "}
                    {sortField === "market_cap" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}

                {columns.price && (
                  <TableCell
                    onClick={() => handleSort("price")}
                    style={{ cursor: "pointer" }}
                  >
                    Price{" "}
                    {sortField === "price" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}

                {columns.volume_24h && (
                  <TableCell
                    onClick={() => handleSort("volume_24h")}
                    style={{ cursor: "pointer" }}
                  >
                    24H Volume ($){" "}
                    {sortField === "volume_24h" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}

                {columns.supply && (
                  <TableCell
                    onClick={() => handleSort("supply")}
                    style={{ cursor: "pointer" }}
                  >
                    Supply{" "}
                    {sortField === "supply" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}

                {/* CA column toggled via filter */}
                {columns.ca && (
                  <TableCell
                    onClick={() => handleSort("address")}
                    style={{ cursor: "pointer" }}
                  >
                    CA{" "}
                    {sortField === "address" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {searchTokens.map((token) => (
                <TableRow key={token.address} ref={token.name === "Vine Coin" ? vineRef : null}>
                  {/* Rank in main table */}
                  <TableCell>
                    {displayedTokens.indexOf(token) + 1}
                  </TableCell>

                  {/* Name with logo if available */}
                  {columns.name && (
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
                  )}

                  {columns.symbol && <TableCell>{token.symbol}</TableCell>}

                  {columns.holders && (
                    <TableCell>{token.holders.toLocaleString()}</TableCell>
                  )}
                  {columns.market_cap && (
                    <TableCell>
                      {token.market_cap?.toLocaleString() || "N/A"}
                    </TableCell>
                  )}
                  {columns.price && (
                    <TableCell>{token.price?.toFixed(6) || "N/A"}</TableCell>
                  )}
                  {columns.volume_24h && (
                    <TableCell>
                      {token.volume_24h?.toLocaleString() || "N/A"}
                    </TableCell>
                  )}
                  {columns.supply && (
                    <TableCell>
                      {token.supply?.toLocaleString() || "N/A"}
                    </TableCell>
                  )}

                  {/* CA column */}
                  {columns.ca && (
                    <TableCell
                      style={{
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                      }}
                    >
                      {token.address}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Filter Menu (columns) */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          {Object.keys(columns).map((col) => (
            <MenuItem key={col}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columns[col]}
                    onChange={() => handleColumnToggle(col)}
                  />
                }
                label={col.replace("_", " ").toUpperCase()}
              />
            </MenuItem>
          ))}
        </Menu>
      </Container>

      <Footer />
    </ThemeProvider>
  );
}