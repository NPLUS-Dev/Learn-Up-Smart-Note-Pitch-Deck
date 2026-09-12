// Builds the deck's two public pages from ko.html, the Korean deck exported
// from Claude Design:
//   1. patches ko.html in place — page <head> (title, language gate) and a
//      working 🌐 language menu on the cover slide. Safe to re-run.
//   2. writes index.html, the English deck, from the copy in deck-en.mjs.
// After replacing ko.html with a new Claude Design export, run
//   node scripts/build-deck.mjs
// It lists any Korean that has no English yet and leaves index.html untouched
// until everything is translated. Zero dependencies, like the rest of the repo.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TEXT, ATTR, RAW, BLOCKS } from "./deck-en.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KO_FILE = join(ROOT, "ko.html");
const EN_FILE = join(ROOT, "index.html");
const HANGUL = /[ㄱ-ㆎ가-힣]/;

const PAGE = {
  ko: { title: "Smart Note · 피치덱", description: "Smart Note — 맞춤형 AI 학습 공간. 프리시드 투자 피치덱." },
  en: { title: "Smart Note · Pitch Deck", description: "Smart Note — a personalized AI learning space. Pre-seed pitch deck." },
};

function head(lang) {
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${PAGE[lang].title}</title>
<meta name="description" content="${PAGE[lang].description}">
<meta name="theme-color" content="#fafafa">
<link rel="icon" type="image/png" href="assets/leaf-mark.png">
<link rel="alternate" hreflang="en" href="./">
<link rel="alternate" hreflang="ko" href="ko.html">
<script src="./lang.js"></script>
<script src="./support.js"></script>
</head>`;
}

// The cover's 🌐 menu, found by the hover rule Claude Design gave it. Opens on
// hover, and on focus for keyboard and touch; the other language is a link
// that lang.js remembers via ?lang=.
const MENU_MARKER = `style-hover="--lang:1;--langv:visible;--lange:auto"`;
const MENU_ITEM = "padding:12px 18px;border-radius:8px;font-size:26px;font-weight:700;white-space:nowrap";

function menuItem(lang, label, current) {
  if (current) {
    return `<span aria-current="true" lang="${lang}" style="${MENU_ITEM};background:#e3f7ec;color:#2f8c63">${label}</span>`;
  }
  const page = lang === "ko" ? "ko.html" : "index.html";
  return `<a href="${page}?lang=${lang}" hreflang="${lang}" lang="${lang}" style="${MENU_ITEM};color:#5d6485;text-decoration:none" style-hover="background:#f8f3e8;color:#1c2340">${label}</a>`;
}

function languageMenu(lang) {
  return `<div style="position:absolute;top:40px;right:48px;display:inline-flex;flex-direction:column;align-items:flex-end;z-index:6" ${MENU_MARKER} style-focus-within="--lang:1;--langv:visible;--lange:auto">
    <span role="button" tabindex="0" aria-haspopup="true" aria-label="Language · 언어" style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:#fffcf4;border:1px solid #ece6ee;box-shadow:0 3px 8px -3px rgba(90,62,32,.10);font-size:30px;cursor:pointer">🌐</span>
    <div style="padding-top:10px;opacity:var(--lang,0);visibility:var(--langv,hidden);pointer-events:var(--lange,none);transition:opacity .18s ease,visibility .18s">
      <div style="min-width:200px;padding:10px;background:#fffcf4;border:1px solid #ece6ee;border-radius:12px;box-shadow:0 40px 90px -40px rgba(58,44,104,.45),0 12px 34px -14px rgba(58,44,104,.22);display:flex;flex-direction:column;gap:6px">
        ${menuItem("ko", "한국어", lang === "ko")}
        ${menuItem("en", "English", lang === "en")}
      </div>
    </div>
  </div>`;
}

// [start, end) of the <div> that carries `marker`.
function divAround(src, marker) {
  const at = src.indexOf(marker);
  if (at < 0) return null;
  const start = src.lastIndexOf("<div", at);
  const tags = /<div\b|<\/div>/g;
  tags.lastIndex = start;
  let depth = 0;
  for (let m; (m = tags.exec(src)); ) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) return { start, end: m.index + m[0].length };
  }
  return null;
}

// A public deck has no Claude Design slide rail. deck-stage only honors
// `no-rail` if it's already set when the element connects, so it rides in as a
// root-component prop default (data-props) instead of being added afterwards.
function withoutRail(src) {
  src = src.replace(/<x-import component-from-global-scope="deck-stage"(?![^>]*\sdc-props=)/, `$& dc-props="{{ deckProps }}"`);
  return src.replace(/(<script type="text\/x-dc"[^>]*\sdata-props=")([^"]*)"/, (_, open, json) => {
    const props = JSON.parse(json.replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
    props.deckProps = { default: { "no-rail": "" } };
    return open + JSON.stringify(props).replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"';
  });
}

// The design starts the tutor chat and the use-of-funds bars on slide indexes,
// which go stale whenever a slide is added or moved; key them to slide labels.
function withSlideLabels(src) {
  const byIndex = "const i = e && e.detail ? e.detail.index : -1;";
  if (!src.includes(byIndex)) return src;
  src = src
    .replace(byIndex, "const label = e && e.detail && e.detail.slide ? e.detail.slide.getAttribute('data-label') : '';")
    .replace(/if \(i === \d+ && !this\.state\.chat\.length\)/, "if (label === 'AI Tutor' && !this.state.chat.length)")
    .replace(/if \(i === \d+ && !this\.state\.askAnim\)/, "if (label === 'The Ask' && !this.state.askAnim)");
  if (/\(i === \d+/.test(src)) throw new Error("ko.html: slide hooks changed shape — update withSlideLabels() in build-deck.mjs");
  return src;
}

function withPage(src, lang) {
  const menu = divAround(src, MENU_MARKER);
  if (!menu) throw new Error("ko.html: couldn't find the 🌐 language menu on the cover (" + MENU_MARKER + ")");
  src = src.slice(0, menu.start) + languageMenu(lang) + src.slice(menu.end);
  src = withSlideLabels(withoutRail(src));
  return src.replace(/<html[^>]*>/, `<html lang="${lang}">`).replace(/<head>[\s\S]*?<\/head>/, head(lang));
}

function toEnglish(ko) {
  let src = withPage(ko, "en");
  const missing = [];
  const swap = (from, to, kind) => {
    const parts = src.split(from);
    if (parts.length === 1) missing.push(`${kind}  ${from}`);
    else src = parts.join(to);
  };
  for (const { start, end, to } of BLOCKS) {
    const i = src.indexOf(start);
    const j = i < 0 ? -1 : src.indexOf(end, i);
    if (j < 0) missing.push(`BLOCK ${start}`);
    else src = src.slice(0, i) + to + src.slice(j + end.length);
  }
  for (const [ko, en] of RAW) swap(ko, en, "RAW  ");
  // longest first, so a heading's `>…AI 튜터</span><` goes before a bare `>AI 튜터<`
  for (const [ko, en] of [...TEXT].sort((a, b) => b[0].length - a[0].length)) swap(`>${ko}<`, `>${en}<`, "TEXT ");
  for (const [ko, en] of ATTR) swap(`="${ko}"`, `="${en}"`, "ATTR ");
  return { src, missing };
}

// Lines that still contain Korean, ignoring the language menu (한국어 stays).
function leftoverKorean(src) {
  const menu = divAround(src, MENU_MARKER);
  const rest = menu ? src.slice(0, menu.start) + src.slice(menu.end) : src;
  return rest.split("\n").flatMap((line, i) => (HANGUL.test(line) ? [`  line ~${i + 1}: ${line.trim().slice(0, 140)}`] : []));
}

const exported = readFileSync(KO_FILE, "utf8").replace(/\r\n/g, "\n");
const ko = withPage(exported, "ko");
if (ko !== exported) {
  writeFileSync(KO_FILE, ko);
  console.log("ko.html: page head and language menu updated");
}

const { src: en, missing } = toEnglish(ko);
const leftover = leftoverKorean(en);
if (missing.length || leftover.length) {
  if (missing.length) console.error(`deck-en.mjs entries that no longer match ko.html (${missing.length}):\n` + missing.map((m) => "  " + m.slice(0, 160)).join("\n"));
  if (leftover.length) console.error(`Korean with no English yet (${leftover.length}):\n` + leftover.join("\n"));
  console.error("index.html was not written.");
  process.exitCode = 1;
} else {
  writeFileSync(EN_FILE, en);
  console.log(`index.html: English deck written (${TEXT.length + ATTR.length + RAW.length + BLOCKS.length} translations)`);
}
