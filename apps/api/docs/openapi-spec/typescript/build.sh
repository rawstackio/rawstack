#!/bin/bash
set -ex

DIRNAME=$(/usr/bin/dirname $0)

cd $DIRNAME

npx @openapitools/openapi-generator-cli generate -i ../v1/open-api.yml -g typescript-axios -o ./api-client/src
rm ./api-client/src/git_push.sh
rm ./api-client/src/.openapi-generator-ignore
rm -rf ./api-client/src/.openapi-generator
cp package.json ./api-client
cp tsconfig.json ./api-client
# Copy file to other apps
