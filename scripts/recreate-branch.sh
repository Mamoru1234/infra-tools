#/usr/bin/env bash

set -eu;

CURRENT_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
TARGET_BRANCH=$1
NUMBER_OF_COMMITS=${2:-1}
COMMIT_MESSAGE=$(git show-branch --no-name HEAD)

echo "Reseting branch $CURRENT_BRANCH_NAME to $TARGET_BRANCH by $NUMBER_OF_COMMITS commits"

git reset HEAD~$NUMBER_OF_COMMITS;

git add .;

git stash;

git checkout "$TARGET_BRANCH";

git branch -D "$CURRENT_BRANCH_NAME";

git checkout -b "$CURRENT_BRANCH_NAME";

echo "Adding stash changes"

git stash pop

git add .

git commit -m "$COMMIT_MESSAGE";

echo ""

echo "git push --set-upstream origin \"$CURRENT_BRANCH_NAME\" -f"
