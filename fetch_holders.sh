#!/bin/bash

# Configuration
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3Mzc4MTQ3MDA0MzgsImVtYWlsIjoiZmluYW5jZUBhYmJhc2lpbmR1c3RyaWVzLmNvbSIsImFjdGlvbiI6InRva2VuLWFwaSIsImFwaVZlcnNpb24iOiJ2MiIsImlhdCI6MTczNzgxNDcwMH0.E-rN5yDNxZ6_p_q4jRa9eZ8MejkTHwNzcXChHpm9JOU"
TOKEN_ADDRESS="6AJcP7wuLwmRYLBNbi825wgguaPsWzPBEHcHndpRpump"
API_URL="https://pro-api.solscan.io/v2.0/token/holders"
PAGE_SIZE=40  # Maximum Solscan allows
OUTPUT_FILE="holders.txt"

# Clear previous output file
> "$OUTPUT_FILE"

# Fetch holders page by page
PAGE=1
while :; do
    echo "Fetching page $PAGE..."
    
    RESPONSE=$(curl -s -X GET "$API_URL?address=$TOKEN_ADDRESS&page=$PAGE&page_size=$PAGE_SIZE" \
        -H "Authorization: Bearer $API_KEY")

    # Extract holders and check if it's empty
    HOLDERS=$(echo "$RESPONSE" | jq -r '.data.items[] | "\(.address)|\(.amount)"')
    
    if [ -z "$HOLDERS" ]; then
        break # Exit if there are no more holders
    fi
    
    # Append holders to file
    echo "$HOLDERS" >> "$OUTPUT_FILE"

    ((PAGE++))
    sleep 1  # Avoid hitting API rate limits
done

echo "Sorting data..."
sort -t '|' -k2 -nr "$OUTPUT_FILE" -o "$OUTPUT_FILE"

# Count holders with balance < 35
SMALL_HOLDERS_COUNT=$(awk -F '|' '$2 < 35' "$OUTPUT_FILE" | wc -l)
echo "Number of holders with less than 35 tokens: $SMALL_HOLDERS_COUNT"

echo "Data saved to $OUTPUT_FILE"