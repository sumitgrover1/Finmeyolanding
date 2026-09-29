#!/usr/bin/env bash
#
# Ship a change: pull, rebuild, restart, verify.
#
#   ./deploy.sh        (from the repository folder)
#
# Safe to re-run. If anything fails it stops, prints the logs and exits
# non-zero rather than leaving you guessing whether it worked.
#
# Settings live in .env beside this file — see .env.production.example.

set -euo pipefail
cd "$(dirname "$0")"

# .env is read line by line rather than sourced: sourcing executes whatever is
# in there, and a stray quote would break the shell.
read_env() { [[ -f .env ]] || return 0; sed -n "s/^$1=//p" .env | tail -1; }

SITE_URL="$(read_env NEXT_PUBLIC_SITE_URL)"; SITE_URL="${SITE_URL:-https://loan.finmeyo.com}"
API_BASE="$(read_env NEXT_PUBLIC_API_BASE)"; API_BASE="${API_BASE:-https://finmeyo.com}"
CADDY_CONTAINER="${CADDY_CONTAINER:-$(read_env CADDY_CONTAINER)}"
PORT="$(read_env WEB_PORT)"; PORT="${PORT:-3100}"

step() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31mFAILED: %s\033[0m\n' "$1" >&2; }

step "Fetching the latest code"
git pull --ff-only

# ---------------------------------------------------------------------------
# The main site has to allow this origin before the page can post a lead.
# Checked here rather than discovered by a visitor whose form silently failed:
# a browser refuses a cross-origin POST with no matching header, and the only
# sign is an error in a console nobody is watching.
# ---------------------------------------------------------------------------
step "Checking the main site allows this origin"
allow="$(curl -fsS -o /dev/null -w '%{http_code}' \
  -X OPTIONS "$API_BASE/api/capture" \
  -H "Origin: $SITE_URL" \
  -H 'Access-Control-Request-Method: POST' || echo 000)"
if [[ "$allow" == "204" ]]; then
  printf '    %s allows %s\n' "$API_BASE" "$SITE_URL"
else
  fail "$API_BASE did not allow $SITE_URL (preflight returned $allow)."
  cat <<MSG

  On the main site, add this origin to LANDING_ORIGINS in .env.production and
  restart it:

      LANDING_ORIGINS=$SITE_URL

  Deploying without it builds a page whose form cannot submit.
MSG
  exit 1
fi

step "Building and restarting"
docker compose up -d --build

step "Waiting for it to come up"
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/api/health"; then
    printf '    healthy after %ss\n' "$i"
    break
  fi
  if [[ $i -eq 30 ]]; then
    fail "the container did not become healthy."
    docker compose logs --tail 60 loans
    exit 1
  fi
  sleep 1
done

step "Checking the page renders"
if curl -fsS "http://127.0.0.1:$PORT/" | grep -q 'Check your loan eligibility'; then
  printf '    the form is on the page\n'
else
  fail "the page came back without its form."
  docker compose logs --tail 60 loans
  exit 1
fi

if [[ -n "$CADDY_CONTAINER" ]]; then
  step "Reloading the proxy"
  docker exec "$CADDY_CONTAINER" caddy reload --config /etc/caddy/Caddyfile || true
fi

printf '\n\033[1;32mDone. %s is serving the new build.\033[0m\n' "$SITE_URL"
