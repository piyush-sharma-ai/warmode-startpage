#!/usr/bin/env python3
"""
Bundle the ES modules in js/ into a single classic script at js/bundle.js.

Why: browsers block ES module loading from the file:// origin (CORS), so the
startpage must ship one classic script to work when opened directly from disk.
Run this after editing anything under js/:

    python3 tools/build_bundle.py
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODULES_DIR = os.path.join(ROOT, "js", "modules")
ENTRY = os.path.join(ROOT, "js", "main.js")
OUT = os.path.join(ROOT, "js", "bundle.js")
THEMES_CSS = os.path.join(ROOT, "css", "themes.css")
THEME_JS = os.path.join(MODULES_DIR, "theme.js")
INDEX_HTML = os.path.join(ROOT, "index.html")

# Theme ids the pre-paint bootstrap in index.html must special-case.
BOOTSTRAP_LIGHT_ID = "daylight"

# Dependency order: leaves first, entry last. The bundle wraps each module in
# a lazy factory so circular imports still resolve.
ORDER = [
    "core", "modal", "storage", "overlay", "shortcuts", "zen", "breathing",
    "hero", "focus", "audio", "theme", "backup", "scratchpad", "widget",
    "dock", "bookmarks", "gmail", "tools", "timer", "search", "edit",
    "keyboard",
]

IMPORT_RE = re.compile(r"import\s+[\s\S]*?from\s+['\"][^'\"]+['\"];?")
EXPORT_LIST_RE = re.compile(r"^(\s*)export\s*\{([^}]*)\};?\s*$")
EXPORT_DECL_RE = re.compile(
    r"^(\s*)export\s+(default\s+)?(async\s+function|function|const|let|var|class)\s+"
    r"([A-Za-z_$][\w$]*)"
)
EXPORT_DEFAULT_RE = re.compile(r"^(\s*)export\s+default\s+")
EXPORT_OTHER_RE = re.compile(r"^\s*export\s+")
IDENT_RE = re.compile(r"^[A-Za-z_$][\w$]*$")


def module_name(spec):
    return os.path.basename(spec)[:-3]


def parse_imports(stmt):
    """Return (module_name, [imported_names])."""
    frm = re.search(r"from\s+['\"]([^'\"]+)['\"]", stmt)
    if not frm:
        return None, []
    spec = frm.group(1)
    if not spec.startswith("."):
        return None, []  # bare specifier: nothing to inline
    braces = re.search(r"\{([^}]*)\}", stmt, re.S)
    if braces:
        names = [n.strip() for n in braces.group(1).split(",") if n.strip()]
    else:
        default = re.search(r"import\s+(\w+)\s+from", stmt)
        names = [default.group(1)] if default else []
    return module_name(spec), names


def strip_imports(src):
    imports = []

    def repl(m):
        mod, names = parse_imports(m.group(0))
        if mod:
            imports.append((mod, names))
        return ""

    return IMPORT_RE.sub(repl, src), imports


def strip_exports(src):
    """Remove `export` keywords and collect exported (local, exported) pairs."""
    exports = []
    out = []
    for line in src.split("\n"):
        m = EXPORT_LIST_RE.match(line)
        if m:
            for part in m.group(2).split(","):
                part = part.strip()
                if not part:
                    continue
                if " as " in part:
                    local, exported = (x.strip() for x in part.split(" as "))
                else:
                    local = exported = part
                exports.append((local, exported))
            continue

        m = EXPORT_DECL_RE.match(line)
        if m:
            name = m.group(4)
            out.append(line.replace("export ", "", 1))
            exports.append((name, name))
            continue

        m = EXPORT_DEFAULT_RE.match(line)
        if m:
            out.append(line.replace("export default ", "const __default = ", 1))
            exports.append(("__default", "default"))
            continue

        if EXPORT_OTHER_RE.match(line):
            # Unknown export form (e.g. `export * from`); drop it.
            continue

        out.append(line)
    return "\n".join(out), exports


def check_theme_consistency():
    """Fail loudly if js/modules/theme.js and css/themes.css drift apart.

    theme.js owns the id -> name mapping and cycle order; themes.css owns the
    colors. A theme registered in one but missing from the other silently
    renders as the fallback palette, which is very hard to spot by eye.
    """
    problems = []

    js_src = open(THEME_JS, encoding="utf-8").read()
    js_ids = re.findall(r"\{\s*name:\s*'([^']+)',\s*id:\s*'([^']+)'\s*\}", js_src)
    js_ids = [i for _, i in js_ids]
    if not js_ids:
        problems.append("theme.js: could not parse any theme ids")
        return problems

    css_src = open(THEMES_CSS, encoding="utf-8").read()
    css_ids = re.findall(r"\[data-theme='([^']+)'\]\s*\{", css_src)
    # effects.css-style attribute references inside themes.css would also match;
    # only count blocks that actually declare a color token.
    real = []
    for m in re.finditer(r"\[data-theme='([^']+)'\]\s*\{([^}]*)\}", css_src):
        if "--color-background:" in m.group(2):
            real.append(m.group(1))

    missing_css = [i for i in js_ids if i not in real]
    orphan_css = [i for i in real if i not in js_ids]

    for tid in missing_css:
        problems.append(f"theme '{tid}' is in theme.js but has no palette in css/themes.css")
    for tid in orphan_css:
        problems.append(f"theme '{tid}' has a palette in css/themes.css but is not in theme.js")

    # Every dark theme must have at least the required tokens.
    required = [
        "--color-background", "--color-surface", "--color-surface-elevated",
        "--color-text-primary", "--color-text-secondary", "--color-border",
        "--color-primary", "--color-success", "--color-warning", "--color-error",
    ]
    for m in re.finditer(r"\[data-theme='([^']+)'\]\s*\{([^}]*)\}", css_src):
        body = m.group(2)
        if "--color-background:" not in body:
            continue
        for tok in required:
            if tok + ":" not in body:
                problems.append(f"theme '{m.group(1)}' is missing {tok}")

    # The light-mode theme must exist for the Dark Mode toggle to work.
    if BOOTSTRAP_LIGHT_ID not in real:
        problems.append(f"theme '{BOOTSTRAP_LIGHT_ID}' is required by the Dark Mode toggle but has no palette")

    # index.html must apply the saved palette before paint, and the default
    # markup theme must be one of the registered ids.
    html = open(INDEX_HTML, encoding="utf-8").read()
    if "warmode_theme_id" not in html:
        problems.append("index.html: missing pre-paint theme bootstrap (warmode_theme_id)")
    m = re.search(r"<html[^>]*data-theme='([^']+)'", html) or re.search(r'<html[^>]*data-theme="([^"]+)"', html)
    if m and m.group(1) not in js_ids:
        problems.append(f"index.html: default data-theme='{m.group(1)}' is not a registered theme")

    return problems


def build():
    files = [os.path.join(MODULES_DIR, f"{name}.js") for name in ORDER] + [ENTRY]
    missing = [f for f in files if not os.path.exists(f)]
    if missing:
        sys.exit("Missing module(s): " + ", ".join(os.path.relpath(f, ROOT) for f in missing))

    parts = [
        "/* WarMode bundle - GENERATED FILE, do not edit by hand.\n"
        " * Built from js/main.js + js/modules/*.js by tools/build_bundle.py so the\n"
        " * startpage runs from file:// where ES modules are blocked by CORS.\n"
        " * Edit the modules and re-run: python3 tools/build_bundle.py */\n"
        "(function (global) {\n"
        "  'use strict';\n"
        "  var __modules = {};\n"
        "  var __cache = {};\n"
        "  function __def(name, factory) { __modules[name] = factory; }\n"
        "  function __req(name) {\n"
        "    if (__cache[name]) return __cache[name].exports;\n"
        "    var mod = { exports: {} };\n"
        "    __cache[name] = mod;\n"
        "    __modules[name](mod, mod.exports, __req);\n"
        "    return mod.exports;\n"
        "  }\n"
    ]

    for path in files:
        src = open(path, encoding="utf-8").read()
        body, imports = strip_imports(src)
        body, exports = strip_exports(body)
        mod = os.path.basename(path)[:-3]

        parts.append(f"\n  __def({json.dumps(mod)}, function (module, exports, __req) {{\n")
        parts.append('    "use strict";\n')

        seen = set()
        for srcmod, names in imports:
            alias = srcmod.replace("-", "_")
            if alias not in seen:
                parts.append(f"    var {alias} = __req({json.dumps(srcmod)});\n")
                seen.add(alias)
            for n in names:
                parts.append(f"    var {n} = {alias}.{n};\n")

        parts.append("\n")
        parts.append(body)
        parts.append("\n")
        for local, exported in exports:
            if IDENT_RE.match(local) or local == "__default":
                parts.append(f"    exports[{json.dumps(exported)}] = {local};\n")
        parts.append("  });\n")

    parts.append(
        "\n  // Entry point: requiring main runs its DOMContentLoaded bootstrap.\n"
        "  __req('main');\n\n"
        "  global.WarMode = { modules: __modules, req: __req };\n"
        "})(typeof window !== 'undefined' ? window : globalThis);\n"
    )

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("".join(parts))
    print(f"Wrote {os.path.relpath(OUT, ROOT)} ({len(files)} modules)")


if __name__ == "__main__":
    problems = check_theme_consistency()
    if problems:
        print("Theme consistency check FAILED:", file=sys.stderr)
        for p in problems:
            print("  - " + p, file=sys.stderr)
        sys.exit(1)
    build()