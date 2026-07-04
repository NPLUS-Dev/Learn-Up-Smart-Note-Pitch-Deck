/* =============================================================================
   Smart Note pitch deck — interactive feature demos (offline, dependency-free)
     · Proofreader        (typo / grammar / LOGIC)                  #demo-proof
     · AI Generation Engine (formula·graph·mermaid·3D·sim·image)    #demo-gen
     · Adaptive Workspace  (custom markdown + adaptive theme)        #demo-ws
     · Context-Aware AI Tutor (note context + URL crawl)              #demo-tutor
     · 3D Note Universe search (search → pulse)                       #demo-universe
     · Import (PDF heading split)                                     #demo-import
     · Market ring chart                                              #demo-market
   Wired on DOMContentLoaded + on `slide:enter` events from deck.js.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var el = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function onEnterOnce(root, fn) {
    var slide = root.closest(".slide"); var done = false;
    document.addEventListener("slide:enter", function (e) { if (e.target === slide && !done) { done = true; fn(); } });
  }

  /* ===========================================================================
     1) Proofreader — beyond spellcheck: catches LOGIC errors in a paragraph
     ======================================================================== */
  function initProofreader() {
    var root = $("#demo-proof");
    if (!root) return;
    var doc = $(".proof__doc", root);
    var list = $(".proof__list", root);
    var scanBtn = $(".proof__scan", root);
    var resetBtn = $(".proof__reset", root);
    var count = $(".proof__count", root);

    // The note paragraph. Each issue is a <span> the scanner will light up.
    // A plain spell-checker only catches #1; #2 and #3 are conceptual LOGIC flaws.
    var ISSUES = [
      { kind: "t", cls: "mark-typo",    sel: "#pf-1", was: "monentum", now: "momentum",
        msg: "<b>Typo</b> — “<span class='was'>monentum</span>” → “<span class='now'>momentum</span>”" },
      { kind: "g", cls: "mark-grammar", sel: "#pf-2", was: "total momentum of after", now: "total momentum after",
        msg: "<b>Grammar</b> — “<span class='was'>momentum of after</span>” → “<span class='now'>momentum after</span>”" },
      { kind: "l", cls: "mark-logic",   sel: "#pf-3", was: "momentum is always conserved even when friction acts", now: "momentum is not conserved under friction",
        msg: "<b>Logic error</b> — friction is an external force. “<span class='was'>conserved with friction</span>” → “<span class='now'>not conserved</span>”" },
      { kind: "l", cls: "mark-logic",   sel: "#pf-4", was: "acceleration is proportional to velocity", now: "acceleration is proportional to net force",
        msg: "<b>Logic error</b> — F = ma. “<span class='was'>∝ velocity</span>” → “<span class='now'>∝ net force</span>”" }
    ];

    function reset() {
      doc.classList.remove("scanned");
      $$(".mark-typo,.mark-grammar,.mark-logic", doc).forEach(function (s) { s.classList.remove("fixed"); });
      list.innerHTML = "";
      if (count) count.innerHTML = "Click “Run Proofread” to analyze the paragraph.";
      if (scanBtn) scanBtn.disabled = false;
      if (resetBtn) resetBtn.style.display = "none";
    }

    function scan() {
      if (scanBtn) scanBtn.disabled = true;
      doc.classList.add("scanned");
      if (count) count.innerHTML = "Found: Typo <b class='t'>1</b> · Grammar <b class='g'>1</b> · <b class='l'>Logic errors 2</b>";
      list.innerHTML = "";
      ISSUES.forEach(function (iss, i) {
        var item = el("div", "proof__item",
          "<span class='proof__tag " + iss.kind + "'>" +
            (iss.kind === "t" ? "Typo" : iss.kind === "g" ? "Grammar" : "Logic") + "</span>" +
          "<span class='proof__msg'>" + iss.msg + "</span>" +
          "<button class='proof__accept'>Accept</button>");
        list.appendChild(item);
        setTimeout(function () { item.classList.add("show"); }, 160 + i * 150);
        var accept = $(".proof__accept", item);
        accept.addEventListener("click", function () {
          var target = $(iss.sel, doc);
          if (target) { target.textContent = iss.now; target.classList.add("fixed"); }
          item.classList.add("done");
          accept.textContent = "Applied ✓"; accept.disabled = true;
        });
      });
      if (resetBtn) resetBtn.style.display = "inline-flex";
    }

    if (scanBtn) scanBtn.addEventListener("click", scan);
    if (resetBtn) resetBtn.addEventListener("click", reset);
    reset();
    onEnterOnce(root, function () { setTimeout(scan, 500); });
  }

  /* ===========================================================================
     Shared 2D/3D drawing helpers (graph plotter + 3D object)
     ======================================================================== */
  function makeCanvas(cls, wd, ht) { var c = document.createElement("canvas"); c.className = cls; c.width = wd; c.height = ht; return c; }

  // Interactive coordinate-grid plotter (drag to pan, wheel to zoom).
  function attachPlotter(canvas, fn) {
    var st = { ox: 0, oy: 0, scale: 38, drag: false, lx: 0, ly: 0, fn: fn };
    function draw() {
      var ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2 + st.ox, cy = h / 2 + st.oy, s = st.scale;
      // grid
      ctx.lineWidth = 1; ctx.strokeStyle = "rgba(148,163,184,0.14)";
      var step = s;
      for (var gx = cx % step; gx < w; gx += step) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
      for (var gy = cy % step; gy < h; gy += step) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
      // axes
      ctx.strokeStyle = "rgba(148,163,184,0.5)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
      // curve
      ctx.strokeStyle = "#00E5FF"; ctx.lineWidth = 2.4; ctx.beginPath();
      var first = true;
      for (var px = 0; px <= w; px++) {
        var xv = (px - cx) / s;
        var yv = st.fn(xv);
        var py = cy - yv * s;
        if (!isFinite(py)) { first = true; continue; }
        if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    st.draw = draw;
    canvas.classList.add("grab");
    // window listeners are added on drag-start and removed on drag-end so repeated
    // block generation never leaks an unbounded number of global handlers.
    var down = function (e) { st.drag = true; st.lx = pageX(e); st.ly = pageY(e); window.addEventListener("mousemove", move); window.addEventListener("mouseup", up); };
    var move = function (e) {
      if (!st.drag) return;
      st.ox += pageX(e) - st.lx; st.oy += pageY(e) - st.ly;
      st.lx = pageX(e); st.ly = pageY(e); draw();
      if (e.cancelable) e.preventDefault();
    };
    var up = function () { st.drag = false; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    function pageX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function pageY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("touchstart", down, { passive: true });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", up);
    canvas.addEventListener("wheel", function (e) {
      e.preventDefault();
      var f = e.deltaY < 0 ? 1.12 : 0.89;
      st.scale = Math.max(10, Math.min(160, st.scale * f));
      draw();
    }, { passive: false });
    draw();
    return st;
  }

  // 3D object renderer (cube or tetrahedral molecule). Drag rotate + wheel zoom.
  function attach3D(canvas, opts) {
    opts = opts || {};
    var st = {
      rx: 0.5, ry: 0.6, zoom: 1, color: opts.color || "#9D7AF0", atom: opts.atom || "#00E5FF",
      shape: opts.shape || "cube", drag: false, lx: 0, ly: 0, auto: opts.auto !== false
    };
    var CUBE = {
      v: [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],
      e: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]],
      atoms: [0,1,2,3,4,5,6,7]
    };
    // tetrahedral molecule: a central atom + 4 bonded atoms (methane-like)
    var MOL = {
      v: [[0,0,0],[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]],
      e: [[0,1],[0,2],[0,3],[0,4]],
      atoms: [0,1,2,3,4]
    };
    // τ = r × F lever diagram: pivot(0) → r-arm tip(1) → F-vector tip(2), plus a thin
    // rotation-axis pole(3,4) for depth cues. v[1]/v[2] are mutated live by setRF().
    var TORQUE = {
      v: [[0,0,0],[0.9,0,0],[0.9,0.7,0],[0,0,-0.9],[0,0,0.9]],
      e: [[0,1],[1,2],[3,4]],
      atoms: [0,1,2]
    };
    st.setRF = function (r, f) { TORQUE.v[1] = [r, 0, 0]; TORQUE.v[2] = [r, f, 0]; };
    function rot(p) {
      var x = p[0], y = p[1], z = p[2];
      var cy = Math.cos(st.ry), sy = Math.sin(st.ry);
      var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
      var cx = Math.cos(st.rx), sx = Math.sin(st.rx);
      var y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      return [x1, y1, z2];
    }
    function draw() {
      var ctx = canvas.getContext("2d"), w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var model = st.shape === "molecule" ? MOL : st.shape === "torque" ? TORQUE : CUBE;
      var cx = w / 2, cy = h / 2, s = Math.min(w, h) * 0.30 * st.zoom;
      var p = model.v.map(function (P) {
        var r = rot(P); var sc = s * (2.8 / (3.4 + r[2]));
        return [cx + r[0] * sc, cy + r[1] * sc, r[2]];
      });
      ctx.strokeStyle = st.color; ctx.lineWidth = st.shape === "molecule" ? 3 : 2;
      ctx.beginPath();
      model.e.forEach(function (e) { ctx.moveTo(p[e[0]][0], p[e[0]][1]); ctx.lineTo(p[e[1]][0], p[e[1]][1]); });
      ctx.stroke();
      // atoms (spheres) sorted back-to-front
      var order = model.atoms.slice().sort(function (a, b) { return p[a][2] - p[b][2]; });
      order.forEach(function (idx) {
        var isCenter = st.shape === "molecule" && idx === 0;
        var rr = (isCenter ? 9 : 6) * st.zoom * (0.7 + (p[idx][2] + 1.4) / 3);
        var g = ctx.createRadialGradient(p[idx][0] - rr * 0.3, p[idx][1] - rr * 0.3, rr * 0.1, p[idx][0], p[idx][1], rr);
        var c = isCenter ? st.color : st.atom;
        g.addColorStop(0, "#ffffff"); g.addColorStop(0.4, c); g.addColorStop(1, "rgba(0,0,0,0.5)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[idx][0], p[idx][1], rr, 0, Math.PI * 2); ctx.fill();
      });
    }
    st.draw = draw;
    canvas.classList.add("grab");
    var down = function (e) { st.drag = true; st.auto = false; st.lx = pageX(e); st.ly = pageY(e); window.addEventListener("mousemove", move); window.addEventListener("mouseup", up); };
    var move = function (e) {
      if (!st.drag) return;
      // drag-to-grab: the object's front face follows the cursor
      st.ry -= (pageX(e) - st.lx) * 0.012; st.rx -= (pageY(e) - st.ly) * 0.012;
      st.lx = pageX(e); st.ly = pageY(e); draw();
      if (e.cancelable) e.preventDefault();
    };
    var up = function () { st.drag = false; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    function pageX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function pageY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("touchstart", down, { passive: true });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", up);
    canvas.addEventListener("wheel", function (e) {
      e.preventDefault(); st.zoom = Math.max(0.5, Math.min(2.4, st.zoom * (e.deltaY < 0 ? 1.12 : 0.89))); draw();
    }, { passive: false });
    draw();
    return st;
  }

  /* ===========================================================================
     2) AI Generation Engine + Planner — type a request → planner routes/splits → blocks
     ======================================================================== */
  function initGenerator() {
    var root = $("#demo-gen");
    if (!root) return;
    var body = $(".note-body", root);
    var btns = $$(".note-gen[data-kind]", root);
    var caret = $(".note-caret", root);
    var busy = false;
    var plotters = [], cubes = [], anims = [];

    var KIND_META = {
      formula:  { lab: "∑ Formula",         tip: "Inserted at cursor" },
      graph:    { lab: "📈 Dynamic Graph",   tip: "Drag to pan · scroll to zoom" },
      mermaid:  { lab: "🔧 Diagram",         tip: "Mermaid-code based" },
      "3d":     { lab: "🧊 3D Object",       tip: "Drag to rotate · scroll to zoom" },
      sim:      { lab: "🎚️ Simulation",      tip: "Live slider control" },
      anim:     { lab: "🎞️ 2D Animation",    tip: "Live frame playback" },
      image:    { lab: "🎨 Illustration",    tip: "Web search → self-hosted" }
    };

    // a simple traveling 2D wave with a dot riding it (the "simple 2D animation" type)
    function drawWave(c, t) {
      var ctx = c.getContext("2d"), w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(148,163,184,0.2)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
      ctx.strokeStyle = "#2ECC71"; ctx.lineWidth = 2.6; ctx.beginPath();
      var amp = (h / 2 - 16) * 0.8;
      for (var x = 0; x <= w; x++) {
        var y = h / 2 - Math.sin(x / w * Math.PI * 4 - t * 3) * amp;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      var dx = (t * 90) % w;
      var dy = h / 2 - Math.sin(dx / w * Math.PI * 4 - t * 3) * amp;
      ctx.fillStyle = "#00E5FF"; ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2); ctx.fill();
    }

    function block(kind, inner) {
      var m = KIND_META[kind];
      var b = el("div", "note-block note-block-in",
        "<div class='note-blab'>" + m.lab + "<span class='tip'>" + m.tip + "</span></div>");
      if (typeof inner === "string") b.insertAdjacentHTML("beforeend", inner);
      else if (inner) b.appendChild(inner);
      return b;
    }

    var MAKERS = {
      // formula renders INLINE at the caret as REAL math via native MathML
      // (browser-built-in — no KaTeX/MathJax, keeps the deck dependency-free)
      formula: function () {
        if (!caret) return null;
        var MATH =
          "<math xmlns='http://www.w3.org/1998/Math/MathML'>" +
            "<mi>y</mi><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo>" +
            "<mi>A</mi><mi>sin</mi><mo>&#8289;</mo><mo>(</mo>" +
              "<mi>&#969;</mi><mi>t</mi><mo>+</mo><mi>&#966;</mi><mo>)</mo>" +
            "<mo>,</mo><mspace width='0.6em'></mspace>" +
            "<mi>&#969;</mi><mo>=</mo>" +
            "<mfrac><mrow><mn>2</mn><mi>&#960;</mi></mrow><mi>T</mi></mfrac>" +
          "</math>";
        var f = el("span", "note-formula", " " + MATH + " ");
        caret.parentNode.insertBefore(f, caret);
        return "INLINE";
      },
      graph: function () {
        var c = makeCanvas("note-canvas", 520, 170);
        var b = block("graph", c);
        plotters.push(attachPlotter(c, function (x) { return Math.sin(x); }));
        return b;
      },
      mermaid: function () {
        return block("mermaid",
          "<div class='note-mermaid'>" +
          "<div class='note-mnode'>Input Image</div><div class='note-marrow'>↓</div>" +
          "<div class='note-mnode'>Convolution (Conv)</div><div class='note-marrow'>↓</div>" +
          "<div class='note-mnode'>Pooling → Feature Map</div></div>");
      },
      "3d": function () {
        var c = makeCanvas("note-canvas", 520, 190);
        var b = block("3d", c);
        cubes.push(attach3D(c, { shape: "molecule", color: "#9D7AF0", atom: "#00E5FF" }));
        return b;
      },
      sim: function () {
        var c = makeCanvas("note-canvas", 520, 150);
        var r = document.createElement("input");
        r.type = "range"; r.min = "20"; r.max = "100"; r.value = "65"; r.className = "note-range";
        var b = block("sim", c); b.appendChild(r);
        var st = attachPlotter(c, function (x) { return Math.sin(x); });
        function redraw() { var k = parseInt(r.value, 10) / 50; st.fn = function (x) { return Math.sin(x * k); }; st.draw(); }
        r.addEventListener("input", redraw); redraw();
        return b;
      },
      anim: function () {
        var c = makeCanvas("note-canvas", 520, 140);
        var b = block("anim", c);
        c.__t = 0; anims.push(c); drawWave(c, 0);
        return b;
      },
      image: function () {
        var ATOM = "<svg viewBox='0 0 220 130' class='note-svg' xmlns='http://www.w3.org/2000/svg'>" +
          "<g fill='none' stroke='#00E5FF' stroke-width='1.6' opacity='0.85'>" +
          "<ellipse cx='110' cy='65' rx='92' ry='30'/><ellipse cx='110' cy='65' rx='92' ry='30' transform='rotate(60 110 65)'/><ellipse cx='110' cy='65' rx='92' ry='30' transform='rotate(120 110 65)'/></g>" +
          "<circle cx='110' cy='65' r='11' fill='#9D7AF0'/>" +
          "<circle cx='202' cy='65' r='4.5' fill='#2ECC71'/><circle cx='64' cy='27' r='4.5' fill='#EA8FC7'/><circle cx='64' cy='103' r='4.5' fill='#D8B46A'/></svg>";
        var b = block("image", ATOM);
        b.insertAdjacentHTML("beforeend", "<div class='note-rehost'>🔒 Web images are re-hosted to the <b>illustrations</b> bucket — safe even if the original is deleted</div>");
        return b;
      }
    };

    function add(kind) {
      var maker = MAKERS[kind]; if (!maker) return;
      var out = maker();
      if (out && out !== "INLINE") { body.appendChild(out); }
      body.scrollTop = body.scrollHeight;
    }

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (busy) return; busy = true;
        var sh = el("div", "note-block note-busy", "<span class='spark'>✨</span> AI is generating the block…");
        body.appendChild(sh); body.scrollTop = body.scrollHeight;
        setTimeout(function () { sh.remove(); add(btn.dataset.kind); busy = false; }, 620);
      });
    });

    // keep 3D molecules gently spinning while the slide is visible
    var slide = root.closest(".slide"), lastTs = 0;
    (function spin(ts) {
      var dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0.016; lastTs = ts || 0;
      if (slide && slide.classList.contains("is-active")) {
        cubes.forEach(function (s) { if (s.auto) { s.ry += dt * 0.5; s.draw(); } });
        anims.forEach(function (c) { c.__t += dt; drawWave(c, c.__t); });
      }
      requestAnimationFrame(spin);
    })();

    onEnterOnce(root, function () { setTimeout(function () { add("graph"); }, 350); });
  }

  /* ===========================================================================
     Shared chat (used by AI tutor)
     ======================================================================== */
  function makeChat(logEl) {
    return {
      add: function (who, html, opts) {
        opts = opts || {};
        var m = el("div", "msg " + who);
        var av = el("div", "msg__av", who === "user" ? "Me" : "AI");
        var b = el("div", "msg__bubble");
        m.appendChild(av); m.appendChild(b);
        logEl.appendChild(m); logEl.scrollTop = logEl.scrollHeight;
        if (opts.instant) { b.innerHTML = html; return Promise.resolve(b); }
        return typeInto(b, html, logEl);
      },
      typing: function () {
        var m = el("div", "msg tutor");
        m.appendChild(el("div", "msg__av", "AI"));
        var b = el("div", "msg__bubble");
        b.appendChild(el("div", "typing", "<span></span><span></span><span></span>"));
        m.appendChild(b); logEl.appendChild(m); logEl.scrollTop = logEl.scrollHeight;
        return m;
      }
    };
  }
  function typeInto(bubble, html, logEl) {
    return new Promise(function (resolve) {
      var tmp = el("div", null, html);
      var nodes = Array.prototype.slice.call(tmp.childNodes);
      bubble.innerHTML = ""; var ni = 0;
      function nextNode() {
        if (ni >= nodes.length) { resolve(bubble); return; }
        var node = nodes[ni++];
        if (node.nodeType === 3) {
          var tnode = document.createTextNode(""); bubble.appendChild(tnode);
          grow(function (s) { tnode.data = s; }, node.textContent, function () { setTimeout(nextNode, 30); });
        } else {
          var clone = node.cloneNode(true); bubble.appendChild(clone); setTimeout(nextNode, 30);
        }
      }
      function grow(set, text, cb) {
        var i = 0;
        (function step() {
          if (i <= text.length) { set(text.slice(0, i)); if (logEl) logEl.scrollTop = logEl.scrollHeight; i++; setTimeout(step, 12); }
          else cb();
        })();
      }
      nextNode();
    });
  }
  function quickRow(container, options, onPick) {
    var row = el("div", "chat__quick");
    options.forEach(function (o) {
      var btn = el("button", null, o.label);
      btn.addEventListener("click", function () { row.remove(); onPick(o); });
      row.appendChild(btn);
    });
    container.appendChild(row); container.scrollTop = container.scrollHeight;
    return row;
  }

  /* ===========================================================================
     5) Context-Aware AI Tutor — note context + live URL crawl, direct explain mode
     ======================================================================== */
  function initTutor() {
    var root = $("#demo-tutor");
    if (!root) return;
    var log = $(".chat__log", root);
    var restart = $(".chat__restart", root);
    var gen = 0;
    function alive(g) { return g === gen; }

    var SCRIPT = {
      start: {
        text: "I see you're writing in the <b>'Torque &amp; Rotational Motion'</b> note. Looking at your <span class='src'>τ = Iα</span> equation — this connects directly to the <b>vector cross product</b> you learned recently! Want to see how?",
        opts: [
          { label: "Oh, how are they connected?", to: "connect" },
          { label: "Actually, torque itself is still confusing", to: "gap" }
        ]
      },
      connect: {
        text: "If you expand the cross product <span class='src'>τ = r × F</span> component-wise, you get exactly the product of moment of inertia I and angular acceleration α — that is, <b>τ = Iα</b>. It's the same concept from your earlier notes, carried forward.",
        opts: [{ label: "Show me with a 3D simulation →", to: "gensim" }]
      },
      gensim: {
        text: "Sure! Instead of a text explanation, I generated a <b>3D simulation</b> on my own where you can directly control <b>r</b> and <b>F</b>, and dropped it right at your cursor — move the two sliders and <span class='src'>τ = r × F</span> plus the rotation speed update in real time.",
        after: function (bubble, myGen) {
          var wrap = el("div", "msg__3d");
          var c = makeCanvas("note-canvas", 280, 170);
          wrap.appendChild(c);

          function ctlRow(labelText) {
            var row = el("div", "msg__3d-ctl");
            row.appendChild(el("span", "msg__3d-ctl-lab", labelText));
            var r = document.createElement("input");
            r.type = "range"; r.min = "10"; r.max = "100"; r.value = "60"; r.className = "note-range";
            row.appendChild(r);
            wrap.appendChild(row);
            return r;
          }
          var rRange = ctlRow("r (radius)");
          var fRange = ctlRow("F (force)");
          var readout = el("div", "msg__3d-tip", "");
          wrap.appendChild(readout);
          bubble.appendChild(wrap);
          log.scrollTop = log.scrollHeight;

          var st3d = attach3D(c, { shape: "torque", color: "#9D7AF0", atom: "#00E5FF" });
          var torque = 0.5; // normalized 0..1 product of r·F, drives angular velocity like τ = Iα
          function applyRF() {
            var rv = parseInt(rRange.value, 10), fv = parseInt(fRange.value, 10);
            st3d.setRF(0.3 + rv / 100 * 1.3, 0.2 + fv / 100 * 1.1);
            torque = (rv / 100) * (fv / 100);
            readout.textContent = "🎚️ τ = r × F ≈ " + torque.toFixed(2) + " — rotation speed (ω) updates live";
            st3d.draw();
          }
          rRange.addEventListener("input", applyRF);
          fRange.addEventListener("input", applyRF);
          applyRF();

          var last = null;
          function spin(ts) {
            if (!alive(myGen)) return;
            if (last != null && st3d.auto) { st3d.ry += (ts - last) / 1000 * torque * 2.2; st3d.draw(); }
            last = ts;
            requestAnimationFrame(spin);
          }
          requestAnimationFrame(spin);
        },
        opts: [{ label: "I get it now, thanks", to: "end" }]
      },
      gap: {
        text: "That's fair — other learners studying similar material often get stuck on <b>'how is this different from force'</b> too. Want me to answer that question first, or go straight to building you a <b>step-by-step study plan</b>?",
        opts: [
          { label: "Build the study plan first", to: "plan" },
          { label: "Answer the sticking point first →", to: "connect" }
        ]
      },
      plan: {
        text: "Great — I've laid it out as <b>Week 1: Force vs. Torque</b> → <b>Week 2: Moment of Inertia</b> → <b>Week 3: Applying τ = Iα</b>. Approve it and I'll add it straight to your study Planner. 👍",
        opts: []
      },
      end: {
        text: "Glad to help — call me back anytime! That whole exchange drew on your profile, learning history, and the current note's context together.",
        opts: []
      }
    };

    function step(key, myGen) {
      if (!alive(myGen)) return;
      var node = SCRIPT[key];
      var chat = makeChat(log);
      var t = chat.typing();
      setTimeout(function () {
        if (!alive(myGen)) { t.remove(); return; }
        t.remove();
        chat.add("tutor", node.text).then(function (bubble) {
          if (!alive(myGen)) return;
          if (node.after) node.after(bubble, myGen);
          if (!node.opts.length) return;
          quickRow(log, node.opts.slice(), function (o) {
            if (!alive(myGen)) return;
            chat.add("user", o.label, { instant: true }).then(function () {
              if (alive(myGen)) setTimeout(function () { step(o.to, myGen); }, 250);
            });
          });
        });
      }, 600);
    }
    function start() { gen++; var myGen = gen; log.innerHTML = ""; step("start", myGen); }
    if (restart) restart.addEventListener("click", start);
    onEnterOnce(root, start);
  }

  /* ===========================================================================
     6) 3D Note Universe — wire search box to the canvas pulse
     ======================================================================== */
  function initUniverseSearch() {
    var root = $("#demo-universe");
    if (!root) return;
    var input = $(".uni-search input", root);
    var btn = $(".uni-search button", root);
    var tip = $(".uni-tip", root);
    function go() {
      if (!window.__snUni || !input) return;
      var hit = window.__snUni.search(input.value);
      if (tip) tip.textContent = hit ? "🔎 Jumped to \"" + hit.label + "\"" : (input.value ? "No results found" : "🖱️ Drag to rotate · hover a planet");
    }
    if (btn) btn.addEventListener("click", go);
    if (input) input.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    $$(".chips .chip", root).forEach(function (c) {
      c.addEventListener("click", function () { if (input) input.value = c.textContent; go(); });
    });
  }

  /* ===========================================================================
     7) TAM/SAM/SOM ring chart
     ======================================================================== */
  function initMarket() {
    var root = $("#demo-market");
    if (!root) return;
    var tam = $("#ring-tam", root), sam = $("#ring-sam", root), som = $("#ring-som", root);
    function set(circle, r, delay) { if (!circle) return; circle.setAttribute("r", "0"); setTimeout(function () { circle.setAttribute("r", r); }, delay + 60); }
    function animate() {
      set(tam, 90, 0); set(sam, 56, 140); set(som, 26, 280);
    }
    onEnterOnce(root, animate);
    document.addEventListener("slide:enter", function (e) { if (e.target === root.closest(".slide")) animate(); });
  }

  /* ===========================================================================
     9) The Ask — SAFE slider ($100k–$200k) recomputes the headline amount,
        equity (post-money cap $2.0M), runway (~$8.3k/mo burn) and each
        use-of-funds amount live.
     ======================================================================== */
  function initAsk() {
    var root = $("#demo-ask");
    if (!root) return;
    var fills = root.querySelectorAll(".use__fill");
    var range = $("#ask-range", root);
    var amountEl = $("#ask-amount", root);
    var equityEl = $("#ask-equity", root);
    var runwayEl = $("#ask-runway", root);
    var amts = root.querySelectorAll(".amt[data-share]");
    var CAP = 2000; // post-money SAFE cap, in $k ($2.0M)

    function usd(k) { return "$" + (k % 1 === 0 ? k : k.toFixed(1)) + "k"; }
    // bar width = pct-of-raise * (raise / max-raise) — ratios between bars stay fixed,
    // but the whole row visibly grows/shrinks with the slider instead of only the numbers.
    function barWidth(pct) {
      var v = parseInt(range.value, 10);
      var min = parseInt(range.min, 10) || 0, max = parseInt(range.max, 10) || v;
      var scale = 0.5 + 0.5 * ((v - min) / (max - min));
      return (pct * scale).toFixed(1) + "%";
    }
    function update() {
      var v = parseInt(range.value, 10);            // $k: 100→$100k … 200→$200k
      if (amountEl) amountEl.textContent = "$" + v + "k";
      if (equityEl) equityEl.textContent = (v / CAP * 100).toFixed(1) + "%";
      if (runwayEl) runwayEl.textContent = Math.round(v * 0.12) + " mo"; // ~$8.3k/mo burn
      amts.forEach(function (a) {
        var share = (parseInt(a.dataset.share, 10) || 0) / 100;
        a.textContent = usd(Math.round(v * share * 10) / 10);
      });
      fills.forEach(function (f) { f.style.width = barWidth(parseFloat(f.dataset.pct) || 0); });
    }
    if (range) { range.addEventListener("input", update); update(); }

    function runBars() {
      fills.forEach(function (f) { f.style.width = "0"; });
      setTimeout(function () { fills.forEach(function (f) { f.style.width = barWidth(parseFloat(f.dataset.pct) || 0); }); }, 60);
    }
    var mySlide = root.closest(".slide");
    document.addEventListener("slide:enter", function (e) { if (e.target === mySlide) setTimeout(runBars, 350); });
  }

  /* ── boot ──────────────────────────────────────────────────────────────── */
  function boot() {
    initProofreader();
    initGenerator();
    initTutor();
    initUniverseSearch();
    initMarket();
    initAsk();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
