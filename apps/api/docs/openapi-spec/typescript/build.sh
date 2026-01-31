#!/bin/bash
set -ex

SCRIPT_DIR=$(/usr/bin/dirname $0)
ROOT_DIR=$(cd "$SCRIPT_DIR/../../../../.." && pwd)
OUTPUT_DIR="$ROOT_DIR/packages/api-client"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate the API client using Docker
docker run --rm \
  -v "$ROOT_DIR:/local" \
  openapitools/openapi-generator-cli generate \
  -i /local/apps/api/docs/openapi-spec/v1/open-api.yml \
  -g typescript-axios \
  -o /local/packages/api-client/src

# Clean up generated files we don't need
rm -f "$OUTPUT_DIR/src/git_push.sh"
rm -f "$OUTPUT_DIR/src/.openapi-generator-ignore"
rm -rf "$OUTPUT_DIR/src/.openapi-generator"

# Copy package.json and tsconfig.json to the output directory
cp "$SCRIPT_DIR/package.json" "$OUTPUT_DIR"
cp "$SCRIPT_DIR/tsconfig.json" "$OUTPUT_DIR"

# Install dependencies and build the package
cd "$OUTPUT_DIR"
yarn install
yarn build

echo "API client generated and built successfully at $OUTPUT_DIR"

# Copy the built client to all app packages directories
echo "Copying API client to app packages..."
rm -rf "$ROOT_DIR/apps/admin/packages/api-client"
rm -rf "$ROOT_DIR/apps/app/packages/api-client"
rm -rf "$ROOT_DIR/apps/web/packages/api-client"

cp -r "$OUTPUT_DIR" "$ROOT_DIR/apps/admin/packages/api-client"
cp -r "$OUTPUT_DIR" "$ROOT_DIR/apps/app/packages/api-client"
cp -r "$OUTPUT_DIR" "$ROOT_DIR/apps/web/packages/api-client"

echo "API client copied to apps/admin/packages, apps/app/packages, and apps/web/packages"
