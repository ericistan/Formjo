import ericTanProfileImg from "../../assets/eric-tan-profile-img.png";

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.339 18.337H5.667v-8.59h2.672v8.59zM7.003 8.574a1.548 1.548 0 1 1 0-3.096 1.548 1.548 0 0 1 0 3.096zm11.335 9.763h-2.669V14.16c0-.996-.018-2.277-1.388-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248h-2.667v-8.59h2.56v1.174h.037c.355-.675 1.227-1.387 2.524-1.387 2.704 0 3.203 1.778 3.203 4.092v4.71z" />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const MEMBER = {
  image: {
    src: ericTanProfileImg,
    alt: "Eric Tan",
  },
  name: "Eric Tan",
  jobTitle: "UX Designer & Full Stack Developer",
  description:
    "Trained to design experiences, now building them end to end. Formjo covers the full stack from database schema and Flask REST API to React, Tailwind, and motion design.",
  links: [
    {
      href: "https://www.linkedin.com/in/erictan",
      icon: LinkedinIcon,
      label: "LinkedIn",
    },
    {
      href: "https://github.com/erictan",
      icon: GithubIcon,
      label: "GitHub",
    },
  ],
};

const TeamSection = () => (
  <section className="px-[5%] py-16 md:py-24 lg:py-28">
    <div className="container">
      {/* Section header */}
      <div className="mx-auto mb-12 max-w-lg text-center md:mb-18 lg:mb-20">
        <p className="mb-3 font-semibold text-primary md:mb-4">The Builder</p>
        <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
          Dev Behind Formjo
        </h2>
      </div>

      {/* Single member card */}
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        {/* Circular photo */}
        <div className="relative mb-6 size-48 overflow-hidden rounded-full border-4 border-border md:size-56">
          <img
            src={MEMBER.image.src}
            alt={MEMBER.image.alt}
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        {/* Name + role */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold md:text-3xl">{MEMBER.name}</h3>
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mt-1">
            {MEMBER.jobTitle}
          </p>
        </div>

        {/* Bio */}
        <p className="text-muted-foreground md:text-base">
          {MEMBER.description}
        </p>

        {/* Social links */}
        <div className="mt-6 flex items-center gap-4">
          {MEMBER.links.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-6" />
            </a>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TeamSection;
