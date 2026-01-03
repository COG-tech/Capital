const STORAGE_VERSION = "2025.1";
const STORAGE_VERSION_KEY = "capital_inventory_version";
const STORAGE_KEY = "capital_inventory_answers_v3";
const FIELD_STORAGE_KEY = "capital_inventory_field";
const PAGE_SIZE = 6;
const TIE_DELTA = 2;
const THEME_STORAGE_KEY = "ecsy_theme_mode";
const RESULTS_ENDPOINT =
  typeof window !== "undefined" ? window.RESULTS_ENDPOINT || "" : "";

const DOMAIN_INFO = {
  E: {
    label: "Economic",
    desc: "Financial resilience, income predictability, and resource access.",
  },
  C: {
    label: "Cultural",
    desc: "Digital literacy, data fluency, and embodied skills.",
  },
  S: {
    label: "Social",
    desc: "Bonding and bridging ties, including digital networks.",
  },
  Y: {
    label: "Symbolic",
    desc: "Visibility, prestige, and recognition in algorithmic spaces.",
  },
};

const FIELD_LABELS = {
  finance_law: "Finance/Law",
  tech_ai: "Tech/AI",
  arts_media: "Arts/Media",
  community_ngo: "Community/NGO",
};

const FIELD_PRIORITY = {
  finance_law: ["E", "Y", "C", "S"],
  tech_ai: ["C", "E", "Y", "S"],
  arts_media: ["Y", "C", "S", "E"],
  community_ngo: ["S", "Y", "C", "E"],
};

const TYPE_META = [
  { id: 1, name: "The Builder", order: "E > C > S > Y" },
  { id: 2, name: "The Patron", order: "E > C > Y > S" },
  { id: 3, name: "The Dealmaker", order: "E > S > C > Y" },
  { id: 4, name: "The Connected Operator", order: "E > S > Y > C" },
  { id: 5, name: "The Power Broker", order: "E > Y > C > S" },
  { id: 6, name: "The Tycoon", order: "E > Y > S > C" },
  { id: 7, name: "The Credentialed Striver", order: "C > E > S > Y" },
  { id: 8, name: "The Polished Professional", order: "C > E > Y > S" },
  { id: 9, name: "The Community Scholar", order: "C > S > E > Y" },
  { id: 10, name: "The Insider-in-Training", order: "C > S > Y > E" },
  { id: 11, name: "The Tastemaker", order: "C > Y > E > S" },
  { id: 12, name: "The Gatekeeper", order: "C > Y > S > E" },
  { id: 13, name: "The Network Hustler", order: "S > E > C > Y" },
  { id: 14, name: "The Rainmaker", order: "S > E > Y > C" },
  { id: 15, name: "The Connector Student", order: "S > C > E > Y" },
  { id: 16, name: "The Trusted Insider", order: "S > C > Y > E" },
  { id: 17, name: "The Political Player", order: "S > Y > E > C" },
  { id: 18, name: "The Community Powerhouse", order: "S > Y > C > E" },
  { id: 19, name: "The Public Figure", order: "Y > E > C > S" },
  { id: 20, name: "The Celebrity Operator", order: "Y > E > S > C" },
  { id: 21, name: "The Elite Graduate", order: "Y > C > E > S" },
  { id: 22, name: "The Institutional Star", order: "Y > C > S > E" },
  { id: 23, name: "The Kingmaker", order: "Y > S > E > C" },
  { id: 24, name: "The Movement Icon", order: "Y > S > C > E" },
];

const TYPE_BY_ORDER = {
  "E>C>S>Y": 1,
  "E>C>Y>S": 2,
  "E>S>C>Y": 3,
  "E>S>Y>C": 4,
  "E>Y>C>S": 5,
  "E>Y>S>C": 6,
  "C>E>S>Y": 7,
  "C>E>Y>S": 8,
  "C>S>E>Y": 9,
  "C>S>Y>E": 10,
  "C>Y>E>S": 11,
  "C>Y>S>E": 12,
  "S>E>C>Y": 13,
  "S>E>Y>C": 14,
  "S>C>E>Y": 15,
  "S>C>Y>E": 16,
  "S>Y>E>C": 17,
  "S>Y>C>E": 18,
  "Y>E>C>S": 19,
  "Y>E>S>C": 20,
  "Y>C>E>S": 21,
  "Y>C>S>E": 22,
  "Y>S>E>C": 23,
  "Y>S>C>E": 24,
};

const DEFAULT_TYPE_NAMES = TYPE_META.reduce((acc, item) => {
  acc[item.id] = item.name;
  return acc;
}, {});

