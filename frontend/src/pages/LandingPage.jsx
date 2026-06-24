import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import TimelineSection from "../components/landing/TimelineSection";
import TeamSection from "../components/landing/TeamSection";
import FooterSection from "../components/landing/FooterSection";
import CurvedLoop from "../components/landing/CurvedLoop";

const LandingPage = () => {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <div className="bg-foreground text-background pt-8 pb-0">
        <CurvedLoop
          marqueeText="Boxing 🥊 MMA 🤼 Wrestling 🤸 Gymnastics 💃 Dance 🏊‍♀️ Swimming 🎾 Tennis 🏌️‍♀️ Golf 🧗 Rock Climbing"
          speed={1}
          curveAmount={100}
          direction="left"
          interactive={true}
        />
      </div>
      <FeaturesSection />
      <TimelineSection />
      <TeamSection />
      <FooterSection />
    </main>
  );
};

export default LandingPage;
