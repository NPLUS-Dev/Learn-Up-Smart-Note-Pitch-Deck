/* =============================================================================
   Smart Note deck — language gate. Loaded synchronously in <head>, before the
   deck boots. Korean lives in ko.html, English in index.html; this decides
   which one to show, in order:
     1. ?lang=ko|en in the URL (also remembered for next time)
     2. the language last picked from the 🌐 menu on the cover slide
     3. Korean when the browser or OS language is Korean, otherwise English
   If the current page is the wrong one it swaps to the other before anything
   renders, keeping the #slide hash.
   ========================================================================== */
(function () {
  "use strict";

  var STORE_KEY = "smartnote-deck-lang";
  var here = document.documentElement.getAttribute("lang") === "ko" ? "ko" : "en";

  function pick(value) {
    value = String(value || "").toLowerCase();
    return value === "ko" || value === "en" ? value : null;
  }

  function recalled() {
    try { return pick(localStorage.getItem(STORE_KEY)); } catch (e) { return null; }
  }

  function remember(lang) {
    try { localStorage.setItem(STORE_KEY, lang); } catch (e) {}
  }

  // Primary browser language, UI language, and the default Intl locale (which
  // follows the OS/browser display language) — any of them Korean means Korean.
  function detected() {
    var nav = window.navigator || {};
    var locales = [nav.languages && nav.languages[0], nav.language, nav.userLanguage, nav.systemLanguage];
    try { locales.push(Intl.DateTimeFormat().resolvedOptions().locale); } catch (e) {}
    for (var i = 0; i < locales.length; i++) {
      if (/^ko(?:[-_]|$)/i.test(locales[i] || "")) return "ko";
    }
    return "en";
  }

  function pageFor(lang) {
    var dir = location.pathname.replace(/[^\/]*$/, "");
    if (lang === "ko") return dir + "ko.html";
    return location.protocol === "file:" ? dir + "index.html" : dir;
  }

  var params = new URLSearchParams(location.search);
  var asked = pick(params.get("lang"));
  if (asked) remember(asked);
  var want = asked || recalled() || detected();

  if (want !== here) {
    document.documentElement.style.display = "none"; // no flash of the wrong language
    location.replace(pageFor(want) + location.search + location.hash);
    return;
  }

  if (asked) {
    params.delete("lang");
    var query = params.toString();
    history.replaceState(history.state, "", location.pathname + (query ? "?" + query : "") + location.hash);
  }
})();
