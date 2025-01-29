#!/usr/bin/env bash
# sync_and_deploy.sh
# Purpose: Update token data, commit changes, push to data-sync branch, then build & deploy to Netlify.

set -e  # Exit immediately if a command fails

cd "$(dirname "$0")"

#######################################
# 1. Run the token update script
#######################################
echo "Running fetch_top_tokens_and_holders.sh..."
./fetch_top_tokens_and_holders.sh

echo "Fetch script completed."

#######################################
# 2. Run the DNS zone check script
#######################################
echo "Running track_zone_updates.sh..."
./track_zone_updates.sh

echo "Zone check completed."

#######################################
# 3. Check if there are changes to commit/push
#######################################
# Stage any changes (especially public/top_tokens_with_holders.json and public/zone_updates.json)
git add public/top_tokens_with_holders.json public/zone_updates.json

if git diff --cached --quiet; then
  echo "No changes to commit. Proceeding to build and deploy."
else
  CURRENT_DATE=$(date -u "+%d-%B-%Y %H:%M UTC")
  COMMIT_MSG="Vine Rank Sync $CURRENT_DATE"

  echo "Committing changes with message: '$COMMIT_MSG'"
  git commit -m "$COMMIT_MSG"

  echo "Pushing to origin feature/data-sync..."
  git push origin feature/data-sync
fi

#######################################
# 4. Build the app
#######################################
echo "Building the production bundle (npm run build)..."
npm run build

#######################################
# 5. Deploy to Netlify production
#######################################
echo "Deploying to Netlify production..."
netlify deploy --prod

# Optional: commit build artifacts post-deploy
git add .
git commit -am "post deploy build sync"
git push origin feature/data-sync

echo "Done!"