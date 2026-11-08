#!/bin/sh
# Static checks. The behaviour check runs live on the site (see the session notes).
set -e
cd "$(dirname "$0")/.."
node -e "
const fs = require('fs');
const m = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
if (m.manifest_version !== 3) throw new Error('manifest_version must be 3');
if (m.description.length > 132) throw new Error('description is over 132 characters');
for (const [size, file] of Object.entries(m.icons || {})) {
  const png = fs.readFileSync(file); // PNG width and height sit at bytes 16 and 20
  if (png.readUInt32BE(16) !== +size || png.readUInt32BE(20) !== +size) throw new Error(file + ' is not ' + size + 'x' + size);
}
"
node --check content.js
node "$HOME/.claude/scripts/design-slop-lint/slop-lint.mjs" content.js
# Firefox: the same folder must pass Mozilla's add-on linter with no warnings
lint=$(npx --yes web-ext@10.8.0 lint --warnings-as-errors 2>&1) || { echo "$lint"; exit 1; }
echo "verify: ok"
