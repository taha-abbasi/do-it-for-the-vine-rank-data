#!/usr/bin/env bash
# sync_and_deploy.sh
# Purpose: Update token data, commit changes, push to data-sync branch, then build & deploy to Netlify.

set -e  # Exit immediately if a command exits with a non-zero status

#######################################
# 1. Run the token update script
#######################################
echo "Running fetch_top_tokens_and_holders.sh..."
./fetch_top_tokens_and_holders.sh

echo "Fetch script completed. Checking for changes..."

#######################################
# 2. Check if the JSON file changed and commit/push if so
#######################################
# Stage any changes (especially public/top_tokens_with_holders.json)
git add public/top_tokens_with_holders.json

# If no changes are staged, we skip the commit/push steps
if git diff --cached --quiet; then
  echo "No changes to commit. Proceeding to build and deploy."
else
  # We have changes, so commit and push
  CURRENT_DATE=$(date -u "+%d-%B-%Y %H:%M UTC")
  COMMIT_MSG="Vine Rank Sync $CURRENT_DATE"

  echo "Committing changes with message: '$COMMIT_MSG'"
  git commit -m "$COMMIT_MSG"

  echo "Pushing to origin data-sync..."
  git push origin data-sync
fi

#######################################
# 3. Build the app
#######################################
echo "Building the production bundle (npm run build)..."
npm run build

#######################################
# 4. Deploy to Netlify production
#######################################
echo "Deploying to Netlify production..."
netlify deploy --prod

echo "Done!"