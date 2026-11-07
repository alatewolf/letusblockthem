#!/bin/sh
# Static checks. The behaviour check runs live on fetlife.com (see the live test in the session notes).
set -e
cd "$(dirname "$0")/.."
node -e "const m = JSON.parse(require('fs').readFileSync('manifest.json', 'utf8')); if (m.manifest_version !== 3) throw new Error('manifest_version must be 3')"
node --check content.js
node "$HOME/.claude/scripts/design-slop-lint/slop-lint.mjs" content.js
echo "verify: ok"
