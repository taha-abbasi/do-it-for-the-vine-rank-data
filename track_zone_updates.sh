#!/bin/bash

# Domains to track
DOMAINS=("twitter.com" "x.com" "vine.co" "vineco.in")

# File to store previous SOA serials
SOA_FILE="soa_serials.log"
TMP_FILE="soa_serials.tmp"

# Get today's date
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Check if the SOA log file exists, if not, create it
if [[ ! -f $SOA_FILE ]]; then
    touch $SOA_FILE
fi

echo "[$DATE] Checking SOA serials..." | tee -a soa_changes.log

# Retrieve the SOA serial numbers for each domain
for DOMAIN in "${DOMAINS[@]}"; do
    SERIAL=$(dig +short $DOMAIN SOA | awk '{print $3}')
    
    if [[ -n "$SERIAL" ]]; then
        echo "$DOMAIN $SERIAL" >> $TMP_FILE
    else
        echo "$DOMAIN ERROR: Could not retrieve SOA record" >> $TMP_FILE
    fi
done

# Compare with previous values
if [[ -f $SOA_FILE ]]; then
    while read -r LINE; do
        DOMAIN=$(echo $LINE | awk '{print $1}')
        OLD_SERIAL=$(echo $LINE | awk '{print $2}')
        NEW_SERIAL=$(grep "^$DOMAIN" $TMP_FILE | awk '{print $2}')
        
        if [[ "$OLD_SERIAL" != "$NEW_SERIAL" ]]; then
            echo "[$DATE] Change detected for $DOMAIN: $OLD_SERIAL -> $NEW_SERIAL" | tee -a soa_changes.log
        fi
    done < $SOA_FILE
fi

# Update stored serials
mv $TMP_FILE $SOA_FILE
echo "Tracking completed."