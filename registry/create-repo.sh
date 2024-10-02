#!/usr/bin/env bash

set -eu;

REPO_NAME=$1;

echo "Creating repo $REPO_NAME"

sudo chsh git -s $(which bash);

sudo -i -u git bash << EOF
cd /home/git;

mkdir "$REPO_NAME.git"
cd "$REPO_NAME.git"
git init --bare

EOF

sudo chsh git -s $(which git-shell);