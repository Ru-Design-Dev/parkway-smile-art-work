const artworkStage = document.querySelector(".artwork-stage");
const brand = document.querySelector(".brand");
const scrollCue = document.querySelector(".scroll-cue");
const home = document.querySelector("#home");
const details = document.querySelector("#details");
const curtainIntro = document.querySelector(".curtain-intro");
const navLinks = [...document.querySelectorAll(".nav-link")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function paintScroll() {
  const range = Math.max(1, home.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / range));
  const start = window.innerWidth <= 760 ? 0.8 : window.innerWidth >= 1500 ? 0.82 : 0.88;
  const end = window.innerWidth <= 760 ? 2.45 : 2.9;
  const scale = start + (end - start) * progress;
  artworkStage.style.transform = `translateX(-50%) scale(${scale})`;
  brand.style.opacity = String(Math.max(0, 1 - progress * 2.5));
  scrollCue.style.opacity = String(Math.max(0, 1 - progress * 4));
}

let scheduled = false;
window.addEventListener("scroll", () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    paintScroll();
    scheduled = false;
  });
}, { passive: true });
window.addEventListener("resize", paintScroll);
paintScroll();

const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const active = entry.target.id;
    navLinks.forEach((link) => {
      const selected = link.dataset.section === active;
      link.classList.toggle("is-active", selected);
      if (selected) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }
}, { rootMargin: "-32% 0px -48% 0px", threshold: 0 });
sectionObserver.observe(home);
sectionObserver.observe(details);

if (reduceMotion.matches) {
  curtainIntro.classList.add("is-gone");
} else {
  window.setTimeout(() => curtainIntro.classList.add("is-open"), 500);
  window.setTimeout(() => curtainIntro.classList.add("is-gone"), 2500);
}
