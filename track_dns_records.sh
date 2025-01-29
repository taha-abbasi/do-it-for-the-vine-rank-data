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
  # We'll keep a subarray of record changes
  # The final data structure for the domain will be:
  # {
  #   "domain": "twitter.com",
  #   "records": [
  #       { "type": "A", "old": [ ... ], "current": [ ... ], "changed": true/false },
  #       ...
  #   ]
  # }

  RECORD_ARRAY=()

  for TYPE in "${TYPES[@]}"; do
    # Query the DNS
    # dig +short returns each result line by line
    CURRENT_RECORDS=$(dig +short "$DOMAIN" "$TYPE" | sort)
    # Convert multiline string to a single space-separated line for easier comparison
    CURRENT_ONE_LINE=$(echo "$CURRENT_RECORDS" | tr '\n' ' ')

    # Retrieve old data from $OLD_DATA_FILE
    # We'll store lines like: "twitter.com A 1.1.1.1 2.2.2.2"
    # so let's grep for domain+type.
    OLD_ENTRY=$(grep "^$DOMAIN $TYPE " "$OLD_DATA_FILE")
    # The old record set is everything after domain + type, i.e. columns 1+2 are domain+type, the rest is record data
    OLD_RECORDS=$(echo "$OLD_ENTRY" | cut -d' ' -f3-)

    CHANGED="false"
    if [[ "$OLD_RECORDS" != "$CURRENT_ONE_LINE" ]]; then
      CHANGED="true"
      echo "[$DATE_UTC] $DOMAIN $TYPE changed from '$OLD_RECORDS' to '$CURRENT_ONE_LINE'"
    fi

    # Write new line to tmp file for next run
    # We'll store lines: "twitter.com A 1.1.1.1 2.2.2.2"
    echo "$DOMAIN $TYPE $CURRENT_ONE_LINE" >> "$TMP_DATA_FILE"

    # Build a small JSON object for the record
    # old => split by spaces if needed (or just store as a single string)
    # new => same approach
    RECORD_ARRAY+=("{
      \"type\": \"$TYPE\",
      \"old\": \"${OLD_RECORDS:-}\" ,
      \"current\": \"${CURRENT_ONE_LINE:-}\" ,
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

# Move tmp file to old data file
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