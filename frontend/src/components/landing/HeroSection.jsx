import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-boxing.jpg";

const HeroSection = () => {
  // useScroll tracks how far the user has scrolled the page (0 = top, 1 = bottom)
  const { scrollYProgress } = useScroll();

  // As the user scrolls, the image shrinks from full-screen down to a small thumbnail
  // and drifts toward the centre of the viewport
  const imgWidth = useTransform(scrollYProgress, [0, 1], ["100%", "10%"]);
  const imgHeight = useTransform(scrollYProgress, [0, 1], ["100%", "20%"]);
  const imgTop = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const imgLeft = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const imgY = useTransform(scrollYProgress, [0.5, 1], ["0vh", "40vh"]);

  return (
    // h-[300vh] creates the scroll zone — the sticky content stays on screen while
    // the extra height gives the scroll-driven animation room to play out
    <section className="relative flex h-[300vh] flex-col items-center">
      <div className="sticky top-0 flex w-full flex-col items-center justify-center">
        {/* Full-screen image that shrinks on scroll */}
        <div className="relative z-10 flex h-screen w-full items-center justify-center">
          <motion.div
            style={{
              y: imgY,
              width: imgWidth,
              height: imgHeight,
              top: imgTop,
              left: imgLeft,
              position: "absolute",
            }}
          >
            <img
              src={heroImg}
              alt="Boxer hitting coach's pad, Formjo training session"
              className="size-full object-cover"
            />
          </motion.div>
        </div>

        {/* Heading + description + CTAs — revealed as the image shrinks */}
        <div className="relative py-16 md:py-24 lg:pb-28 lg:pt-6">
          <div className="px-[5%]">
            <div className="mx-auto w-full max-w-lg text-center">
              <h1 className="mb-5 text-6xl font-bold md:mb-6 md:text-9xl leading-tight">
                Coach Smarter. Train Better.
              </h1>
              <p className="text-muted-foreground md:text-base">
                Formjo is a platform for coaches to assign structured training,
                review athlete video submissions, and deliver personalised
                feedback.
              </p>
              <div className="mt-6 flex items-center justify-center gap-x-4 md:mt-8">
                <Link to="/signup">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link to="/signin">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 mt-[100vh]" />
    </section>
  );
};

export default HeroSection;
