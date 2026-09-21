#!/usr/bin/env bash
set -Eeuo pipefail

readonly REPO='/home/ubuntu/Rudolf_music_site'
readonly SERVICE='musikschule-tg-bot.service'
readonly ENV_FILE='/etc/music_school.env'
readonly WRAPPER='/usr/local/bin/music-school-agy'
readonly AGY_BIN='/home/ubuntu/.local/bin/agy'
readonly AGY_MODEL='gemini-3.8-flash-medium'
readonly RUN_STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
readonly BACKUP_DIR="/var/backups/musikschule-agy-migration/${RUN_STAMP}"

old_head=''
service_was_active='no'
backup_ready='no'

log() { printf '[agy-migration] %s\n' "$*"; }
fail() { log "ERROR: $*" >&2; exit 1; }

rollback() {
  local exit_code=$?
  trap - ERR
  set +e
  log "Failure detected (exit ${exit_code}); restoring production state."
  systemctl stop "$SERVICE"
  if [[ "$backup_ready" == 'yes' ]]; then
    cp -a "${BACKUP_DIR}/music_school.env" "$ENV_FILE"
    if [[ -f "${BACKUP_DIR}/music-school-agy" ]]; then
      install -o root -g root -m 0755 "${BACKUP_DIR}/music-school-agy" "$WRAPPER"
    else
      rm -f -- "$WRAPPER"
    fi
    if [[ -n "$old_head" ]]; then
      sudo -H -u ubuntu git -C "$REPO" reset --hard "$old_head"
    fi
  fi
  if [[ "$service_was_active" == 'yes' ]]; then
    systemctl start "$SERVICE"
  fi
  log "Rollback finished. Backup: ${BACKUP_DIR}"
  exit "$exit_code"
}
trap rollback ERR

[[ $EUID -eq 0 ]] || fail 'Run as root.'
[[ -x "$AGY_BIN" ]] || fail "AGY binary missing: ${AGY_BIN}"
[[ -f "$ENV_FILE" ]] || fail "Environment file missing: ${ENV_FILE}"
[[ -x "${REPO}/scripts/music-school-agy-wrapper.sh" || -d "$REPO/.git" ]] \
  || fail "Unexpected repository path: ${REPO}"

systemctl is-active --quiet "$SERVICE" && service_was_active='yes'
old_head="$(sudo -H -u ubuntu git -C "$REPO" rev-parse HEAD)"
[[ -z "$(sudo -H -u ubuntu git -C "$REPO" status --porcelain=v1)" ]] \
  || fail 'Production worktree is not clean.'

log "AGY version: $(sudo -H -u ubuntu "$AGY_BIN" --version)"
sudo -H -u ubuntu "$AGY_BIN" models | awk '{print $1}' | grep -Fxq "$AGY_MODEL" \
  || fail "Configured model is unavailable: ${AGY_MODEL}"

log 'Verifying cached AGY authentication in headless sandbox mode.'
auth_result="$(sudo -H -u ubuntu "$AGY_BIN" \
  --add-dir "${REPO}/site" \
  --model "$AGY_MODEL" \
  --mode plan \
  --sandbox \
  --disable-slash-commands \
  --output-format json \
  --print-timeout 60s \
  --print 'Reply with exactly AGY_AUTH_OK. Do not use tools.')"
python3 - "$auth_result" <<'PY'
import json, sys
result = json.loads(sys.argv[1])
if result.get('status') != 'SUCCESS' or result.get('response', '').strip() != 'AGY_AUTH_OK':
    raise SystemExit('AGY authentication smoke failed')
PY

log 'Fetching target revision and checking fast-forward safety.'
sudo -H -u ubuntu git -C "$REPO" fetch origin main
target_head="$(sudo -H -u ubuntu git -C "$REPO" rev-parse origin/main)"
sudo -H -u ubuntu git -C "$REPO" merge-base --is-ancestor "$old_head" "$target_head" \
  || fail 'origin/main is not a fast-forward from production HEAD.'

install -d -o root -g root -m 0700 "$BACKUP_DIR"
cp -a "$ENV_FILE" "${BACKUP_DIR}/music_school.env"
if [[ -f "$WRAPPER" ]]; then cp -a "$WRAPPER" "${BACKUP_DIR}/music-school-agy"; fi
printf '%s\n' "$old_head" >"${BACKUP_DIR}/old_git_head"
backup_ready='yes'

