#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

fail=0

if git ls-files --error-unmatch .env >/dev/null 2>&1; then
  echo "FAIL: .env is tracked by git"
  fail=1
fi

tracked_secret_files=$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -vE '\.env\.example$|\.env\.test\.example$' || true)
if [ -n "$tracked_secret_files" ]; then
  echo "FAIL: tracked env files: $tracked_secret_files"
  fail=1
fi

patterns=(
  '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'
  '[0-9]{8,10}:[A-Za-z0-9_-]{35}'
  'AKIA[0-9A-Z]{16}'
  'sk-[A-Za-z0-9]{20,}'
)

files=$(git ls-files -c -o --exclude-standard | grep -vE '^pnpm-lock\.yaml$' || true)
for pattern in "${patterns[@]}"; do
  hits=$(echo "$files" | grep . | xargs grep -lIE "$pattern" 2>/dev/null || true)
  if [ -n "$hits" ]; then
    echo "FAIL: pattern '$pattern' matched in: $hits"
    fail=1
  fi
done

# 64-hex matches tx/result hashes in evidence, so key-shaped hits are only
# flagged outside artifacts/, docs/ and the status report, where no legitimate
# hash lives in code.
code_files=$(echo "$files" | grep -vE '^(artifacts/|docs/|STATUS\.md$)' | grep . || true)
key_hits=$(echo "$code_files" | grep . | xargs grep -lIE '(PRIVATE_KEY|privateKey|secret)[^=]*=[^0]*0x[a-fA-F0-9]{64}' 2>/dev/null || true)
plain_hits=$(echo "$code_files" | grep -vE '\.(test|spec)\.ts$|^packages/core/src/data/' | grep . | xargs grep -lIE '"?0x[a-fA-F0-9]{64}"?' 2>/dev/null || true)
if [ -n "$key_hits$plain_hits" ]; then
  echo "FAIL: possible key material in: $key_hits $plain_hits"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "secret scan: PASS"
else
  exit 1
fi
