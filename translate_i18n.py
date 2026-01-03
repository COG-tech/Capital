import json
import re
import urllib.parse
import urllib.request
from pathlib import Path
import sys

if len(sys.argv) < 2:
    print("usage: translate_i18n.py <locale>")
    sys.exit(1)

locale = sys.argv[1]

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

if locale not in lang_map:
    raise SystemExit("unknown locale")

root = Path(__file__).resolve().parent
base = root / "assets" / "i18n" / "en.json"

if not base.exists():
    raise SystemExit("assets/i18n/en.json not found")

source = json.loads(base.read_text(encoding="utf-8"))

cache_path = root / f".translate_cache_{locale}_i18n.json"
cache = {}
if cache_path.exists():
    try:
        cache = json.loads(cache_path.read_text(encoding="utf-8"))
    except Exception:
        cache = {}

TOKEN_RE = re.compile(r"\{[^}]+\}")
MAX_TRANSLATE_CHARS = 4200


def protect_tokens(text):
    tokens = []

    def repl(match):
        tokens.append(match.group(0))
        return f"__TOKEN{len(tokens)-1}__"

    protected = TOKEN_RE.sub(repl, text)
    return protected, tokens


def restore_tokens(text, tokens):
    for i, token in enumerate(tokens):
        text = text.replace(f"__TOKEN{i}__", token)
    return text


def chunk_text(text, max_len=MAX_TRANSLATE_CHARS):
    if len(text) <= max_len:
        return [text]
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks = []
    current = ""
    for sentence in sentences:
        if not sentence:
            continue
        if current and len(current) + len(sentence) + 1 > max_len:
            chunks.append(current.strip())
            current = sentence
        else:
            current = f"{current} {sentence}".strip()
    if current:
        chunks.append(current.strip())
    return chunks


def translate_chunk(text, target):
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


def translate_text(text, target):
    if target == "en" or not text or not text.strip():
        return text
    cached = cache.get(text)
    if cached is not None:
        return cached
    protected, tokens = protect_tokens(text)
    chunks = chunk_text(protected)
    translated_chunks = [translate_chunk(chunk, target) for chunk in chunks]
    translated = " ".join(chunk.strip() for chunk in translated_chunks).strip()
    translated = restore_tokens(translated, tokens)
    cache[text] = translated
    return translated


def walk(value, target):
    if isinstance(value, str):
        return translate_text(value, target)
    if isinstance(value, list):
        return [walk(item, target) for item in value]
    if isinstance(value, dict):
        return {key: walk(val, target) for key, val in value.items()}
    return value

translated = walk(source, lang_map[locale])

out_path = root / "assets" / "i18n" / f"{locale}.json"
out_path.write_text(json.dumps(translated, ensure_ascii=False, indent=2), encoding="utf-8")
cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"wrote {out_path}")
