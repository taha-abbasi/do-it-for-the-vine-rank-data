#!/bin/bash
# track_dns_records.sh
# Purpose: Track specific DNS record types for each domain, detect changes, output JSON in public/dns_record_updates.json.

DOMAINS=("twitter.com" "x.com" "vine.co" "vineco.in")
TYPES=("A" "AAAA" "CNAME" "MX" "TXT" "NS")

# Where to store the previous run data
OLD_DATA_FILE="dns_records.log"
TMP_DATA_FILE="dns_records.tmp"

# The JSON output
OUTPUT_JSON="public/dns_record_updates.json"

# Current date/time in UTC
DATE_UTC=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Ensure public/ folder exists
mkdir -p public

# Ensure old data file exists
[ ! -f "$OLD_DATA_FILE" ] && touch "$OLD_DATA_FILE"

echo "[$DATE_UTC] Checking DNS records..."

# We'll build up an array of domain objects in JSON
DOMAIN_JSON_ARRAY=()

for DOMAIN in "${DOMAINS[@]}"; do
  RECORD_ARRAY=()

  for TYPE in "${TYPES[@]}"; do
    # Query and flatten the new record set
    CURRENT_RECORDS=$(dig +short "$DOMAIN" "$TYPE" | sort)
    CURRENT_ONE_LINE=$(echo "$CURRENT_RECORDS" | tr '\n' ' ')

    # Get the old record line from the log
    OLD_ENTRY=$(grep "^$DOMAIN $TYPE " "$OLD_DATA_FILE")
    OLD_RECORDS=$(echo "$OLD_ENTRY" | cut -d' ' -f3-)

    # Compare
    CHANGED="false"
    if [[ "$OLD_RECORDS" != "$CURRENT_ONE_LINE" ]]; then
      CHANGED="true"
      echo "[$DATE_UTC] $DOMAIN $TYPE changed from '$OLD_RECORDS' to '$CURRENT_ONE_LINE'"
    fi

    # Write new line to tmp file for next run
    echo "$DOMAIN $TYPE $CURRENT_ONE_LINE" >> "$TMP_DATA_FILE"

    # ***** Escape internal quotes for valid JSON strings *****
    ESCAPED_OLD_RECORDS=$(echo "$OLD_RECORDS" | sed 's/"/\\"/g')
    ESCAPED_CURRENT_ONE_LINE=$(echo "$CURRENT_ONE_LINE" | sed 's/"/\\"/g')

    # Build a small JSON object
    RECORD_ARRAY+=("{
      \"type\": \"$TYPE\",
      \"old\": \"${ESCAPED_OLD_RECORDS:-}\",
      \"current\": \"${ESCAPED_CURRENT_ONE_LINE:-}\",
      \"changed\": $CHANGED
    }")
  done

  # Merge record array into domain object
  RECORD_JSON_LIST=$(IFS=,; echo "${RECORD_ARRAY[*]}")
  DOMAIN_JSON_ARRAY+=("{
    \"domain\": \"$DOMAIN\",
    \"records\": [ $RECORD_JSON_LIST ]
  }")
done

mv "$TMP_DATA_FILE" "$OLD_DATA_FILE"

# Build final JSON
DOMAIN_JSON_LIST=$(IFS=,; echo "${DOMAIN_JSON_ARRAY[*]}")

cat <<EOF > "$OUTPUT_JSON"
{
  "lastRun": "$DATE_UTC",
  "domains": [ $DOMAIN_JSON_LIST ]
}
EOF

echo "DNS record updates written to $OUTPUT_JSON"