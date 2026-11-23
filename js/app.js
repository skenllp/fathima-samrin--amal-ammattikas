(function () {
  "use strict";
  var D = window.weddingData;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;

  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  window.scrollTo(0, 0);

  /* ---------- Links from config ---------- */
  var mapsUrl = D.venue.confirmedMapsUrl || D.venue.mapsUrl;
  var dirUrl = D.venue.confirmedDirectionsUrl || D.venue.directionsUrl;
  $$(".js-maps").forEach(function (a) { a.href = mapsUrl; });
  $$(".js-directions").forEach(function (a) { a.href = dirUrl; });

  /* ---------- Decorative corner florals ---------- */
  $$(".corners").forEach(function (el) {
    el.setAttribute("aria-hidden", "true");
    el.getAttribute("data-corners").split(" ").forEach(function (c) {
      el.insertAdjacentHTML("beforeend", '<svg class="' + c + '" viewBox="0 0 220 220"><use href="#floral"/></svg>');
    });
  });

  /* ---------- Falling petals ---------- */
  var petals = $(".petals");
  for (var i = 0; i < 9; i++) {
    var p = document.createElement("span");
    p.className = "petal";
    p.style.left = ((i * 11 + 6) % 96) + "%";
    p.style.width = 10 + (i % 3) * 3 + "px";
    p.style.height = 13 + (i % 3) * 3 + "px";
    p.style.setProperty("--dur", 13 + (i % 4) * 3 + "s");
    p.style.setProperty("--delay", -i * 2.3 + "s");
    p.style.setProperty("--sway", (i % 2 ? 1 : -1) * (20 + i * 4) + "px");
    petals.appendChild(p);
  }

  /* ---------- Scroll reveal ---------- */
  var hasIO = "IntersectionObserver" in window;
  var revealIO = hasIO && new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach(function (el) {
    el.style.setProperty("--d", (el.getAttribute("data-d") || 0) + "ms");
    revealIO ? revealIO.observe(el) : el.classList.add("is-in");
  });

  /* ---------- Section backgrounds: preload quietly after the page loads, apply once decoded (no pop-in) ---------- */
  var bgMap = {};
  $$("[data-bg]").forEach(function (el) {
    var u = el.getAttribute("data-bg");
    (bgMap[u] = bgMap[u] || []).push(el);
  });
  function loadBgs() {
    Object.keys(bgMap).forEach(function (u) {
      var im = new Image();
      im.onload = function () { bgMap[u].forEach(function (el) { el.style.backgroundImage = "url(" + u + ")"; }); };
      im.src = u;
    });
  }
  if (document.readyState === "complete") setTimeout(loadBgs, 300);
  else window.addEventListener("load", function () { setTimeout(loadBgs, 300); });
  /* ---------- Capital first letters in script names ---------- */
  $$(".script").forEach(function (el) {
    var t = el.textContent;
    if (!/^[A-Za-z][A-Za-z ]*$/.test(t)) return;
    el.setAttribute("aria-label", t);
    el.innerHTML = t.replace(/(^|\s)([A-Za-z])/g, function (m, sp, ch) {
      return sp + '<span class="cap" aria-hidden="true">' + ch + "</span>";
    });
  });

  /* ---------- Music (silent until the guest taps; then plays from the start) ---------- */
  var audio = null, musicOn = false, noteTimer;
  var mBtn = $("#musicBtn"), mNote = $("#musicNote"), mIcon = $("#musicIcon");
  function note(t) {
    mNote.textContent = t; mNote.hidden = false;
    clearTimeout(noteTimer); noteTimer = setTimeout(function () { mNote.hidden = true; }, 3200);
  }
  function setMusic(on) {
    musicOn = on;
    mBtn.setAttribute("aria-pressed", on);
    mBtn.setAttribute("aria-label", "Turn background music " + (on ? "off" : "on"));
    mIcon.setAttribute("d", on ? "M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" : "M17 9l5 6M22 9l-5 6");
  }
  function startMusic(quiet) {
    if (!D.musicSrc) { if (!quiet) note("Music has not been added to this invitation yet."); return; }
    if (!audio) {
      audio = new Audio(); audio.loop = true; audio.preload = "auto";
      audio.addEventListener("playing", function () { setMusic(true); });
      audio.addEventListener("pause", function () { setMusic(false); });
      audio.addEventListener("error", function () { setMusic(false); note("Music could not be loaded."); });
      audio.src = D.musicSrc;         // a fresh element already starts at 0:00 — no seek needed
    } else if (audio.currentTime > 0.5) {
      audio.currentTime = 0;          // only rewind when restarting an element that already played
    }
    var pr = audio.play();            // must be called inside a tap handler
    if (pr && pr.catch) pr.catch(function () {
      setMusic(false);
      if (quiet) {
        // Browser refused (e.g. strict autoplay rules): retry on the guest's next tap
        var retry = function () { document.removeEventListener("pointerdown", retry, true); if (!musicOn && !userMuted) startMusic(false); };
        document.addEventListener("pointerdown", retry, true);
      } else note("Music could not be played.");
    });
  }
  var userMuted = false;              // guest pressed the speaker to turn music off
  mBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (musicOn && audio) { userMuted = true; audio.pause(); }
    else { userMuted = false; startMusic(false); }
  });

  /* ---------- Show intro text only once fonts are ready (no font-swap flicker) ---------- */
  var fontsShown = false;
  function showIntroText() { if (!fontsShown) { fontsShown = true; root.classList.add("fonts-ok"); } }
  setTimeout(showIntroText, 2500); // never wait longer than this
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load("1em Parisienne"), document.fonts.load("1em Cinzel"), document.fonts.load("1em 'Cormorant Garamond'")])
      .then(showIntroText, showIntroText);
  } else showIntroText();
  /* ---------- 1. Cinematic intro ---------- */
  var intro = $("#intro"), video = $("#introVideo"), introText = $("#introText");
  var openBtn = $("#openBtn"), skipBtn = $("#skipBtn");
  var finished = false, started = false, videoFailed = false, phase = "idle";

  function finish() {
    if (finished) return;
    finished = true; phase = "leaving";
    intro.classList.add("leaving");
    introText.classList.add("hide");
    root.classList.remove("no-scroll");   // scrolling enabled
    document.body.classList.add("ready");  // hero reveal starts
    $("#music").hidden = false;
    setTimeout(function () {
      try { video.pause(); } catch (e) {}
      intro.remove();
    }, 1500);
  }

  // fade the first frame in when it is ready, instead of popping in
  function videoReady() { video.classList.add("on"); }
  if (video.readyState >= 2) videoReady(); else video.addEventListener("loadeddata", videoReady);
  setTimeout(videoReady, 3500);
  video.addEventListener("playing", function () { started = true; videoReady(); });
  video.addEventListener("ended", finish);
  video.addEventListener("error", function () { videoFailed = true; if (phase === "playing") finish(); });

  openBtn.addEventListener("click", function () {
    if (phase !== "idle") return;
    startMusic(true);                // song starts from 0:00 on this tap
    if (videoFailed) return finish();
    phase = "playing";
    introText.classList.add("hide"); // fades out in 0.6s while the curtain starts moving
    try {
      video.currentTime = 0;
      var pr = video.play();           // called directly inside the tap: allowed on iOS / Android
      if (pr && pr.catch) pr.catch(finish);
    } catch (e) { return finish(); }
    setTimeout(function () { if (!started) finish(); }, 8000); // never trap the guest
  });
  skipBtn.addEventListener("click", function () { if (phase === "idle") startMusic(true); finish(); });

  /* ---------- 7. Countdown ---------- */
  var target = new Date(D.countdownTarget).getTime();
  var cdEls = { d: $("#cdDays"), h: $("#cdHours"), m: $("#cdMinutes"), s: $("#cdSeconds") };
  function setNum(el, v) {
    var t = String(v).padStart(2, "0");
    if (el.textContent !== t) {
      el.textContent = t;
      el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
    }
  }
  function tickCountdown() {
    var left = target - Date.now();
    if (left <= 0) {
      $("#cdGrid").hidden = true; $("#cdArrived").hidden = false;
      return false;
    }
    var s = Math.floor(left / 1000);
    setNum(cdEls.d, Math.floor(s / 86400));
    setNum(cdEls.h, Math.floor((s % 86400) / 3600));
    setNum(cdEls.m, Math.floor((s % 3600) / 60));
    setNum(cdEls.s, s % 60);
    $("#cdGrid").setAttribute("aria-label", Math.floor(s / 86400) + " days, " + Math.floor((s % 86400) / 3600) + " hours, " + Math.floor((s % 3600) / 60) + " minutes remaining");
    return true;
  }
  if (tickCountdown()) {
    var cdTimer = setInterval(function () { if (!tickCountdown()) clearInterval(cdTimer); }, 1000);
  }

  /* ---------- 9. Wishes (only runs if the section is present in the HTML) ---------- */
  if (document.getElementById("wishForm")) {

  var W = D.wishes || {};
  var SUPA = (W.supabaseUrl || "").replace(/\/$/, "");
  var BACKEND = SUPA && W.supabaseAnonKey ? "supabase" : W.endpoint ? "endpoint" : "demo";
  var LS = "wedding-wishes-demo-v1";
  var supaHeaders = { apikey: W.supabaseAnonKey, Authorization: "Bearer " + W.supabaseAnonKey, "Content-Type": "application/json" };

  function readLocal() { try { return JSON.parse(localStorage.getItem(LS) || "[]"); } catch (e) { return []; } }
  function writeLocal(l) { try { localStorage.setItem(LS, JSON.stringify(l.slice(0, 50))); return true; } catch (e) { return false; } }

  function listWishes() {
    if (BACKEND === "supabase")
      return fetch(SUPA + "/rest/v1/wishes?select=name,message,created_at&approved=eq.true&order=created_at.desc&limit=30", { headers: supaHeaders })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); });
    if (BACKEND === "endpoint")
      return fetch(W.endpoint).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { return Array.isArray(d) ? d : []; });
    return Promise.resolve(readLocal());
  }
  function submitWish(name, message) {
    var wish = { name: name, message: message, created_at: new Date().toISOString() };
    if (BACKEND === "supabase")
      return fetch(SUPA + "/rest/v1/wishes", { method: "POST", headers: Object.assign({ Prefer: "return=minimal" }, supaHeaders), body: JSON.stringify({ name: name, message: message }) })
        .then(function (r) { if (!r.ok) throw 0; return { persisted: true, moderated: true, wish: wish }; });
    if (BACKEND === "endpoint")
      return fetch(W.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ name: name, message: message }) })
        .then(function (r) { if (!r.ok) throw 0; return { persisted: true, moderated: false, wish: wish }; });
    if (!writeLocal([wish].concat(readLocal()))) return Promise.reject(0);
    return Promise.resolve({ persisted: false, moderated: false, wish: wish });
  }

  var form = $("#wishForm"), nameIn = $("#wName"), msgIn = $("#wMsg"), listEl = $("#wList");
  if (BACKEND === "demo") $("#demoNote").hidden = false;

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; }
  }
  var shown = [];
  function renderWishes() {
    $$("article", listEl).forEach(function (a) { a.remove(); });
    if (!shown.length) { listEl.hidden = true; return; }
    $("#wListTitle").textContent = BACKEND === "demo" ? "Your preview wishes" : "Blessings from loved ones";
    shown.forEach(function (w) {
      var a = document.createElement("article"); a.className = "card-outline";
      var m = document.createElement("p"); m.className = "body-serif msg"; m.textContent = w.message;   // textContent: no HTML injection
      var b = document.createElement("p"); b.className = "by"; b.textContent = "— " + w.name + (w.created_at ? " · " + fmtDate(w.created_at) : "");
      a.appendChild(m); a.appendChild(b); listEl.appendChild(a);
    });
    listEl.hidden = false;
  }
  listWishes().then(function (l) { shown = l; renderWishes(); }).catch(function () {});

  msgIn.addEventListener("input", function () { $("#wCount").textContent = msgIn.value.length + "/500"; });

  function setErr(input, id, text) {
    var el = $("#" + id);
    el.hidden = !text; el.textContent = text || "";
    input.setAttribute("aria-invalid", text ? "true" : "false");
    if (text) input.setAttribute("aria-describedby", id); else input.removeAttribute("aria-describedby");
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var btn = $("#wSubmit"), status = $("#wStatus");
    if (btn.disabled || $("#wTrap").value) return;
    var name = nameIn.value.trim(), msg = msgIn.value.trim();
    var bad = false;
    setErr(nameIn, "wNameErr", name.length < 2 ? (bad = true, "Please enter your name.") : "");
    setErr(msgIn, "wMsgErr", msg.length < 5 ? (bad = true, "Please share a few words (at least 5 characters).") : "");
    if (bad) { status.textContent = ""; (name.length < 2 ? nameIn : msgIn).focus(); return; }

    btn.disabled = true; btn.textContent = "Sending…"; status.textContent = "";
    submitWish(name, msg).then(function (r) {
      var text = r.persisted
        ? (r.moderated ? "Thank you! Your blessing has been received and will appear once it has been reviewed."
                       : "Thank you! Your blessing has been sent to the couple.")
        : "Preview saved on this device only. It has not been sent to the couple (demo mode).";
      status.innerHTML = '<p class="ok"></p>'; status.firstChild.textContent = text;
      if (!r.moderated) { shown.unshift(r.wish); renderWishes(); }
      form.reset(); $("#wCount").textContent = "0/500";
    }).catch(function () {
      status.innerHTML = '<p class="err" role="alert"></p>';
      status.firstChild.textContent = "We couldn’t send your wishes just now. Please try again.";
    }).then(function () { btn.disabled = false; btn.textContent = "Submit Wishes"; });
  });

  }
})();
