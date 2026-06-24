import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoDefault from "../assets/formjo-logo-default.png";
import logoDarkmode from "../assets/formjo-logo-darkmode.png";
import { Button } from "@/components/ui/button";
import CardNav from "./CardNav";
import { BookOpen, Layers, Users, ClipboardList, LayoutDashboard } from "lucide-react";

// Approximate hex values for our OKLCH theme tokens
const COACH = {
  base: "#211B11",     // dark-base
  menu: "#EDE6D6",     // chalk
  card1: "#2B2216",    // dark-surface
  card2: "#332A1C",
  card3: "#3B3020",
};

const STUDENT = {
  base: "#EDE6D6",     // washi
  menu: "#211B11",     // ink
  card1: "#211B11",    // dark-base
};

const Navbar = () => {
  const { user, signout } = useAuth();

  const logoHref =
    user?.role === "coach"
      ? "/coach/dashboard"
      : user?.role === "student"
        ? "/student/dashboard"
        : "/";

  const isCoach = user?.role === "coach";
  const isStudent = user?.role === "student";
  const colors = isCoach ? COACH : STUDENT;

  const coachItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      bgColor: COACH.card1,
      textColor: COACH.menu,
      links: [
        { label: "Dashboard", href: "/coach/dashboard", ariaLabel: "Dashboard" },
      ],
    },
    {
      label: "Lessons",
      icon: BookOpen,
      bgColor: COACH.card1,
      textColor: COACH.menu,
      links: [
        { label: "All Lessons", href: "/coach/lessons", ariaLabel: "All Lessons" },
        { label: "Create Lesson", href: "/coach/lessons/create", ariaLabel: "Create Lesson" },
      ],
    },
    {
      label: "Modules",
      icon: Layers,
      bgColor: COACH.card2,
      textColor: COACH.menu,
      links: [
        { label: "All Modules", href: "/coach/modules", ariaLabel: "All Modules" },
        { label: "Create Module", href: "/coach/modules/create", ariaLabel: "Create Module" },
      ],
    },
    {
      label: "Students",
      icon: Users,
      bgColor: COACH.card3,
      textColor: COACH.menu,
      links: [
        { label: "My Students", href: "/coach/assignments", ariaLabel: "My Students" },
        { label: "Assign Module", href: "/coach/assignments/create", ariaLabel: "Assign Module" },
      ],
    },
  ];

  const studentItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      bgColor: STUDENT.card1,
      textColor: STUDENT.base,
      links: [
        { label: "Dashboard", href: "/student/dashboard", ariaLabel: "Dashboard" },
      ],
    },
    {
      label: "Assignments",
      icon: ClipboardList,
      bgColor: STUDENT.card1,
      textColor: STUDENT.base,
      links: [
        { label: "My Assignments", href: "/student/assignments", ariaLabel: "My Assignments" },
      ],
    },
  ];

  const items = isCoach ? coachItems : isStudent ? studentItems : [];

  function handleSignout() {
    signout();
    window.location.href = "/";
  }

  const cta = user ? (
    <Button variant="outline" size="sm" onClick={handleSignout}>
      Sign out
    </Button>
  ) : (
    <>
      <Link to="/signin">
        <Button variant="ghost" size="sm">Sign in</Button>
      </Link>
      <Link to="/signup">
        <Button size="sm">Sign up</Button>
      </Link>
    </>
  );

  const logoSrc = isCoach ? logoDarkmode : logoDefault;

  return (
    <CardNav
      logoSrc={logoSrc}
      logoHref={logoHref}
      items={items}
      baseColor={colors.base}
      menuColor={colors.menu}
      cta={cta}
      contentMaxWidth="max-w-3xl"
    />
  );
};

export default Navbar;
