#!/bin/bash

# Configuration
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3Mzc4MTQ3MDA0MzgsImVtYWlsIjoiZmluYW5jZUBhYmJhc2lpbmR1c3RyaWVzLmNvbSIsImFjdGlvbiI6InRva2VuLWFwaSIsImFwaVZlcnNpb24iOiJ2MiIsImlhdCI6MTczNzgxNDcwMH0.E-rN5yDNxZ6_p_q4jRa9eZ8MejkTHwNzcXChHpm9JOU"
TOKEN_ADDRESS="6AJcP7wuLwmRYLBNbi825wgguaPsWzPBEHcHndpRpump"
API_URL="https://pro-api.solscan.io/v2.0/token/holders"
PAGE_SIZE=40  # API supports max 40
OUTPUT_FILE="holders.txt"
DECIMALS=1000000  # 6 decimal places

# Clear previous data
> "$OUTPUT_FILE"

PAGE=1
TOTAL_HOLDERS=0

while :; do
    echo "Fetching page $PAGE..."

    RESPONSE=$(curl -s -X GET "$API_URL?address=$TOKEN_ADDRESS&page=$PAGE&page_size=$PAGE_SIZE" \
        -H "content-Type: application/json" \
        -H "token: $API_KEY")

    # Check if the API response contains an error message
    if echo "$RESPONSE" | jq -e '.error_message' > /dev/null; then
        echo "Error fetching data: $(echo "$RESPONSE" | jq -r '.error_message')"
        exit 1
    fi

    # Extract holders
    HOLDERS=$(echo "$RESPONSE" | jq -r '.data.items[]? | "\(.address) \(.amount)"')

    # Stop if no more holders
    if [ -z "$HOLDERS" ]; then
        echo "No more holders found. Exiting loop."
        break
    fi

    # Convert raw balances to readable balances
    while read -r ADDRESS RAW_BALANCE; do
        HUMAN_BALANCE=$(awk "BEGIN {printf \"%.6f\", $RAW_BALANCE / $DECIMALS}")
        echo "$ADDRESS|$HUMAN_BALANCE" >> "$OUTPUT_FILE"
        ((TOTAL_HOLDERS++))
    done <<< "$HOLDERS"

    ((PAGE++))
    sleep 1  # Avoid API rate limits
done

echo "Total holders fetched: $TOTAL_HOLDERS"
echo "Sorting data..."
sort -t '|' -k2 -nr "$OUTPUT_FILE" -o "$OUTPUT_FILE"

# Count holders with balance < 35 VINE
SMALL_HOLDERS_COUNT=$(awk -F '|' '$2 < 35' "$OUTPUT_FILE" | wc -l)
echo "Number of holders with less than 35 VINE: $SMALL_HOLDERS_COUNT"

echo "Data saved to $OUTPUT_FILE"