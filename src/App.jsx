const masthead = [
  "__     __   _____   __    __\n| \\   / |  / ___ \\  \\ \\  / /\n|  \\_/  | | |   | |  \\ \\/ / \n| |\\_/| | | |___| |   /  \\  \n| |   | | |  ___  |  / /\\ \\ \n| |   | | | |   | | / /  \\ \\\n|_|   |_| |_|   |_| \\/    \\/",
  "  _____   _____ _______ _______ ___    \n / ___ \\  |_ _| |_   _| |  ___| | |    \n| |   | |  | |    | |   | |___  | |    \n| |___| |  | |    | |   |  ___| | |    \n|  ___  |  | |    | |   | |     | |    \n| |   | | _| |_   | |   | |___  | |___ \n|_|   |_| |___|   |_|   |_____| |_____|"
];

const experienceItems = [
  {
    title: "Codex Ambassador",
    company: "OpenAI",
    companyUrl: "https://openai.com/",
    type: "Part-time",
    location: "Christchurch, Canterbury, New Zealand · Remote",
    date: "Apr 2026 — Present",
  },
  {
    title: "Software Engineer",
    company: "LODG",
    companyUrl: "https://lodg.co.nz/",
    type: "Part-time",
    location: "Christchurch, Canterbury, New Zealand · Remote",
    date: "May 2026 — Present",
  },
  {
    title: "Business Team",
    company: "UCM - University of Canterbury Motorsport",
    companyUrl: "https://www.ucmotorsport.com/",
    type: "Part-time",
    location: "Christchurch, Canterbury, New Zealand · Hybrid",
    date: "Jan 2026 — Present",
  },
  {
    title: "Computer Science Student",
    company: "University of Canterbury",
    companyUrl: "https://www.canterbury.ac.nz/",
    type: "Full-time",
    location: "Christchurch, Canterbury, New Zealand · On-site",
    date: "Feb 2025 — Present",
  },
  {
    title: "Mentor",
    company: "Miami Beach Bots — FRC 7652",
    companyUrl: "https://miamibeachbots.org/",
    type: "Volunteer",
    location: "Miami Beach, Florida, United States",
    date: "May 2024 — Present",
  },
  {
    title: "Intern",
    company: "Red Balloon Security, Inc.",
    companyUrl: "https://redballoonsecurity.com/",
    type: "Internship",
    location: "New York City Metropolitan Area · On-site",
    date: "Aug 2024 — Dec 2024",
  },
];

export default function App() {
  return (
    <>
      <a className="skip" href="#about">Skip to content</a>
      <main id="top">
        <section className="hero" aria-labelledby="name">
          <h1 id="name" className="sr-only">Max Aitel</h1>
          <div className="wordmark" aria-hidden="true">
            <pre className="word-first">{masthead[0]}</pre>
            <pre className="word-second">{masthead[1]}</pre>
          </div>
          <nav aria-label="Main navigation">
            <a href="#about">about</a>
            <a href="#experience">experience</a>
            <a href="#contact">contact</a>
          </nav>
        </section>
        <section id="about" className="about section" aria-labelledby="about-title">
          <h2 id="about-title">about</h2>
          <div className="about-copy">
            <p>I'm Max Aitel. I study computer science at the University of Canterbury in Christchurch. Outside of work: robotics, planes, and AI.</p>
          </div>
        </section>
        <section id="experience" className="experience section" aria-labelledby="experience-title">
          <h2 id="experience-title">experience</h2>
          <div className="roles">
            {experienceItems.map((item) => (
              <article className="role" key={`${item.title}-${item.date}`}>
                <h3>{item.title}</h3>
                <p className="organization">
                  <a href={item.companyUrl} target="_blank" rel="noopener noreferrer">{item.company}</a>
                </p>
                <p className="period">{item.date}</p>
                <p className="role-detail">{item.type} / {item.location}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="contact" className="contact section" aria-labelledby="contact-title">
          <h2 id="contact-title">contact</h2>
          <p className="email">maxaitel[@]gmail.com</p>
          <div className="socials">
            <a href="https://github.com/maxaitel" target="_blank" rel="noopener noreferrer">github</a>
            <a href="https://www.linkedin.com/in/max-aitel-b09498220/" target="_blank" rel="noopener noreferrer">linkedin</a>
            <a href="https://x.com/aitelmax?lang=en" target="_blank" rel="noopener noreferrer">x / twitter</a>
          </div>
        </section>
      </main>
    </>
  );
}
