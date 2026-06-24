import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import featureBestPractice from "@/assets/feature-best-practice.png";
import featureVideoSubmission from "@/assets/landingPage-feature_submitTraining.png";
import featureVoiceFeedback from "@/assets/landingPage-feature_record-audio.png";
import featureProgressTracking from "@/assets/landingPage-feature_stat-tracking.png";
import featureLesson from "@/assets/landingPage-feature_lesson.png";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

const FEATURES = [
  {
    tagline: "Lessons built smart",
    heading: "Build and assign structured training plans",
    description:
      "Create lessons with organised modules, then assign them directly to your athletes. Everything stays in one place, no chasing over DMs, no spreadsheets.",
    image: {
      src: featureLesson,
      alt: "Formjo coach dashboard - assignments and progress overview",
    },
  },
  {
    tagline: "Get feedback faster",
    heading: "Record and submit your training footage",
    description:
      "Complete your assigned lessons and upload session video directly in the app. Your coach is notified the moment it's ready to review.",
    image: {
      src: featureVideoSubmission,
      alt: "Video submission preview",
    },
  },
  {
    tagline: "Coach with your voice",
    heading: "Leave voice notes on every submission",
    description:
      "Record audio feedback directly on a submission. Richer than a text comment and faster than typing.",
    image: {
      src: featureVoiceFeedback,
      alt: "Voice feedback preview",
    },
  },
  {
    tagline: "See how far you've come",
    heading: "Track improvement session by session",
    description:
      "Browse the full submission history across any athlete and watch their form develop over time. Build a visible record of progress.",
    image: {
      src: featureProgressTracking,
      alt: "Progress tracking preview",
    },
  },
];

const ContentBlock = ({ feature, onVisibilityChange }) => {
  const blockRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.33, 0.5, 0.66, 0.83],
    [0, 0, 1, 1, 0],
  );

  useEffect(() => {
    const unsubscribe = opacity.on("change", (v) => {
      onVisibilityChange(v > 0.5);
    });
    return () => unsubscribe();
  }, [opacity, onVisibilityChange]);

  return (
    <motion.div
      ref={blockRef}
      animate={isMobile ? { opacity: 1 } : undefined}
      style={!isMobile ? { opacity } : undefined}
      className="flex flex-col items-start justify-center md:justify-start"
    >
      {/* Image shown inline on mobile only */}
      <div className="mb-8 md:hidden">
        <img
          src={feature.image.src}
          alt={feature.image.alt}
          className="w-full"
        />
      </div>

      <p className="mb-3 font-semibold text-primary md:mb-4">
        {feature.tagline}
      </p>
      <h3 className="mb-5 text-2xl font-bold md:mb-6 md:text-3xl md:leading-[1.3] lg:text-4xl">
        {feature.heading}
      </h3>
      <p className="text-muted-foreground md:text-base">
        {feature.description}
      </p>

      <div className="mt-6 flex items-center gap-x-4 md:mt-8">
        <Link to="/signup">
          <Button variant="outline">Get Started</Button>
        </Link>
        <Link
          to="/signup"
          className="flex items-center gap-1 text-sm font-semibold hover:underline"
        >
          Learn more <ChevronRight className="size-4" />
        </Link>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleVisibilityChange = (index, isVisible) => {
    if (isVisible) setCurrentImageIndex(index);
  };

  return (
    <section className="relative px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container">
        {/* Section header */}
        <div className="mx-auto max-w-lg text-center">
          <p className="mb-3 font-semibold text-primary md:mb-4">
            The Platform
          </p>
          <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
            Everything you need to coach better
          </h2>
          <p className="text-muted-foreground md:text-base">
            Formjo brings structure, video, and feedback into a single workflow
            — so coaches can focus on coaching, not admin.
          </p>
        </div>

        {/* 3-column scroll grid */}
        <div className="mt-12 grid grid-cols-1 items-start gap-12 md:mt-0 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:gap-x-12">
          {/* Left column — even-indexed features */}
          <div className="relative flex w-full flex-col gap-12 md:pt-[60vh]">
            {FEATURES.map((feature, index) =>
              isMobile || index % 2 === 0 ? (
                <div key={index} className="md:h-svh">
                  <ContentBlock
                    feature={feature}
                    onVisibilityChange={(isVisible) =>
                      handleVisibilityChange(index, isVisible)
                    }
                  />
                </div>
              ) : null,
            )}
          </div>

          {/* Center column — sticky image that swaps on scroll */}
          <div className="sticky top-0 hidden h-screen w-full items-center justify-center md:flex">
            <img
              src={FEATURES[currentImageIndex].image.src}
              alt={FEATURES[currentImageIndex].image.alt}
              className="max-h-[80vh] w-auto object-contain"
            />
          </div>

          {/* Right column — odd-indexed features */}
          <div className="relative hidden w-full flex-col gap-12 md:flex md:pt-[110vh]">
            {FEATURES.map((feature, index) =>
              index % 2 !== 0 ? (
                <div key={index} className="md:h-svh">
                  <ContentBlock
                    feature={feature}
                    onVisibilityChange={(isVisible) =>
                      handleVisibilityChange(index, isVisible)
                    }
                  />
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-[5%] py-16 md:py-24 lg:py-28">
        <div className="container">
          <div className="mx-auto max-w-lg text-center">
            <p className="mb-3 font-semibold text-primary md:mb-4">GA Capstone — 2026</p>
            <h2 className="mb-5 text-5xl font-bold md:mb-6 md:text-7xl lg:text-8xl">
              Ready to see it in action?
            </h2>
            <p className="text-muted-foreground md:text-base">
              Formjo is live. Sign up as a coach or student and explore a seeded demo with real
              training plans, video submissions, and voice feedback.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:mt-8">
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/signin" className="flex items-center gap-1 font-semibold hover:underline">
                Sign in <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
