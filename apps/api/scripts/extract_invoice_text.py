import json
import sys

import pdfplumber


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"text": "", "error": "missing file path"}))
        return 1

    path = sys.argv[1]
    pages: list[str] = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            pages.append(page.extract_text(x_tolerance=1, y_tolerance=3) or "")

    print(json.dumps({"text": "\n".join(pages), "pages": len(pages)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
