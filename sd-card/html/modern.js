/* ==========================================================================
   SLIM - Comportamiento visual de la interfaz (menu, pie, tema, controles)
   --------------------------------------------------------------------------
   Solo anade clases CSS y elementos decorativos. No modifica valores,
   formularios, IDs ni llamadas al dispositivo. Si algo falla, la pagina
   sigue funcionando (todo va dentro de try/catch).
   Se enlaza en el <head> de cada pagina.
   ========================================================================== */
(function () {
  "use strict";

  /* Logos vectoriales (en linea: el servidor del ESP32 no sirve .svg como
     imagen). El texto usa currentColor para adaptarse al modo claro/oscuro. */
  var LOGO_LUMENS =
    '<svg class="slim-logo slim-logo-lumens" viewBox="0 0 206 72" role="img" aria-label="LUMENS IoT SLIM">' +
    '<defs><linearGradient id="slimLg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#6366f1"/></linearGradient>' +
    '<linearGradient id="slimLt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0ea5e9"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs>' +
    '<rect x="4" y="6" width="60" height="60" rx="16" fill="url(#slimLg)"/><rect x="4" y="6" width="60" height="30" rx="16" fill="#fff" fill-opacity=".10"/>' +
    '<g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M30.2 18.6 A5.4 5.4 0 0 1 37.8 18.6"/><path d="M26.4 14.8 A10.8 10.8 0 0 1 41.6 14.8"/></g>' +
    '<circle cx="34" cy="21.6" r="1.9" fill="#fff"/><rect x="14" y="26" width="40" height="30" rx="8" fill="#fff"/><rect x="19" y="32" width="30" height="12" rx="3" fill="#0f172a"/>' +
    '<g fill="#38bdf8"><rect x="22" y="34.5" width="4.4" height="7" rx="1"/><rect x="28.6" y="34.5" width="4.4" height="7" rx="1"/><rect x="35.2" y="34.5" width="4.4" height="7" rx="1"/></g>' +
    '<rect x="41.8" y="34.5" width="4.4" height="7" rx="1" fill="#f59e0b"/><circle cx="27" cy="50" r="2.2" fill="#6366f1"/><circle cx="34" cy="50" r="2.2" fill="#0ea5e9"/><circle cx="41" cy="50" r="2.2" fill="#6366f1"/>' +
    '<g font-family="\'Segoe UI\',\'Helvetica Neue\',Arial,sans-serif" font-weight="800"><text x="76" y="34" font-size="26" letter-spacing="1.6" fill="currentColor">LUMENS</text>' +
    '<text x="77" y="60" font-size="21" letter-spacing="1"><tspan fill="url(#slimLt)">IoT</tspan><tspan fill="currentColor" dx="7">SLIM</tspan></text></g></svg>';
  var LOGO_LECTA =
    '<svg class="slim-logo slim-logo-lecta" viewBox="0 0 150 48" role="img" aria-label="LECTA">' +
    '<defs><linearGradient id="slimCb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1d47"/><stop offset="1" stop-color="#173a7a"/></linearGradient>' +
    '<radialGradient id="slimCg" cx=".18" cy=".2" r=".7"><stop offset="0" stop-color="#38bdf8" stop-opacity=".35"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="slimCe" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#7dd3fc"/></linearGradient></defs>' +
    '<rect width="150" height="48" rx="10" fill="url(#slimCb)"/><rect width="150" height="48" rx="10" fill="url(#slimCg)"/>' +
    '<g fill="#fff"><rect x="17" y="12" width="6.4" height="24" rx="1"/><rect x="17" y="29.6" width="17" height="6.4" rx="1"/></g>' +
    '<g fill="url(#slimCe)"><rect x="38" y="12" width="17" height="6" rx="1.2"/><rect x="38" y="21" width="13.5" height="6" rx="1.2"/><rect x="38" y="30" width="17" height="6" rx="1.2"/></g>' +
    '<text x="58" y="36" font-family="\'Segoe UI\',\'Helvetica Neue\',Arial,sans-serif" font-weight="800" font-size="33.5" letter-spacing="1" fill="#fff">CTA</text></svg>';
  window.SLIM_LOGOS = { lumens: LOGO_LUMENS, lecta: LOGO_LECTA };

  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* --- Marco principal (index.html): barra de carga y menu activo --- */
  function enhanceShell() {
    var frame = document.getElementById("maincontent");
    var menu = document.querySelector(".menu");
    if (!frame || !menu) return;

    document.documentElement.classList.add("slim-shell");

    var bar = document.createElement("div");
    bar.id = "slim-progress";
    document.body.appendChild(bar);

    var hideTimer = null;
    function startLoading() {
      clearTimeout(hideTimer);
      bar.classList.add("on");
      frame.classList.add("slim-loading");
      // Seguridad: nunca dejar la barra encendida si la pagina no responde
      hideTimer = setTimeout(stopLoading, 15000);
    }
    function stopLoading() {
      clearTimeout(hideTimer);
      bar.classList.remove("on");
      frame.classList.remove("slim-loading");
    }

    frame.addEventListener("load", stopLoading);

    // Detecta cuando el original cambia frame.src (loadPage/asyncPageLoad)
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].attributeName === "src") { startLoading(); break; }
      }
    }).observe(frame, { attributes: true, attributeFilter: ["src"] });

    // Pie de pagina con logos LUMENS IOT SLIM y LECTA
    if (!document.getElementById("slim-footer")) {
      var foot = document.createElement("div");
      foot.id = "slim-footer";
      foot.innerHTML =
        '<span class="slim-brand">' + LOGO_LUMENS + '</span>' +
        '<a class="slim-brand" href="https://website.lecta.com.co/" target="_blank" rel="noopener">' +
        '<span>Con el respaldo de</span>' + LOGO_LECTA + '</a>';
      frame.parentNode.insertBefore(foot, frame.nextSibling);
    }

    // Marca la seccion de menu activa (Overview / Settings / Data / System)
    var topItems = menu.querySelectorAll(":scope > ul > li");
    menu.addEventListener("click", function (ev) {
      var link = ev.target.closest ? ev.target.closest("a") : null;
      if (!link || !link.getAttribute("onclick")) return;
      for (var i = 0; i < topItems.length; i++) {
        topItems[i].classList.toggle("slim-active", topItems[i].contains(link));
      }
    });
  }

  /* --- Overview: destello cuando cambia un valor --- */
  function enhanceOverview() {
    var ids = ["value", "prevalue", "raw", "error", "statusflow"];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var last = el.textContent;
      new MutationObserver(function () {
        if (el.textContent === last) return;
        last = el.textContent;
        el.classList.remove("slim-updated");
        void el.offsetWidth; // reinicia la animacion
        el.classList.add("slim-updated");
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  /* --- Marcos (iframe) cuyas paginas no cargan common.js ---
     (pasos del asistente, pagina "Recognition" generada por el firmware...)
     Se les inyecta el mismo tema y la traduccion al cargar. */
  function injectInto(frame) {
    try {
      var w = frame.contentWindow, d = frame.contentDocument;
      if (!w || !d || !d.head || w.__slimThemeLoaded) return;
      if (d.location.origin !== location.origin) return;
      w.__slimThemeLoaded = true;
      var v = "slim3";
      var css = d.createElement("link");
      css.rel = "stylesheet"; css.href = "/modern.css?v=" + v;
      d.head.appendChild(css);
      ["modern.js", "i18n-es.js"].forEach(function (f) {
        var s = d.createElement("script"); s.src = "/" + f + "?v=" + v; d.head.appendChild(s);
      });
    } catch (e) { /* otro origen o pagina no accesible: se deja tal cual */ }
  }
  function watchFrames() {
    function hook(f) {
      if (f.__slimHooked) return;
      f.__slimHooked = true;
      f.addEventListener("load", function () { injectInto(f); });
      injectInto(f);
    }
    Array.prototype.forEach.call(document.querySelectorAll("iframe"), hook);
    new MutationObserver(function () {
      Array.prototype.forEach.call(document.querySelectorAll("iframe"), hook);
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* --- Tema claro / oscuro ---
     Preferencia guardada en localStorage ("slim-theme": "dark" | "light").
     Sin preferencia se sigue la del sistema. Se sincroniza entre el marco
     principal y las paginas internas con el evento "storage". */
  var THEME_KEY = "slim-theme";
  function readPref() { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } }
  function systemDark() { return !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches); }
  function isDark() { var p = readPref(); return p ? p === "dark" : systemDark(); }
  function applyTheme() {
    document.documentElement.classList.toggle("slim-dark", isDark());
    var b = document.getElementById("slim-theme-toggle");
    if (b) {
      b.textContent = isDark() ? "☀️" : "🌙";
      b.title = isDark() ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
    }
    // Aplicar tambien a los iframes (mismo origen) al instante
    Array.prototype.forEach.call(document.querySelectorAll("iframe"), function (f) {
      try { f.contentDocument.documentElement.classList.toggle("slim-dark", isDark()); } catch (e) {}
    });
  }
  function initTheme() {
    applyTheme();
    window.addEventListener("storage", function (e) { if (e.key === THEME_KEY) applyTheme(); });
    if (window.matchMedia) {
      var mq = matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", applyTheme);
    }
    // Boton solo en el marco principal
    var header = document.querySelector(".main > table:first-child");
    if (header && document.getElementById("maincontent") && !document.getElementById("slim-theme-toggle")) {
      var b = document.createElement("button");
      b.type = "button";
      b.id = "slim-theme-toggle";
      b.addEventListener("click", function () {
        try { localStorage.setItem(THEME_KEY, isDark() ? "light" : "dark"); } catch (e) {}
        applyTheme();
      });
      header.appendChild(b);
      applyTheme();
    }
  }

  /* --- Desplegables -> interruptor o botones segmentados ---
     Solo en Configuracion e Imagen de referencia, donde el codigo original
     lee el VALOR del <select>. El <select> se queda (oculto) y sigue siendo
     el que se guarda: el control nuevo solo escribe en el y lanza "change". */
  function enhanceControls() {
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (!/^(edit_config|edit_reference)\.html$/.test(page)) return;
    var widgets = [];

    function txt(o) { return (o.textContent || "").replace(/\s+/g, " ").trim(); }
    function setValue(sel, v) {
      if (sel.disabled || sel.value === v) return;
      sel.value = v;
      sel.dispatchEvent(new Event("input", { bubbles: true }));
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      sync();
    }
    function build(sel) {
      if (sel.__slim || sel.multiple || sel.size > 1) return;
      var opts = Array.prototype.slice.call(sel.options);
      var n = opts.length;
      if (n < 2) return;
      var vals = opts.map(function (o) { return o.value; });
      var isBool = n === 2 && vals.indexOf("true") >= 0 && vals.indexOf("false") >= 0;
      var maxLen = Math.max.apply(null, opts.map(function (o) { return txt(o).length; }));
      var isSeg = !isBool && ((n <= 4 && maxLen <= 16) || (n <= 6 && maxLen <= 10) || (n <= 8 && maxLen <= 4));
      if (!isBool && !isSeg) return;
      sel.__slim = true;
      var w;
      if (isBool) {
        w = document.createElement("button");
        w.type = "button";
        w.className = "slim-switch";
        w.setAttribute("role", "switch");
        w.addEventListener("click", function () { setValue(sel, sel.value === "true" ? "false" : "true"); });
      } else {
        w = document.createElement("div");
        w.className = "slim-seg";
        w.setAttribute("role", "radiogroup");
        opts.forEach(function (o) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = txt(o);
          b.setAttribute("data-v", o.value);
          b.addEventListener("click", function () { setValue(sel, o.value); });
          w.appendChild(b);
        });
      }
      sel.classList.add("slim-native-hidden");
      sel.parentNode.insertBefore(w, sel.nextSibling);
      widgets.push({ sel: sel, w: w, bool: isBool });
    }
    function sync() {
      widgets.forEach(function (x) {
        var v = x.sel.value, dis = x.sel.disabled;
        x.w.classList.toggle("is-disabled", dis);
        if (x.bool) {
          x.w.classList.toggle("on", v === "true");
          x.w.setAttribute("aria-checked", v === "true" ? "true" : "false");
          x.w.disabled = dis;
        } else {
          Array.prototype.forEach.call(x.w.children, function (b) {
            b.classList.toggle("active", b.getAttribute("data-v") === v);
            b.disabled = dis;
          });
        }
      });
    }
    function scan() {
      Array.prototype.forEach.call(document.querySelectorAll("select"), build);
      sync();
    }
    scan();
    // El codigo original rellena y cambia los <select> despues de cargar
    // (valores leidos del config.ini, activar/desactivar parametros...)
    setInterval(scan, 500);
  }

  /* --- Deslizadores: pista rellena hasta el valor actual --- */
  function enhanceRanges() {
    function upd(r) {
      var min = parseFloat(r.min || 0), max = parseFloat(r.max || 100), v = parseFloat(r.value);
      var p = max > min ? ((v - min) / (max - min)) * 100 : 0;
      r.style.setProperty("--slim-fill", Math.max(0, Math.min(100, p)) + "%");
    }
    function all() { Array.prototype.forEach.call(document.querySelectorAll("input[type=range]"), upd); }
    document.addEventListener("input", function (e) { if (e.target && e.target.type === "range") upd(e.target); });
    all();
    setInterval(all, 700);
  }

  onReady(function () {
    try { initTheme(); } catch (e) { console.warn("SLIM theme (tema):", e); }
    try { enhanceShell(); } catch (e) { console.warn("SLIM theme (shell):", e); }
    try { enhanceOverview(); } catch (e) { console.warn("SLIM theme (overview):", e); }
    try { watchFrames(); } catch (e) { console.warn("SLIM theme (frames):", e); }
    try { enhanceControls(); } catch (e) { console.warn("SLIM theme (controles):", e); }
    try { enhanceRanges(); } catch (e) { console.warn("SLIM theme (deslizadores):", e); }
  });
})();
