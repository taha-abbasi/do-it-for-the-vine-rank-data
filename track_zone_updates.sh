#!/bin/bash

# track_zone_updates.sh
# Purpose: Check DNS SOA serials for domains, produce JSON in public/zone_updates.json

# Domains to track
DOMAINS=("twitter.com" "x.com" "vine.co" "vineco.in")

# The JSON output file
OUTPUT_JSON="public/zone_updates.json"

# The local "database" for last known serials (still plain text)
SOA_FILE="soa_serials.log"
TMP_FILE="soa_serials.tmp"

# Current date/time
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Ensure we have a public/ directory (in case this script is run from root)
mkdir -p public

# If the serial log file doesn't exist, create it
if [[ ! -f $SOA_FILE ]]; then
    touch $SOA_FILE
fi

echo "[$DATE] Checking SOA serials..."

# We'll keep an array of JSON domain objects
# We'll construct it in bash, then pass to jq for safer JSON building
DOMAIN_JSON_ARRAY=()

for DOMAIN in "${DOMAINS[@]}"; do
    SERIAL=$(dig +short $DOMAIN SOA | awk '{print $3}')

    if [[ -n "$SERIAL" ]]; then
        LAST_ENTRY=$(grep "^$DOMAIN" $SOA_FILE)
        LAST_SERIAL=$(echo "$LAST_ENTRY" | awk '{print $2}')
        LAST_DATE=$(echo "$LAST_ENTRY" | awk '{print $3, $4}')

        CHANGED="false"
        if [[ "$LAST_SERIAL" != "$SERIAL" ]]; then
            CHANGED="true"
            echo "[$DATE] Change detected for $DOMAIN: $LAST_SERIAL -> $SERIAL"
        fi

        # Write new line in tmp file for next run
        echo "$DOMAIN $SERIAL $DATE" >> $TMP_FILE

        # Build a small domain object
        # We'll store domain, current serial, last check date (this run), changed?
        DOMAIN_JSON_ARRAY+=("{
          \"domain\": \"$DOMAIN\",
          \"serial\": \"$SERIAL\",
          \"changed\": $CHANGED,
          \"lastChecked\": \"$DATE\"
        }")
    else
        # Could not retrieve
        echo "$DOMAIN ERROR: Could not retrieve SOA record" >> $TMP_FILE
        DOMAIN_JSON_ARRAY+=("{
          \"domain\": \"$DOMAIN\",
          \"serial\": null,
          \"changed\": false,
          \"lastChecked\": \"$DATE\",
          \"error\": \"Could not retrieve SOA\"
        }")
    fi
done

# Replace the old file with the new one
mv $TMP_FILE $SOA_FILE

# Now produce the final JSON
# We'll pass the array to jq to build a proper JSON structure
# Something like: { "lastRun": "2025-01-28 03:41:50", "domains": [ {...}, {...} ] }

# Convert array items to a comma-separated list
DOMAIN_JSON_LIST=$(IFS=,; echo "${DOMAIN_JSON_ARRAY[*]}")

cat <<EOF > $OUTPUT_JSON
{
  "lastRun": "$DATE",
  "domains": [
    $DOMAIN_JSON_LIST
  ]
}
EOF

echo "Zone updates saved to $OUTPUT_JSON"