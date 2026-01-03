document.addEventListener("DOMContentLoaded", () => {
  const tocLinks = Array.from(document.querySelectorAll(".kb-toc nav a"));
  const targets = tocLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!tocLinks.length || !targets.length) {
    return;
  }

  const setActive = (id) => {
    tocLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", isMatch);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible && visible.target && visible.target.id) {
        setActive(visible.target.id);
      }
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: [0.1, 0.25, 0.5] }
  );

  targets.forEach((target) => observer.observe(target));
  setActive(targets[0].id);
});
