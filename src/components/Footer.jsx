// src/components/Footer.jsx

import React from "react";
import {
  Box,
  Grid,
  Container,
  Typography,
  Link,
  Divider,
  Stack,
  Button,
} from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f5f5f5",
        paddingY: 6,
        marginTop: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Column 1: About Me + Donations */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              About Me
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              I am a software architect serving in web3 since 2016,
              passionate about decentralized sovereignty of assets. I love
              evangelizing fairly distributed, community-driven coins,
              movements, and technologies. If you like <strong>$VINE</strong>,
              also check out the <strong>100K holders of $DOG</strong>, a free
              and fair distribution underdog that is already the largest Bitcoin
              Token!
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 1 }}>
              Support My Work
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              Solscan APIs cost <strong>$199/month</strong>. Donations are
              appreciated:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              9jJbYgykByUFURADCkpMmPAx4VvcvjuDemetMDVxNDUQ
            </Typography>
          </Grid>

          {/* Column 2: Connect with the Vine Community */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              Connect with the Vine Community
            </Typography>

            <Stack spacing={1}>
              <Link
                href="https://x.com/tahaabbasi"
                target="_blank"
                rel="noopener"
              >
                X Profile (The Brown Cowboy)
              </Link>
              <Link
                href="https://www.youtube.com/TahaAbbasi"
                target="_blank"
                rel="noopener"
              >
                YouTube
              </Link>
            </Stack>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              Chief Vine
            </Typography>
            <Link href="https://x.com/rus" target="_blank" rel="noopener">
              Rus (Founder of Vine)
            </Link>
          </Grid>

          {/* Column 3: “Do it for the Vine” Space Hosts & Vine Tribe Button */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              “Do it for the Vine” Space Hosts
            </Typography>

            <Stack spacing={1}>
              <Link
                href="https://x.com/thefarklord"
                target="_blank"
                rel="noopener"
              >
                hbar (Farklord)
              </Link>
              <Link
                href="https://x.com/paperthynn"
                target="_blank"
                rel="noopener"
              >
                Joshua ☕️ ᵍᵐ
              </Link>
              <Link
                href="https://x.com/KBFNBR"
                target="_blank"
                rel="noopener"
              >
                KB
              </Link>
            </Stack>

            <Divider sx={{ marginY: 2 }} />

            {/* Button to join Vine Tribe */}
            <Button
              variant="contained"
              color="primary"
              href="https://x.com/i/communities/1882668779890500022"
              target="_blank"
              rel="noopener"
            >
              Join Vine Tribe on X
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}