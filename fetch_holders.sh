#!/bin/bash

# Configuration
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOjE3Mzc4MTQ3MDA0MzgsImVtYWlsIjoiZmluYW5jZUBhYmJhc2lpbmR1c3RyaWVzLmNvbSIsImFjdGlvbiI6InRva2VuLWFwaSIsImFwaVZlcnNpb24iOiJ2MiIsImlhdCI6MTczNzgxNDcwMH0.E-rN5yDNxZ6_p_q4jRa9eZ8MejkTHwNzcXChHpm9JOU"
TOKEN_ADDRESS="6AJcP7wuLwmRYLBNbi825wgguaPsWzPBEHcHndpRpump"
API_URL_HOLDERS="https://pro-api.solscan.io/v2.0/token/holders"
API_URL_META="https://pro-api.solscan.io/v2.0/token/meta"
PAGE_SIZE=40  # Maximum per request
OUTPUT_FILE="holders.txt"
DECIMALS=1000000  # 6 decimal places
CONCURRENT_REQUESTS=10  # Parallel API calls
FAILED_PAGES="failed_pages.log"

# Clear previous data
> "$OUTPUT_FILE"
> "$FAILED_PAGES"

# Step 1: Fetch Total Holder Count from `/token/meta`
echo "Fetching total holder count..."
TOTAL_COUNT=$(curl -s -X GET "$API_URL_META?address=$TOKEN_ADDRESS" \
    -H "content-Type: application/json" \
    -H "token: $API_KEY" | jq -r '.data.holder // 0')

if [[ "$TOTAL_COUNT" -eq 0 ]]; then
    echo "Failed to fetch total holder count. Exiting."
    exit 1
fi

LAST_PAGE=$(( (TOTAL_COUNT + PAGE_SIZE - 1) / PAGE_SIZE ))
echo "Total holders: $TOTAL_COUNT (Last Page: $LAST_PAGE)"

# Step 2: Function to Fetch Pages with Error Handling
fetch_page() {
    PAGE=$1
    echo "Fetching page $PAGE..."

    RESPONSE=$(curl -s -X GET "$API_URL_HOLDERS?address=$TOKEN_ADDRESS&page=$PAGE&page_size=$PAGE_SIZE" \
        -H "content-Type: application/json" \
        -H "token: $API_KEY")

    # Check for API errors
    if echo "$RESPONSE" | jq -e '.error_message' > /dev/null; then
        echo "Error fetching page $PAGE: $(echo "$RESPONSE" | jq -r '.error_message')"
        echo "$PAGE" >> "$FAILED_PAGES"
        return
    fi

    # Extract holders (address & balance)
    HOLDERS=$(echo "$RESPONSE" | jq -r '.data.items[]? | "\(.address) \(.amount)"')

    # If the API returned no data, log the failed page
    if [ -z "$HOLDERS" ]; then
        echo "Page $PAGE returned no data, retrying later..."
        echo "$PAGE" >> "$FAILED_PAGES"
        return
    fi

    # Convert balances to human-readable format
    while read -r ADDRESS RAW_BALANCE; do
        # Ensure RAW_BALANCE is numeric and non-empty
        if [[ -n "$RAW_BALANCE" && "$RAW_BALANCE" =~ ^[0-9]+$ ]]; then
            HUMAN_BALANCE=$(awk -v raw="$RAW_BALANCE" -v dec="$DECIMALS" 'BEGIN { printf "%.6f", raw / dec }')
            echo "$ADDRESS|$HUMAN_BALANCE" >> "$OUTPUT_FILE"
        else
            echo "Skipping invalid balance entry: $ADDRESS $RAW_BALANCE"
        fi
    done <<< "$HOLDERS"
}

export -f fetch_page
export API_URL_HOLDERS TOKEN_ADDRESS API_KEY PAGE_SIZE DECIMALS OUTPUT_FILE

# Step 3: Fetch Pages in Parallel
echo "Fetching all holders in parallel..."
seq 1 "$LAST_PAGE" | xargs -n1 -P"$CONCURRENT_REQUESTS" bash -c 'fetch_page "$@"' _

# Step 4: Retry Failed Pages
if [[ -s "$FAILED_PAGES" ]]; then
    echo "Retrying failed pages..."
    cat "$FAILED_PAGES" | xargs -n1 -P1 bash -c 'fetch_page "$@"' _
fi

echo "Sorting data..."
sort -t '|' -k2 -nr "$OUTPUT_FILE" -o "$OUTPUT_FILE"

# Step 5: Count holders with balance < 35 VINE
SMALL_HOLDERS_COUNT=$(awk -F '|' '$2 < 35' "$OUTPUT_FILE" | wc -l)
echo "Number of holders with less than 35 VINE: $SMALL_HOLDERS_COUNT"

echo "Data saved to $OUTPUT_FILE"