/* =============================================================================
   Smart Note deck controller — slide navigation (keyboard / swipe / agenda /
   fullscreen). Fires a bubbling `slide:enter` CustomEvent on each slide as it
   activates so the demos can kick off their animations. Zero dependencies.
   ========================================================================== */
(function () {
  "use strict";

  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var total = slides.length;
  var cur = 0;

  var progress = document.querySelector(".progress");
  var counter = document.querySelector(".nav__count");
  var btnPrev = document.querySelector(".nav__prev");
  var btnNext = document.querySelector(".nav__next");
  var agenda = document.querySelector(".agenda");
  var agendaGrid = document.querySelector(".agenda__grid");

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function fireEnter(i) {
    var s = slides[i];
    s.dispatchEvent(new CustomEvent("slide:enter", {
      bubbles: true,
      detail: { index: i, id: s.id, title: s.getAttribute("data-title") || "" }
    }));
  }

  function goto(i, dir) {
    i = Math.max(0, Math.min(total - 1, i));
    if (i === cur && slides[cur].classList.contains("is-active")) return;
    var leaving = slides[cur];
    var forward = dir != null ? dir > 0 : i > cur;

    if (forward) leaving.classList.add("is-prev");
    else leaving.classList.remove("is-prev");
    leaving.classList.remove("is-active");

    var target = slides[i];
    target.classList.remove("is-prev");
    void target.offsetWidth; // force reflow so reveal animations re-run
    target.classList.add("is-active");

    cur = i;
    update();
    fireEnter(i);
  }

  function next() { goto(cur + 1, 1); }
  function prev() { goto(cur - 1, -1); }

  function update() {
    if (progress) progress.style.width = ((cur + 1) / total * 100) + "%";
    if (counter) counter.innerHTML = "<b>" + pad(cur + 1) + "</b> / " + pad(total);
    document.title = "Smart Note · " + (slides[cur].getAttribute("data-title") || "Pitch Deck");
  }

  /* ── keyboard ──────────────────────────────────────────────────────────── */
  document.addEventListener("keydown", function (e) {
    // never hijack typing inside the live demos (editor, search, chat inputs)
    var tag = (e.target.tagName || "").toLowerCase();
    var typing = tag === "input" || tag === "textarea";
    if (agenda && agenda.classList.contains("is-open")) {
      if (e.key === "Escape" || e.key === "m" || e.key === "M") toggleAgenda(false);
      return;
    }
    // while editing a demo input/textarea, let navigation keys move the caret natively
    if (typing && (e.key.indexOf("Arrow") === 0 || e.key === "PageUp" || e.key === "PageDown" || e.key === "Home" || e.key === "End")) return;
    switch (e.key) {
      case "ArrowRight": case "PageDown":
        e.preventDefault(); next(); break;
      case " ": case "Enter":
        if (typing) return; e.preventDefault(); next(); break;
      case "ArrowLeft": case "PageUp":
        e.preventDefault(); prev(); break;
      case "Home": e.preventDefault(); goto(0, -1); break;
      case "End": e.preventDefault(); goto(total - 1, 1); break;
      case "f": case "F": if (!typing) toggleFullscreen(); break;
      case "m": case "M": if (!typing) toggleAgenda(true); break;
    }
  });

  if (btnNext) btnNext.addEventListener("click", next);
  if (btnPrev) btnPrev.addEventListener("click", prev);
  if (counter) counter.addEventListener("click", function () { toggleAgenda(true); });

  /* ── touch swipe ───────────────────────────────────────────────────────── */
  var tsx = 0, tsy = 0, touching = false;
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    if (e.target.closest(".uni-stage, .chat__log, input, textarea, button, .roadmap, .note-body, .note-canvas, .ws__editor")) { touching = false; return; }
    touching = true;
    tsx = e.touches[0].clientX; tsy = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!touching) return;
    touching = false;
    var dx = e.changedTouches[0].clientX - tsx;
    var dy = e.changedTouches[0].clientY - tsy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });

  /* ── fullscreen ────────────────────────────────────────────────────────── */
  function toggleFullscreen() {
    var d = document;
    if (!d.fullscreenElement) {
      (d.documentElement.requestFullscreen || d.documentElement.webkitRequestFullscreen || function () {}).call(d.documentElement);
    } else {
      (d.exitFullscreen || d.webkitExitFullscreen || function () {}).call(d);
    }
  }

  /* ── agenda overlay ────────────────────────────────────────────────────── */
  function buildAgenda() {
    if (!agendaGrid) return;
    slides.forEach(function (s, i) {
      var item = document.createElement("button");
      item.className = "agenda__item";
      item.innerHTML = '<span class="n">' + pad(i + 1) + '</span><span>' +
        (s.getAttribute("data-title") || ("Slide " + (i + 1))) + '</span>';
      item.addEventListener("click", function () { toggleAgenda(false); goto(i); });
      agendaGrid.appendChild(item);
    });
  }
  function toggleAgenda(open) { if (agenda) agenda.classList.toggle("is-open", open); }
  var agendaClose = document.querySelector(".agenda__close");
  if (agendaClose) agendaClose.addEventListener("click", function () { toggleAgenda(false); });
  if (agenda) agenda.addEventListener("click", function (e) { if (e.target === agenda) toggleAgenda(false); });

  /* ── hash deep-link (#3 → slide 3) ─────────────────────────────────────── */
  function fromHash() {
    var m = (location.hash || "").match(/\d+/);
    if (m) { var n = parseInt(m[0], 10) - 1; if (n >= 0 && n < total) cur = n; }
  }

  /* ── init ──────────────────────────────────────────────────────────────── */
  buildAgenda();
  fromHash();
  slides.forEach(function (s, i) {
    var num = s.querySelector(".kicker .num");
    if (num) num.textContent = pad(i + 1);
  });
  slides.forEach(function (s) { s.classList.remove("is-active"); });
  slides[cur].classList.add("is-active");
  update();
  requestAnimationFrame(function () { requestAnimationFrame(function () { fireEnter(cur); }); });

  window.SNDeck = { goto: goto, next: next, prev: prev, count: function () { return total; } };
})();
