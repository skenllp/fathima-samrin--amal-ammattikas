(function () {
  "use strict";
  var D = window.weddingData;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
  window.scrollTo(0, 0);

  /* ---------- Google Maps links from config ---------- */
  var mapsUrl = D.venue.confirmedMapsUrl || D.venue.mapsUrl;
  var dirUrl = D.venue.confirmedDirectionsUrl || D.venue.directionsUrl;
  $$(".js-maps").forEach(function (a) { a.href = mapsUrl; });
  $$(".js-directions").forEach(function (a) { a.href = dirUrl; });

  /* ---------- Script names: serif capital first letters ---------- */
  $$(".script").forEach(function (el) {
    var t = el.textContent;
    if (!/^[A-Za-z][A-Za-z ]*$/.test(t)) return;
    el.setAttribute("aria-label", t);
    el.innerHTML = t.replace(/(^|\s)([A-Za-z])/g, function (m, sp, ch) {
      return sp + '<span class="cap" aria-hidden="true">' + ch + "</span>";
    });
  });

  /* ---------- Ambient particles ---------- */
  if (!reduce) {
    var sp = $("#sparkles");
    var small = window.innerWidth < 720;
    for (var i = 0; i < (small ? 6 : 12); i++) {
      var s = document.createElement("span");
      s.className = "spark";
      s.style.left = ((i * 37 + 8) % 94) + "%";
      s.style.top = ((i * 23 + 10) % 82) + "%";
      s.style.animationDelay = (-i * 0.9) + "s";
      s.style.animationDuration = 4 + (i % 4) + "s";
      sp.appendChild(s);
    }
    var pt = $("#petals");
    for (var j = 0; j < (small ? 5 : 9); j++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.style.left = ((j * 11 + 6) % 96) + "%";
      p.style.width = 10 + (j % 3) * 3 + "px";
      p.style.height = 13 + (j % 3) * 3 + "px";
      p.style.setProperty("--dur", 13 + (j % 4) * 3 + "s");
      p.style.setProperty("--delay", -j * 2.3 + "s");
      p.style.setProperty("--sway", (j % 2 ? 1 : -1) * (20 + j * 4) + "px");
      pt.appendChild(p);
    }
  }

  /* ---------- Scroll reveal ---------- */
  var hasIO = "IntersectionObserver" in window;
  var io = hasIO && new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .timeline").forEach(function (el) {
    el.style.setProperty("--d", (el.getAttribute("data-d") || 0) + "ms");
    io ? io.observe(el) : el.classList.add("is-in");
  });

  /* ---------- Music (silent until the guest taps; then plays from the start) ---------- */
  var audio = null, musicOn = false, userMuted = false, noteTimer;
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
      audio.src = D.musicSrc;
    } else if (audio.currentTime > 0.5) {
      audio.currentTime = 0;
    }
    var pr = audio.play();
    if (pr && pr.catch) pr.catch(function () {
      setMusic(false);
      if (quiet) {
        var retry = function () { document.removeEventListener("pointerdown", retry, true); if (!musicOn && !userMuted) startMusic(false); };
        document.addEventListener("pointerdown", retry, true);
      } else note("Music could not be played.");
    });
  }
  mBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (musicOn && audio) { userMuted = true; audio.pause(); }
    else { userMuted = false; startMusic(false); }
  });

  /* ---------- Opening gate ---------- */
  var gate = $("#gate"), openBtn = $("#openBtn"), opened = false;
  function openInvitation() {
    if (opened) return;
    opened = true;
    startMusic(true);                         // plays from 0:00 on this tap
    gate.classList.add("closing");
    root.classList.remove("no-scroll");
    window.scrollTo(0, 0);
    setTimeout(function () { document.body.classList.add("ready"); }, 350);   // hero text reveals as the gate lifts
    $("#music").hidden = false;
    setTimeout(function () { gate.remove(); }, 1600);
  }
  openBtn.addEventListener("click", openInvitation);
  openBtn.focus({ preventScroll: true });

  /* ---------- Countdown ---------- */
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
    if (left <= 0) { $("#cdGrid").hidden = true; $("#cdArrived").hidden = false; return false; }
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
})();