const DEFAULT_I18N = {
  strings: {
    testName:
      "The 2025 Logic of Practice: A Resource-Mapping Diagnostic for the Digital Field",
    quizSub: "Answer each item on a 7-point scale.",
    scaleLeft: "Strongly disagree",
    scaleRight: "Strongly agree",
    pageLabel: "Page {current} of {total}",
    missingItems: "Please answer all items. Missing {count}.",
    summaryTemplate:
      "Type {typeId}: {typeName} ({order}). Bottleneck: {bottleneck}. Lever: {lever}.",
    nextFocusTemplate: "Next Focus: {focus}.",
    tieBreakTemplate: "Tie break used {field} priority ordering.",
    viewType: "View Type {id}",
  },
  labels: {
    domains: {
      E: "Economic",
      C: "Cultural",
      S: "Social",
      Y: "Symbolic",
    },
    fields: {
      finance_law: "Finance/Law",
      tech_ai: "Tech/AI",
      arts_media: "Arts/Media",
      community_ngo: "Community/NGO",
    },
  },
  tiers: {
    dominant: "Dominant",
    strong: "Strong",
    steady: "Steady",
    thin: "Thin Base",
    constrained: "Constrained",
  },
  nextFocus: {
    tech_ai_C: "Technical Mastery and Certification",
    community_ngo_S: "Bridging Ties and Reciprocity",
    arts_media_Y: "Symbolic Distinction and Legitimacy",
    finance_law_E: "Asset Accumulation and Risk Management",
    fallback: {
      E: "Asset Buffer and Risk Control",
      C: "Skill Depth and Credential Signals",
      S: "Network Quality and Reciprocity",
      Y: "Legitimacy Signals and Recognition",
    },
  },
  types: DEFAULT_TYPE_NAMES,
};

let I18N = DEFAULT_I18N;

