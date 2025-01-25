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
  AppBar,
  Toolbar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";

// Define the theme with Vine colors
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

// Path to the local JSON file
const DATA_FILE = "/top_tokens_with_holders.json";

export default function VineTable() {
  const [tokenData, setTokenData] = useState([]); // All token data
  const [displayedTokens, setDisplayedTokens] = useState([]); // Filtered or unfiltered tokens
  const [searchTokens, setSearchTokens] = useState([]); // Tokens filtered by search query
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [showAll, setShowAll] = useState(false); // Show all tokens or only filtered tokens
  const [columns, setColumns] = useState({
    name: true,
    symbol: true,
    holders: true,
    market_cap: true,
    price: false, // Hidden by default
    volume_24h: true,
    supply: false, // Hidden by default
  });
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [sortField, setSortField] = useState("holders"); // Default sorting field
  const [sortOrder, setSortOrder] = useState("desc"); // Default sorting order

  const [anchorEl, setAnchorEl] = useState(null); // State for dropdown menu
  const vineRef = useRef(null); // Reference to the Vine Coin row in the main table

  // -----------------------------
  // Fetch data from the JSON file
  // -----------------------------
  useEffect(() => {
    fetch(DATA_FILE)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch token data");
        }
        return response.json();
      })
      .then((data) => {
        // Initial sort by holders (desc) without storing rank in the object
        const sortedData = data.sort((a, b) => b.holders - a.holders);

        setTokenData(sortedData);

        // Default filter: tokens with market_cap > 1M
        const initialDisplayed = sortedData.filter(
          (token) => token.market_cap > 1_000_000
        );
        setDisplayedTokens(initialDisplayed);
        setSearchTokens(initialDisplayed); // initialize searchTokens
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, []);

  // -----------------------------
  // Show All / Hide <1M
  // -----------------------------
  const handleShowAll = () => {
    let newDisplayed;
    if (!showAll) {
      // Show all tokens
      newDisplayed = [...tokenData];
    } else {
      // Hide tokens < 1M cap
      newDisplayed = tokenData.filter((t) => t.market_cap > 1_000_000);
    }

    // Sort them according to current sortField / sortOrder
    const sorted = sortTokens(newDisplayed, sortField, sortOrder);
    setDisplayedTokens(sorted);

    // Now filter by the current search query
    const filteredSearch = sorted.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery) ||
        token.symbol.toLowerCase().includes(searchQuery)
    );
    setSearchTokens(filteredSearch);

    setShowAll(!showAll);
  };

  // -----------------------------
  // Search by name / symbol
  // -----------------------------
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter from displayedTokens
    const filteredSearchTokens = displayedTokens.filter(
      (token) =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query)
    );
    setSearchTokens(filteredSearchTokens);
  };

  // -----------------------------
  // Sorting logic
  // -----------------------------
  const handleSort = (field) => {
    const newSortOrder =
      sortField === field && sortOrder === "desc" ? "asc" : "desc";
    setSortField(field);
    setSortOrder(newSortOrder);

    // Sort displayedTokens with new field / order
    const sorted = sortTokens(displayedTokens, field, newSortOrder);
    setDisplayedTokens(sorted);

    // Then filter by existing search
    const filteredSearchTokens = sorted.filter(
      (token) =>
        token.name.toLowerCase().includes(searchQuery) ||
        token.symbol.toLowerCase().includes(searchQuery)
    );
    setSearchTokens(filteredSearchTokens);
  };

  // -----------------------------
  // Sort Helper
  // -----------------------------
  const sortTokens = (arr, field, order) => {
    return [...arr].sort((a, b) => {
      if (order === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  };

  // -----------------------------
  // Toggle columns
  // -----------------------------
  const handleColumnToggle = (column) => {
    setColumns((prev) => ({ ...prev, [column]: !prev[column] }));
  };

  // -----------------------------
  // Filter Menu
  // -----------------------------
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  // -----------------------------
  // Quick View
  // -----------------------------
  const vineIndex = displayedTokens.findIndex((t) => t.name === "Vine Coin");
  const quickViewTokens = [
    displayedTokens[vineIndex - 1],
    displayedTokens[vineIndex],
    displayedTokens[vineIndex + 1],
  ].filter(Boolean);

  // -----------------------------
  // Scroll to row
  // -----------------------------
  const scrollToRow = (index) => {
    if (index !== -1 && vineRef.current) {
      vineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // ---------------
  // Render
  // ---------------
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar position="static" style={{ backgroundColor: "#02be8e" }}>
        <Toolbar>
          <Box display="flex" alignItems="center" style={{ flexGrow: 1 }}>
            <img
              src="/vine_logo_white.svg"
              alt="Vine Logo"
              style={{ height: 40, marginRight: 12 }}
            />
            <Typography
              variant="h6"
              style={{
                textAlign: "center",
                flexGrow: 1,
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              Do it for the Vine
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        style={{
          textAlign: "center",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        {/* Section Title */}
        <Typography variant="h3" color="primary" gutterBottom>
          Explore the world of Vine Coin and other top tokens.
        </Typography>

        {/* Search Field */}
        <TextField
          label="Search by Name or Symbol"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          style={{ marginBottom: "1rem", width: "100%" }}
        />

        {/* Quick View Table */}
        <TableContainer component={Paper} elevation={3}>
          <Typography variant="h5" style={{ padding: "1rem 0" }}>
            Quick View
          </Typography>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "#02be8e" }}>
                <TableCell style={{ color: "#ffffff", fontWeight: "bold" }}>
                  Rank
                </TableCell>
                <TableCell style={{ color: "#ffffff", fontWeight: "bold" }}>
                  Name
                </TableCell>
                <TableCell style={{ color: "#ffffff", fontWeight: "bold" }}>
                  Symbol
                </TableCell>
                <TableCell style={{ color: "#ffffff", fontWeight: "bold" }}>
                  Holders
                </TableCell>
                <TableCell style={{ color: "#ffffff", fontWeight: "bold" }}>
                  Market Cap ($)
                </TableCell>
                <TableCell style={{ color: "#ffffff", fontWeight: "bold" }}>
                  24H Volume ($)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quickViewTokens.map((token) => (
                <TableRow
                  key={token.address}
                  onClick={() => scrollToRow(displayedTokens.indexOf(token))}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      token.name === "Vine Coin" ? "#e8f8f3" : "inherit",
                  }}
                >
                  {/* Quick View rank: displayedTokens-based */}
                  <TableCell>
                    {displayedTokens.indexOf(token) + 1}
                  </TableCell>
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

        {/* Main Table Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <Typography variant="h6" style={{ flex: 1, textAlign: "center" }}>
            Rank by {sortField.replace("_", " ").toUpperCase()}
          </Typography>
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

        {/* Main Table */}
        <TableContainer component={Paper} style={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow style={{ backgroundColor: "#02be8e" }}>
                <TableCell style={{ color: "#ffffff", fontWeight: "bold" }}>
                  Rank
                </TableCell>
                {columns.name && (
                  <TableCell
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer", color: "#ffffff" }}
                  >
                    Name{" "}
                    {sortField === "name" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}
                {columns.symbol && (
                  <TableCell
                    onClick={() => handleSort("symbol")}
                    style={{ cursor: "pointer", color: "#ffffff" }}
                  >
                    Symbol{" "}
                    {sortField === "symbol" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}
                {columns.holders && (
                  <TableCell
                    onClick={() => handleSort("holders")}
                    style={{ cursor: "pointer", color: "#ffffff" }}
                  >
                    Holders{" "}
                    {sortField === "holders" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}
                {columns.market_cap && (
                  <TableCell
                    onClick={() => handleSort("market_cap")}
                    style={{ cursor: "pointer", color: "#ffffff" }}
                  >
                    Market Cap ($){" "}
                    {sortField === "market_cap" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}
                {columns.price && (
                  <TableCell
                    onClick={() => handleSort("price")}
                    style={{ cursor: "pointer", color: "#ffffff" }}
                  >
                    Price{" "}
                    {sortField === "price" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}
                {columns.volume_24h && (
                  <TableCell
                    onClick={() => handleSort("volume_24h")}
                    style={{ cursor: "pointer", color: "#ffffff" }}
                  >
                    24H Volume ($){" "}
                    {sortField === "volume_24h" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}
                {columns.supply && (
                  <TableCell
                    onClick={() => handleSort("supply")}
                    style={{ cursor: "pointer", color: "#ffffff" }}
                  >
                    Supply{" "}
                    {sortField === "supply" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {searchTokens.map((token) => (
                <TableRow key={token.address}>
                  {/* Use displayedTokens.indexOf(token) + 1 for rank in main table */}
                  <TableCell>
                    {displayedTokens.indexOf(token) + 1}
                  </TableCell>
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
                    <TableCell>
                      {token.price?.toFixed(6) || "N/A"}
                    </TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Filter Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
        >
          {Object.keys(columns).map((column) => (
            <MenuItem key={column}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={columns[column]}
                    onChange={() => handleColumnToggle(column)}
                  />
                }
                label={column.replace("_", " ").toUpperCase()}
              />
            </MenuItem>
          ))}
        </Menu>
      </Container>
    </ThemeProvider>
  );
}