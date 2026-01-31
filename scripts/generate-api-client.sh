#!/bin/bash
# Script to generate the TypeScript API client from OpenAPI spec
set -e

SCRIPT_DIR=$(dirname "$0")
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
BUILD_SCRIPT="$ROOT_DIR/apps/api/docs/openapi-spec/typescript/build.sh"

echo "Generating API client..."

if [ ! -f "$BUILD_SCRIPT" ]; then
  echo "Error: Build script not found at $BUILD_SCRIPT"
  exit 1
fi

# Run the build script
bash "$BUILD_SCRIPT"

echo "API client generation complete!"