const ITEMS = [
  {
    id: "E1",
    domain: "E",
    type: "likert7",
    text: "I am confident I could cover an unexpected expense of $5,000 and bounce back financially.",
  },
  {
    id: "E2",
    domain: "E",
    type: "likert7",
    text: "My monthly income allows me to budget effectively for the next six months.",
  },
  {
    id: "E3",
    domain: "E",
    type: "likert7",
    text: "I have enough liquid savings to cover six months of essential living expenses.",
  },
  {
    id: "E4",
    domain: "E",
    type: "likert7",
    reverse: true,
    text: "Housing costs in my area frequently prevent me from investing in my future/skills.",
  },
  {
    id: "E5",
    domain: "E",
    type: "likert7",
    reverse: true,
    text: "I often worry about my income fluctuating unpredictably from month to month.",
  },
  {
    id: "E6",
    domain: "E",
    type: "likert7",
    text: "I feel financially secure enough to take significant career risks.",
  },
  {
    id: "E7",
    domain: "E",
    type: "likert7",
    text: "I can easily afford the quality of healthcare I need without financial stress.",
  },
  {
    id: "E8",
    domain: "E",
    type: "likert7",
    text: "My debt levels are manageable and do not limit my daily life choices.",
  },
  {
    id: "E9",
    domain: "E",
    type: "likert7",
    reverse: true,
    text: "I find it difficult to save any portion of my income for retirement.",
  },
  {
    id: "E10",
    domain: "E",
    type: "likert7",
    text: "I have access to diverse lines of credit or capital if I needed to start a project.",
  },
  {
    id: "E11",
    domain: "E",
    type: "likert7",
    reverse: true,
    text: "I feel stressed when thinking about my long-term financial future.",
  },
  {
    id: "E12",
    domain: "E",
    type: "likert7",
    text: "I can afford to outsource tasks (cleaning, delivery, etc.) to save my own time.",
  },
  {
    id: "E13",
    domain: "E",
    type: "likert7",
    text: "I regularly invest in assets (stocks, property, crypto) to build long-term wealth.",
  },
  {
    id: "E14",
    domain: "E",
    type: "likert7",
    text: "My financial situation rarely limits my ability to travel or relocate.",
  },
  {
    id: "E15",
    domain: "E",
    type: "likert7",
    reverse: true,
    text: "I frequently use \"Buy Now Pay Later\" or high-interest loans for basic needs.",
  },
  {
    id: "E16",
    domain: "E",
    type: "likert7",
    text: "I am satisfied with my current standard of living relative to my peers.",
  },
  {
    id: "E17",
    domain: "E",
    type: "likert7",
    text: "I can support family members financially without it impacting my own stability.",
  },
  {
    id: "E18",
    domain: "E",
    type: "likert7",
    text: "I have a comprehensive financial plan that I review with professional advisors.",
  },
  {
    id: "E19",
    domain: "E",
    type: "likert7",
    reverse: true,
    text: "I avoid important life decisions because I worry about the immediate cost.",
  },
  {
    id: "E20",
    domain: "E",
    type: "likert7",
    text: "My income has grown significantly or stayed resilient over the past two years.",
  },
  {
    id: "E21",
    domain: "E",
    type: "likert7",
    reverse: true,
    text: "I feel \"trapped\" in my current job solely because of my financial obligations.",
  },
  {
    id: "E22",
    domain: "E",
    type: "likert7",
    text: "I can easily replace essential household appliances or technology if they break.",
  },
  {
    id: "E23",
    domain: "E",
    type: "likert7",
    text: "I have multiple sources of income that protect me from a single job loss.",
  },
  {
    id: "E24",
    domain: "E",
    type: "likert7",
    text: "I feel adequately protected against inflation and rising costs of living.",
  },
  {
    id: "S1",
    domain: "S",
    type: "likert7",
    text: "I have many close contacts I can rely on for emergency financial help or housing.",
  },
  {
    id: "S2",
    domain: "S",
    type: "likert7",
    text: "My social network includes people with significant professional influence or power.",
  },
  {
    id: "S3",
    domain: "S",
    type: "likert7",
    text: "I have digital networks that provide professional opportunities I cannot find locally.",
  },
  {
    id: "S4",
    domain: "S",
    type: "likert7",
    text: "I feel a strong sense of belonging and mutual trust within my neighborhood.",
  },
  {
    id: "S5",
    domain: "S",
    type: "likert7",
    text: "I often interact with people from diverse socioeconomic or cultural backgrounds.",
  },
  {
    id: "S6",
    domain: "S",
    type: "likert7",
    text: "If I lost my job today, I know several people who could help me find a new one immediately.",
  },
  {
    id: "S7",
    domain: "S",
    type: "likert7",
    reverse: true,
    text: "I find it difficult to ask people in my network for significant favors.",
  },
  {
    id: "S8",
    domain: "S",
    type: "likert7",
    text: "I am an active member of professional associations or exclusive digital communities.",
  },
  {
    id: "S9",
    domain: "S",
    type: "likert7",
    text: "I generally trust the people I interact with in my daily social circles.",
  },
  {
    id: "S10",
    domain: "S",
    type: "likert7",
    text: "I have a mentor or confidant who provides me with high-level career advice.",
  },
  {
    id: "S11",
    domain: "S",
    type: "likert7",
    text: "My connections often introduce me to new ideas, information, or resources.",
  },
  {
    id: "S12",
    domain: "S",
    type: "likert7",
    reverse: true,
    text: "I feel lonely or socially isolated in my professional life.",
  },
  {
    id: "S13",
    domain: "S",
    type: "likert7",
    text: "People in my network often cooperate with me to achieve shared goals.",
  },
  {
    id: "S14",
    domain: "S",
    type: "likert7",
    text: "I believe my reputation within my community is a major asset for me.",
  },
  {
    id: "S15",
    domain: "S",
    type: "likert7",
    text: "I frequently participate in civic or community activities that build trust.",
  },
  {
    id: "S16",
    domain: "S",
    type: "likert7",
    reverse: true,
    text: "I find it hard to maintain long-term professional relationships.",
  },
  {
    id: "S17",
    domain: "S",
    type: "likert7",
    text: "My network includes experts in fields that are very different from my own.",
  },
  {
    id: "S18",
    domain: "S",
    type: "likert7",
    text: "I feel comfortable talking to high-status individuals in my professional field.",
  },
  {
    id: "S19",
    domain: "S",
    type: "likert7",
    text: "I am often asked to connect people within my network to one another.",
  },
  {
    id: "S20",
    domain: "S",
    type: "likert7",
    text: "I feel my social connections have significantly improved my life chances.",
  },
  {
    id: "S21",
    domain: "S",
    type: "likert7",
    reverse: true,
    text: "I lack contacts who can provide me with specialized or technical knowledge.",
  },
  {
    id: "S22",
    domain: "S",
    type: "likert7",
    text: "I can easily mobilize a group of people to support a cause I care about.",
  },
  {
    id: "S23",
    domain: "S",
    type: "likert7",
    text: "I belong to groups that provide me with a distinct sense of identity and pride.",
  },
  {
    id: "S24",
    domain: "S",
    type: "likert7",
    text: "My social network allows me to bypass formal barriers to get things done.",
  },
  {
    id: "C1",
    domain: "C",
    type: "likert7",
    text: "I am confident in reading, writing, and comprehending complex data sets to make decisions.",
  },
  {
    id: "C2",
    domain: "C",
    type: "likert7",
    text: "I hold verified certifications or credentials that are highly recognized in my field.",
  },
  {
    id: "C3",
    domain: "C",
    type: "likert7",
    text: "I have a collection of digital learning resources (courses, e-books) I use for self-improvement.",
  },
  {
    id: "C4",
    domain: "C",
    type: "likert7",
    text: "I feel comfortable and at home in high-status professional or academic environments.",
  },
  {
    id: "C5",
    domain: "C",
    type: "likert7",
    text: "I am proficient in using AI tools to enhance my productivity or creativity.",
  },
  {
    id: "C6",
    domain: "C",
    type: "likert7",
    text: "I possess technical skills that are in high demand in the current labor market.",
  },
  {
    id: "C7",
    domain: "C",
    type: "likert7",
    reverse: true,
    text: "I find it difficult to understand technical discussions or modern digital jargon.",
  },
  {
    id: "C8",
    domain: "C",
    type: "likert7",
    text: "I have been exposed to diverse cultural ideas through travel or intentional learning.",
  },
  {
    id: "C9",
    domain: "C",
    type: "likert7",
    text: "I can adapt my communication style (tone, language) for different cultural audiences.",
  },
  {
    id: "C10",
    domain: "C",
    type: "likert7",
    text: "I enjoy exploring complex intellectual topics that are outside my immediate expertise.",
  },
  {
    id: "C11",
    domain: "C",
    type: "likert7",
    text: "I feel my educational background has given me a major advantage in life.",
  },
  {
    id: "C12",
    domain: "C",
    type: "likert7",
    reverse: true,
    text: "I struggle to keep up with rapid changes in technology.",
  },
  {
    id: "C13",
    domain: "C",
    type: "likert7",
    text: "I am comfortable writing or speaking in a style that is seen as highly educated.",
  },
  {
    id: "C14",
    domain: "C",
    type: "likert7",
    text: "I frequently engage in hobbies that require high levels of skill or specialized knowledge.",
  },
  {
    id: "C15",
    domain: "C",
    type: "likert7",
    text: "I am usually the person people turn to for advice on how to use new tools or software.",
  },
  {
    id: "C16",
    domain: "C",
    type: "likert7",
    reverse: true,
    text: "I feel out of place when discussing high-culture topics like art or philosophy.",
  },
  {
    id: "C17",
    domain: "C",
    type: "likert7",
    text: "I have a broad vocabulary that allows me to express complex ideas clearly.",
  },
  {
    id: "C18",
    domain: "C",
    type: "likert7",
    text: "I am confident in my ability to teach myself any new skill using online resources.",
  },
  {
    id: "C19",
    domain: "C",
    type: "likert7",
    text: "I feel that I have good taste in music, art, or design that others respect.",
  },
  {
    id: "C20",
    domain: "C",
    type: "likert7",
    reverse: true,
    text: "I lack the formal qualifications needed to reach the next level of my career.",
  },
  {
    id: "C21",
    domain: "C",
    type: "likert7",
    text: "I can critically evaluate whether a digital news source or piece of media is reliable.",
  },
  {
    id: "C22",
    domain: "C",
    type: "likert7",
    text: "I frequently share knowledge or mentor others in my areas of expertise.",
  },
  {
    id: "C23",
    domain: "C",
    type: "likert7",
    text: "I have access to the latest hardware and high-speed internet needed for my work.",
  },
  {
    id: "C24",
    domain: "C",
    type: "likert7",
    text: "I feel my worldview is global and not limited by my local upbringing.",
  },
  {
    id: "Y1",
    domain: "Y",
    type: "likert7",
    text: "Others frequently seek my input or defer to my judgment in professional settings.",
  },
  {
    id: "Y2",
    domain: "Y",
    type: "likert7",
    text: "I possess verified status or visible badges of expertise on professional or social platforms.",
  },
  {
    id: "Y3",
    domain: "Y",
    type: "likert7",
    text: "My professional contributions regularly garner significant visibility and engagement from peers.",
  },
  {
    id: "Y4",
    domain: "Y",
    type: "likert7",
    text: "I am regarded as an expert or visionary in my specific area of work.",
  },
  {
    id: "Y5",
    domain: "Y",
    type: "likert7",
    text: "I have received prestigious awards, honors, or public recognition for my achievements.",
  },
  {
    id: "Y6",
    domain: "Y",
    type: "likert7",
    text: "People generally treat me with a high level of respect when I introduce myself.",
  },
  {
    id: "Y7",
    domain: "Y",
    type: "likert7",
    reverse: true,
    text: "I feel my accomplishments are often overlooked or under-credited.",
  },
  {
    id: "Y8",
    domain: "Y",
    type: "likert7",
    text: "I am frequently invited to speak at events or participate in high-level meetings.",
  },
  {
    id: "Y9",
    domain: "Y",
    type: "likert7",
    text: "I hold a title or role that commands automatic legitimacy in the eyes of others.",
  },
  {
    id: "Y10",
    domain: "Y",
    type: "likert7",
    text: "I believe my personal brand or reputation is a major driver of my success.",
  },
  {
    id: "Y11",
    domain: "Y",
    type: "likert7",
    text: "Others often mention my previous successes when they introduce me to new people.",
  },
  {
    id: "Y12",
    domain: "Y",
    type: "likert7",
    reverse: true,
    text: "I find it hard to get people to take my ideas seriously.",
  },
  {
    id: "Y13",
    domain: "Y",
    type: "likert7",
    text: "My opinions are highly valued in my social and professional communities.",
  },
  {
    id: "Y14",
    domain: "Y",
    type: "likert7",
    text: "I am often asked to lead or moderate groups because of my perceived authority.",
  },
  {
    id: "Y15",
    domain: "Y",
    type: "likert7",
    text: "I feel like a role model to others in my field or community.",
  },
  {
    id: "Y16",
    domain: "Y",
    type: "likert7",
    reverse: true,
    text: "I rarely receive the recognition I feel I deserve for my hard work.",
  },
  {
    id: "Y17",
    domain: "Y",
    type: "likert7",
    text: "My presence in a room or digital space is immediately noticed by others.",
  },
  {
    id: "Y18",
    domain: "Y",
    type: "likert7",
    text: "I am confident that my reputation would protect me during a crisis or scandal.",
  },
  {
    id: "Y19",
    domain: "Y",
    type: "likert7",
    text: "People often follow or subscribe to my updates to see what I am doing.",
  },
  {
    id: "Y20",
    domain: "Y",
    type: "likert7",
    reverse: true,
    text: "I feel insignificant or overlooked in most professional settings.",
  },
  {
    id: "Y21",
    domain: "Y",
    type: "likert7",
    text: "I have been cited or quoted by others as a source of authority.",
  },
  {
    id: "Y22",
    domain: "Y",
    type: "likert7",
    text: "I am satisfied with the level of influence I have over decisions in my field.",
  },
  {
    id: "Y23",
    domain: "Y",
    type: "likert7",
    text: "I believe I could achieve a higher social status if I chose to pursue it.",
  },
  {
    id: "Y24",
    domain: "Y",
    type: "likert7",
    text: "I feel proud of the professional legacy or reputation I have built.",
  },
];

