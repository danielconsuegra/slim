/* ==========================================================================
   SLIM - Traduccion al espanol de la interfaz de AI-on-the-edge-device
   --------------------------------------------------------------------------
   Traduce SOLO el texto visible en el navegador. No modifica el HTML en la
   tarjeta SD, ni IDs, ni valores de formularios, ni lo que se guarda en el
   dispositivo. Archivo generado por build_i18n.py: no editar a mano el
   diccionario (editar es_part*.txt y volver a generar).

   Reglas de seguridad:
   - No se traducen <option> salvo en paginas donde el codigo lee el VALOR
     (y no el texto): edit_config.html y edit_reference.html. En ROIs y
     "valor previo" las opciones son nombres del usuario (main, dig1...).
   - No se traducen <code>, <pre>, <textarea>, scripts, estilos, el visor de
     registros (#log) ni la tabla de datos (#data).
   - Si algo falla, la pagina sigue en ingles y funcionando (try/catch).
   ========================================================================== */
(function () {
  "use strict";
  if (window.__slimI18nLoaded) return;
  window.__slimI18nLoaded = true;

  var D = /*__DICT__*/{};

  var SIGNAL = { Excellent: "Excelente", Good: "Buena", Fair: "Regular", Weak: "Débil" };

  // Reglas para textos que llevan partes variables (estados, errores...)
  var R = [
    [/^Flow finished \((.*)\)$/, "Proceso terminado ($1)"],
    [/^Rate too high - Read:\s*(.*?)\s*- Pre:\s*(.*?)\s*- Rate:\s*(.*)$/, "Cambio demasiado alto - Leído: $1 - Previo: $2 - Cambio: $3"],
    [/^Neg\. Rate - Read:\s*(.*?)\s*- Raw:\s*(.*?)\s*- Pre:\s*(.*?)$/, "Cambio negativo - Leído: $1 - Bruto: $2 - Previo: $3"],
    [/^Date\/Time on device: (.*)$/, "Fecha/hora del dispositivo: $1"],
    [/^Last Page Refresh:\s*(.*)$/, "Última actualización: $1"],
    [/^CPU Temperature: (.*)$/, "Temperatura de la CPU: $1"],
    [/^Uptime: (.*)$/, "Tiempo encendido: $1"],
    [/^WIFI Signal: (\w+) \((.*)\)$/, function (m, q, v) { return "Señal WiFi: " + (SIGNAL[q] || q) + " (" + v + ")"; }],
    [/^\(Round: (.*)\)$/, "(Ronda: $1)"],
    [/^Current state: (.*)$/, function (m, s) { return "Estado actual: " + (T(s) || s); }],
    [/^Uploaded (.*?) MB of (.*?) MB$/, "Subidos $1 MB de $2 MB"],
    [/^Status: (\d+)% uploaded\.\.\.$/, "Estado: $1 % subido..."],
    [/^The version of the web interface \((.*?)\) does not match the firmware version \((.*?)\)! It is suggested to keep them on the same version!$/,
      "La versión de la interfaz web ($1) no coincide con la del firmware ($2). Se recomienda usar la misma versión."],
    [/^Digitizer - AI on the edge - (.+)$/, "SLIM"],
    [/^HTTP error (.*)$/, "Error HTTP $1"],
    [/^Processing done! \((.*)$/, "¡Procesamiento terminado! ($1"],
    [/^File size must be less than (.*)$/, "El archivo debe pesar menos de $1"],
    [/^No data available for (.*)$/, "No hay datos disponibles para $1"],
    [/^An error occured: (.*)$/, "Ha ocurrido un error: $1"]
  ];

  // Textos dinamicos exactos (firmware y JavaScript de las paginas)
  var EXTRA = {
    "Aligning": "Alineando",
    "Digitization of ROIs": "Digitalizando ROIs",
    "Sending MQTT": "Enviando MQTT",
    "Sending InfluxDB": "Enviando a InfluxDB",
    "Sending InfluxDBv2": "Enviando a InfluxDBv2",
    "Sending Webhook": "Enviando webhook",
    "Initialization": "Inicialización",
    "Initialization (delayed)": "Inicialización (retrasada)",
    "Unkown Status": "Estado desconocido",
    "Flow finished": "Proceso terminado",
    "no error": "sin errores",
    "Synchronized": "Sincronizada",
    "In Progress": "En curso",
    "reboot now": "reiniciar ahora",
    "Reloading...": "Recargando...",
    "Creating backup...": "Creando copia de seguridad...",
    "Creating Export Data...": "Creando exportación de datos...",
    "Please wait for the first round to complete!": "¡Espera a que termine la primera ronda!",
    "Recognized Digit ROIs (previous round)": "ROIs de dígitos reconocidas (ronda anterior)",
    "Recognized Analog ROIs (previous round)": "ROIs analógicas reconocidas (ronda anterior)",
    "Aligned Image (current round)": "Imagen alineada (ronda actual)",
    "Status: Upload completed. Validating file...": "Estado: subida completada. Validando archivo...",
    "Status: The uploaded file is valid, installing it...": "Estado: el archivo es válido, instalando...",
    "Status: The file got corrupted! Please upload it again!": "Estado: ¡el archivo se ha dañado! Súbelo de nuevo.",
    "Status: It seems to be a legacy firmware, installing the update without validation...": "Estado: parece un firmware antiguo, instalando sin validar...",
    "Status: Upload Failed": "Estado: la subida ha fallado",
    "Status: Upload Aborted": "Estado: subida cancelada",
    "Alignment Marker have been updated": "Marcas de alineación actualizadas",
    "Alignment marker saved. They will get applied after the next reboot!": "Marcas de alineación guardadas. ¡Se aplicarán tras el próximo reinicio!",
    "Analog ROI processing is disabled. Activate with checkbox if needed": "El procesamiento de ROIs analógicas está desactivado. Actívalo con la casilla si lo necesitas",
    "Cam Settings saved": "Ajustes de cámara guardados",
    "Configuration could not be loaded! Please reload the page!": "¡No se pudo cargar la configuración! Recarga la página.",
    "Configuration saved. It will get applied after the next reboot!": "Configuración guardada. ¡Se aplicará tras el próximo reinicio!",
    "Configuration saved.": "Configuración guardada.",
    "Digit ROI processing is disabled. Activate with checkbox if needed": "El procesamiento de ROIs de dígitos está desactivado. Actívalo con la casilla si lo necesitas",
    "Enhancing Image Contrast aborted, timeout!": "Mejora de contraste cancelada: ¡tiempo agotado!",
    "Expert parameter view activated. Please use it carefully": "Vista de parámetros avanzados activada. Úsala con cuidado",
    "Expert view activated. Please use it carefully": "Vista avanzada activada. Úsala con cuidado",
    "Failed to get data from device!": "¡No se pudieron obtener datos del dispositivo!",
    "File name not specified after path!": "¡Falta el nombre del archivo tras la ruta!",
    "File path on server cannot have spaces!": "¡La ruta en el servidor no puede tener espacios!",
    "File path on server is not set!": "¡No se ha indicado la ruta en el servidor!",
    "File upload completed": "Archivo subido",
    "Filename can not have spaces!": "¡El nombre del archivo no puede tener espacios!",
    "Filename is to long! Max 100 characters.": "¡El nombre del archivo es demasiado largo! Máximo 100 caracteres.",
    "Filename is too long! Max 100 characters.": "¡El nombre del archivo es demasiado largo! Máximo 100 caracteres.",
    "Filename not specified after path!": "¡Falta el nombre del archivo tras la ruta!",
    "Flow start scheduled. Start after round is completed": "Inicio programado. Empezará al terminar la ronda actual",
    "Flow start triggered": "Inicio de ronda solicitado",
    "Flow start triggered, but start not possible (no flow task available)": "Inicio solicitado, pero no es posible (no hay tarea de proceso disponible)",
    "Image Contrast got enhanced": "Contraste de imagen mejorado",
    "Image capture aborted, timeout!": "Captura cancelada: ¡tiempo agotado!",
    "Image capture completed, please wait until it loads...": "Captura completada, espera a que cargue...",
    "No analog ROIs defined in selected number sequence": "No hay ROIs analógicas en la secuencia numérica seleccionada",
    "No digit ROIs defined in selected number sequence": "No hay ROIs de dígitos en la secuencia numérica seleccionada",
    "No file selected!": "¡No has seleccionado ningún archivo!",
    "Reference image configuration saved": "Configuración de la imagen de referencia guardada",
    "Save Cam Settings aborted, timeout!": "Guardado de ajustes de cámara cancelado: ¡tiempo agotado!",
    "Server closed the connection abruptly!": "¡El servidor cerró la conexión de forma inesperada!",
    "Settings cannot be saved. Please check your entries!": "No se pueden guardar los ajustes. ¡Revisa los valores!",
    "Setup mode could not be deactivated! Please try again!": "¡No se pudo desactivar el modo de configuración! Inténtalo de nuevo.",
    "The device seems not do be up again, or maybe we missed it. Try to reload this page or reset the device!": "Parece que el dispositivo no ha vuelto a arrancar (o no lo hemos detectado). ¡Recarga la página o reinicia el dispositivo!",
    "The filename does not match our expectations!": "¡El nombre del archivo no es el esperado!",
    "Tooltip view activated.": "Ayudas emergentes activadas.",
    "Update completed!": "¡Actualización completada!",
    "Updating marker aborted, timeout!": "Actualización de marca cancelada: ¡tiempo agotado!",
    "Upload aborted!": "¡Subida cancelada!",
    "Upload completed and validated. The device will now reboot and install the update": "Subida completada y validada. El dispositivo se reiniciará e instalará la actualización",
    "Upload failed!": "¡La subida ha fallado!",
    "Upload failed, the file got corrupted! Please upload it again!": "La subida ha fallado: ¡el archivo se ha dañado! Súbelo de nuevo.",
    "You have changed the camera settings, creating a new reference image and updating the alignment marks is mandatory!": "Has cambiado los ajustes de la cámara: ¡es obligatorio crear una nueva imagen de referencia y actualizar las marcas de alineación!",
    "Do you want to complete the setup mode and switch to regular web interface?": "¿Quieres terminar el modo de configuración y pasar a la interfaz web normal?",
    "Please enter a name for the new ROI": "Escribe un nombre para la nueva ROI",
    "Please enter a name for the new number sequence": "Escribe un nombre para la nueva secuencia numérica",
    "Please enter a new name for the number sequence": "Escribe un nuevo nombre para la secuencia numérica",
    "Please enter a new name for the ROI": "Escribe un nuevo nombre para la ROI"
  };
  for (var k in EXTRA) { if (!D.hasOwnProperty(k)) D[k] = EXTRA[k]; }

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  var SKIP_IDS = { log: 1, data: 1 };
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var OPTIONS_OK = page === "edit_config.html" || page === "edit_reference.html";

  function norm(s) { return s.replace(/\s+/g, " ").trim(); }

  function T(s) {
    var k = norm(s);
    if (!k || !/[A-Za-z]/.test(k)) return null;
    if (D.hasOwnProperty(k)) return D[k];
    for (var i = 0; i < R.length; i++) {
      if (R[i][0].test(k)) return k.replace(R[i][0], R[i][1]);
    }
    return null;
  }

  function skipped(node) {
    for (var el = node.nodeType === 1 ? node : node.parentNode; el && el.nodeType === 1; el = el.parentNode) {
      if (SKIP_TAGS[el.tagName]) return true;
      if (el.id && SKIP_IDS[el.id]) return true;
      if (el.tagName === "OPTION" && !OPTIONS_OK) return true;
      if (el.isContentEditable) return true;
    }
    return false;
  }

  function trText(node) {
    var v = node.nodeValue;
    if (!v || v.length > 4000) return;
    var t = T(v);
    if (t === null || t === norm(v)) return;
    var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
    node.nodeValue = lead + t + trail;
  }

  function trAttrs(el) {
    if (!el.getAttribute) return;
    var a = ["title", "placeholder"];
    for (var i = 0; i < a.length; i++) {
      var v = el.getAttribute(a[i]);
      if (v) { var t = T(v); if (t !== null && t !== v) el.setAttribute(a[i], t); }
    }
    if (el.tagName === "INPUT" && /^(button|submit|reset)$/i.test(el.type) && el.value) {
      var tv = T(el.value); if (tv !== null && tv !== el.value) el.value = tv;
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (!skipped(root)) trText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (skipped(root)) return;
      trAttrs(root);
    }
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeType === 1 && (SKIP_TAGS[n.tagName] || (n.id && SKIP_IDS[n.id]) || (n.tagName === "OPTION" && !OPTIONS_OK))) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n, texts = [], els = [];
    while ((n = tw.nextNode())) { (n.nodeType === 3 ? texts : els).push(n); }
    for (var i = 0; i < els.length; i++) trAttrs(els[i]);
    for (var j = 0; j < texts.length; j++) trText(texts[j]);
  }

  // Dialogos del navegador (confirm/alert/prompt): solo se traduce el mensaje
  try {
    ["alert", "confirm"].forEach(function (fn) {
      var orig = window[fn];
      window[fn] = function (msg) { var t = (typeof msg === "string") ? T(msg) : null; return orig.call(window, t === null ? msg : t); };
    });
    var origPrompt = window.prompt;
    window.prompt = function (msg, def) { var t = (typeof msg === "string") ? T(msg) : null; return origPrompt.call(window, t === null ? msg : t, def); };
  } catch (e) {}

  // Titulo de la pestana del navegador ("AI on the edge", "<host> - AI on the edge")
  var BRAND = "SLIM";
  function trTitle() {
    var t = document.title || "";
    if (/AI on the edge/i.test(t) && t !== BRAND) document.title = BRAND;
  }

  function start() {
    try {
      document.documentElement.setAttribute("lang", "es");
      trTitle();
      var tEl = document.querySelector("head > title");
      if (tEl) new MutationObserver(trTitle).observe(tEl, { childList: true, characterData: true, subtree: true });
      walk(document.body);
      new MutationObserver(function (list) {
        for (var i = 0; i < list.length; i++) {
          var m = list[i];
          if (m.type === "characterData") { if (!skipped(m.target)) trText(m.target); }
          else if (m.type === "attributes") { if (!skipped(m.target)) trAttrs(m.target); }
          else { for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]); }
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["title", "placeholder", "value"] });
    } catch (e) { console.warn("SLIM i18n:", e); }
  }

  window.slimT = T; // util para depurar desde la consola

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
