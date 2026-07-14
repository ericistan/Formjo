import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import FormjoStyleGuide from "@/assets/formjo-styleguide.jpg";
import FormjoDbErd from "@/assets/formjo-db-erd.png";
import FormjoLofiWireframes from "@/assets/formjo-lofi-wireframe.jpg";
import FeatureFrontend from "@/assets/landingpage-feature_frontend.png";
import FeatureBackend from "@/assets/landingpage-feature_backend.png";

const PHASES = [
  {
    date: "Phase 1",
    label: "Foundations",
    description:
      "Started with the data model: 13 database tables covering users, lessons, modules, assignments, submissions, and feedback. Built a secure Flask REST API with JWT authentication from the ground up.",
    images: [
      { src: FormjoDbErd, alt: "Database Schema ERD and API scaffolding" },
      {
        src: FormjoLofiWireframes,
        alt: "Low-fidelity wireframes and user flows",
      },
      { src: FormjoStyleGuide, alt: "Style guide and UI components" },
    ],
  },
  {
    date: "Phase 2",
    label: "Core Features",
    description:
      "Built the full CRUD workflow for coaches and students. Lessons, modules, assignments, video submissions with YouTube and file upload support, and voice feedback recorded directly in the browser via the Web Audio API.",
    images: [
      { src: FeatureFrontend, alt: "Frontend, coach and student dashboards" },
      { src: FeatureBackend, alt: "Backend, Flask REST API and database schema" },
    ],
    techStack: [
      {
        name: "React",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
      },
      {
        name: "Vite",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg",
      },
      {
        name: "Tailwind",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
      },
      {
        name: "JavaScript",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      },
      {
        name: "Python",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      },
      {
        name: "Flask",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg",
        invert: true,
      },
      {
        name: "PostgreSQL",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
      },
    ],
  },
  {
    date: "Phase 3",
    label: "The Experience",
    description:
      "Shipped a dual-mode app for Coaches and Students with a seeded demo dataset that walks through a full coaching cycle: lessons assigned, videos submitted, and feedback recorded via comments and voice. Live and fully functional end to end.",
    images: [],
    content: (
      <div>
        <p className="mb-2 text-xl font-semibold text-foreground">
          Outcomes & Lessons
        </p>
        <div className="mb-8 flex flex-col gap-2">
          {[
            {
              emoji: "✅",
              text: "Full CRUD workflow for lessons, modules, assignments, submissions, and feedback",
            },
            {
              emoji: "✅",
              text: "Use deterministic gradients for lesson cover images based on module ID to create a unique visual identity for each lesson",
            },
            {
              emoji: "✅",
              text: "Voice feedback recorded directly in the browser using the Web Audio API and MediaRecorder, with Cloudinary for Video upload and a localStorage-persisted consent gate",
            },
            {
              emoji: "✅",
              text: "Using regex to extract YouTube video IDs from any valid URL format for embedding",
            },
            {
              emoji: "✅",
              text: "Back and forth commenting on student's submissions",
            },
            {
              emoji: "⚠️",
              text: "Spend more time performing UX heuristic evaluations and user testing to catch usability issues",
            },
            {
              emoji: "⚠️",
              text: "Reviewing the ERD and Database schema while building would save time and prevent mistakes in the API design when building features not initially planned.",
            },
            {
              emoji: "⚠️",
              text: "Making use of props and code refactors so I don't spend time rewriting the same logic multiple times.",
            },
            {
              emoji: "⚠️",
              text: "Using Tanstack Query for data fetching and caching would have simplified the frontend code and improved performance.",
            },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              className="flex items-start gap-2 text-base text-muted-foreground"
            >
              <span>{emoji}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    date: "Phase 4",
    label: "Stretch Goals",
    description:
      "Features left on the roadmap for a production-ready coaching platform.",
    images: [],
    content: (
      <div>
        <p className="mb-2 text-xl font-semibold text-foreground">
          What's Next
        </p>
        <p className="mb-6 text-base text-muted-foreground">
          With the MVP complete, these are the features that would take Formjo
          from a capstone project to a real coaching tool.
        </p>
        <div className="mb-8 flex flex-col gap-2">
          {[
            {
              emoji: "🔔",
              text: "Push notifications: alert students when a coach leaves voice or text feedback",
            },
            {
              emoji: "👥",
              text: "Coach–student invite system with formal roster management before assignments are sent",
            },
            {
              emoji: "🏆",
              text: "Streak System for gamified progress tracking and motivation.",
            },
            {
              emoji: "🔑",
              text: "Password reset via email for self-serve account recovery",
            },
            {
              emoji: "📊",
              text: "A more in-depth Analytics dashboard for coaches to track student progress and completion rates over time",
            },
            {
              emoji: "☁️",
              text: "Cloudinary paid plan to increase user upload limits and support more concurrent users",
            },
          ].map(({ emoji, text }) => (
            <div
              key={text}
              className="flex items-start gap-2 text-base text-muted-foreground"
            >
              <span>{emoji}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const TimelineItem = ({
  date,
  label,
  description,
  images = [],
  techStack,
  content,
}) => {
  const circleRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: circleRef,
    offset: ["end end", "end center"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.85, 1],
    [0, 0.25, 0.75, 1],
  );
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 1],
    ["oklch(0.897 0.016 75)", "oklch(0.145 0 0)"],
  );

  return (
    <div className="relative z-20 grid w-full auto-cols-fr grid-cols-[3rem_1fr] gap-y-6 py-16 sm:grid-cols-[4rem_1fr] md:w-auto md:grid-cols-[1fr_10rem_1fr] md:gap-y-0 lg:grid-cols-[1fr_12rem_1fr]">
      {/* Date — left on desktop, top on mobile */}
      <motion.div
        style={{ opacity }}
        className="[grid-area:1/2/2/3] md:text-right md:[grid-area:auto]"
      >
        <h3 className="text-4xl font-bold leading-[1.2] md:text-5xl lg:text-6xl">
          {date}
        </h3>
        <p className="mt-1 text-sm font-semibold text-primary uppercase tracking-widest">
          {label}
        </p>
      </motion.div>

      {/* Sticky dot */}
      <div className="flex justify-start [grid-area:1/1/3/2] md:justify-center md:[grid-area:auto]">
        <motion.div
          ref={circleRef}
          style={{
            backgroundColor,
            boxShadow: "0 0 0 8px var(--color-background)",
          }}
          className="sticky top-[50vh] size-[0.9375rem] rounded-full"
        />
      </div>

      {/* Content + image — right column */}
      <motion.div style={{ opacity }}>
        <div className="mb-10 md:mb-14 lg:mb-16">
          <p className="text-muted-foreground md:text-base">{description}</p>
          {content && <div className="mt-6">{content}</div>}
          {techStack && (
            <div className="mt-6">
              <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
                Tech Stack
              </p>
              <div className="flex flex-wrap gap-6">
                {techStack.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex flex-col items-center gap-2"
                  >
                    <img
                      src={tech.icon}
                      alt={tech.name}
                      className="h-10 w-10"
                      style={tech.invert ? { filter: "brightness(0)" } : {}}
                    />
                    <span className="text-sm text-muted-foreground">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {images.map((img, i) => (
            <div key={i} className="overflow-hidden rounded-lg">
              <img src={img.src} alt={img.alt} className="w-full" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const SectionHeader = ({ isBottom }) => (
  <div className="bg-background px-[5%] py-16 md:py-24 lg:py-28">
    <div className="container mx-auto">
      <div className="mx-auto max-w-lg text-center">
        {isBottom ? (
          <>
            <p className="mb-3 font-semibold text-primary md:mb-4">
              GA Capstone, 2026
            </p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Ready to see it in action?
            </h2>
            <p className="text-muted-foreground md:text-base">
              Formjo is live. Sign up as a coach or student and explore a seeded
              demo with real training plans, video submissions, and voice
              feedback.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:mt-8">
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link
                to="/signin"
                className="flex items-center gap-1 font-semibold hover:underline"
              >
                Sign in <ChevronRight className="size-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mb-3 font-semibold text-primary md:mb-4">
              The Dev Journey
            </p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Built in 2 weeks.
            </h2>
            <p className="text-muted-foreground md:text-base">
              Formjo is built as a General Assembly capstone project, designed
              and developed from scratch. The following timeline highlights the
              key phases of development, from initial planning to the final
              product.
            </p>
          </>
        )}
      </div>
    </div>
  </div>
);

const TimelineSection = () => (
  <section className="relative z-0">
    <div className="relative -z-30">
      <SectionHeader isBottom={false} />

      <div className="px-[5%]">
        <div className="container mx-auto">
          <div className="relative flex flex-col items-center justify-center">
            {/* Vertical line */}
            <div className="absolute left-1.5 -z-20 h-full w-[3px] bg-border md:left-auto">
              <div className="absolute left-0 right-0 top-0 z-10 h-24 w-full bg-gradient-to-b from-background to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 z-10 h-24 w-full bg-gradient-to-t from-background to-transparent" />
            </div>

            {PHASES.map((phase) => (
              <TimelineItem key={phase.date} {...phase} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TimelineSection;