const SUPPORTED_LOCALES = [
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
];

function getLocaleKey() {
  const raw =
    (typeof window !== "undefined" && window.SITE_LOCALE) ||
    (typeof document !== "undefined" && document.documentElement.lang) ||
    "en";
  const normalized = String(raw).toLowerCase();
  if (SUPPORTED_LOCALES.includes(normalized)) {
    return normalized;
  }
  return "en";
}

function mergeI18n(base, override) {
  if (!override || typeof override !== "object") {
    return base;
  }
  const output = Array.isArray(base) ? [...base] : { ...base };
  Object.entries(override).forEach(([key, value]) => {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof base?.[key] === "object"
    ) {
      output[key] = mergeI18n(base[key], value);
    } else {
      output[key] = value;
    }
  });
  return output;
}

function formatTemplate(template, values) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = values[key];
    return val === undefined || val === null ? "" : String(val);
  });
}

function getTypeName(typeId) {
  const map = I18N.types || DEFAULT_TYPE_NAMES;
  return map[String(typeId)] || DEFAULT_TYPE_NAMES[typeId] || `Type ${typeId}`;
}

function applyI18n() {
  const itemText = I18N.items || {};
  ITEMS.forEach((item) => {
    if (itemText[item.id]) {
      item.text = itemText[item.id];
    }
  });
}

