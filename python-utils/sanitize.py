#!/usr/bin/env python3
"""
Sanitize SVG content.

Contract:
- stdin: raw SVG (utf-8)
- stdout: sanitized SVG (utf-8)
- exit code 0 on success, non-zero on failure

Policy:
- Keep dependencies minimal. If you add deps, list them in requirements.txt.
- This script should print clear install instructions when deps are missing.
"""

from __future__ import annotations

import re
import sys


def sanitize_svg(svg: str) -> str:
    # Minimal, dependency-free sanitize:
    # - remove <script> blocks
    # - remove on* event handler attributes (e.g. onclick="...")
    sanitized = re.sub(r"<script\b[^>]*>[\s\S]*?</script\s*>", "", svg, flags=re.IGNORECASE)
    sanitized = re.sub(r"""\s+on[a-zA-Z]+\s*=\s*(['"]).*?\1""", "", sanitized)
    return sanitized


def main() -> int:
    raw = sys.stdin.read()
    if not raw:
        # treat empty as success (no-op)
        return 0

    try:
        out = sanitize_svg(raw)
    except Exception as exc:  # pragma: no cover
        sys.stderr.write(f"sanitize.py failed: {exc}\n")
        return 1

    sys.stdout.write(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

