import json
import urllib.parse
import urllib.request
from pathlib import Path

locales = [
    "en",
    "es",
    "fr",
    "ar",
    "hi",
    "bn",
    "pt",
    "ru",
    "id",
    "zh-hans",
    "zh-hant",
    "fil",
]

lang_map = {
    "en": "en",
    "es": "es",
    "fr": "fr",
    "ar": "ar",
    "hi": "hi",
    "bn": "bn",
    "pt": "pt",
    "ru": "ru",
    "id": "id",
    "zh-hans": "zh-Hans",
    "zh-hant": "zh-Hant",
    "fil": "fil-PH",
}

base = {
    "nav": {
        "home": "Home",
        "test": "Test",
        "types": "Types",
        "theory": "Theory",
        "resources": "Resources",
        "start": "Start",
        "language": "Language",
    },
    "footer": {
        "tagline": "Built for clarity and curiosity. No external images, fast and lightweight.",
    },
}

root = Path(__file__).resolve().parent


def translate_text(text, target):
    if target == "en":
        return text
    params = [
        ("client", "gtx"),
        ("sl", "en"),
        ("tl", target),
        ("dt", "t"),
        ("q", text),
    ]
    url = "https://translate.googleapis.com/translate_a/single?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=12) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        if not data or not data[0]:
            return text
        translated = "".join(seg[0] for seg in data[0] if seg and seg[0])
        return translated or text
    except Exception:
        return text


def translate_block(block, target):
    if isinstance(block, dict):
        return {k: translate_block(v, target) for k, v in block.items()}
    if isinstance(block, list):
        return [translate_block(v, target) for v in block]
    if isinstance(block, str):
        return translate_text(block, target)
    return block

out = {}
for locale in locales:
    out[locale] = translate_block(base, lang_map[locale])

out_path = root / "_data" / "i18n.json"
out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print("wrote _data/i18n.json")
