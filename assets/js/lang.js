(() => {
  const STORAGE_KEY = "site_lang";
  const SUPPORTED = [
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

  const basePath = window.SITE_BASE || "";

  const normalizeLocale = (raw) => {
    if (!raw) return "en";
    const lc = raw.toLowerCase();
    if (lc.startsWith("fil") || lc.startsWith("tl")) return "fil";
    if (lc.startsWith("ar")) return "ar";
    if (lc.startsWith("es")) return "es";
    if (lc.startsWith("fr")) return "fr";
    if (lc.startsWith("hi")) return "hi";
    if (lc.startsWith("bn")) return "bn";
    if (lc.startsWith("pt")) return "pt";
    if (lc.startsWith("ru")) return "ru";
    if (lc.startsWith("id")) return "id";
    if (lc.startsWith("zh")) {
      if (lc.includes("hant") || lc.includes("tw") || lc.includes("hk") || lc.includes("mo")) {
        return "zh-hant";
      }
      return "zh-hans";
    }
    return "en";
  };

  const getLocaleFromPath = () => {
    let path = window.location.pathname || "";
    if (basePath && path.startsWith(basePath)) {
      path = path.slice(basePath.length);
    }
    if (path.startsWith("/")) {
      path = path.slice(1);
    }
    const parts = path.split("/").filter(Boolean);
    const candidate = parts[0];
    return SUPPORTED.includes(candidate) ? candidate : null;
  };

  const buildTarget = (locale) => {
    let path = window.location.pathname || "";
    if (basePath && path.startsWith(basePath)) {
      path = path.slice(basePath.length);
    }
    if (path.startsWith("/")) {
      path = path.slice(1);
    }
    const parts = path.split("/").filter(Boolean);
    let rest = "";
    if (parts.length && SUPPORTED.includes(parts[0])) {
      rest = parts.slice(1).join("/");
    } else {
      rest = parts.join("/");
    }
    if (!rest) {
      rest = "index.html";
    }
    const target = `${basePath}/${locale}/${rest}`.replace(/\/+/g, "/");
    return target;
  };

  const goToLocale = async (locale) => {
    const target = buildTarget(locale);
    localStorage.setItem(STORAGE_KEY, locale);
    try {
      const res = await fetch(target, { method: "HEAD" });
      if (res.ok) {
        window.location.href = target;
        return;
      }
    } catch (err) {
      // fallback below
    }
    window.location.href = `${basePath}/${locale}/index.html`.replace(/\/+/g, "/");
  };

  const langToggle = document.getElementById("langToggle");
  const langModal = document.getElementById("langModal");
  const langClose = langModal ? langModal.querySelector(".lang-close") : null;

  if (langToggle && langModal) {
    const openModal = () => {
      langModal.hidden = false;
      langToggle.setAttribute("aria-expanded", "true");
    };
    const closeModal = () => {
      langModal.hidden = true;
      langToggle.setAttribute("aria-expanded", "false");
    };

    langToggle.addEventListener("click", () => {
      if (langModal.hidden) {
        openModal();
      } else {
        closeModal();
      }
    });

    if (langClose) {
      langClose.addEventListener("click", closeModal);
    }

    langModal.addEventListener("click", (event) => {
      if (event.target === langModal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !langModal.hidden) {
        closeModal();
      }
    });

    langModal.querySelectorAll(".lang-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const locale = btn.getAttribute("data-locale");
        if (!locale) return;
        closeModal();
        goToLocale(locale);
      });
    });
  }

  // Auto-apply saved language if missing from path
  const stored = localStorage.getItem(STORAGE_KEY);
  const pathLocale = getLocaleFromPath();
  if (!pathLocale) {
    const detected = stored || normalizeLocale(navigator.language || "");
    if (SUPPORTED.includes(detected)) {
      const target = buildTarget(detected);
      if (!window.location.pathname.endsWith("index.html")) {
        window.location.href = target;
      }
    }
  }
})();
