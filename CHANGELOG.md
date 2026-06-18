# Changelog

## 1.3.0

- Add a **cache-token mode**: `/trackusage cache on` counts input + output + cache
  creation + cache reads; `/trackusage cache off` (the default) counts only input +
  output. `/trackusage cache` toggles it. Both totals are computed in a single
  transcript pass and cached, so switching modes is instant — no re-parse.

## 1.2.0

- Add current **model name** to the statusline.
- Add **total session tokens** (input + output), summed from the session transcript
  and including subagent turns. Parsed incrementally and cached (with a formula-version
  marker so the cache self-invalidates), so it stays fast even on large transcripts.
  Shown as a full comma-grouped number. Cache reads are intentionally excluded so the
  figure reflects tokens actually sent/generated rather than per-turn context re-reads.
- Replace the plain context % with a **context bar + "% to compact"** indicator that
  honors `CLAUDE_CODE_AUTO_COMPACT_WINDOW` and `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`,
  turning yellow under 25% and red under 10% headroom.
- Spell out `context` (was `ctx`).

## 1.0.0

- Initial release: live session cost, context %, and 5-hour / 7-day rate-limit usage
  with reset times, plus a `/trackusage` on/off/status toggle.