async function loadI18n() {
  const locale = getLocaleKey();
  if (locale === "en") {
    return;
  }
  const base = typeof window !== "undefined" ? window.SITE_BASE || "" : "";
  const url = `${base}/assets/i18n/${locale}.json`.replace(/\/+/g, "/");
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    I18N = mergeI18n(DEFAULT_I18N, data);
  } catch (err) {
    // ignore i18n fetch failures
  }
}

const LIKERT_OPTIONS = [
  { value: 1, side: "d", size: "size-5" },
  { value: 2, side: "d", size: "size-4" },
  { value: 3, side: "d", size: "size-3" },
  { value: 4, side: "n", size: "size-2" },
  { value: 5, side: "a", size: "size-3" },
  { value: 6, side: "a", size: "size-4" },
  { value: 7, side: "a", size: "size-5" },
];

const quizEl = document.getElementById("quiz");
const resultsEl = document.getElementById("results");
const submitBtn = document.getElementById("submitBtn");
const resetBtn = document.getElementById("resetBtn");
const answeredCountEl = document.getElementById("answeredCount");
const totalCountEl = document.getElementById("totalCount");
const progressFillEl = document.getElementById("progressFill");
const errorMsgEl = document.getElementById("errorMsg");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageLabelEl = document.getElementById("pageLabel");
const fieldSelectEl = document.getElementById("fieldSelect");
const resultTypeLink = document.getElementById("resultTypeLink");

let currentPage = 0;
let pageAdvanceTimer = null;
const totalPages = Math.ceil(ITEMS.length / PAGE_SIZE);

function escapeHtml(str) {
  return String(str).replace(/[&<>\"']/g, (match) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return map[match] || match;
  });
}

function renderScale(item, labelId) {
  const optionsHtml = LIKERT_OPTIONS.map((opt, optIndex) => {
    const inputId = `${item.id}_${optIndex}`;
    return `
      <label class="choice" data-side="${opt.side}">
        <input type="radio" name="${item.id}" id="${inputId}" value="${opt.value}" />
        <span class="bubble ${opt.size}" aria-hidden="true"></span>
      </label>
    `;
  }).join("");

  return `
    <div class="scale" role="group" aria-labelledby="${labelId}">
      <div class="end left">${escapeHtml(I18N.strings.scaleLeft)}</div>
      <div class="choices">${optionsHtml}</div>
      <div class="end right">${escapeHtml(I18N.strings.scaleRight)}</div>
    </div>
  `;
}

