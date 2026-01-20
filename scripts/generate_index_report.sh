#!/usr/bin/env bash
set -euo pipefail

out_file="${1:-}"
if [ -z "${out_file}" ]; then
  if [ -d "meta" ]; then
    out_file="meta/INDEX_REPORT.md"
  else
    out_file="INDEX_REPORT.md"
  fi
fi
out_dir="$(dirname "${out_file}")"
if [ ! -d "${out_dir}" ]; then
  mkdir -p "${out_dir}"
fi

agent_model="${AGENT_MODEL:-unknown}"
agent_account="${AGENT_ACCOUNT:-unknown}"
agent_session_id="${AGENT_SESSION_ID:-unknown}"

timestamp_utc="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
  git_head="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
else
  git_branch="unknown"
  git_head="unknown"
fi

tmp_list_file="$(mktemp)"
if command -v rg >/dev/null 2>&1 && rg --files >/dev/null 2>&1; then
  inventory_source="rg --files"
  rg --files > "${tmp_list_file}"
else
  inventory_source="find . -type f -not -path */.git/* -print"
  find . -type f -not -path "*/.git/*" -print > "${tmp_list_file}"
fi

total_files="$(wc -l < "${tmp_list_file}" | tr -d ' ')"

{
  echo "# INDEX_REPORT.md — отчёт индексирования проекта"
  echo
  echo "## Metadata"
  echo "- generated_at_utc: ${timestamp_utc}"
  echo "- agent_model: ${agent_model}"
  echo "- agent_account: ${agent_account}"
  echo "- agent_session_id: ${agent_session_id}"
  echo "- git_branch: ${git_branch}"
  echo "- git_head: ${git_head}"
  echo "- output_path: ${out_file}"
  echo "- scope: full index"
  echo
  echo "## Правила пересоздания"
  echo "- первое появление модели+аккаунта в проекте"
  echo "- последний отчёт старше 7 дней"
  echo "- изменился git_head по сравнению с отчётом"
  echo "- явный запрос пользователя"
  echo "- крупная реорганизация структуры"
  echo
  echo "## Сводка"
  echo "- total_files: ${total_files}"
  echo "- inventory_source: ${inventory_source}"
  echo "- notes: отчёт включает полный список файлов проекта"
  echo
  echo "## Полный список файлов"
  echo '```'
  sort < "${tmp_list_file}"
  echo '```'
} > "${out_file}"

rm -f "${tmp_list_file}"

printf "OK: wrote %s\n" "${out_file}"
