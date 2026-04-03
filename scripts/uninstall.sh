#!/usr/bin/env bash
# =============================================================
# Mehtrics Uninstaller
# =============================================================
# Usage: bash scripts/uninstall.sh
# =============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

INSTALL_DIR="${MEHTRICS_DIR:-$HOME/.mehtrics}"
DOCKER_COMPOSE_FILE="$INSTALL_DIR/docker/docker-compose.yml"
ENV_FILE="$INSTALL_DIR/.env"

log() { echo -e "${BLUE}[Mehtrics]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }

# =============================================================
# Confirm
# =============================================================
echo ""
echo "======================================================"
echo -e "  ${RED}Mehtrics Uninstaller${NC}"
echo "======================================================"
echo ""
echo "  This will:"
echo "    - Stop and remove all Mehtrics containers"
echo "    - Remove all Docker volumes (your analytics data)"
echo "    - Remove Docker networks"
echo "    - Delete the .env file"
echo ""

read -r -p "Are you sure? This is IRREVERSIBLE. Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

# Optional: remove images too
read -r -p "Also remove Docker images? (y/N): " REMOVE_IMAGES
REMOVE_IMAGES="${REMOVE_IMAGES:-n}"

# =============================================================
# Step 1: Stop containers
# =============================================================
log "Stopping containers..."
if [ -f "$DOCKER_COMPOSE_FILE" ]; then
  docker compose -f "$DOCKER_COMPOSE_FILE" --env-file "${ENV_FILE:-/dev/null}" stop 2>/dev/null || true
  success "Containers stopped."
else
  warn "docker-compose.yml not found - skipping."
fi

# =============================================================
# Step 2: Remove containers
# =============================================================
log "Removing containers..."
docker compose -f "$DOCKER_COMPOSE_FILE" down 2>/dev/null || true
success "Containers removed."

# =============================================================
# Step 3: Remove volumes and DB
# =============================================================
log "Removing volumes & data..."

docker compose -f "$DOCKER_COMPOSE_FILE" down -v 2>/dev/null || true

# Fallback: remove by name
if ! docker volume rm mehtrics_postgres-data mehtrics_redis-data 2>/dev/null; then
  warn "Some volumes could not be removed."
fi

if [ -d /opt/geolite ]; then
  sudo rm -rf /opt/geolite
  success "GeoLite data removed."
else
  warn "/opt/geolite not found."
fi

success "Volumes and internal data removed."

# =============================================================
# Step 4: Remove networks
# =============================================================
log "Removing networks..."

if docker network inspect mehtrics_mehtrics-net >/dev/null 2>&1; then
  docker network rm mehtrics_mehtrics-net
  success "Network removed."
else
  warn "Network mehtrics_mehtrics-net not found."
fi

success "Networks removed."

# =============================================================
# Step 5: Remove images (optional)
# =============================================================
if [[ "$REMOVE_IMAGES" =~ ^([Yy]|[Yy][Ee][Ss])$ ]]; then
  log "Removing images..."

  if ! docker images --filter "label=maintainer=mehtrics" -q | xargs -r docker rmi -f 2>/dev/null; then
    warn "Some images could not be removed."
  fi

  # Fallback: remove by name
  if ! docker rmi mehtrics-postgres mehtrics-redis mehtrics-app 2>/dev/null; then
    warn "Some images could not be removed."
  fi

  success "Images removed."
fi

# =============================================================
# Step 6: Remove .env file
# =============================================================
if [ -f "$ENV_FILE" ]; then
  log "Removing .env file..."
  rm -f "$ENV_FILE"
  success ".env removed."
fi

# =============================================================
# Done
# =============================================================
echo ""
echo "======================================================"
echo -e "${GREEN}  Mehtrics uninstalled successfully.${NC}"
echo "======================================================"
echo ""
echo "  The installation directory was kept: $INSTALL_DIR"
echo "  Remove it manually with: rm -rf $INSTALL_DIR"
echo ""