function renderQuiz() {
  if (!quizEl) {
    return;
  }
  quizEl.innerHTML = `
    <div class="quiz-head">
      <div class="quiz-title">${escapeHtml(I18N.strings.testName)}</div>
      <div class="quiz-sub">${escapeHtml(I18N.strings.quizSub)}</div>
    </div>
    <div class="quiz-list"></div>
  `;
  if (totalCountEl) {
    totalCountEl.textContent = String(ITEMS.length);
  }

  const listEl = quizEl.querySelector(".quiz-list");
  if (!listEl) {
    return;
  }
  const frag = document.createDocumentFragment();

  ITEMS.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "q";
    row.dataset.qid = item.id;
    row.dataset.page = String(Math.floor(index / PAGE_SIZE));
    const titleId = `title_${item.id}`;
    row.innerHTML = `
      <div class="qtitle" id="${titleId}">
        <span class="qid">Q${index + 1}</span>
        <span class="qtext">${escapeHtml(item.text)}</span>
        <span class="qcheck" aria-hidden="true">&#10003;</span>
      </div>
      ${renderScale(item, titleId)}
    `;
    frag.appendChild(row);
  });

  listEl.appendChild(frag);
}

function pageForItemId(id) {
  const index = ITEMS.findIndex((item) => item.id === id);
  return index === -1 ? 0 : Math.floor(index / PAGE_SIZE);
}

function isPageComplete(page, answers) {
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, ITEMS.length);
  for (let i = start; i < end; i += 1) {
    const answer = answers[ITEMS[i].id];
    if (answer === null || answer === undefined) {
      return false;
    }
  }
  return true;
}

