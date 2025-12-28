#!/bin/sh

#set -e  # exit on error
#set -x  # trace commands

# Fail fast if env vars are missing
: "${OUTLINE_URL:?Missing OUTLINE_URL in env file}"
: "${OUTLINE_API_KEY:?Missing OUTLINE_API_KEY in env file}"
: "${OUTLINE_COLLECTION_ID:?Missing OUTLINE_COLLECTION_ID in env file}"
: "${GITHUB_URL:?Missing GITHUB_URL in env file}"
: "${GITHUB_USER:?Missing GITHUB_USER in env file}"
: "${GITHUB_KEY:?Missing GITHUB_KEY in env file}"

# ── GitLine Branding ────────────────────────────────────────────────────────────
GITLINE_NAME="GitLine"
GITLINE_AUTHOR="Niklas Stephan"

# ── Colors ─────────────────────────────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"

FG_GRAY="\033[90m"
FG_RED="\033[31m"
FG_GREEN="\033[32m"
FG_YELLOW="\033[33m"
FG_BLUE="\033[34m"
FG_CYAN="\033[36m"

log_header() {
  echo >&2
  echo "${BOLD}${FG_CYAN}┌───────────────────────────────────────────────┐${RESET}" >&2
  echo "${BOLD}${FG_CYAN}│  $GITLINE_NAME - Outline → Git Sync           │${RESET}" >&2
  echo "${BOLD}${FG_CYAN}│  Author: $GITLINE_AUTHOR                      │${RESET}" >&2
  echo "${BOLD}${FG_CYAN}└───────────────────────────────────────────────┘${RESET}" >&2
}

log_header

/home/gitline/sync.sh

# Then run every 5 minutes
while true; do
  sleep 300  # 5 minutes = 300 seconds
  /home/gitline/sync.sh
done

tail -f /dev/null