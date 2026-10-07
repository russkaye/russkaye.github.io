#!/usr/bin/env bash
# Push as russkaye without switching the global gh account or touching git config.
set -euo pipefail
exec git -c credential.helper= \
  -c "credential.helper=!f() { echo username=russkaye; echo \"password=\$(gh auth token --user russkaye)\"; }; f" \
  push "$@"
