#!/bin/sh
#set -e  # Exit on any error



# ── Colors ─────────────────────────────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"

FG_GRAY="\033[90m"
FG_RED="\033[31m"
FG_GREEN="\033[32m"
FG_YELLOW="\033[33m"
FG_BLUE="\033[34m"
FG_CYAN="\033[36m"

# ── Timestamp helper ──────────────────────────────────────────────────────────
timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}
# ── Logging helpers ───────────────────────────────────────────────────────────
log_info() {
  # usage: log_info "message"
  echo "$(timestamp) ${FG_BLUE}[INFO]${RESET} $1" >&2
}

log_success() {
  echo "$(timestamp) ${FG_GREEN}[OK]${RESET}   $1" >&2
}

log_warn() {
  echo "$(timestamp) ${FG_YELLOW}[WARN]${RESET} $1" >&2
}

log_error() {
  echo "$(timestamp) ${FG_RED}[ERR]${RESET}  $1" >&2
}

log_step() {
  # For big, visible steps
  echo >&2
  echo "${BOLD}${FG_CYAN}==== $1 ====${RESET}" >&2
}

log_header() {
  echo >&2
  echo "${BOLD}${FG_CYAN}┌───────────────────────────────────────────────┐${RESET}" >&2
  echo "${BOLD}${FG_CYAN}│  $GITLINE_NAME - Outline → Git Sync           │${RESET}" >&2
  echo "${BOLD}${FG_CYAN}│  Author: $GITLINE_AUTHOR                      │${RESET}" >&2
  echo "${BOLD}${FG_CYAN}└───────────────────────────────────────────────┘${RESET}" >&2
}

