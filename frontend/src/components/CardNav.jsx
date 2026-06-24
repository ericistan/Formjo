import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";

const CardNav = ({
  logoText = "Formjo",
  logoHref = "/",
  items = [],
  className = "",
  ease = "power3.out",
  baseColor = "#fff",
  menuColor,
  cta,
  contentMaxWidth = "max-w-3xl",
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);

  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      const contentEl = navEl.querySelector(".card-nav-content");
      if (contentEl) {
        const prev = {
          visibility: contentEl.style.visibility,
          pointerEvents: contentEl.style.pointerEvents,
          position: contentEl.style.position,
          height: contentEl.style.height,
        };
        Object.assign(contentEl.style, {
          visibility: "visible",
          pointerEvents: "auto",
          position: "static",
          height: "auto",
        });
        contentEl.offsetHeight;
        const total = 60 + contentEl.scrollHeight + 16;
        Object.assign(contentEl.style, prev);
        return total;
      }
    }
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    gsap.set(navEl, { height: 60, overflow: "hidden" });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease });
    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
      "-=0.1",
    );
    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;
      if (isExpanded) {
        gsap.set(navRef.current, { height: calculateHeight() });
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) { newTl.progress(1); tlRef.current = newTl; }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) tlRef.current = newTl;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isExpanded]);

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const closeMenu = () => {
    if (!isExpanded) return;
    setIsHamburgerOpen(false);
    tlRef.current?.eventCallback("onReverseComplete", () => setIsExpanded(false));
    tlRef.current?.reverse();
  };

  const setCardRef = (i) => (el) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`relative w-full z-50 ${className}`}>
      <nav
        ref={navRef}
        className="block h-[60px] p-0 rounded-none shadow-none relative overflow-hidden will-change-[height] border-b border-border"
        style={{ backgroundColor: baseColor }}
      >
        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 h-[60px] flex items-center px-4 z-[2]">
          <div className={`${contentMaxWidth} mx-auto w-full flex items-center justify-between`}>
            {/* Left: logo + desktop nav links */}
            <div className="flex items-center">
              <Link
                to={logoHref}
                onClick={closeMenu}
                className="font-display text-xl"
                style={{ color: menuColor }}
              >
                {logoText}
              </Link>
              <div className="hidden md:flex items-center gap-1 ml-6">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.links?.[0]?.href ?? "#"}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm transition-opacity hover:opacity-70"
                      style={{ color: menuColor }}
                    >
                      {Icon && <Icon size={14} />}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: CTA (always desktop) + hamburger (mobile, only when items exist) */}
            <div className="flex items-center gap-2">
              <div className={items.length > 0 ? "hidden md:flex items-center gap-2" : "flex items-center gap-2"}>
                {cta}
              </div>
              {items.length > 0 && (
                <div
                  className="flex md:hidden flex-col items-center justify-center cursor-pointer gap-[6px]"
                  onClick={toggleMenu}
                  role="button"
                  aria-label={isExpanded ? "Close menu" : "Open menu"}
                  tabIndex={0}
                  style={{ color: menuColor }}
                >
                  <div
                    className={`w-[24px] h-[2px] bg-current transition-[transform,opacity] duration-300 ease-linear origin-center ${
                      isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""
                    }`}
                  />
                  <div
                    className={`w-[24px] h-[2px] bg-current transition-[transform,opacity] duration-300 ease-linear origin-center ${
                      isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expandable card content — mobile */}
        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col gap-2 z-[1] md:hidden ${
            isExpanded ? "visible pointer-events-auto" : "invisible pointer-events-none"
          }`}
          aria-hidden={!isExpanded}
        >
          {items.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              ref={setCardRef(idx)}
              className="flex flex-col gap-2 p-[12px_16px] rounded-[calc(0.75rem-0.2rem)] min-h-[60px]"
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="font-display text-[20px] flex items-center gap-2">
                {item.icon && <item.icon size={18} />}
                {item.label}
              </div>
              <div className="flex flex-col gap-[2px]">
                {item.links?.map((link, i) => (
                  <Link
                    key={i}
                    to={link.href}
                    onClick={closeMenu}
                    aria-label={link.ariaLabel}
                    className="inline-flex items-center gap-[6px] no-underline text-[15px] transition-opacity hover:opacity-75"
                  >
                    <GoArrowUpRight className="shrink-0" aria-hidden="true" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Mobile CTA */}
          <div className="p-2 flex flex-col gap-2" ref={setCardRef(items.length)}>
            {cta}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