function setPage(page, options = {}) {
  const clamped = Math.max(0, Math.min(page, totalPages - 1));
  currentPage = clamped;
  const { scroll = true } = options;

  if (pageAdvanceTimer) {
    window.clearTimeout(pageAdvanceTimer);
    pageAdvanceTimer = null;
  }

  document.querySelectorAll(".q").forEach((row) => {
    const rowPage = Number(row.dataset.page || 0);
    row.classList.toggle("page-hidden", rowPage !== currentPage);
  });

  if (pageLabelEl) {
    pageLabelEl.textContent = formatTemplate(I18N.strings.pageLabel, {
      current: currentPage + 1,
      total: totalPages,
    });
  }
  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage === 0;
  }
  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage >= totalPages - 1;
  }

  if (scroll && quizEl) {
    quizEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function schedulePageAdvance(page) {
  if (pageAdvanceTimer) {
    window.clearTimeout(pageAdvanceTimer);
  }
  pageAdvanceTimer = window.setTimeout(() => {
    setPage(page);
    pageAdvanceTimer = null;
  }, 380);
}

function markAnswered(row, immediate = false) {
  if (!row || row.classList.contains("answered-hidden")) {
    return;
  }
  if (row.hideTimer) {
    window.clearTimeout(row.hideTimer);
    row.hideTimer = null;
  }
  row.classList.add("answered");
  if (immediate) {
    row.classList.add("answered-hidden");
    return;
  }
  row.hideTimer = window.setTimeout(() => {
    row.classList.add("answered-hidden");
    row.hideTimer = null;
  }, 350);
}

function getAnswers() {
  const answers = {};
  ITEMS.forEach((item) => {
    const picked = document.querySelector(`input[name="${item.id}"]:checked`);
    answers[item.id] = picked ? Number(picked.value) : null;
  });
  return answers;
}

function requireAllAnswered(answers) {
  return Object.entries(answers)
    .filter(([, value]) => value === null)
    .map(([key]) => key);
}

function findFirstUnansweredPage() {
  const answers = getAnswers();
  for (let page = 0; page < totalPages; page += 1) {
    if (!isPageComplete(page, answers)) {
      return page;
    }
  }
  return Math.max(totalPages - 1, 0);
}

function updateProgress() {
  const answers = getAnswers();
  const answered = Object.values(answers).filter((value) => value !== null).length;
  if (answeredCountEl) {
    answeredCountEl.textContent = String(answered);
  }
  const total = ITEMS.length;
  const pct = total ? (answered / total) * 100 : 0;
  if (progressFillEl) {
    progressFillEl.style.width = `${pct}%`;
  }
}

function saveAnswers() {
  const answers = getAnswers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
}

function loadAnswers() {
  try {
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (savedVersion && savedVersion !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const answers = JSON.parse(raw);
    ITEMS.forEach((item) => {
      const value = answers[item.id];
      if (value === null || value === undefined) {
        return;
      }
      const input = document.querySelector(
        `input[name="${item.id}"][value="${String(value)}"]`
      );
      if (input) {
        input.checked = true;
        const row = input.closest(".q");
        if (row) {
          markAnswered(row, true);
        }
      }
    });
  } catch (err) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadFieldSelection() {
  if (!fieldSelectEl) {
    return;
  }
  const saved = localStorage.getItem(FIELD_STORAGE_KEY);
  if (saved && fieldSelectEl.querySelector(`option[value="${saved}"]`)) {
    fieldSelectEl.value = saved;
  }
}

function getSelectedField() {
  if (!fieldSelectEl) {
    return "tech_ai";
  }
  return fieldSelectEl.value || "tech_ai";
}

function scoreItem(item, rawValue) {
  if (rawValue === null || rawValue === undefined) {
    return null;
  }
  if (item.type === "likert7") {
    return item.reverse ? 8 - rawValue : rawValue;
  }
  return null;
}

function itemRange(item) {
  if (item.type === "likert7") {
    return { min: 1, max: 7 };
  }
  return { min: 0, max: 0 };
}

function scoreDomain(domain, answers) {
  const items = ITEMS.filter((item) => item.domain === domain);
  let sum = 0;
  let min = 0;
  let max = 0;
  items.forEach((item) => {
    const raw = answers[item.id];
    const scored = scoreItem(item, raw);
    if (scored === null) {
      return;
    }
    const range = itemRange(item);
    sum += scored;
    min += range.min;
    max += range.max;
  });
  const pct = max === min ? 0 : ((sum - min) / (max - min)) * 100;
  return Math.round(pct);
}

function tierLabel(score) {
  const tiers = I18N.tiers || DEFAULT_I18N.tiers;
  if (score >= 81) {
    return tiers.dominant;
  }
  if (score >= 61) {
    return tiers.strong;
  }
  if (score >= 41) {
    return tiers.steady;
  }
  if (score >= 21) {
    return tiers.thin;
  }
  return tiers.constrained;
}

function computeNextFocus(lowest, field) {
  const focus = I18N.nextFocus || DEFAULT_I18N.nextFocus;
  if (field === "tech_ai" && lowest === "C") {
    return focus.tech_ai_C;
  }
  if (field === "community_ngo" && lowest === "S") {
    return focus.community_ngo_S;
  }
  if (field === "arts_media" && lowest === "Y") {
    return focus.arts_media_Y;
  }
  if (field === "finance_law" && lowest === "E") {
    return focus.finance_law_E;
  }
  return focus.fallback?.[lowest] || "";
}

function resolveType(scores, field) {
  const priority = FIELD_PRIORITY[field] || FIELD_PRIORITY.tech_ai;
  const priorityIndex = (cap) => priority.indexOf(cap);
  let tieUsed = false;
  const orderedCaps = ["E", "C", "S", "Y"].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (Math.abs(diff) > TIE_DELTA) {
      return diff > 0 ? 1 : -1;
    }
    tieUsed = true;
    return priorityIndex(a) - priorityIndex(b);
  });

  const typeOrder = `${orderedCaps[0]}>${orderedCaps[1]}>${orderedCaps[2]}>${orderedCaps[3]}`;
  const typeId = TYPE_BY_ORDER[typeOrder];

  return {
    typeId: typeId || 1,
    typeOrder,
    orderedCaps,
    tieUsed,
  };
}

function buildResult(answers) {
  const field = getSelectedField();
  const scores = {
    E: scoreDomain("E", answers),
    C: scoreDomain("C", answers),
    S: scoreDomain("S", answers),
    Y: scoreDomain("Y", answers),
  };
  const tiers = {
    E: tierLabel(scores.E),
    C: tierLabel(scores.C),
    S: tierLabel(scores.S),
    Y: tierLabel(scores.Y),
  };

  const { typeId, typeOrder, orderedCaps, tieUsed } = resolveType(scores, field);
  const highest = orderedCaps[0];
  const lowest = orderedCaps[orderedCaps.length - 1];

  return {
    scores,
    tiers,
    typeId,
    typeOrder,
    displayOrder: typeOrder.split(">").map((val) => val.trim()).join(" > "),
    highest,
    lowest,
    nextFocus: computeNextFocus(lowest, field),
    field,
    tieUsed,
  };
}

function sendAnonymousResult(result) {
  if (!RESULTS_ENDPOINT) {
    return;
  }

  const payload = {
    version: STORAGE_VERSION,
    timestamp: new Date().toISOString(),
    field: result.field,
    scores: result.scores,
    tiers: result.tiers,
    typeId: result.typeId,
    typeOrder: result.typeOrder,
  };

  fetch(RESULTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

function clearMissingHighlights(missingIds) {
  document.querySelectorAll(".q.missing").forEach((row) => row.classList.remove("missing"));
  missingIds.forEach((id) => {
    const row = document.querySelector(`.q[data-qid="${id}"]`);
    if (row) {
      row.classList.add("missing");
    }
  });
}

function showResults(result) {
  if (!resultsEl) {
    return;
  }
  resultsEl.classList.remove("hidden");

  const labels = (I18N.labels && I18N.labels.domains) || DEFAULT_I18N.labels.domains;
  const fieldLabels = (I18N.labels && I18N.labels.fields) || DEFAULT_I18N.labels.fields;
  const typeName = getTypeName(result.typeId);
  const orderLabel = result.displayOrder;
  const bottleneck = `${labels[result.lowest]} (${result.lowest})`;
  const lever = `${labels[result.highest]} (${result.highest})`;

  document.getElementById("scoreE").textContent = result.scores.E;
  document.getElementById("scoreC").textContent = result.scores.C;
  document.getElementById("scoreS").textContent = result.scores.S;
  document.getElementById("scoreY").textContent = result.scores.Y;

  document.getElementById("tierE").textContent = result.tiers.E;
  document.getElementById("tierC").textContent = result.tiers.C;
  document.getElementById("tierS").textContent = result.tiers.S;
  document.getElementById("tierY").textContent = result.tiers.Y;

  document.getElementById("barE").style.width = `${result.scores.E}%`;
  document.getElementById("barC").style.width = `${result.scores.C}%`;
  document.getElementById("barS").style.width = `${result.scores.S}%`;
  document.getElementById("barY").style.width = `${result.scores.Y}%`;

  document.getElementById("summary").textContent = formatTemplate(
    I18N.strings.summaryTemplate,
    {
      typeId: result.typeId,
      typeName,
      order: orderLabel,
      bottleneck,
      lever,
    }
  );

  let nextSteps = formatTemplate(I18N.strings.nextFocusTemplate, {
    focus: result.nextFocus,
  });
  if (result.tieUsed) {
    const fieldLabel = fieldLabels[result.field] || "Field";
    nextSteps += ` ${formatTemplate(I18N.strings.tieBreakTemplate, { field: fieldLabel })}`;
  }
  document.getElementById("nextSteps").textContent = nextSteps;

  if (resultTypeLink) {
    resultTypeLink.href = `type-${result.typeId}.html`;
    resultTypeLink.textContent = formatTemplate(I18N.strings.viewType, {
      id: result.typeId,
    });
  }

  sendAnonymousResult(result);
  resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const answers = getAnswers();
    const missing = requireAllAnswered(answers);
    if (missing.length) {
      clearMissingHighlights(missing);
      if (errorMsgEl) {
        errorMsgEl.textContent = formatTemplate(I18N.strings.missingItems, {
          count: missing.length,
        });
        errorMsgEl.classList.remove("hidden");
      }
      const targetPage = pageForItemId(missing[0]);
      setPage(targetPage, { scroll: false });
      window.setTimeout(() => {
        const firstMissing = document.querySelector(`.q[data-qid="${missing[0]}"]`);
        if (firstMissing) {
          firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 60);
      return;
    }

    if (errorMsgEl) {
      errorMsgEl.classList.add("hidden");
    }
    clearMissingHighlights([]);
    const result = buildResult(answers);
    showResults(result);
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.querySelectorAll("input[type=radio]").forEach((input) => {
      input.checked = false;
    });
    document.querySelectorAll(".q").forEach((row) => {
      if (row.hideTimer) {
        window.clearTimeout(row.hideTimer);
        row.hideTimer = null;
      }
      row.classList.remove("answered", "answered-hidden", "missing");
    });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_VERSION_KEY);
    if (resultsEl) {
      resultsEl.classList.add("hidden");
    }
    if (errorMsgEl) {
      errorMsgEl.classList.add("hidden");
    }
    clearMissingHighlights([]);
    updateProgress();
    setPage(0, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.addEventListener("change", (event) => {
  if (event.target && event.target.matches('input[type="radio"]')) {
    const row = event.target.closest(".q");
    if (row) {
      row.classList.remove("missing");
    }
    if (errorMsgEl) {
      errorMsgEl.classList.add("hidden");
    }
    updateProgress();
    saveAnswers();
    if (row) {
      markAnswered(row);
      const answers = getAnswers();
      const rowPage = Number(row.dataset.page || 0);
      if (isPageComplete(rowPage, answers) && rowPage < totalPages - 1) {
        schedulePageAdvance(rowPage + 1);
      }
    }
  }
});

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => setPage(currentPage - 1));
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => setPage(currentPage + 1));
}

if (fieldSelectEl) {
  fieldSelectEl.addEventListener("change", () => {
    localStorage.setItem(FIELD_STORAGE_KEY, getSelectedField());
  });
}

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const themeButtons = document.querySelectorAll("[data-action='toggle-theme']");
const rootEl = document.documentElement;

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const applyTheme = (mode) => {
  if (mode === "dark") {
    rootEl.setAttribute("data-theme", "dark");
  } else {
    rootEl.removeAttribute("data-theme");
  }

  themeButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", mode === "dark" ? "true" : "false");
  });
};

if (themeButtons.length) {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme) {
    applyTheme(storedTheme);
  }

  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const isDark = rootEl.getAttribute("data-theme") === "dark";
      const nextMode = isDark ? "light" : "dark";
      localStorage.setItem(THEME_STORAGE_KEY, nextMode);
      applyTheme(nextMode);
    });
  });
}

async function initQuiz() {
  await loadI18n();
  applyI18n();
  renderQuiz();
  loadFieldSelection();
  loadAnswers();
  updateProgress();
  setPage(findFirstUnansweredPage(), { scroll: false });
}

initQuiz();
