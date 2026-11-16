"""SLIM: genera el diccionario ingles->espanol (es.json) y el traductor en
vivo (sd-card/html/i18n-es.js) a partir de es_part*.txt + texts_ordered.json."""
import json, re, glob, os
base = os.path.dirname(os.path.abspath(__file__))
repo = os.path.abspath(os.path.join(base, "..", "..", ".."))
order = json.load(open(os.path.join(base, "texts_ordered.json"), encoding="utf-8"))
norm = lambda s: re.sub(r"\s+", " ", s).strip()
d, bad = {}, []
for f in sorted(glob.glob(os.path.join(base, "es_part*.txt"))):
    for ln, line in enumerate(open(f, encoding="utf-8"), 1):
        line = line.rstrip("\n")
        if not line.strip(): continue
        idx, _, es = line.partition("|")
        try: en = norm(order[int(idx)][1])
        except Exception: bad.append((f, ln, line)); continue
        es = es.strip()
        if es and es != en: d[en] = es
eng = open(os.path.join(base, "i18n_engine.js"), encoding="utf-8").read()
# EXTRA (mensajes dinamicos) tambien al diccionario estatico
m = re.search(r"var EXTRA = (\{.*?\n  \});", eng, re.S)
extra = json.loads(re.sub(r",\s*}", "}", m.group(1)))
full = dict(extra); full.update(d)
json.dump(full, open(os.path.join(base, "es.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1, sort_keys=True)
out = eng.replace("/*__DICT__*/{}", json.dumps(d, ensure_ascii=False, indent=0))
open(os.path.join(repo, "sd-card", "html", "i18n-es.js"), "w", encoding="utf-8", newline="\n").write(out)
print("entradas:", len(full), "| errores:", bad)
