#!/usr/bin/env bash
# =============================================================
# Mehtrics Installer
# =============================================================
# Usage: curl -fsSL https://yourhost.com/install.sh | bash
#        or: bash install.sh
# =============================================================

set -euo pipefail

# ---- Colors ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ---- Config ----
INSTALL_DIR="${MEHTRICS_DIR:-$HOME/.mehtrics}"
REPO_URL="https://github.com/yogendrarana/mehtrics"

MEHTRICS_ENV="${MEHTRICS_ENV:-production}"
if [ "$MEHTRICS_ENV" = "development" ] || [ "$MEHTRICS_ENV" = "local" ] || [ "$MEHTRICS_ENV" = "dev" ]; then
  MEHTRICS_ENV="development"
  DOCKER_COMPOSE_FILE="$INSTALL_DIR/docker/docker-compose.dev.yml"
else
  MEHTRICS_ENV="production"
  DOCKER_COMPOSE_FILE="$INSTALL_DIR/docker/docker-compose.prod.yml"
fi
ENV_FILE="$INSTALL_DIR/.env"
APP_PORT="${APP_PORT:-8080}"
MAXMIND_ACCOUNT_ID="${MAXMIND_ACCOUNT_ID:-}"
MAXMIND_LICENSE_KEY="${MAXMIND_LICENSE_KEY:-}"

log() { echo -e "${BLUE}[Mehtrics]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# =============================================================
# Step 1: Detect OS
# =============================================================
detect_os() {
  log "Detecting operating system..."
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  case "$OS" in
    Linux)  OS_TYPE="linux" ;;
    Darwin) OS_TYPE="macos" ;;
    *) error "Unsupported OS: $OS ($ARCH). Mehtrics supports Linux and macOS only." ;;
  esac

  success "Detected: $OS_TYPE ($ARCH)"
}

# =============================================================
# Step 2: Install Docker
# =============================================================
install_docker() {
  if command -v docker &>/dev/null; then
    success "Docker already installed: $(docker --version)"
    return
  fi

  log "Installing Docker..."

  if [ "$OS_TYPE" = "linux" ]; then
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER" || true
    success "Docker installed. You may need to log out and back in."
  elif [ "$OS_TYPE" = "macos" ]; then
    if command -v brew &>/dev/null; then
      brew install --cask docker
      success "Docker Desktop installed via Homebrew."
    else
      error "Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
    fi
  fi
}

# =============================================================
# Step 3: Install Docker Compose
# =============================================================
install_docker_compose() {
  if docker compose version &>/dev/null 2>&1; then
    success "Docker Compose (plugin) already installed."
    return
  fi

  if command -v docker-compose &>/dev/null; then
    success "docker-compose already installed."
    return
  fi

  log "Installing Docker Compose plugin..."
  COMPOSE_VERSION="2.24.0"
  sudo mkdir -p /usr/local/lib/docker/cli-plugins
  sudo curl -sL "https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  success "Docker Compose installed."
}

# =============================================================
# Step 4: Clone / Update repo
# =============================================================
setup_files() {
  log "Setting up Mehtrics files in $INSTALL_DIR..."

  if [ "${SKIP_GIT:-0}" = "1" ]; then
    warn "SKIP_GIT=1 detected. Using existing files without updating from GitHub."
    return
  fi

  if [ -d "$INSTALL_DIR/.git" ]; then
    warn "Mehtrics directory already exists. Pulling latest..."
    git -C "$INSTALL_DIR" pull --quiet
  else
    git clone --quiet "$REPO_URL" "$INSTALL_DIR"
  fi

  success "Files ready."
}

# =============================================================
# Step 4.5: Download MaxMind Database
# =============================================================
download_maxmind() {
  if [ -f "/opt/geolite/GeoLite2-City.mmdb" ]; then
    success "MaxMind database already exists in /opt/geolite."
    return
  fi

  echo ""
  read -r -p "Do you want to download MaxMind GeoLite2 for IP geolocation? (y/N): " DOWNLOAD_GEO
  if [[ ! "$DOWNLOAD_GEO" =~ ^([Yy]|[Yy][Ee][Ss])$ ]]; then
    warn "Skipping MaxMind download. Geolocation will be limited."
    warn "To set it up later, place GeoLite2-City.mmdb in /opt/geolite/GeoLite2-City.mmdb"
    return
  fi

  if [ -z "$MAXMIND_ACCOUNT_ID" ]; then
    read -r -p "Enter MaxMind Account ID: " MAXMIND_ACCOUNT_ID
  fi
  if [ -z "$MAXMIND_LICENSE_KEY" ]; then
    read -r -p "Enter MaxMind License Key: " MAXMIND_LICENSE_KEY
  fi

  # Require env vars if they chose to install
  if [ -z "$MAXMIND_ACCOUNT_ID" ] || [ -z "$MAXMIND_LICENSE_KEY" ]; then
    error "MaxMind Account ID and License Key are required to download the database. Aborting installation."
  fi

  log "Downloading MaxMind GeoLite2 database..."

  sudo mkdir -p /opt/geolite

  local tmp_file="/tmp/geolite.tar.gz"
  local url="https://download.maxmind.com/geoip/databases/GeoLite2-City/download?suffix=tar.gz"

  if curl -fL -u "$MAXMIND_ACCOUNT_ID:$MAXMIND_LICENSE_KEY" \
    "$url" \
    -o "$tmp_file"; then

    tar -xzf "$tmp_file" -C /tmp

    local extracted_dir
    extracted_dir=$(find /tmp -type d -name "GeoLite2-City_*" | head -n 1)

    if [ -f "$extracted_dir/GeoLite2-City.mmdb" ]; then
      sudo mv "$extracted_dir/GeoLite2-City.mmdb" /opt/geolite/
      success "MaxMind GeoLite2 database installed to /opt/geolite."
    else
      warn "Extraction failed: .mmdb file not found."
    fi

    rm -rf "$tmp_file" "$extracted_dir"
  else
    warn "Failed to download GeoLite2 database from MaxMind."
  fi
}

