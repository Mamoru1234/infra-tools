#/usr/bin/env bash

set -eu;


docker build -t 575286770774.dkr.ecr.eu-central-1.amazonaws.com/tools/ssl-server:latest .

export AWS_PROFILE=personal;
docker push 575286770774.dkr.ecr.eu-central-1.amazonaws.com/tools/ssl-server:latest
