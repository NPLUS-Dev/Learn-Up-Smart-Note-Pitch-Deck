/* =============================================================================
   Smart Note · 3D Note Universe — offline Canvas2D demo
   Mirrors the app's independent note-space (NoteUniverse, lazy three.js) with
   zero dependencies so it runs from file:// on any device:
     · FOLDER  → color group (subject hue), the "star" a note belongs to
     · NOTE    → planet; SIZE ∝ note weight, ORBIT ∝ 1/weight (central = core)
     · [[CITE]] → gravity line between notes that reference each other
     · search the title → the matching note pulses + labels itself
     · gentle orbital drift · drag to spin · hover for a title
   ========================================================================== */
(function () {
  "use strict";

  var DOMAIN_HUE = {
    math: "#9D7AF0",
    physics: "#5DA7F0",
    chemistry: "#EA8FC7",
    biology: "#6DCB9B",
    other: "#D8B46A"
  };

  /* A connected, note-flavored universe (weight 0–100 ≈ note maturity/size). */
  var DEFAULT = {
    planets: [
      { id: "shm",     label: "단순조화진동",   domain: "physics",   mastery: 84 },
      { id: "cnn",     label: "CNN 역전파",     domain: "other",     mastery: 76 },
      { id: "cross",   label: "벡터 외적",       domain: "math",      mastery: 72 },
      { id: "rot",     label: "회전 역학",       domain: "physics",   mastery: 67 },
      { id: "benzene", label: "벤젠 고리 구조",  domain: "chemistry", mastery: 63 },
      { id: "neuron",  label: "신경세포 전위",   domain: "biology",   mastery: 60 },
      { id: "im2col",  label: "im2col",         domain: "other",     mastery: 56 },
      { id: "angmom",  label: "각운동량 보존",   domain: "physics",   mastery: 52 },
      { id: "matrix",  label: "행렬 변환",       domain: "math",      mastery: 49 },
      { id: "fourier", label: "푸리에 급수",     domain: "math",      mastery: 43 },
      { id: "echem",   label: "전기화학",        domain: "chemistry", mastery: 37 },
      { id: "entropy", label: "엔트로피",        domain: "chemistry", mastery: 31 }
    ],
    links: [
      { a: "cross",   b: "rot",     strength: 0.9 },
      { a: "rot",     b: "angmom",  strength: 0.85 },
      { a: "shm",     b: "rot",     strength: 0.7 },
      { a: "cnn",     b: "im2col",  strength: 0.92 },
      { a: "matrix",  b: "im2col",  strength: 0.55 },
      { a: "fourier", b: "shm",     strength: 0.66 },
      { a: "benzene", b: "echem",   strength: 0.6 },
      { a: "entropy", b: "echem",   strength: 0.5 },
      { a: "neuron",  b: "benzene", strength: 0.42 },
      { a: "matrix",  b: "cross",   strength: 0.5 }
    ]
  };

  function hash01(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 100000) / 100000;
  }

  var instances = [];

  function create(canvas, opts) {
    opts = opts || {};
    var data = opts.data || DEFAULT;
    var interactive = opts.interactive !== false;
    var showLabels = opts.showLabels !== false;
    var dim = opts.dim || 1;
    var ctx = canvas.getContext("2d");

    var planets = data.planets.map(function (p) {
      var hv = hash01(p.id);
      return {
        id: p.id, label: p.label, domain: p.domain, mastery: p.mastery,
        orbit: 0.30 + (1 - Math.min(100, p.mastery) / 100) * 0.70,
        angle: hv * Math.PI * 2,
        speed: 0.04 + hv * 0.06,
        incline: (hv - 0.5) * 0.5,
        spin: 0,
        hasRing: hash01(p.id + "r") > 0.62,
        bobPhase: hv * Math.PI * 2
      };
    });

    var inst = {
      canvas: canvas, ctx: ctx, planets: planets, links: data.links,
      interactive: interactive, showLabels: showLabels, dim: dim,
      spinOffset: 0, drag: false, lastX: 0, dragVel: 0,
      hover: null, pointer: { x: -1, y: -1 }, stars: [], w: 0, h: 0, dpr: 1, t: 0,
      searchId: null, searchT: 0
    };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      inst.dpr = dpr; inst.w = rect.width; inst.h = rect.height;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      if (!inst.stars.length || inst._sw !== rect.width) {
        inst._sw = rect.width; inst.stars = [];
        var n = Math.round((rect.width * rect.height) / 4200);
        for (var i = 0; i < n; i++) {
          inst.stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.2, tw: Math.random() * Math.PI * 2, sp: Math.random() * 2 + 0.6 });
        }
      }
    }
    inst.resize = resize;

    /* Search a note by title fragment → pulse + reveal it. Returns the match. */
    inst.search = function (q) {
      q = (q || "").trim().toLowerCase();
      if (!q) { inst.searchId = null; return null; }
      var hit = null;
      for (var i = 0; i < inst.planets.length; i++) {
        if (inst.planets[i].label.toLowerCase().indexOf(q) !== -1) { hit = inst.planets[i]; break; }
      }
      inst.searchId = hit ? hit.id : null;
      inst.searchT = 0;
      return hit;
    };

    if (interactive) {
      var down = function (e) { inst.drag = true; inst.lastX = (e.touches ? e.touches[0].clientX : e.clientX); canvas.style.cursor = "grabbing"; };
      var move = function (e) {
        var cx = (e.touches ? e.touches[0].clientX : e.clientX);
        var rect = canvas.getBoundingClientRect();
        inst.pointer.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        inst.pointer.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        if (inst.drag) {
          var dx = cx - inst.lastX;
          inst.spinOffset -= dx * 0.006; inst.dragVel = -dx * 0.006; inst.lastX = cx;
        }
      };
      var up = function () { inst.drag = false; canvas.style.cursor = "grab"; };
      canvas.addEventListener("mousedown", down);
      canvas.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      canvas.addEventListener("mouseleave", function () { inst.pointer.x = -1; inst.pointer.y = -1; });
      canvas.addEventListener("touchstart", function (e) { down(e); }, { passive: true });
      canvas.addEventListener("touchmove", function (e) { move(e); }, { passive: true });
      canvas.addEventListener("touchend", up);
    }

    resize();
    instances.push(inst);
    return inst;
  }

  function bodyRadius(mastery, base) { return base * (0.018 + (Math.min(100, Math.max(0, mastery)) / 100) * 0.05); }

  function project(inst, p) {
    var cx = inst.w / 2, cy = inst.h / 2;
    var maxR = Math.min(inst.w, inst.h) * 0.42;
    var a = p.angle + inst.spinOffset;
    var x = Math.cos(a) * p.orbit * maxR;
    var z = Math.sin(a) * p.orbit * maxR;
    var bob = Math.sin(inst.t * 0.8 + p.bobPhase) * 6;
    var sx = cx + x;
    var sy = cy + z * 0.40 + p.incline * maxR * 0.5 + bob;
    var depth = (z / maxR + 1) / 2;
    return { sx: sx, sy: sy, depth: depth };
  }

  function draw(inst, dt) {
    var ctx = inst.ctx, w = inst.w, h = inst.h, dpr = inst.dpr;
    inst.t += dt;
    inst.searchT += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var bg = ctx.createRadialGradient(w / 2, h * 0.32, 0, w / 2, h * 0.4, Math.max(w, h) * 0.75);
    bg.addColorStop(0, "rgba(26,19,64,0.55)");
    bg.addColorStop(0.6, "rgba(12,10,36,0.25)");
    bg.addColorStop(1, "rgba(7,6,26,0)");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    for (var i = 0; i < inst.stars.length; i++) {
      var s = inst.stars[i];
      s.tw += dt * s.sp;
      var tw = 0.35 + (Math.sin(s.tw) * 0.5 + 0.5) * 0.65;
      ctx.globalAlpha = tw * inst.dim;
      ctx.fillStyle = "#dfe7ff";
      ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (!inst.drag) {
      inst.spinOffset += dt * 0.06 + inst.dragVel;
      inst.dragVel *= 0.94;
      if (Math.abs(inst.dragVel) < 0.0002) inst.dragVel = 0;
    }
    for (var k = 0; k < inst.planets.length; k++) inst.planets[k].angle += dt * inst.planets[k].speed * 0.25;

    var pos = {};
    for (var p = 0; p < inst.planets.length; p++) { var pl = inst.planets[p]; pos[pl.id] = project(inst, pl); }

    for (var l = 0; l < inst.links.length; l++) {
      var lk = inst.links[l];
      var A = pos[lk.a], B = pos[lk.b];
      if (!A || !B) continue;
      var grad = ctx.createLinearGradient(A.sx, A.sy, B.sx, B.sy);
      var op = (0.08 + lk.strength * 0.32) * inst.dim;
      grad.addColorStop(0, "rgba(157,122,240," + op + ")");
      grad.addColorStop(0.5, "rgba(0,229,255," + (op * 0.9) + ")");
      grad.addColorStop(1, "rgba(157,122,240," + op + ")");
      ctx.strokeStyle = grad; ctx.lineWidth = 0.7 + lk.strength * 2.2;
      ctx.beginPath(); ctx.moveTo(A.sx, A.sy); ctx.lineTo(B.sx, B.sy); ctx.stroke();
    }

    var base = Math.min(w, h);
    inst.hover = null;
    if (inst.interactive && inst.pointer.x >= 0) {
      var best = 1e9;
      for (var hh = 0; hh < inst.planets.length; hh++) {
        var hp = inst.planets[hh];
        var hpz = pos[hp.id];
        var rad = bodyRadius(hp.mastery, base) * (0.8 + hpz.depth * 0.5);
        var d = Math.hypot(inst.pointer.x - hpz.sx, inst.pointer.y - hpz.sy);
        if (d < rad + 8 && d < best) { best = d; inst.hover = hp.id; }
      }
    }

    var order = inst.planets.slice().sort(function (a, b) { return pos[a.id].depth - pos[b.id].depth; });

    for (var o = 0; o < order.length; o++) {
      var planet = order[o];
      var pp = pos[planet.id];
      var col = DOMAIN_HUE[planet.domain] || DOMAIN_HUE.other;
      var r = bodyRadius(planet.mastery, base) * (0.8 + pp.depth * 0.5);
      var bright = (0.55 + pp.depth * 0.45) * inst.dim;
      var isHover = inst.hover === planet.id;
      var isSearch = inst.searchId === planet.id;

      var glow = ctx.createRadialGradient(pp.sx, pp.sy, 0, pp.sx, pp.sy, r * 3.4);
      glow.addColorStop(0, hexA(col, 0.32 * bright));
      glow.addColorStop(0.5, hexA(col, 0.09 * bright));
      glow.addColorStop(1, hexA(col, 0));
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(pp.sx, pp.sy, r * 3.4, 0, Math.PI * 2); ctx.fill();

      if (planet.hasRing) {
        ctx.save(); ctx.translate(pp.sx, pp.sy); ctx.scale(1, 0.34);
        ctx.strokeStyle = hexA(col, 0.45 * bright);
        ctx.lineWidth = Math.max(1.5, r * 0.34);
        ctx.beginPath(); ctx.arc(0, 0, r * 1.85, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }

      var bodyGrad = ctx.createRadialGradient(pp.sx - r * 0.4, pp.sy - r * 0.45, r * 0.1, pp.sx, pp.sy, r);
      bodyGrad.addColorStop(0, lighten(col, 0.5));
      bodyGrad.addColorStop(0.55, col);
      bodyGrad.addColorStop(1, darken(col, 0.55));
      ctx.fillStyle = bodyGrad;
      ctx.beginPath(); ctx.arc(pp.sx, pp.sy, r, 0, Math.PI * 2); ctx.fill();

      if (planet.mastery > 58 && !planet.hasRing) {
        ctx.strokeStyle = "rgba(255,255,255," + (0.4 * bright) + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(pp.sx, pp.sy, r * 1.5, 0, Math.PI * 2); ctx.stroke();
      }

      if (isHover) {
        ctx.strokeStyle = "#00E5FF"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pp.sx, pp.sy, r + 4, 0, Math.PI * 2); ctx.stroke();
      }

      // search pulse: an expanding cyan ring that fades, looping a few times
      if (isSearch) {
        var ph = (inst.searchT % 1.4) / 1.4;          // 0..1 each 1.4s
        var pr = r + 6 + ph * (r * 2.4 + 22);
        ctx.strokeStyle = "rgba(0,229,255," + (0.85 * (1 - ph)) + ")";
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(pp.sx, pp.sy, pr, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(0,229,255,0.9)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pp.sx, pp.sy, r + 4, 0, Math.PI * 2); ctx.stroke();
      }
    }

    // hovered or searched label (drawn last, on top)
    var labelId = inst.hover || (inst.showLabels ? inst.searchId : null);
    if (inst.showLabels && labelId) {
      var hpObj = null;
      for (var z = 0; z < inst.planets.length; z++) if (inst.planets[z].id === labelId) hpObj = inst.planets[z];
      if (hpObj) {
        var hpp = pos[hpObj.id];
        var txt = hpObj.label;
        ctx.font = "600 13px Pretendard, 'Malgun Gothic', system-ui, sans-serif";
        var tw = ctx.measureText(txt).width;
        var bx = hpp.sx - tw / 2 - 10;
        var by = hpp.sy - bodyRadius(hpObj.mastery, base) * 2.4 - 26;
        roundRect(ctx, bx, by, tw + 20, 26, 13);
        ctx.fillStyle = "rgba(248,250,252,0.96)"; ctx.fill();
        ctx.fillStyle = "#1c2340"; ctx.fillText(txt, hpp.sx - tw / 2, by + 17);
      }
    }
  }

  function parseHex(hex) { var c = hex.replace("#", ""); return [parseInt(c.substring(0, 2), 16), parseInt(c.substring(2, 4), 16), parseInt(c.substring(4, 6), 16)]; }
  function hexA(hex, a) { var r = parseHex(hex); return "rgba(" + r[0] + "," + r[1] + "," + r[2] + "," + a + ")"; }
  function lighten(hex, t) { var r = parseHex(hex); return "rgb(" + Math.round(r[0] + (255 - r[0]) * t) + "," + Math.round(r[1] + (255 - r[1]) * t) + "," + Math.round(r[2] + (255 - r[2]) * t) + ")"; }
  function darken(hex, t) { var r = parseHex(hex); return "rgb(" + Math.round(r[0] * (1 - t)) + "," + Math.round(r[1] * (1 - t)) + "," + Math.round(r[2] * (1 - t)) + ")"; }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function visible(canvas) {
    if (canvas.offsetParent === null) return false;
    var slide = canvas.closest(".slide");
    if (slide && !slide.classList.contains("is-active")) return false;
    return true;
  }

  var last = 0;
  function loop(ts) {
    var dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016;
    last = ts;
    for (var i = 0; i < instances.length; i++) if (visible(instances[i].canvas)) draw(instances[i], dt);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  window.addEventListener("resize", function () { for (var i = 0; i < instances.length; i++) instances[i].resize(); });

  window.SNUniverse = { create: create, DOMAIN_HUE: DOMAIN_HUE, DEFAULT: DEFAULT };
})();
