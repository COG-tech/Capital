document.addEventListener("DOMContentLoaded", () => {
  const tocLinks = Array.from(document.querySelectorAll(".toc-nav a"));
  const targets = tocLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (!tocLinks.length || !targets.length) {
    return;
  }

  const setActive = (id) => {
    tocLinks.forEach((a) => {
      const hit = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("is-active", hit);
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible && visible.target && visible.target.id) {
        setActive(visible.target.id);
      }
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: [0.1, 0.25, 0.5] }
  );

  targets.forEach((t) => io.observe(t));

  setActive(targets[0].id);
});
