#!/bin/bash
# track_dns_records.sh
# Purpose: Track specific DNS record types for each domain, detect changes,
# store them as a JSON in public/dns_record_updates.json.
# On first run (no old data), we treat it as "changed": false.

DOMAINS=("twitter.com" "x.com" "vine.co" "vineco.in")
TYPES=("A" "AAAA" "CNAME" "MX" "TXT" "NS")

OLD_DATA_FILE="dns_records.log"
TMP_DATA_FILE="dns_records.tmp"
OUTPUT_JSON="public/dns_record_updates.json"

DATE_UTC=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Ensure we have a public/ directory
mkdir -p public

# Ensure old data file exists
[ ! -f "$OLD_DATA_FILE" ] && touch "$OLD_DATA_FILE"

echo "[$DATE_UTC] Checking DNS records..."

DOMAIN_JSON_ARRAY=()

for DOMAIN in "${DOMAINS[@]}"; do
  RECORD_ARRAY=()

  for TYPE in "${TYPES[@]}"; do
    # Query the DNS, flatten each line into one space-separated string
    CURRENT_RECORDS=$(dig +short "$DOMAIN" "$TYPE" | sort)
    CURRENT_ONE_LINE=$(echo "$CURRENT_RECORDS" | tr '\n' ' ')

    # Grab old data from log
    OLD_ENTRY=$(grep "^$DOMAIN $TYPE " "$OLD_DATA_FILE")
    OLD_RECORDS=$(echo "$OLD_ENTRY" | cut -d' ' -f3-)

    # Decide changed or not
    CHANGED="false"
    if [[ -z "$OLD_RECORDS" ]]; then
      # No baseline => treat as no change
      CHANGED="false"
    else
      # If new differs from old, changed
      if [[ "$OLD_RECORDS" != "$CURRENT_ONE_LINE" ]]; then
        CHANGED="true"
        echo "[$DATE_UTC] $DOMAIN $TYPE changed from '$OLD_RECORDS' to '$CURRENT_ONE_LINE'"
      else
        CHANGED="false"
      fi
    fi

    # Write new line to tmp file for next run
    echo "$DOMAIN $TYPE $CURRENT_ONE_LINE" >> "$TMP_DATA_FILE"

    # ***** Escape quotes for valid JSON *****
    # We only store them as a single string, so let's escape internal quotes:
    ESCAPED_OLD=$(echo "$OLD_RECORDS" | sed 's/"/\\"/g')
    ESCAPED_CURRENT=$(echo "$CURRENT_ONE_LINE" | sed 's/"/\\"/g')

    # Build record JSON
    RECORD_ARRAY+=("{
      \"type\": \"$TYPE\",
      \"old\": \"${ESCAPED_OLD:-}\",
      \"current\": \"${ESCAPED_CURRENT:-}\",
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

# Move tmp to old
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