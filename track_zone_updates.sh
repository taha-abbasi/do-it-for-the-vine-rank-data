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

# Current date/time (in local format or you could do date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Ensure we have a public/ directory (in case this script is run from root)
mkdir -p public

# If the serial log file doesn't exist, create it
if [[ ! -f "$SOA_FILE" ]]; then
    touch "$SOA_FILE"
fi

echo "[$DATE] Checking SOA serials..."

# We'll keep an array of JSON domain objects
DOMAIN_JSON_ARRAY=()

for DOMAIN in "${DOMAINS[@]}"; do

    # 1) Attempt to retrieve the current serial via dig
    #    dig +short domain.com SOA => "ns server <serial> <otherstuff>"
    #    we only want the serial => the 3rd field
    SOA_OUTPUT=$(dig +short "$DOMAIN" SOA)
    SERIAL=$(echo "$SOA_OUTPUT" | awk '{print $3}')

    if [[ -n "$SERIAL" ]]; then
        # 2) Retrieve old data from $SOA_FILE
        #    Lines might look like: "domain.com 2023121201 2025-01-28 02:41:22"
        LAST_ENTRY=$(grep "^$DOMAIN " "$SOA_FILE")

        # If we found an entry, parse out old serial
        LAST_SERIAL=$(echo "$LAST_ENTRY" | awk '{print $2}')
        # (We do have a "last check date" in columns 3,4, but we won't use it here)

        # Default changed = false
        CHANGED="false"

        # Only set changed=true if we had old data AND the serial is different
        if [[ -n "$LAST_SERIAL" ]]; then
            if [[ "$LAST_SERIAL" != "$SERIAL" ]]; then
                CHANGED="true"
                echo "[$DATE] Change detected for $DOMAIN: $LAST_SERIAL -> $SERIAL"
            fi
        fi

        # 3) Write new line in tmp file for next run
        echo "$DOMAIN $SERIAL $DATE" >> "$TMP_FILE"

        # 4) Build a small domain object for JSON
        #    store domain, serial, changed, lastChecked
        DOMAIN_JSON_ARRAY+=("{
          \"domain\": \"$DOMAIN\",
          \"serial\": \"$SERIAL\",
          \"changed\": $CHANGED,
          \"lastChecked\": \"$DATE\"
        }")

    else
        # Could not retrieve the SOA record => mark error
        echo "$DOMAIN ERROR: Could not retrieve SOA record" >> "$TMP_FILE"

        DOMAIN_JSON_ARRAY+=("{
          \"domain\": \"$DOMAIN\",
          \"serial\": null,
          \"changed\": false,
          \"lastChecked\": \"$DATE\",
          \"error\": \"Could not retrieve SOA\"
        }")
    fi

done

# 5) Replace the old file with the new one
mv "$TMP_FILE" "$SOA_FILE"

# 6) Produce final JSON
# We'll simply build it with a Bash variable for the array
DOMAIN_JSON_LIST=$(IFS=,; echo "${DOMAIN_JSON_ARRAY[*]}")

cat <<EOF > "$OUTPUT_JSON"
{
  "lastRun": "$DATE",
  "domains": [
    $DOMAIN_JSON_LIST
  ]
}
EOF

echo "Zone updates saved to $OUTPUT_JSON"