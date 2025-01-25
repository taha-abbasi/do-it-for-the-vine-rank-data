#!/bin/bash

# 1) Source the .env file to load environment variables
if [ -f .env ]; then
  source .env
fi

# Constants
BASE_URL="https://pro-api.solscan.io/v2.0"
OUTPUT_FILE="./public/top_tokens_with_holders.json"

# Ensure jq is installed
if ! command -v jq &>/dev/null; then
  echo "jq is not installed. Please install jq using 'brew install jq' or your package manager."
  exit 1
fi

# Step 1: Fetch the top 100 tokens
echo "Fetching top 100 tokens..."
TOKEN_LIST=$(curl --silent --request GET \
  --url "$BASE_URL/token/list?sort_by=holder&sort_order=desc&page=1&page_size=100" \
  --header "content-Type: application/json" \
  --header "token: $SOLSCAN_API_KEY")

if [[ -z "$TOKEN_LIST" ]]; then
  echo "Failed to fetch the token list. Exiting."
  exit 1
fi

# Extract token information
TOKENS=$(echo "$TOKEN_LIST" | jq -c '.data[]')

if [[ -z "$TOKENS" ]]; then
  echo "No tokens found in the token list response. Exiting."
  exit 1
fi

# Step 2: Fetch holders and metadata for each token
echo "Fetching metadata for each token..."
TOKEN_HOLDER_DATA=()

while IFS= read -r TOKEN; do
  ADDRESS=$(echo "$TOKEN" | jq -r '.address')
  NAME=$(echo "$TOKEN" | jq -r '.name')
  SYMBOL=$(echo "$TOKEN" | jq -r '.symbol')
  MARKET_CAP=$(echo "$TOKEN" | jq -r '.market_cap')
  PRICE=$(echo "$TOKEN" | jq -r '.price')

  # Fetch token metadata
  echo "Fetching metadata for $NAME ($SYMBOL)..."
  RESPONSE=$(curl --silent --request GET \
    --url "$BASE_URL/token/meta?address=$ADDRESS" \
    --header "content-Type: application/json" \
    --header "token: $SOLSCAN_API_KEY")

  # Debug: is it valid JSON?
  if ! echo "$RESPONSE" | jq empty 2>/dev/null; then
    echo "ERROR: Invalid JSON for $NAME ($SYMBOL): $RESPONSE"
    continue
  fi

  # Extract additional fields
  HOLDER_COUNT=$(echo "$RESPONSE" | jq -r '.data.holder // 0')
  VOLUME_24H=$(echo "$RESPONSE" | jq -r '.data.volume_24h // 0')
  ICON=$(echo "$RESPONSE" | jq -r '.data.icon // ""')
  SUPPLY=$(echo "$RESPONSE" | jq -r '.data.supply // 0')
  PRICE_CHANGE_24H=$(echo "$RESPONSE" | jq -r '.data.price_change_24h // 0')

  TOKEN_HOLDER_DATA+=("$(jq -n \
    --arg address "$ADDRESS" \
    --arg name "$NAME" \
    --arg symbol "$SYMBOL" \
    --argjson market_cap "$MARKET_CAP" \
    --argjson price "$PRICE" \
    --argjson holders "$HOLDER_COUNT" \
    --argjson volume_24h "$VOLUME_24H" \
    --arg icon "$ICON" \
    --argjson supply "$SUPPLY" \
    --argjson price_change_24h "$PRICE_CHANGE_24H" \
    '{address: $address, name: $name, symbol: $symbol, market_cap: $market_cap, price: $price, holders: $holders, volume_24h: $volume_24h, icon: $icon, supply: $supply, price_change_24h: $price_change_24h}')")

  # Sleep to avoid rate-limiting
  sleep 0.2
done <<<"$TOKENS"

# Step 3: Sort tokens by holder count
echo "Sorting tokens by holder count..."
SORTED_TOKENS=$(printf "%s\n" "${TOKEN_HOLDER_DATA[@]}" | jq -s 'sort_by(.holders) | reverse')

# Step 4: Save to JSON file
echo "$SORTED_TOKENS" >"$OUTPUT_FILE"

echo "Top tokens with holders saved to $OUTPUT_FILE."
