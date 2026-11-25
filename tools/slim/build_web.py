"""SLIM - Genera la carpeta html lista para la microSD (equivalente al paso
"Prepare Web UI" de .github/workflows/build.yaml, pero en Windows/Linux).

Uso (desde la raiz del repositorio):
    python tools/slim/build_web.py            # -> build-web/html + build-web/slim-html-<hash>.zip

Pasos:
  1. Copia sd-card/html a build-web/html.
  2. Genera las ayudas emergentes de cada parametro (param-docs) dentro de
     edit_config.html y edit_reference.html, y las traduce al espanol con el
     diccionario de SLIM (tools/slim/i18n/es.json).
  3. Sustituye $COMMIT_HASH por el commit actual (para que coincida con el
     firmware compilado desde el mismo commit).
  4. Comprime html/css/js/jpg/png/svg/map con gzip, como el proyecto original.
     Las imagenes Flowstate_*.jpg se dejan tambien sin comprimir porque el
     firmware las lee directamente de la tarjeta.
"""
import glob
import gzip
import os
import shutil
import subprocess
import sys
import zipfile

import markdown

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import translate  # noqa: E402
import docs_urls  # noqa: E402

SRC = os.path.join(REPO, "sd-card", "html")
OUT_ROOT = os.path.join(REPO, "build-web")
OUT = os.path.join(OUT_ROOT, "html")
PARAM_DOCS = os.path.join(REPO, "param-docs", "parameter-pages")

TOOLTIP_PREFIX = """
    <div class="rst-content"><div class="tooltip"><img src="help.png" width="32px"><span class="tooltiptext">
"""
TOOLTIP_SUFFIX = """
    </span></div></div>
"""
KEEP_PLAIN = ("Flowstate_",)


def git_hash():
    h = subprocess.check_output(["git", "rev-parse", "--short=7", "HEAD"], cwd=REPO, text=True).strip()
    dirty = subprocess.call(["git", "diff", "--quiet", "HEAD", "--", "sd-card/html"], cwd=REPO) != 0
    return h, dirty


def tooltip_html(md_file):
    text = open(md_file, encoding="utf-8").read().replace("# ", "### ")
    h = markdown.markdown(text, extensions=["admonition"])
    h = h.replace("a href", "a target=_blank href")
    h = docs_urls.replace_relative(h)   # enlaces a la documentacion -> GitBook de SLIM
    h = docs_urls.replace_old(h)
    h = h.replace("<h3>", '<h3 style="margin: 0">')
    h = h.replace("../img/", "/")
    return TOOLTIP_PREFIX + h + TOOLTIP_SUFFIX


def generate_tooltips():
    pages = {}
    for name in ("edit_config.html", "edit_reference.html"):
        pages[name] = open(os.path.join(OUT, name), encoding="utf-8", newline="").read()
    n = 0
    for folder in sorted(d for d in glob.glob(os.path.join(PARAM_DOCS, "*")) if os.path.isdir(d)):
        section = os.path.basename(folder)
        for md in sorted(glob.glob(os.path.join(folder, "*.md"))):
            param = os.path.basename(md)[:-3].replace("<", "").replace(">", "")
            key = "<td>$TOOLTIP_" + section + "_" + param + "</td>"
            if not any(key in p for p in pages.values()):
                continue
            tip = "<td>" + tooltip_html(md) + "</td>"
            for name in pages:
                pages[name] = pages[name].replace(key, tip)
            n += 1
    for name, content in pages.items():
        open(os.path.join(OUT, name), "w", encoding="utf-8", newline="").write(content)
    for img in glob.glob(os.path.join(PARAM_DOCS, "img", "*")):
        shutil.copy2(img, OUT)
    return n


def main():
    commit, dirty = git_hash()
    if os.path.isdir(OUT_ROOT):
        shutil.rmtree(OUT_ROOT)
    shutil.copytree(SRC, OUT)

    # 1) Pagina de configuracion a partir de la plantilla + ayudas
    shutil.copy2(os.path.join(OUT, "edit_config_template.html"), os.path.join(OUT, "edit_config.html"))
    os.remove(os.path.join(OUT, "edit_config_template.html"))
    print("ayudas generadas:", generate_tooltips())

    # 2) Traduccion de lo generado (las ayudas vienen de param-docs en ingles)
    print("textos traducidos en el paquete:",
          sum(translate.translate_file(os.path.join(OUT, f)) for f in ("edit_config.html", "edit_reference.html")))

    # 3) Hash de version
    for path in glob.glob(os.path.join(OUT, "**", "*"), recursive=True):
        if os.path.isfile(path) and path.endswith((".html", ".js", ".css", ".txt")):
            s = open(path, encoding="utf-8", errors="surrogateescape", newline="").read()
            if "$COMMIT_HASH" in s:
                open(path, "w", encoding="utf-8", errors="surrogateescape", newline="").write(s.replace("$COMMIT_HASH", commit))
    open(os.path.join(OUT, "version.txt"), "w", newline="\n").write(
        "SLIM-Branch: slim-ui (Commit: %s%s)\n%s\n" % (commit, "+" if dirty else "", commit))

    # 4) gzip como el proyecto original
    exts = (".html", ".css", ".js", ".jpg", ".png", ".svg", ".map")
    for path in glob.glob(os.path.join(OUT, "**", "*"), recursive=True):
        if not (os.path.isfile(path) and path.endswith(exts)):
            continue
        with open(path, "rb") as f, gzip.open(path + ".gz", "wb", 9) as g:
            shutil.copyfileobj(f, g)
        if not os.path.basename(path).startswith(KEEP_PLAIN):
            os.remove(path)

    # 5) zip para copiar a la tarjeta (contiene la carpeta html/)
    zpath = os.path.join(OUT_ROOT, "slim-html-%s.zip" % commit)
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for path in glob.glob(os.path.join(OUT, "**", "*"), recursive=True):
            if os.path.isfile(path):
                z.write(path, os.path.relpath(path, OUT_ROOT))
    print("commit:", commit + ("+ (cambios sin commit en sd-card/html)" if dirty else ""))
    print("salida:", OUT)
    print("zip:", zpath)


if __name__ == "__main__":
    main()
