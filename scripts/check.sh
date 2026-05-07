#!/bin/sh

REPO_ROOT=$(git rev-parse --show-toplevel)
FAILED=0

echo "=== lint + tsc ==="

printf "\n[admin] lint\n"
(cd "$REPO_ROOT/apps/admin" && yarn lint) || FAILED=1
printf "[admin] tsc\n"
(cd "$REPO_ROOT/apps/admin" && yarn tsc -b) || FAILED=1

printf "\n[api] lint\n"
(cd "$REPO_ROOT/apps/api" && yarn lint) || FAILED=1
printf "[api] tsc\n"
(cd "$REPO_ROOT/apps/api" && yarn tsc --noEmit) || FAILED=1

printf "\n[web] lint\n"
(cd "$REPO_ROOT/apps/web" && yarn lint) || FAILED=1
printf "[web] tsc\n"
(cd "$REPO_ROOT/apps/web" && yarn tsc --noEmit) || FAILED=1

printf "\n[api-client] tsc\n"
(cd "$REPO_ROOT/packages/api-client" && yarn tsc --skipLibCheck --noEmit) || FAILED=1

if [ "$FAILED" -eq 1 ]; then
  printf "\nchecks failed\n"
else
  printf "\nall checks passed\n"
fi

exit $FAILED
