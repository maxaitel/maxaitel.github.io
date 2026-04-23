import { useEffect } from "react";

const experienceItems = [
  {
    title: "Codex Ambassador",
    company: "OpenAI",
    companyUrl: "https://openai.com/",
    type: "Part-time",
    location: "Christchurch, Canterbury, New Zealand · Remote",
    date: "Apr 2026 - Present",
  },
  {
    title: "Business Team",
    company: "UCM - University of Canterbury Motorsport",
    companyUrl: "https://www.ucmotorsport.com/",
    type: "Part-time",
    location: "Christchurch, Canterbury, New Zealand · Hybrid",
    date: "Jan 2026 - Present",
  },
  {
    title: "Computer Science Student",
    company: "University of Canterbury",
    companyUrl: "https://www.canterbury.ac.nz/",
    type: "Full-time",
    location: "Christchurch, Canterbury, New Zealand · On-site",
    date: "Feb 2025 - Present",
  },
  {
    title: "Mentor",
    company: "Miami Beach Bots - FRC 7652",
    companyUrl: "https://miamibeachbots.org/",
    type: "Volunteer",
    location: "Miami Beach, Florida, United States",
    date: "May 2024 - Present",
  },
  {
    title: "Intern",
    company: "Red Balloon Security, Inc.",
    companyUrl: "https://redballoonsecurity.com/",
    type: "Internship",
    location: "New York City Metropolitan Area · On-site",
    date: "Aug 2024 - Dec 2024",
  },
];

const contactLinks = [
  {
    href: "mailto:maxaitel@gmail.com",
    label: "maxaitel@gmail.com",
  },
  {
    href: "https://github.com/maxaitel",
    label: "github",
  },
  {
    href: "https://www.linkedin.com/in/max-aitel-b09498220/",
    label: "linkedin",
  },
  {
    href: "https://x.com/aitelmax?lang=en",
    label: "x",
  },
];

function useRevealOnScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveals = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window) || reducedMotion.matches) {
      reveals.forEach((element) => element.classList.add("is-visible"));
      return undefined;
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

    return () => observer.disconnect();
  }, []);
}

export default function App() {
  useRevealOnScroll();

  return (
    <div className="site-shell min-h-screen">
      <a className="skip-link" href="#main">
        skip to content
      </a>

      <header className="site-header">
        <a className="site-mark" href="#main" aria-label="max aitel — home">
          max aitel
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="#about">about</a>
          <a href="#experience">experience</a>
          <a href="#contact">contact</a>
        </nav>
      </header>

      <main id="main">
        <section className="hero section">
          <div className="hero-copy reveal">
            <h1>
              <span>hi, i’m</span>
              <span>max aitel</span>
            </h1>
            <p className="hero-text">christchurch-based student</p>
            <div className="hero-actions">
              <a className="text-link" href="#experience">
                view work
              </a>
              <a
                className="text-link muted-link"
                href="https://github.com/maxaitel"
                target="_blank"
                rel="noreferrer"
              >
                github
              </a>
            </div>
          </div>

          <a className="scroll-prompt" href="#about">
            scroll
          </a>
        </section>

        <section id="about" className="section">
          <div className="section-title reveal">
            <h2>about</h2>
          </div>
          <div className="section-content reveal">
            <p className="lead">I like building products that feel measured and useful.</p>
            <p>
              Publicly, I’m based in Christchurch and currently studying
              computer science at the University of Canterbury. Outside of work,
              I keep returning to robotics, planes, and AI.
            </p>
          </div>
        </section>

        <section id="experience" className="section">
          <div className="section-title reveal">
            <h2>experience</h2>
          </div>
          <div className="section-content reveal">
            <div className="experience-list">
              {experienceItems.map((item) => (
                <article className="experience-item" key={`${item.title}-${item.date}`}>
                  <div className="experience-main">
                    <h3>{item.title}</h3>
                    <p className="role">
                      <a
                        className="inline-link"
                        href={item.companyUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.company}
                      </a>{" "}
                      · {item.type}
                    </p>
                    <p className="experience-detail">{item.location}</p>
                  </div>
                  <p className="date">{item.date}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section section-contact">
          <div className="section-title reveal">
            <h2>let’s connect</h2>
          </div>
          <div className="section-content reveal">
            <div className="contact-links">
              {contactLinks.map((link) => (
                <a
                  href={link.href}
                  key={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Max Aitel</p>
        <div className="footer-links">
          <a href="#main">back to top</a>
        </div>
      </footer>
    </div>
  );
}