# =============================================================
# Step 5: Generate .env file
# =============================================================
generate_env() {
  if [ -f "$ENV_FILE" ]; then
    warn ".env file already exists — skipping generation."
    return
  fi

  log "Generating .env file..."

  # Generate random secrets
  AUTH_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '/+=' | head -c 64)
  DB_PASSWORD=$(openssl rand -hex 16 2>/dev/null || head -c 16 /dev/urandom | base64 | tr -d '/+=' | head -c 32)

  cat > "$ENV_FILE" <<EOF
# Mehtrics Configuration - Generated by install.sh
NODE_ENV=${MEHTRICS_ENV}
NEXT_PUBLIC_APP_URL=http://localhost:${APP_PORT}
BETTER_AUTH_URL=http://localhost:${APP_PORT}

# Database
POSTGRES_USER=mehtrics
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=mehtrics
POSTGRES_PORT=5432
DATABASE_URL=postgresql://mehtrics:${DB_PASSWORD}@postgres:5432/mehtrics

# Redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379

# Auth
BETTER_AUTH_SECRET=${AUTH_SECRET}

# Ports
WWW_PORT=3000
APP_PORT=${APP_PORT}

# Maxmind GeoLite
MAXMIND_ACCOUNT_ID=${MAXMIND_ACCOUNT_ID}
MAXMIND_LICENSE_KEY=${MAXMIND_LICENSE_KEY}
GEOLITE_DB_PATH=/opt/geolite/GeoLite2-City.mmdb
EOF

  success ".env file generated."
}

# =============================================================
# Step 6: Start services
# =============================================================
start_services() {
  log "Starting Docker services..."
  cd "$INSTALL_DIR/docker"
  docker compose -f "$DOCKER_COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
  success "Services started."
}

# =============================================================
# Step 7: Wait for healthy services
# =============================================================
wait_healthy() {
  log "Waiting for services to be healthy..."
  local max_wait=60
  local elapsed=0

  while [ $elapsed -lt $max_wait ]; do
    if docker compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "healthy"; then
      success "All services healthy."
      return
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done

  warn "Services may not be fully healthy yet. Check with: docker compose ps"
}

# =============================================================
# Step 8: Run migrations
# =============================================================
run_migrations() {
  log "Running database migrations..."
  docker compose -f "$DOCKER_COMPOSE_FILE" --env-file "$ENV_FILE" \
    run --rm app bun --filter @mehtrics/db run db:migrate || \
    warn "Migrations may have failed - check logs."
  success "Migrations complete."
}

# =============================================================
# Step 9: Print info
# =============================================================
print_info() {
  echo ""
  echo "======================================================"
  echo -e "${GREEN}   Mehtrics is ready! ${NC}"
  echo "======================================================"
  echo ""
  echo -e "  Dashboard: ${BLUE}http://localhost:${APP_PORT}${NC}"
  echo ""
  echo "  On first visit, you'll be prompted to create your"
  echo "  admin account at /setup"
  echo ""
  echo "  Useful commands:"
  echo "    View logs:    docker compose -f $DOCKER_COMPOSE_FILE logs -f"
  echo "    Stop:         docker compose -f $DOCKER_COMPOSE_FILE down"
  echo "    Uninstall:    bash $INSTALL_DIR/scripts/uninstall.sh"
  echo ""
}

# =============================================================
# Main
# =============================================================
main() {
  echo ""
  echo "======================================================"
  echo "   Mehtrics Installer"
  echo "======================================================"
  echo ""

  detect_os
  install_docker
  install_docker_compose
  setup_files
  download_maxmind
  generate_env
  start_services
  wait_healthy
  run_migrations
  print_info
}

main "$@"
