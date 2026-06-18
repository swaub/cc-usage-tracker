#!/usr/bin/env node
const os = require("os");
const path = require("path");
const fs = require("fs");

const STATE_FILE = path.join(os.homedir(), ".claude", "usage-tracker.json");

function isEnabled() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return s.enabled !== false;
  } catch {
    return true;
  }
}

let raw = "";
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  if (!isEnabled()) {
    process.stdout.write("");
    return;
  }
  let d = {};
  try {
    d = JSON.parse(raw);
  } catch {
    process.stdout.write("");
    return;
  }

  const groups = [];
  const head = [];

  const model = d.model?.display_name;
  if (model) head.push(`\x1b[1m\x1b[34m${model}\x1b[0m`);

  const cost = d.cost?.total_cost_usd;
  if (typeof cost === "number") head.push(`\x1b[32m$${cost.toFixed(2)}\x1b[0m`);

  const tok = sessionTokens(d.transcript_path);
  if (tok != null) head.push(`\x1b[37m${fmtTokens(tok)}\x1b[0m ${dim("tokens")}`);

  if (head.length) groups.push(head.join(`  ${dim("·")}  `));

  const cg = contextGroup(d.context_window);
  if (cg) groups.push(cg);

  const five = d.rate_limits?.five_hour;
  if (five && typeof five.used_percentage === "number")
    groups.push(limit("session", five.used_percentage, five.resets_at, 33, clock));

  const seven = d.rate_limits?.seven_day;
  if (seven && typeof seven.used_percentage === "number")
    groups.push(limit("week", seven.used_percentage, seven.resets_at, 35, day));

  process.stdout.write(groups.join("     "));
});

function dim(s) {
  return `\x1b[90m${s}\x1b[0m`;
}

const TOKEN_CACHE = path.join(os.homedir(), ".claude", ".usage-tracker-cache.json");
const TOKEN_FORMULA = 3;

function includeCache() {
  try {
    const s = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return s.cache === true;
  } catch {
    return false;
  }
}

function sessionTokens(transcriptPath) {
  if (!transcriptPath) return null;
  let curSize;
  try {
    curSize = fs.statSync(transcriptPath).size;
  } catch {
    return null;
  }

  let cache = {};
  try {
    cache = JSON.parse(fs.readFileSync(TOKEN_CACHE, "utf8"));
  } catch {}

  const prev = cache[transcriptPath];
  let startOffset = 0;
  let io = 0;
  let all = 0;
  if (prev && prev.v === TOKEN_FORMULA && curSize >= prev.size) {
    startOffset = prev.size;
    io = prev.io;
    all = prev.all;
  }

  const len = curSize - startOffset;
  let completeLen = 0;
  if (len > 0) {
    let buf;
    try {
      const fd = fs.openSync(transcriptPath, "r");
      buf = Buffer.allocUnsafe(len);
      fs.readSync(fd, buf, 0, len, startOffset);
      fs.closeSync(fd);
    } catch {
      return pick(io, all);
    }
    const lastNl = buf.lastIndexOf(0x0a);
    completeLen = lastNl >= 0 ? lastNl + 1 : 0;
    const chunk = buf.toString("utf8", 0, completeLen);
    for (const line of chunk.split("\n")) {
      if (!line) continue;
      let e;
      try {
        e = JSON.parse(line);
      } catch {
        continue;
      }
      const u = e?.message?.usage || e?.usage;
      if (u && typeof u === "object") {
        const base = (u.input_tokens || 0) + (u.output_tokens || 0);
        io += base;
        all += base + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
      }
    }
  }

  cache[transcriptPath] = { v: TOKEN_FORMULA, size: startOffset + completeLen, io, all };
  try {
    fs.writeFileSync(TOKEN_CACHE, JSON.stringify(cache));
  } catch {}

  return pick(io, all);
}

function pick(io, all) {
  const total = includeCache() ? all : io;
  return total > 0 ? total : null;
}

function fmtTokens(n) {
  return n.toLocaleString("en-US");
}

function contextGroup(cw) {
  if (!cw || typeof cw.used_percentage !== "number") return "";
  const used = cw.used_percentage;
  const winSize = cw.context_window_size || 200000;
  const usedTokens = (used / 100) * winSize;
  const envWin = parseFloat(process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW);
  const envPct = parseFloat(process.env.CLAUDE_AUTOCOMPACT_PCT_OVERRIDE);
  const compactWindow = isFinite(envWin) && envWin > 0 ? envWin : winSize;
  const triggerPct = isFinite(envPct) && envPct > 0 ? envPct : 100;
  const toCompact = Math.max(0, triggerPct - (usedTokens / compactWindow) * 100);
  const u = toCompact < 10 ? 31 : toCompact < 25 ? 33 : 90;
  const ann = `  \x1b[${u}m↻ ${Math.round(toCompact)}% to compact\x1b[0m`;
  return `${dim("context")} ${bar(used, 36)} \x1b[36m${Math.round(used)}%\x1b[0m${ann}`;
}

function limit(label, pct, resetEpoch, color, fmt) {
  const c = (s) => `\x1b[${color}m${s}\x1b[0m`;
  const reset = typeof resetEpoch === "number" ? `  ${dim("↻ " + fmt(resetEpoch))}` : "";
  return `${dim(label)} ${bar(pct, color)} ${c(Math.round(pct) + "%")}${reset}`;
}

function bar(pct, color, width = 10) {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)));
  return `\x1b[${color}m${"█".repeat(filled)}\x1b[0m\x1b[90m${"░".repeat(width - filled)}\x1b[0m`;
}

function clock(epoch) {
  const dt = new Date(epoch * 1000);
  let h = dt.getHours();
  const m = dt.getMinutes();
  const ap = h < 12 ? "am" : "pm";
  h = h % 12 || 12;
  return m === 0 ? `${h}${ap}` : `${h}:${String(m).padStart(2, "0")}${ap}`;
}

function day(epoch) {
  return new Date(epoch * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
