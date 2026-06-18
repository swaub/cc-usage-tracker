# Usage Tracker — Claude Code plugin

A live, always-visible statusline for Claude Code showing the **current model**,
**session cost**, **total tokens used**, **context window with headroom until
auto-compact**, and your **5-hour / 7-day rate-limit usage** with reset times —
so you never have to run `/usage` again.

```
Opus 4.8  ·  $2.17  ·  196,189 tokens     context █░░░░░░░░░ 7%  ↻ 58% to compact     session █░░░░░░░░░ 7%  ↻ 12pm     week █░░░░░░░░░ 11%  ↻ Jun 23
```

It auto-refreshes after every message (and on a 5s idle timer). Pure Node, no
dependencies — works on macOS, Linux, and WSL anywhere Claude Code runs.

## Install

```
/plugin marketplace add brendangboyd2003/cc-usage-tracker
/plugin install usage-tracker@boyd-plugins
/usage-tracker:trackusage on
```

The first two commands fetch and enable the plugin. The third wires the
statusline into your `~/.claude/settings.json` and switches it on. It shows up on
your next message.

> Note: Claude Code plugins can't auto-register a statusline (it's a user
> setting), so the `on` step does that wiring for you once.

## Toggle it any time

```
/usage-tracker:trackusage on       # turn on
/usage-tracker:trackusage off      # blank the statusline (stays installed)
/usage-tracker:trackusage status   # check current state
/usage-tracker:trackusage          # toggle
```

State lives in `~/.claude/usage-tracker.json`.

## What each segment means

| Segment                  | Meaning                                                        |
|--------------------------|----------------------------------------------------------------|
| `Opus 4.8`               | Current model                                                   |
| `$2.17`                  | Estimated session cost (USD)                                    |
| `196,189 tokens`         | Total tokens used this session (input + output, incl. subagents) |
| `context █░ 7% ↻ 58%`    | Context window used + headroom remaining until auto-compact     |
| `session █░ 7% ↻ 12pm`   | 5-hour rate-limit window + when it resets                       |
| `week █░ 11% ↻ Jun 23`   | 7-day rate-limit window + reset date                            |

The rate-limit segments appear after the first model response in a session
(that's when Claude Code provides the data). The **to compact** figure honors the
`CLAUDE_CODE_AUTO_COMPACT_WINDOW` and `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` environment
variables, and turns yellow under 25% / red under 10% headroom.

## License

MIT
