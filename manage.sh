#!/usr/bin/env bash
#
# Container management helper for the BYOS TRMNL server.
#
# The app is built as a production image (`pnpm run build`) with no hot
# reload, so any code change needs a rebuild. This wraps the common
# docker-compose flows so you don't have to remember the flags.
#
# Usage:  ./manage.sh <command> [args]
#   ./manage.sh rebuild            Rebuild + restart the app (most common)
#   ./manage.sh rebuild --clean    Rebuild ignoring Docker layer cache
#   ./manage.sh up                 Start app + db (no rebuild)
#   ./manage.sh down               Stop all containers
#   ./manage.sh restart            Restart the app without rebuilding
#   ./manage.sh logs [service]     Follow logs (default: trmnl_app)
#   ./manage.sh status             Show container status
#   ./manage.sh shell              Open a shell in the app container
#   ./manage.sh db                 Open a psql shell on the database
#   ./manage.sh render <slug>      Render a recipe PNG to /tmp/<slug>.png
#                                  e.g. ./manage.sh render weather3
#
set -euo pipefail

# Always operate from the repo root (where this script lives).
cd "$(dirname "$0")"

APP=trmnl_app
DB=trmnl_db
DB_USER=postgres
DB_NAME=byos_db
HOST_PORT=3777
BASE_URL="http://localhost:${HOST_PORT}"

# ── helpers ─────────────────────────────────────────────────────────────
log() { printf '\033[1;36m▶ %s\033[0m\n' "$*"; }
err() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; }

# Block until the app answers on its host port (build + boot can take a while).
wait_for_app() {
	log "Waiting for app on ${BASE_URL} ..."
	for _ in $(seq 1 120); do
		if curl -sf -o /dev/null "${BASE_URL}" 2>/dev/null; then
			log "App is up at ${BASE_URL}"
			return 0
		fi
		sleep 1
	done
	err "App did not become ready in time — check: ./manage.sh logs"
	return 1
}

# ── commands ────────────────────────────────────────────────────────────
cmd_rebuild() {
	if [[ "${1:-}" == "--clean" ]]; then
		log "Clean rebuild (no cache) of ${APP} ..."
		docker compose build --no-cache "${APP}"
		docker compose up -d "${APP}"
	else
		log "Rebuilding + restarting ${APP} ..."
		docker compose up -d --build "${APP}"
	fi
	wait_for_app
}

cmd_up() {
	log "Starting containers ..."
	docker compose up -d
	wait_for_app
}

cmd_down() {
	log "Stopping containers ..."
	docker compose down
}

cmd_restart() {
	log "Restarting ${APP} (no rebuild) ..."
	docker compose restart "${APP}"
	wait_for_app
}

cmd_logs() {
	docker compose logs -f "${1:-$APP}"
}

cmd_status() {
	docker compose ps
}

cmd_shell() {
	docker compose exec "${APP}" sh
}

cmd_db() {
	docker compose exec "${DB}" psql -U "${DB_USER}" -d "${DB_NAME}"
}

cmd_render() {
	local slug="${1:-}"
	if [[ -z "${slug}" ]]; then
		err "Usage: ./manage.sh render <slug> [width] [height] [extra-query]"
		exit 1
	fi
	local width="${2:-1304}"
	local height="${3:-984}"
	local extra="${4:-}"
	local out="/tmp/${slug}.png"
	local url="${BASE_URL}/api/png/${slug}.png?width=${width}&height=${height}"
	[[ -n "${extra}" ]] && url="${url}&${extra}"
	log "Rendering ${slug} → ${out}"
	local code
	code=$(curl -s -o "${out}" -w '%{http_code}' "${url}")
	log "HTTP ${code} · saved ${out}"
}

# ── dispatch ────────────────────────────────────────────────────────────
cmd="${1:-}"
shift || true
case "${cmd}" in
	rebuild) cmd_rebuild "$@" ;;
	up)      cmd_up ;;
	down)    cmd_down ;;
	restart) cmd_restart ;;
	logs)    cmd_logs "$@" ;;
	status)  cmd_status ;;
	shell)   cmd_shell ;;
	db)      cmd_db ;;
	render)  cmd_render "$@" ;;
	*)
		grep -E '^#( |$)' "$0" | sed -E 's/^# ?//'
		exit 1
		;;
esac