get_collection_updated_at() {
  local outline_url="$1"
  local outline_apikey="$2"
  local collection_id="$3"

  log_step "Checking Outline collection last update"
  log_info "Collection ID: $collection_id"

  response=$(curl -s -X POST "${outline_url}/api/collections.info" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${outline_apikey}" \
    --data-binary "{\"id\":\"$collection_id\"}")

  # Use grep/cut to extract updatedAt without full JSON parsing
  updated_at=$(printf '%s\n' "$response" \
    | tr -d '\n' \
    | grep -o '"updatedAt":"[^"]*"' \
    | head -1 \
    | cut -d'"' -f4)

  if [ -z "$updated_at" ]; then
    log_warn "Could not extract updatedAt; treating as 'changed'"
    updated_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  fi

  log_info "Using updatedAt for comparison: $updated_at"
  echo "$updated_at"
}

ensure_repo_cloned() {
  local github_url="$1"
  local github_user="$2"
  local github_key="$3"
  local repo_dir="repo"

  # URL encode username and key
  local encoded_user
  encoded_user=$(printf %s "$github_user" | jq -sRr @uri)
  local encoded_key
  encoded_key=$(printf %s "$github_key" | jq -sRr @uri)

  local clean_url="${github_url#https://}"
  clean_url="${clean_url#http://}"
  local auth_url="https://${encoded_user}:${encoded_key}@${clean_url}"

  if [ -d "$repo_dir/.git" ]; then
    log_info "Repo already present locally, skipping pre-clone"
    return 0
  fi

  log_step "Initial clone of GitHub repository (for sync state file)"
  git clone "$auth_url" "$repo_dir"
}

outline_export_start() {
  local outline_url="$1"
  local outline_apikey="$2"
  local collection_id="$3"
  
  log_step "Starting Outline export"
  log_info "Collection ID: $collection_id"
  
  response=$(curl -s -X POST "${outline_url}/api/collections.export" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${outline_apikey}" \
    -d "$(jq -n --arg id "$collection_id" '{id: $id, format: "outline-markdown"}')")
  
  file_operation_id=$(echo "$response" | jq -r '.data.fileOperation.id')
  
  if [ "$file_operation_id" = "null" ] || [ -z "$file_operation_id" ]; then
      log_error "Failed to start export"
      echo "$response" >&2
      return 1
    fi

    log_success "Export started (operation ID: $file_operation_id)"
    echo "$file_operation_id"
}

outline_export_status() {
  local outline_url="$1"
  local outline_apikey="$2"
  local operation_id="$3"
  local delay="$4"
  
  local delay_seconds=$((delay + 1))

  log_step "Waiting for Outline export to complete"
  log_info "Operation ID: $operation_id"
  
  while true; do
    log_info "Sleeping ${delay_seconds}s before status check..."
    sleep "$delay_seconds"
    
    response=$(curl -s -X POST "${outline_url}/api/fileOperations.info" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${outline_apikey}" \
      -d "$(jq -n --arg id "$operation_id" '{id: $id}')")
    
    state=$(echo "$response" | jq -r '.data.state')
    
    log_info "Current state: $state"

    if [ "$state" = "complete" ]; then
      log_success "Export state is 'complete'"
      return 0
    elif [ "$state" = "error" ]; then
      log_error "Export state is 'error'"
      echo "$response" >&2
      return 1
    fi
  done
}

outline_download_archive() {
  local outline_url="$1"
  local outline_apikey="$2"
  local operation_id="$3"
  
  log_step "Downloading archive for operation: $operation_id"
  
  # Create temp directory if it doesn't exist
  mkdir -p temp
  
  local file_path="temp/download.zip"
  
  # Download the file
  curl -s -L -X GET "${outline_url}/api/fileOperations.redirect?id=${operation_id}" \
    -H "Authorization: Bearer ${outline_apikey}" \
    -o "$file_path"
  
  if [ ! -f "$file_path" ]; then
    log_error "Failed to download archive!"
    return 1
  fi
  log_info "Archive downloaded to: $file_path"
  echo "$file_path"  # Return the file path
}

outline_extract_archive() {
  local zip_file="$1"
  local extract_path="temp"
  
  log_step "Extracting archive: $zip_file"
  
  # Extract the zip file
  unzip -q -o "$zip_file" -d "$extract_path"
  # Remvoe the zip file
  rm $zip_file
  
  if [ $? -eq 0 ]; then
    log_info "Archive extracted to: $extract_path"
    echo "$extract_path"  # Return the extraction path
    return 0
  else
    log_error "Failed to extract archive!"
    return 1
  fi
}

sync_to_github() {
  local extract_path="$1"
  local github_url="$2"
  local github_user="$3"
  local github_key="$4"
  local repo_dir="repo"
  
  log_step "Syncing to GitHub"
  
  # URL encode the username and key (especially important for @ symbols)
  local encoded_user=$(printf %s "$github_user" | jq -sRr @uri)
  local encoded_key=$(printf %s "$github_key" | jq -sRr @uri)
  
  # Build authenticated URL properly
  local clean_url="${github_url#https://}"
  local clean_url="${clean_url#http://}"
  local auth_url="https://${encoded_user}:${encoded_key}@${clean_url}"
  
  # Clone or pull the repository
  if [ -d "$repo_dir/.git" ]; then
    log_info "Repository exists, pulling latest changes..."
    cd "$repo_dir"
    git pull
    cd ..
  else
    log_info "Cloning repository..."
    git clone "$auth_url" "$repo_dir"
  fi
  
  # Remove old content (except .git directory)
  log_info "Clearing old content..."
  find "$repo_dir" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
  
  # Copy new content from extracted archive
  log_info "Copying new content..."
  cp -r "$extract_path"/* "$repo_dir"/
  
  # Configure git user
  cd "$repo_dir"
  git config user.name "GitLine Bot"
  git config user.email "$github_user"
  
  # Check if there are changes
  if [ -n "$(git status --porcelain)" ]; then
    log_info "Changes detected, committing..."
    git add .
    git commit -m "Sync from Outline - $(date '+%Y-%m-%d %H:%M:%S')"
    
    log_info "Pushing to GitHub..."
    git push
    
    log_info "Successfully synced to GitHub!"
  else
    log_info "No changes to commit"
  fi
  
  cd ..
  
  return 0
}

outline_cleanup() {
  local outline_url="$1"
  local outline_apikey="$2"
  local operation_id="$3"
  
  log_step "Cleaning up"
  
  # Delete the file operation from Outline
  log_info "Deleting file operation from Outline..."
  response=$(curl -s -w "\n%{http_code}" -X POST "${outline_url}/api/fileOperations.delete" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${outline_apikey}" \
    -d "$(jq -n --arg id "$operation_id" '{id: $id}')")
  
  # Extract HTTP status code (last line)
  http_code=$(echo "$response" | tail -n1)
  response_body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" != "200" ]; then
    log_error "Warning: Could not delete file operation (HTTP $http_code)"
    echo "$response_body" >&2
  else
    log_info "File operation deleted from Outline"
  fi
  
  # Clean up local temp directory
  log_info "Removing local temp files..."
  if [ -d "temp" ]; then
    rm -rf temp
    log_info "Temp directory removed"
  fi
  
  log_info "Cleanup completed successfully"
  return 0
}

# ── Main script execution ──────────────────────────────────────────────────────


# Ensure repo exists so we can read/write the sync marker file
ensure_repo_cloned "$GITHUB_URL" "$GITHUB_USER" "$GITHUB_KEY"

# 1) Get current updatedAt from Outline
current_updated_at=$(get_collection_updated_at "$OUTLINE_URL" "$OUTLINE_API_KEY" "$OUTLINE_COLLECTION_ID") || {
  log_error "get_collection_updated_at failed; aborting run"
  exit 1
}

repo_dir="repo"
sync_marker_file="$repo_dir/.gitline_last_sync"

last_synced_at=""
if [ -f "$sync_marker_file" ]; then
  last_synced_at=$(cat "$sync_marker_file")
  log_info "Last synced updatedAt: $last_synced_at"
else
  log_warn "No previous sync marker found – will treat as first sync"
fi

# 2) Compare timestamps
if [ -n "$last_synced_at" ] && [ "$last_synced_at" = "$current_updated_at" ]; then
  log_step "No changes detected in Outline collection"
  log_info "Skipping export + Git sync (collection not updated)"
  exit 0
fi

log_step "Changes detected – starting Outline → Git sync pipeline"

# 3) Run full export + sync process

file_operation_id=$(outline_export_start "$OUTLINE_URL" "$OUTLINE_API_KEY" "$OUTLINE_COLLECTION_ID")
log_info "Captured operation ID: $file_operation_id"

outline_export_status "$OUTLINE_URL" "$OUTLINE_API_KEY" "$file_operation_id" 5

archive_path=$(outline_download_archive "$OUTLINE_URL" "$OUTLINE_API_KEY" "$file_operation_id")
log_success "Archive downloaded: $archive_path"

extract_path=$(outline_extract_archive "$archive_path")
log_success "Extract complete: $extract_path"

sync_to_github "$extract_path" "$GITHUB_URL" "$GITHUB_USER" "$GITHUB_KEY"
log_success "GitHub Sync finished"

# 4) Update sync marker to the current updatedAt
sync_marker_file="$repo_dir/.gitline_last_sync"
echo "$current_updated_at" > "$sync_marker_file"

(
  cd "$repo_dir"
  git add ".gitline_last_sync"
  if [ -n "$(git status --porcelain .gitline_last_sync)" ]; then
    log_info "Committing updated sync marker"
    git commit -m "Update GitLine sync marker: $current_updated_at"
    git push
  else
    log_info "Sync marker unchanged, no extra commit needed"
  fi
)

outline_cleanup "$OUTLINE_URL" "$OUTLINE_API_KEY" "$file_operation_id"
log_success "Clenaup finished"

log_step "GitLine sync completed"
log_success "All steps finished successfully"
echo