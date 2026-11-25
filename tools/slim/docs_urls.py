"""SLIM - Enlaces de documentacion: proyecto original -> GitBook de SLIM.

Usado por build_web.py (ayudas de parametros generadas desde param-docs) y
aplicado una vez al codigo fuente (sd-card/html y firmware).
"""
import re

SLIM_DOCS = "https://lecta-ltda.gitbook.io/slim"
_M = SLIM_DOCS + "/proyecto-slim/manual-del-usuario/modulos-del-sistemas"
_OLD = "https://jomjol.github.io/AI-on-the-edge-device-docs"

# ruta de la doc original (sin barra final, minusculas) -> URL nueva
MAP = {
    "": SLIM_DOCS,
    "initial-setup": SLIM_DOCS + "/proyecto-slim/manual-del-usuario/setup-configuracion-inicial",
    "alignment": _M + "#alignment-references",
    "roi-configuration": _M + "#rois-regions-of-interest",
    "reference-image": _M + "#submodulo-de-imagen-de-referencia-y-ajustes",
    "reference-image#focus": _M + "#focus",
    "external-led": _M + "#submodulo-de-flash-luz-encendida",
    "parameters": _M + "#graphical-configuration",
    "new-releases-notification": _M + "#over-the-air-ota-update",
    "faqs#pre-value": _M + "#modulo-de-establecer-valor-anterior",
    "error-codes": SLIM_DOCS + "/proyecto-slim/solucion-de-problemas#critical-errors",
    "demo-mode": SLIM_DOCS + "/proyecto-slim/solucion-de-problemas",
    "choosing-the-model": SLIM_DOCS + "/proyecto-slim/bienvenido/seleccion-del-modelo",
    "data-logging": _M + "#menu-principal-de-datos",
    "watermeter-specific-analog---digit-transition": SLIM_DOCS + "/proyecto-slim/bienvenido/algoritmo-de-correccion",
    "mqtt-api": _M + "#mqtt",
    "integration-home-assistant": _M + "#mqtt",
}
# Hojas de datos de las camaras (documentos del fabricante, no estan en la doc
# de SLIM). Las que tienen direccion nueva se cambian; el resto se mantiene.
DATASHEETS = {
    "datasheets/ov5640_datasheet.pdf": "https://www.alldatasheet.com/datasheet-pdf/view/587044/OMNIVISION/OV5640.html",
}
KEEP_PREFIX = ("datasheets/",)


def new_url(path):
    """path = parte despues de la raiz de la doc original (p.ej. 'Alignment/')."""
    p = path.strip()
    if p.lower() in DATASHEETS:
        return DATASHEETS[p.lower()]
    if p.startswith(KEEP_PREFIX):
        return _OLD + "/" + p
    key = p.lower().replace("/#", "#").rstrip("/")
    if key in MAP:
        return MAP[key]
    base = key.split("#")[0].rstrip("/")
    if base.startswith("parameters"):
        frag = key.split("#")[1] if "#" in key else ""
        if frag.startswith("parameter-uri") or frag.startswith("parameter-cacert") or "mqtt" in frag:
            return _M + "#mqtt"
        if frag.startswith("postprocessing"):
            return _M + "#postprocessing"
        return MAP["parameters"]
    if base in MAP:
        return MAP[base]
    return SLIM_DOCS


# La ruta termina en comillas, espacio, <, ), >, ! o barra invertida (\" en C++)
OLD_RE = re.compile(r"https?://jomjol\.github\.io/AI-on-the-edge-device-docs/?([^\"'\s<)>!\\]*)")


def replace_old(text):
    return OLD_RE.sub(lambda m: new_url(m.group(1)), text)


def replace_relative(html):
    """Enlaces relativos de param-docs: href="../Algo" -> URL nueva."""
    return re.sub(r'href="\.\./([^"]*)"', lambda m: 'href="%s"' % new_url(m.group(1)), html)


if __name__ == "__main__":
    for t in ["", "Alignment/", "ROI-Configuration/", "Reference-Image/#focus", "Parameters/#parameter-uri",
              "Parameters/#PostProcessing-NUMBER.AllowNegativeRates", "MQTT-API/#mqtt-tls", "datasheets/OV5640_datasheet.pdf",
              "Error-Codes", "FAQs/#pre-value", "Something-Else"]:
        print("%-55s -> %s" % (t, new_url(t)))
