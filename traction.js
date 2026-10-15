/* =============================================================================
   Smart Note deck — live traction numbers. Loaded in <head>; the deck's
   component calls window.loadTraction() on mount (wired in by
   scripts/build-deck.mjs).
     1. public.pitch_traction() on Supabase — aggregate counts only, callable
        with the public anon key (Spinel Server migration 046) — so the
        Traction slide shows today's numbers every time the deck opens.
     2. data/traction.json — the daily snapshot from
        .github/workflows/update-traction.yml — if that call fails or is slow.
   Resolves to null when both fail, and the tiles stay at "—".
   ========================================================================== */
(function () {
  "use strict";

  var SUPABASE_URL = "https://tuowcavfjpbisjfnbwkf.supabase.co";
  // The anon key is public by design (it ships in the Smart Note web client);
  // here it only calls the aggregate RPC, which returns no per-user data.
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1b3djYXZmanBiaXNqZm5id2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDMwNDEsImV4cCI6MjA5NTQ3OTA0MX0.Q33q1tYXFG2s_0nHAWTjeLS8Jjpi-LzlrJsjri7QiaU";
  var TIMEOUT_MS = 5000;

  function live() {
    var ctrl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = ctrl && setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS);
    return fetch(SUPABASE_URL + "/rest/v1/rpc/pitch_traction", {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
      body: "{}",
      cache: "no-store",
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { return d && d.signups ? d : null; })
      .finally(function () { if (timer) clearTimeout(timer); });
  }

  function snapshot() {
    return fetch("data/traction.json", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; });
  }

  window.loadTraction = function () {
    return live()
      .catch(function () { return null; })
      .then(function (d) { return d || snapshot(); })
      .catch(function () { return null; });
  };

  var KO = document.documentElement.getAttribute("lang") === "ko";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // "9월 12일" / "Sep 12" in Seoul time — the date the numbers are as of.
  function asOf(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return "—";
    var seoul = new Date(t + 9 * 3600 * 1000);
    var m = seoul.getUTCMonth(), day = seoul.getUTCDate();
    return KO ? m + 1 + "월 " + day + "일" : MONTHS[m] + " " + day;
  }

  // Values for the slide subtitle: "13 weeks of beta — … (as of Sep 12)".
  window.tractionSummary = function (d) {
    var weeks = d && d.signupsByWeek;
    return {
      weeks: weeks && weeks.length ? String(weeks.length) : "—",
      asOf: d ? asOf(d.updatedAt) : "—"
    };
  };

  // The weekly sign-up chart, drawn to the Claude Design layout it replaces:
  // bars for new sign-ups per week, a line for the running total.
  var X0 = 86, X1 = 1452, Y0 = 278, H = 252;
  var FONT = 'font-family="Geist, sans-serif"';

  window.drawSignupChart = function (el, d) {
    var weeks = d && d.signupsByWeek;
    if (!el || !weeks || !weeks.length) return;
    var n = weeks.length;
    var step = n > 1 ? (X1 - X0) / (n - 1) : 0;
    var x = function (i) { return n > 1 ? X0 + i * step : (X0 + X1) / 2; };
    var maxWeek = Math.max(1, Math.max.apply(null, weeks.map(function (w) { return w.count; })));
    var total = 0;
    var cum = weeks.map(function (w) { return (total += w.count); });
    var top = Math.max(4, Math.ceil(total / 4) * 4);
    var yCum = function (v) { return Y0 - (v / top) * H; };
    var barW = Math.min(42, Math.max(10, step * 0.6));
    var every = Math.max(1, Math.ceil(56 / (step || 56)));
    var f = function (v) { return v.toFixed(1); };
    var out = [];

    out.push('<defs><linearGradient id="suA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4a76d6" stop-opacity="0.22"></stop><stop offset="100%" stop-color="#4a76d6" stop-opacity="0"></stop></linearGradient></defs>');
    for (var k = 0; k <= 4; k++) {
      var gy = Y0 - (k * H) / 4;
      out.push('<line x1="' + X0 + '" y1="' + f(gy) + '" x2="' + X1 + '" y2="' + f(gy) + '" stroke="#ece6ee" stroke-width="1.5"></line>' +
        '<text x="70" y="' + f(gy + 6) + '" text-anchor="end" font-size="18" font-weight="700" fill="#8c93b5" ' + FONT + '>' + (k * top) / 4 + "</text>");
    }
    weeks.forEach(function (w, i) {
      var h = (w.count / maxWeek) * H;
      out.push('<rect x="' + f(x(i) - barW / 2) + '" y="' + f(Y0 - h) + '" width="' + f(barW) + '" height="' + f(h) + '" rx="3" fill="#b6e6ff" opacity="0.85"></rect>');
      if (w.count) out.push('<text x="' + f(x(i)) + '" y="' + f(Y0 - h - 8) + '" text-anchor="middle" font-size="16" font-weight="800" fill="#4a76d6" ' + FONT + ">+" + w.count + "</text>");
    });
    var pts = cum.map(function (v, i) { return f(x(i)) + "," + f(yCum(v)); }).join(" ");
    out.push('<polygon points="' + f(x(0)) + "," + Y0 + " " + pts + " " + f(x(n - 1)) + "," + Y0 + '" fill="url(#suA)"></polygon>');
    out.push('<polyline points="' + pts + '" fill="none" stroke="#4a76d6" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"></polyline>');
    cum.forEach(function (v, i) {
      out.push('<circle cx="' + f(x(i)) + '" cy="' + f(yCum(v)) + '" r="5" fill="#fffcf4" stroke="#4a76d6" stroke-width="3"></circle>');
    });
    weeks.forEach(function (w, i) {
      if ((n - 1 - i) % every) return;
      var p = String(w.week).split("-");
      out.push('<text x="' + f(x(i)) + '" y="304" text-anchor="middle" font-size="17" font-weight="700" fill="#8c93b5" ' + FONT + ">" + Number(p[1]) + "/" + Number(p[2]) + "</text>");
    });

    var peak = weeks.reduce(function (a, w) { return w.count > a.count ? w : a; }, weeks[0]);
    var pp = String(peak.week).split("-");
    var label = KO
      ? "주별 신규 가입과 누적 가입자 그래프 — " + n + "주 동안 누적 " + total + "명, " + Number(pp[1]) + "월 " + Number(pp[2]) + "일 주에 주간 " + peak.count + "명이 최고치"
      : "Weekly new and cumulative sign-ups — " + total + " in total over " + n + " weeks, peaking at " + peak.count + " in the week of " + MONTHS[Number(pp[1]) - 1] + " " + Number(pp[2]);
    el.innerHTML = '<svg viewBox="0 0 1480 330" style="width:100%;display:block" role="img" aria-label="' + label + '">' + out.join("") + "</svg>";
  };
})();
