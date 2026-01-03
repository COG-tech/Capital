import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent
app_js = root / "assets" / "js" / "app.js"

text = app_js.read_text(encoding="utf-8")

def unescape_js_string(raw):
    return json.loads('"' + raw + '"')

# Extract test name
m = re.search(r"const TEST_NAME\s*=\s*\"([^\"]+)\"", text, re.S)
if not m:
    raise SystemExit("TEST_NAME not found")

test_name = m.group(1)

# Extract TYPE_META names
type_block = re.search(r"const TYPE_META = \[(.*?)\];", text, re.S)
if not type_block:
    raise SystemExit("TYPE_META not found")

type_entries = re.findall(r"id:\s*(\d+).*?name:\s*\"([^\"]+)\"", type_block.group(1), re.S)

type_names = {str(type_id): name for type_id, name in type_entries}

# Extract ITEMS text
items_block = re.search(r"const ITEMS = \[(.*?)]\s*;", text, re.S)
if not items_block:
    raise SystemExit("ITEMS not found")

item_matches = re.finditer(r"id:\s*\"([^\"]+)\".*?text:\s*\"((?:\\.|[^\"])*)\"", items_block.group(1), re.S)
items = {}
for match in item_matches:
    item_id = match.group(1)
    raw = match.group(2)
    items[item_id] = unescape_js_string(raw)

payload = {
    "strings": {
        "testName": test_name,
        "quizSub": "Answer each item on a 7-point scale.",
        "scaleLeft": "Strongly disagree",
        "scaleRight": "Strongly agree",
        "pageLabel": "Page {current} of {total}",
        "missingItems": "Please answer all items. Missing {count}.",
        "summaryTemplate": "Type {typeId}: {typeName} ({order}). Bottleneck: {bottleneck}. Lever: {lever}.",
        "nextFocusTemplate": "Next Focus: {focus}.",
        "tieBreakTemplate": "Tie break used {field} priority ordering.",
        "viewType": "View Type {id}",
    },
    "labels": {
        "domains": {
            "E": "Economic",
            "C": "Cultural",
            "S": "Social",
            "Y": "Symbolic",
        },
        "fields": {
            "finance_law": "Finance/Law",
            "tech_ai": "Tech/AI",
            "arts_media": "Arts/Media",
            "community_ngo": "Community/NGO",
        },
    },
    "tiers": {
        "dominant": "Dominant",
        "strong": "Strong",
        "steady": "Steady",
        "thin": "Thin Base",
        "constrained": "Constrained",
    },
    "nextFocus": {
        "tech_ai_C": "Technical Mastery and Certification",
        "community_ngo_S": "Bridging Ties and Reciprocity",
        "arts_media_Y": "Symbolic Distinction and Legitimacy",
        "finance_law_E": "Asset Accumulation and Risk Management",
        "fallback": {
            "E": "Asset Buffer and Risk Control",
            "C": "Skill Depth and Credential Signals",
            "S": "Network Quality and Reciprocity",
            "Y": "Legitimacy Signals and Recognition",
        },
    },
    "types": type_names,
    "items": items,
}

out_dir = root / "assets" / "i18n"
out_dir.mkdir(parents=True, exist_ok=True)
(out_dir / "en.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print("wrote assets/i18n/en.json")