log 'Stopping Telegram bot and updating repository.'
systemctl stop "$SERVICE"
sudo -H -u ubuntu git -C "$REPO" merge --ff-only "$target_head"

log 'Installing root-owned AGY wrapper.'
install -o root -g root -m 0755 "${REPO}/scripts/music-school-agy-wrapper.sh" "$WRAPPER"

log 'Replacing Codex runtime variables with pinned AGY configuration.'
env_tmp="$(mktemp /tmp/music-school-env.XXXXXX)"
awk '!/^(CODEX|AGY)_[A-Z0-9_]+=/' "$ENV_FILE" >"$env_tmp"
{
  printf '\n# Google Antigravity CLI (Telegram bot brain)\n'
  printf 'AGY_BIN=%s\n' "$WRAPPER"
  printf 'AGY_MODEL=%s\n' "$AGY_MODEL"
  printf 'AGY_WORKDIR=%s\n' "${REPO}/site"
  printf 'AGY_TIMEOUT_MS=180000\n'
} >>"$env_tmp"
chown --reference="$ENV_FILE" "$env_tmp"
chmod --reference="$ENV_FILE" "$env_tmp"
mv -f "$env_tmp" "$ENV_FILE"

log 'Installing dependencies and running TypeScript verification.'
sudo -H -u ubuntu env PATH=/home/ubuntu/.nvm/versions/node/v20.20.0/bin:/usr/local/bin:/usr/bin:/bin \
  npm --prefix "${REPO}/services/telegram-bot" ci
sudo -H -u ubuntu env PATH=/home/ubuntu/.nvm/versions/node/v20.20.0/bin:/usr/local/bin:/usr/bin:/bin \
  npm --prefix "${REPO}/services/telegram-bot" run typecheck

log 'Running a reversible AGY write smoke against an allowed content field.'
smoke_prompt="Open ${REPO}/site/src/data/content.js and change only content.hero.title from 'Willkommen in unserer Welt der Klänge und Farben!' to 'AGY PRODUCTION WRITE SMOKE'. Do not delegate, run commands, or edit any other file. Reply exactly AGY_WRITE_OK after the edit."
smoke_input="$(python3 -c 'import json,sys; print(json.dumps({"event":"user","message":{"content":sys.argv[1]}}))' "$smoke_prompt")"
smoke_output="$(mktemp /tmp/agy-write-smoke.XXXXXX.jsonl)"
printf '%s\n' "$smoke_input" | "$WRAPPER" \
  --add-dir "${REPO}/site" \
  --model "$AGY_MODEL" \
  --mode accept-edits \
  --sandbox \
  --disable-slash-commands \
  --input-format stream-json \
  --output-format stream-json \
  --print-timeout 120s >"$smoke_output"
python3 - "$smoke_output" <<'PY'
import json, sys
result = None
with open(sys.argv[1], encoding='utf-8') as stream:
    for line in stream:
        event = json.loads(line)
        if event.get('event') == 'result':
            result = event.get('result')
if not result or result.get('status') != 'SUCCESS':
    raise SystemExit('AGY write smoke did not finish successfully')
PY
mapfile -t changed_files < <(sudo -H -u ubuntu git -C "$REPO" status --porcelain=v1 | sed 's/^...//')
[[ ${#changed_files[@]} -eq 1 && "${changed_files[0]}" == 'site/src/data/content.js' ]] \
  || fail "AGY write smoke changed unexpected files: ${changed_files[*]:-none}"
grep -Fq '"title": "AGY PRODUCTION WRITE SMOKE"' "${REPO}/site/src/data/content.js" \
  || fail 'AGY write smoke did not perform the requested edit.'
sudo -H -u ubuntu git -C "$REPO" restore --worktree -- site/src/data/content.js
rm -f -- "$smoke_output"
[[ -z "$(sudo -H -u ubuntu git -C "$REPO" status --porcelain=v1)" ]] \
  || fail 'Worktree is not clean after AGY write smoke rollback.'

log 'Starting service and verifying health.'
systemctl start "$SERVICE"
systemctl is-active --quiet "$SERVICE"
systemctl is-enabled --quiet "$SERVICE"
sleep 2
curl -ksSf https://127.0.0.1:8443/health | grep -Fq '"ok":true'
curl -fsSf https://musikschule-cms-bielefeld.de:8443/health | grep -Fq '"ok":true'

trap - ERR
log "Migration complete. New HEAD: $(sudo -H -u ubuntu git -C "$REPO" rev-parse HEAD)"
log "Backup: ${BACKUP_DIR}"
