#!/bin/bash

# Configuration
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3Mzc4MTQ3MDA0MzgsImVtYWlsIjoiZmluYW5jZUBhYmJhc2lpbmR1c3RyaWVzLmNvbSIsImFjdGlvbiI6InRva2VuLWFwaSIsImFwaVZlcnNpb24iOiJ2MiIsImlhdCI6MTczNzgxNDcwMH0.E-rN5yDNxZ6_p_q4jRa9eZ8MejkTHwNzcXChHpm9JOU"
TOKEN_ADDRESS="6AJcP7wuLwmRYLBNbi825wgguaPsWzPBEHcHndpRpump"
API_URL="https://pro-api.solscan.io/v2.0/token/holders"
PAGE_SIZE=40  # API supports max 40
OUTPUT_FILE="holders.txt"

# Clear previous data
> "$OUTPUT_FILE"

PAGE=1
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

    # Check if 'data.items' exists
    if ! echo "$RESPONSE" | jq -e '.data.items' > /dev/null; then
        echo "No more data found. Exiting."
        break
    fi

    # Extract holders (address|balance)
    HOLDERS=$(echo "$RESPONSE" | jq -r '.data.items[]? | "\(.address)|\(.amount)"')

    # If no holders are found, exit the loop
    if [ -z "$HOLDERS" ]; then
        echo "No more holders found. Exiting loop."
        break
    fi

    # Append holders to file
    echo "$HOLDERS" >> "$OUTPUT_FILE"

    ((PAGE++))
    sleep 1  # Avoid hitting API rate limits
done

echo "Sorting data..."
sort -t '|' -k2 -nr "$OUTPUT_FILE" -o "$OUTPUT_FILE"

# Count holders with balance < 35 tokens
SMALL_HOLDERS_COUNT=$(awk -F '|' '$2 < 35' "$OUTPUT_FILE" | wc -l)
echo "Number of holders with less than 35 tokens: $SMALL_HOLDERS_COUNT"

echo "Data saved to $OUTPUT_FILE"