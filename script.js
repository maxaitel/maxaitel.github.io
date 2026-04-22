const yearElement = document.getElementById("year");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setupReveal() {
  const reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reducedMotion.matches) {
    reveals.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  reveals.forEach((element) => observer.observe(element));
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

setupReveal();
