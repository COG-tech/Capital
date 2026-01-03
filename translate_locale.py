import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

if len(sys.argv) < 2:
    print("usage: translate_locale.py <locale>")
    sys.exit(1)

locale = sys.argv[1]

root = Path(".")
source_dir = root / "en"

source_files = [
    "index.html",
    "resources.html",
    "types.html",
    "theory.html",
] + [f"type-{i}.html" for i in range(1, 25)]

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

dir_map = {"ar": "rtl"}

if locale not in lang_map:
    print("unknown locale")
    sys.exit(1)


def split_front_matter(text):
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            return parts[1].strip(), parts[2].lstrip("\n")
    return "", text


def rebuild_front_matter(fm, locale):
    lines = [line for line in fm.splitlines() if line.strip() and not line.strip().startswith("permalink:")]
    cleaned = []
    for line in lines:
        key = line.split(":", 1)[0].strip()
        if key in {"lang", "dir", "locale"}:
            continue
        cleaned.append(line)
    cleaned.append(f"locale: \"{locale}\"")
    cleaned.append(f"lang: \"{lang_map[locale]}\"")
    cleaned.append(f"dir: \"{dir_map.get(locale, 'ltr')}\"")
    return "\n".join(cleaned)


def get_text_nodes(html):
    soup = BeautifulSoup(html, "html.parser")
    nodes = []
    for node in soup.find_all(string=True):
        if not node or not node.strip():
            continue
        parent = node.parent
        if parent and parent.name in {"script", "style", "code", "pre"}:
            continue
        if parent and parent.has_attr("translate") and parent.get("translate") == "no":
            continue
        if parent and parent.has_attr("data-no-translate"):
            continue
        nodes.append(node)
    return soup, nodes


cache = {}


MAX_TRANSLATE_CHARS = 4200
SEP_TOKEN = "|||###|||"
cache_path = root / f".translate_cache_{locale}.json"
if cache_path.exists():
    try:
        cache = json.loads(cache_path.read_text(encoding="utf-8"))
    except Exception:
        cache = {}


def chunk_text(text, max_len=MAX_TRANSLATE_CHARS):
    if len(text) <= max_len:
        return [text]
    sentences = re.split(r"(?<=[.!?])\\s+", text)
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


def translate_text(text, target):
    if target == "en":
        return text
    if not text or not text.strip():
        return text
    cached = cache.get(text)
    if cached is not None:
        return cached
    chunks = chunk_text(text)
    translated_chunks = [translate_chunk(chunk, target) for chunk in chunks]
    translated = " ".join(chunk.strip() for chunk in translated_chunks).strip()
    cache[text] = translated
    return translated


def translate_texts(texts, target):
    if target == "en":
        return texts
    out = [None] * len(texts)
    batch = []
    batch_idx = []
    batch_len = 0

    def flush():
        nonlocal batch, batch_idx, batch_len
        if not batch:
            return
        joined = SEP_TOKEN.join(batch)
        translated_joined = translate_chunk(joined, target)
        if SEP_TOKEN in translated_joined:
            parts = translated_joined.split(SEP_TOKEN)
        else:
            parts = []
        if len(parts) != len(batch):
            parts = [translate_text(text, target) for text in batch]
        for text, idx, translated in zip(batch, batch_idx, parts):
            cache[text] = translated
            out[idx] = translated
        batch = []
        batch_idx = []
        batch_len = 0

    for i, text in enumerate(texts):
        cached = cache.get(text)
        if cached is not None:
            out[i] = cached
            continue
        if len(text) > MAX_TRANSLATE_CHARS:
            translated = translate_text(text, target)
            cache[text] = translated
            out[i] = translated
            continue
        if batch and batch_len + len(text) + len(SEP_TOKEN) > MAX_TRANSLATE_CHARS:
            flush()
        batch.append(text)
        batch_idx.append(i)
        batch_len += len(text) + len(SEP_TOKEN)

    flush()
    return out


out_dir = root / locale
out_dir.mkdir(exist_ok=True)

for fname in source_files:
    src = source_dir / fname
    if not src.exists():
        continue
    raw = src.read_text(encoding="utf-8")
    fm, body = split_front_matter(raw)
    # translate title
    m = re.search(r"^title:\s*\"?(.*?)\"?$", fm, re.MULTILINE)
    if m:
        title_val = m.group(1)
        title_trans = translate_texts([title_val], locale)[0]
        fm = re.sub(r"^title:.*$", f'title: "{title_trans}"', fm, flags=re.MULTILINE)
    fm = rebuild_front_matter(fm, locale)

    soup, nodes = get_text_nodes(body)
    originals = [str(node).strip() for node in nodes]
    translated = translate_texts(originals, locale)
    for node, src_text, dst_text in zip(nodes, originals, translated):
        full = str(node)
        lead = re.match(r"^\s*", full).group(0)
        trail = re.search(r"\s*$", full).group(0)
        node.replace_with(lead + dst_text + trail)

    out = f"---\n{fm}\n---\n\n{soup.decode().strip()}\n"
    try:
        (out_dir / fname).write_text(out, encoding="utf-8")
    except Exception:
        (out_dir / fname).write_text(out, encoding="utf-8", errors="ignore")

cache_path.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"done {locale}")
