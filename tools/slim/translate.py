"""SLIM - Traductor de la interfaz web (ingles -> espanol) sobre el CODIGO FUENTE.

Uso:
    python tools/slim/translate.py sd-card/html            # traduce en sitio
    python tools/slim/translate.py <carpeta> --dry-run     # solo cuenta

Que traduce:
  * Texto visible del HTML (nodos de texto entre etiquetas).
  * Atributos visibles: title, placeholder y value de <input type=button|submit|reset>.
  * En JavaScript, SOLO mensajes mostrados al usuario:
      firework.launch("..."), alert("..."), confirm("..."), prompt("..."),
      elemento.innerHTML = "..." (literal completo).
Que NO traduce (para no romper nada):
  * Nombres de parametros, secciones, valores de <select>, ids, clases.
  * <script>/<style>/<pre>/<code>/<textarea>, el visor de registros (#log) y
    la tabla de datos (#data).
  * Texto de <option> salvo en edit_config / edit_reference (en el resto de
    paginas las opciones son nombres que el codigo lee por su texto).
Es idempotente: lo ya traducido no vuelve a coincidir con el diccionario.
"""
import html
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(BASE, "i18n", "es.json"), encoding="utf-8"))

SKIP_TAGS = {"script", "style", "pre", "code", "textarea", "noscript"}
SKIP_IDS = {"log", "data"}
OPTION_PAGES = {"edit_config.html", "edit_config_template.html", "edit_reference.html"}
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "param", "source", "track", "wbr"}

TOKEN = re.compile(r"(<!--.*?-->|<script\b[^>]*>.*?</script\s*>|<style\b[^>]*>.*?</style\s*>|<[^>]+>)",
                   re.S | re.I)


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def T(s):
    k = norm(s)
    if not k or not re.search(r"[A-Za-z]", k):
        return None
    return D.get(k)


def tr_text(raw):
    t = T(html.unescape(raw))
    if t is None:
        return raw, 0
    lead = re.match(r"^\s*", raw).group(0)
    trail = re.search(r"\s*$", raw).group(0)
    return lead + html.escape(t, quote=False) + trail, 1


def tr_attrs(tag):
    n = 0

    def rep(m):
        nonlocal n
        name, q, val = m.group(1), m.group(2), m.group(3)
        t = T(html.unescape(val))
        if t is None:
            return m.group(0)
        n += 1
        return '%s=%s%s%s' % (name, q, html.escape(t, quote=True), q)

    out = re.sub(r'\b(title|placeholder)=(["\'])(.*?)\2', rep, tag, flags=re.I | re.S)
    if re.match(r"<input\b", out, re.I) and re.search(r'type=["\']?(button|submit|reset)\b', out, re.I):
        out = re.sub(r'\b(value)=(["\'])(.*?)\2', rep, out, flags=re.I | re.S)
    return out, n


JS_CALL = re.compile(r'''((?:firework\.launch|\balert|\bconfirm|\bprompt)\(\s*)(["'])((?:(?!\2)[^\\\n]|\\.)*)\2''')
JS_INNER = re.compile(r'''(\.innerHTML\s*=\s*)(["'])((?:(?!\2)[^\\\n]|\\.)*)\2(\s*;)''')


def tr_js(code):
    n = 0

    def rep(m):
        nonlocal n
        q, s = m.group(2), m.group(3)
        t = T(s.replace("\\'", "'").replace('\\"', '"'))
        if t is None:
            return m.group(0)
        n += 1
        t = t.replace("\\", "\\\\").replace(q, "\\" + q)
        return m.group(1) + q + t + q + (m.group(4) if m.lastindex >= 4 else "")

    code = JS_CALL.sub(rep, code)
    code = JS_INNER.sub(rep, code)
    return code, n


def translate_html(src, page):
    parts = TOKEN.split(src)
    out, count = [], 0
    stack = []          # etiquetas abiertas que obligan a saltar texto
    in_option = False
    for i, p in enumerate(parts):
        if i % 2 == 1:                                   # etiqueta / comentario / script
            low = p.lower()
            if low.startswith("<script"):
                m = re.match(r"(<script\b[^>]*>)(.*?)(</script\s*>)$", p, re.S | re.I)
                if m and "src=" not in m.group(1).lower():
                    js, n = tr_js(m.group(2)); count += n
                    p = m.group(1) + js + m.group(3)
                out.append(p); continue
            if low.startswith("<!--") or low.startswith("<style") or low.startswith("<!"):
                out.append(p); continue
            m = re.match(r"<\s*(/?)\s*([a-zA-Z0-9]+)", p)
            if not m:
                out.append(p); continue
            closing, name = m.group(1) == "/", m.group(2).lower()
            if name == "option":
                in_option = not closing
            if closing:
                if stack and stack[-1][0] == name:
                    stack[-1][1] -= 1
                    if stack[-1][1] == 0:
                        stack.pop()
                out.append(p); continue
            if not stack:
                p, n = tr_attrs(p); count += n
            if name in VOID or p.rstrip().endswith("/>"):
                out.append(p); continue
            idm = re.search(r'\bid=["\']?([\w-]+)', p)
            if stack and stack[-1][0] == name:
                stack[-1][1] += 1
            elif name in SKIP_TAGS or (idm and idm.group(1) in SKIP_IDS):
                stack.append([name, 1])
            out.append(p)
        else:                                            # texto
            if stack or (in_option and page not in OPTION_PAGES):
                out.append(p); continue
            p, n = tr_text(p); count += n
            out.append(p)
    return "".join(out), count


def translate_file(path, dry=False):
    page = os.path.basename(path)
    src = open(path, encoding="utf-8", newline="").read()
    if page.endswith(".html"):
        res, n = translate_html(src, page)
    elif page.endswith(".js"):
        res, n = tr_js(src)
    else:
        return 0
    if n and not dry:
        open(path, "w", encoding="utf-8", newline="").write(res)
    return n


SKIP_FILES = re.compile(r"(\.min\.js|^jquery|^plotly|^jszip|^i18n-es\.js|^modern\.js|^firework\.js|^FileSaver)", re.I)

if __name__ == "__main__":
    folder = sys.argv[1]
    dry = "--dry-run" in sys.argv
    total = 0
    for f in sorted(os.listdir(folder)):
        if SKIP_FILES.search(f) or not f.endswith((".html", ".js")):
            continue
        n = translate_file(os.path.join(folder, f), dry)
        if n:
            print("%-32s %4d" % (f, n))
        total += n
    print("TOTAL", total, "(simulacion)" if dry else "")
