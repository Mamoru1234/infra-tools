#/usr/bin/env bash

set -eu;

SERVER_NAME="$1";
CONTAINER_NAME="${2:-"$1-db"}";

echo "Creating dump for $CONTAINER_NAME in $SERVER_NAME"
ssh "$SERVER_NAME" "docker exec $CONTAINER_NAME pg_dump -U postgres --column-inserts --data-only postgres > inserts.sql"

scp "$SERVER_NAME":~/inserts.sql .

ssh "$SERVER_NAME" "rm inserts.sql"
dt=$(date '+%d.%m.%Y %H:%M:%S');

aws --profile personal s3api put-object --bucket gontarpersonal --key "dump/$SERVER_NAME/$dt.sql" --body ./inserts.sql

