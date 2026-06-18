---
description: Turn the live Usage Tracker statusline on or off, or check its status. Accepts "on", "off", "status", or no argument (toggles current state).
allowed-tools: Bash, Read, Edit, Write
---

# Track Usage — toggle the live usage statusline

The user wants to control the Usage Tracker statusline, which shows live session
cost, context window %, and 5-hour / 7-day rate-limit usage with reset times.

## Key paths

- Bundled script (in this plugin): `${CLAUDE_PLUGIN_ROOT}/statusline.js`
- Installed script (stable home path): `~/.claude/statusline-usage-tracker.js`
- State file: `~/.claude/usage-tracker.json` → JSON `{ "enabled": true | false }`
  (a missing file counts as enabled)
- User settings: `~/.claude/settings.json`

## Interpret the argument (`$ARGUMENTS`)

- `on`     → enable
- `off`    → disable
- `status` → report current state only; make no changes
- empty    → toggle (enabled → disabled, or disabled → enabled)

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
3. Write `~/.claude/usage-tracker.json` = `{ "enabled": true }`.
4. Tell the user it is ON and will appear on the next message.

## To DISABLE

1. Write `~/.claude/usage-tracker.json` = `{ "enabled": false }`.
   The script stays installed but renders an empty string, so the statusline goes blank.
2. Tell the user it is OFF.

## For STATUS

Read the state file (treat missing as enabled) and report whether it is currently
on or off, plus whether `statusLine` is wired into `~/.claude/settings.json`.

## Rules

- Never remove or rewrite the user's other settings keys. Keep edits minimal.
- Do not print secrets from settings.json back to the user.
