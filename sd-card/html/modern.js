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

    buildSidebar(menu, frame);
  }

  /* --- Menu lateral izquierdo ---
     Usa el MISMO menu original: los enlaces y sus onclick no se tocan. Solo se
     anaden iconos, titulos de grupo, la marca SLIM arriba y el estado abajo. */
  var ICONS = [
    [/overview\.html/, "M4 4h6v8H4zM14 4h6v5h-6zM14 13h6v7h-6zM4 16h6v4H4z"],
    [/prevalue_set/, "M12 8v4l2 2M3.05 11a9 9 0 1 1 .5 4M3 4v5h5"],
    [/edit_reference/, "M4 5h16v14H4zM4 15l4-4 5 5M14 14l2-2 4 4M15 8h.01"],
    [/edit_alignment/, "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8M12 12h.01"],
    [/edit_digits/, "M4 6h2v12M10 8a2 2 0 1 1 4 0c0 2-4 4-4 6h4M17 6h3l-2 4a2 2 0 1 1-2 3"],
    [/edit_analog/, "M12 13l3-3M5.6 18a8 8 0 1 1 12.8 0"],
    [/edit_config/, "M6 4v16M12 4v16M18 4v16M4 9h4M10 14h4M16 7h4"],
    [/value\?full/, "M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M7 12h10"],
    [/livestream/, "M4 7h11v10H4zM15 10l5-3v10l-5-3"],
    [/graph\.html/, "M4 19h16M5 15l4-5 4 3 6-7"],
    [/data\.html/, "M4 5h16v14H4zM4 10h16M10 5v14"],
    [/log\/data/, "M4 6h5l2 2h9v10H4z"],
    [/data_export/, "M12 4v11M8 11l4 4 4-4M5 20h14"],
    [/backup/, "M7 18a4 4 0 0 1 0-8a5 5 0 0 1 9.6-1.5A4 4 0 0 1 17 18zM12 11v5M10 13l2-2 2 2"],
    [/ota_page/, "M12 15V5M8 9l4-4 4 4M5 15v4h14v-4"],
    [/log\.html/, "M6 3h9l4 4v14H6zM9 12h6M9 16h6"],
    [/fileserver\/'/, "M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01"],
    [/reboot/, "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"],
    [/info\.html/, "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 11v5M12 8h.01"],
    [/flow_start/, "M7 4l12 8-12 8z"],
    [/HA_send/, "M4 11l8-7 8 7v9H4z"],
    [/gitbook|help/i, "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01"]
  ];
  function icon(d) {
    return '<svg class="slim-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  function buildSidebar(menu, frame) {
    var root = document.documentElement;
    root.classList.add("slim-sidebar");

    // Iconos y titulos de grupo (sin cambiar onclick ni href)
    Array.prototype.forEach.call(menu.querySelectorAll("a"), function (a) {
      var act = (a.getAttribute("onclick") || "") + " " + (a.getAttribute("href") || "");
      if (!a.getAttribute("onclick") && !/^https?:/.test(a.getAttribute("href") || "")) {
        var depth = 0;
        for (var p = a.parentNode; p && p !== menu; p = p.parentNode) { if (p.tagName === "UL") depth++; }
        a.classList.add(depth <= 1 ? "slim-group" : "slim-subgroup");
        a.setAttribute("tabindex", "-1");
        return;
      }
      for (var i = 0; i < ICONS.length; i++) {
        if (ICONS[i][0].test(act)) { a.insertAdjacentHTML("afterbegin", icon(ICONS[i][1])); break; }
      }
    });

    // Marca SLIM arriba
    var brand = document.createElement("div");
    brand.className = "slim-side-brand";
    brand.innerHTML = '<img src="slim-logo.png" alt=""><div><b>SLIM</b><span>Sistema de Lectura Inteligente de Medidores</span></div>';
    menu.insertBefore(brand, menu.firstChild);

    // Estado de conexion abajo (+ boton de tema claro/oscuro)
    var st = document.createElement("div");
    st.className = "slim-side-status";
    st.innerHTML = '<span class="dot"></span><span class="txt">Conectando...</span>';
    menu.appendChild(st);
    var tg = document.getElementById("slim-theme-toggle");
    if (tg) st.appendChild(tg);
    function quality(r) { return r >= -55 ? "excelente" : r >= -67 ? "buena" : r >= -78 ? "regular" : "débil"; }
    function poll() {
      fetch("/rssi", { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (t) {
        var v = parseInt(t, 10);
        st.querySelector(".dot").className = "dot on";
        st.querySelector(".txt").textContent = isNaN(v) ? "En línea" : "En línea · WiFi " + quality(v) + " (" + v + " dBm)";
      }).catch(function () {
        st.querySelector(".dot").className = "dot off";
        st.querySelector(".txt").textContent = "Sin conexión con el dispositivo";
      });
    }
    poll();
    setInterval(poll, 60000);

    // Opcion activa (resaltado) y cierre del menu en movil al elegir
    function mark(link) {
      Array.prototype.forEach.call(menu.querySelectorAll("a.slim-current"), function (x) { x.classList.remove("slim-current"); });
      if (link) link.classList.add("slim-current");
    }
    menu.addEventListener("click", function (ev) {
      var link = ev.target.closest ? ev.target.closest("a") : null;
      if (!link || !link.getAttribute("onclick")) return;
      if (/loadPage/.test(link.getAttribute("onclick"))) mark(link);
      root.classList.remove("slim-menu-open");
    });
    mark(menu.querySelector('a[onclick*="overview.html"]'));
    frame.addEventListener("load", function () {
      try {
        var page = (frame.contentWindow.location.pathname.split("/").pop() || "");
        if (!page) return;
        var hit = menu.querySelector('a[onclick*="' + page + '"]');
        if (hit) mark(hit);
      } catch (e) {}
    });

    // Boton de menu para pantallas pequenas
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "slim-menu-btn";
    btn.innerHTML = "&#9776; Menú";
    btn.addEventListener("click", function () { root.classList.toggle("slim-menu-open"); });
    var back = document.createElement("div");
    back.id = "slim-menu-backdrop";
    back.addEventListener("click", function () { root.classList.remove("slim-menu-open"); });
    document.body.appendChild(btn);
    document.body.appendChild(back);
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
