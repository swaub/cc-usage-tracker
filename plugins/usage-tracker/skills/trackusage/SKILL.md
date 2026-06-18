---
description: Turn the live Usage Tracker statusline on or off, check its status, or switch the token counter between input+output and cache-included. Accepts "on", "off", "status", "cache on", "cache off", "cache", or no argument (toggles on/off).
allowed-tools: Bash, Read, Edit, Write
---

# Track Usage — toggle the live usage statusline

The user wants to control the Usage Tracker statusline, which shows live session
cost, context window %, and 5-hour / 7-day rate-limit usage with reset times.

## Key paths

- Bundled script (in this plugin): `${CLAUDE_PLUGIN_ROOT}/statusline.js`
- Installed script (stable home path): `~/.claude/statusline-usage-tracker.js`
- State file: `~/.claude/usage-tracker.json` → JSON `{ "enabled": true | false, "cache": true | false }`
  (a missing file counts as enabled; a missing `cache` key counts as false)
- User settings: `~/.claude/settings.json`

## Interpret the argument (`$ARGUMENTS`)

- `on`        → enable
- `off`       → disable
- `status`    → report current state only; make no changes
- `cache on`  → include cache tokens in the counter (input + output + cache create + cache read)
- `cache off` → count only input + output tokens (the default)
- `cache`     → toggle the cache setting
- empty       → toggle on/off (enabled → disabled, or disabled → enabled)

The `cache` setting controls only the token-count metric; it is independent of
on/off. The counter switches instantly when toggled (both totals are pre-computed),
so no statusline restart or re-parse is needed.

## To ENABLE

1. Copy `${CLAUDE_PLUGIN_ROOT}/statusline.js` to `~/.claude/statusline-usage-tracker.js`,
   overwriting any existing copy. (Re-copying keeps it current after plugin updates.)
2. Merge this block into `~/.claude/settings.json` without disturbing other keys
   (create the file as `{}` first if it does not exist):
   ```json
   "statusLine": {
     "type": "command",
     "command": "node ~/.claude/statusline-usage-tracker.js",
     "refreshInterval": 5
   }
   ```
3. Set `enabled` to `true` in `~/.claude/usage-tracker.json`, preserving any
   existing `cache` value (read the file first; if missing, write `{ "enabled": true }`).
4. Tell the user it is ON and will appear on the next message.

## To DISABLE

1. Set `enabled` to `false` in `~/.claude/usage-tracker.json`, preserving any
   existing `cache` value. The script stays installed but renders an empty string,
   so the statusline goes blank.
2. Tell the user it is OFF.

## To CHANGE CACHE MODE (`cache on` / `cache off` / `cache`)

1. Read `~/.claude/usage-tracker.json` (treat missing as `{ "enabled": true }`,
   missing `cache` as `false`).
2. Set `cache` to `true` (`cache on`), `false` (`cache off`), or the opposite of
   its current value (`cache` with no value), leaving `enabled` untouched.
3. Tell the user the counter now shows either "input + output" (`cache` false) or
   "input + output + cache" (`cache` true). It updates on the next message.

## For STATUS

Read the state file (treat missing as enabled, missing `cache` as false) and report
whether it is currently on or off, which token mode is active (input+output vs
cache-included), plus whether `statusLine` is wired into `~/.claude/settings.json`.

## Rules

- Never remove or rewrite the user's other settings keys. Keep edits minimal.
- Do not print secrets from settings.json back to the user.
