#!/bin/bash
# ============================================================================
#  revert.sh — restore ~/.zshrc to the pre-WarMode original
#
#  This script MODIFIES a file outside the testing folder (~/.zshrc).
#  It is provided for you to run deliberately; it is never run automatically.
#
#  Usage:
#    bash revert.sh          # apply the revert
#    bash revert.sh --check  # report only, change nothing
# ============================================================================

set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP="$HERE/original-zshrc.backup"
TARGET="$HOME/.zshrc"
EXPECTED_SHA="99705c281b9bfce833bea4e390dcbe530f98315db2222b707ff66eefb6175027"

CHECK_ONLY=0
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=1

fail() { printf '\033[1;31mERROR:\033[0m %s\n' "$1" >&2; exit 1; }
ok()   { printf '\033[1;32mOK:\033[0m %s\n' "$1"; }
info() { printf '\033[1;36mINFO:\033[0m %s\n' "$1"; }

[[ -f "$BACKUP" ]] || fail "backup not found: $BACKUP"
[[ -f "$TARGET" ]] || fail "target not found: $TARGET"

# --- report current state ---------------------------------------------------
CUR_SHA=$(shasum -a 256 "$TARGET" | awk '{print $1}')
info "current  $TARGET"
info "  sha256 = $CUR_SHA"

if [[ "$CUR_SHA" == "$EXPECTED_SHA" ]]; then
  ok "~/.zshrc already matches the original — nothing to do."
  exit 0
fi

info "backup   $BACKUP"
info "  sha256 = $(shasum -a 256 "$BACKUP" | awk '{print $1}')"

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  info "--check given: no changes made."
  info "run without --check to restore."
  exit 0
fi

# --- apply ------------------------------------------------------------------
STAMP=$(date +%Y%m%d-%H%M%S)
cp "$TARGET" "$TARGET.pre-revert.$STAMP"
info "saved current file to $TARGET.pre-revert.$STAMP"

cp "$BACKUP" "$TARGET"
NEW_SHA=$(shasum -a 256 "$TARGET" | awk '{print $1}')

if [[ "$NEW_SHA" != "$EXPECTED_SHA" ]]; then
  fail "restored file checksum mismatch ($NEW_SHA); original backup kept at $TARGET.pre-revert.$STAMP"
fi

ok "~/.zshrc restored to the original."
zsh -n "$TARGET" && ok "syntax check passed."
printf '\nRun  exec zsh  to reload, or open a new terminal tab.\n'