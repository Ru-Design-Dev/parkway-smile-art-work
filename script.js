const heroScene = document.querySelector(".hero-scene");
const artworkStage = document.querySelector(".artwork-stage");
const couch = document.querySelector(".couch");
const artworkMotion = document.querySelector(".artwork-motion");
const brand = document.querySelector(".brand");
const scrollCue = document.querySelector(".scroll-cue");
const home = document.querySelector("#home");
const details = document.querySelector("#details");
const pricing = document.querySelector("#pricing");
const navLinks = [...document.querySelectorAll(".nav-link")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let videoHasStarted = false;
const heroIntroStarted = performance.now();

function paintScroll() {
  const range = Math.max(1, home.offsetHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / range));
  const start = window.innerWidth <= 760 ? 0.9 : 1;
  const zoomStart = 0.06;
  const zoomEnd = 0.55;
  const artCenterY = artworkStage.offsetTop + artworkStage.offsetHeight / 2;
  const maxScale = Math.max(start, Math.min(
    window.innerHeight / artworkStage.offsetHeight,
    window.innerWidth / artworkStage.offsetWidth,
  ));
  const zoomProgress = Math.min(1, Math.max(0, (progress - zoomStart) / (zoomEnd - zoomStart)));
  const scale = start + (maxScale - start) * zoomProgress;
  const centerShift = (window.innerHeight / 2 - artCenterY) * zoomProgress;
  const introProgress = Math.min(1, (performance.now() - heroIntroStarted) / 900);
  const introOffset = (1 - introProgress) * 8;
  heroScene.style.transformOrigin = `50% ${artCenterY}px`;
  heroScene.style.transform = `translateY(${centerShift + introOffset}px) scale(${scale})`;
  heroScene.style.opacity = String(introProgress);
  const couchProgress = Math.min(1, Math.max(0, (progress - zoomStart) / 0.28));
  const logoProgress = Math.min(1, progress / 0.04);
  const artworkIsFullSize = progress >= zoomEnd;
  if (artworkIsFullSize && !reduceMotion.matches && !videoHasStarted) {
    videoHasStarted = true;
    artworkMotion.play().catch(() => { videoHasStarted = false; });
  } else if ((!artworkIsFullSize || reduceMotion.matches) && videoHasStarted) {
    videoHasStarted = false;
    artworkMotion.pause();
    artworkMotion.currentTime = 0;
  }
  artworkMotion.style.opacity = artworkIsFullSize
    && !reduceMotion.matches
    && artworkMotion.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
    ? "1"
    : "0";
  couch.style.opacity = String(introProgress * (1 - couchProgress));
  brand.style.opacity = String(introProgress * (1 - logoProgress));
  scrollCue.style.opacity = String(introProgress * Math.max(0, 1 - progress * 4));
  if (introProgress < 1) requestAnimationFrame(paintScroll);
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
artworkMotion.addEventListener("loadedmetadata", paintScroll);
artworkMotion.addEventListener("loadeddata", paintScroll);
paintScroll();

function setActiveSection(active) {
  navLinks.forEach((link) => {
    const selected = link.dataset.section === active;
    link.classList.toggle("is-active", selected);
    if (selected) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

let pendingSection = null;
let pendingSectionTimeout = 0;
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    pendingSection = link.dataset.section;
    setActiveSection(pendingSection);
    window.clearTimeout(pendingSectionTimeout);
    pendingSectionTimeout = window.setTimeout(() => { pendingSection = null; }, 4000);
  });
});
setActiveSection("home");

const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    if (pendingSection && pendingSection !== entry.target.id) continue;
    setActiveSection(entry.target.id);
    if (pendingSection === entry.target.id) {
      pendingSection = null;
      window.clearTimeout(pendingSectionTimeout);
    }
  }
}, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
sectionObserver.observe(home);
sectionObserver.observe(details);
sectionObserver.observe(pricing);
window.addEventListener("scrollend", () => {
  if (!pendingSection) return;
  const target = document.getElementById(pendingSection);
  const bounds = target.getBoundingClientRect();
  const center = window.innerHeight / 2;
  if (bounds.top <= center && bounds.bottom >= center) setActiveSection(pendingSection);
  pendingSection = null;
  window.clearTimeout(pendingSectionTimeout);
});

