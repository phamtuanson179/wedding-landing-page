"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller } from "@/lib/scroll/cornerNav";

gsap.registerPlugin(ScrollTrigger);

type Person = {
  role: string;
  fullName: string;
  nickname: string;
  quote: string;
  facts: string[];
  image: string;
  imagePosition: string;
};

const GROOM: Person = {
  role: "Chú rể",
  fullName: "Phạm Tuấn Sơn",
  nickname: "Sơn",
  quote:
    "Mười năm không dài, nhưng đủ để biết bản thân muốn che chở cho một người đến hết đời.",
  facts: ["Thích chụp ảnh film", "Calisthenics"],
  image:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
  imagePosition: "object-[center_20%]",
};

const BRIDE: Person = {
  role: "Cô dâu",
  fullName: "Nguyễn Thị Thùy Linh",
  nickname: "Linh",
  quote:
    "Cảm ơn vì đã luôn là chỗ dựa bình yên và dịu dàng nhất sau mọi bão giông.",
  facts: ["Thích cắm hoa", "Du lịch"],
  image:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  imagePosition: "object-[center_18%]",
};

const CONTENT_INSET_X = "px-6 md:px-16 lg:px-24";

const MASK_HIDDEN = "inset(100% 0% 0% 0%)";
const MASK_VISIBLE = "inset(0% 0% 0% 0%)";

function PortraitCard({ person }: { person: Person }) {
  const cardRef = useRef<HTMLElement>(null);

  const handleHoverStart = () => {
    const card = cardRef.current;
    const image = card?.querySelector<HTMLElement>("[data-intro-portrait]");
    if (!image) {
      return;
    }

    gsap.to(image, {
      scale: 1.04,
      duration: 0.6,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const handleHoverEnd = () => {
    const card = cardRef.current;
    const image = card?.querySelector<HTMLElement>("[data-intro-portrait]");
    if (!image) {
      return;
    }

    gsap.to(image, {
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
      overwrite: true,
    });
  };

  return (
    <article
      ref={cardRef}
      className="group flex h-full flex-col gap-3 md:gap-6"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onFocus={handleHoverStart}
      onBlur={handleHoverEnd}
    >
      <div className="relative mx-auto w-full max-w-[min(88vw,300px)] md:mx-0">
        <div
          data-intro-image-mask
          className="relative h-[min(30vh,220px)] overflow-hidden bg-foreground/5 sm:h-[min(34vh,260px)] md:aspect-3/4 md:h-auto"
        >
          <div
            data-intro-parallax
            className="relative h-[108%] w-full translate-y-[-4%]"
          >
            <Image
              data-intro-portrait
              src={person.image}
              alt={person.fullName}
              fill
              sizes="(max-width: 768px) 88vw, 340px"
              className={`origin-center object-cover ${person.imagePosition} saturate-[0.82] brightness-[0.96] will-change-transform`}
            />
          </div>
        </div>
      </div>

      <div data-intro-text-block className="min-h-0 max-w-sm md:max-w-none">
        <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/55 md:text-xs md:tracking-[0.32em]">
          {person.role}
        </p>
        <h3 className="mt-1.5 font-display text-[clamp(1.1rem,2.8vw,2.5rem)] leading-tight text-foreground md:mt-3">
          {person.fullName}
        </h3>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-primary md:mt-1 md:text-sm md:tracking-[0.22em]">
          ({person.nickname})
        </p>
        <blockquote
          data-intro-quote
          className="mt-3 line-clamp-3 border-l border-primary/35 pl-3 text-sm leading-relaxed text-foreground/82 transition-[color,border-color] duration-500 group-hover:border-primary group-hover:text-foreground md:mt-5 md:line-clamp-none md:pl-4 md:text-lg font-light italic"
        >
          &ldquo;{person.quote}&rdquo;
        </blockquote>
        <ul className="mt-3 hidden space-y-1 text-xs text-foreground/68 sm:block md:mt-5 md:space-y-2 md:text-sm">
          {person.facts.map((fact) => (
            <li key={fact} className="flex items-start gap-2">
              <span className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-primary/70" />
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function getColumnTargets(column: HTMLElement) {
  return {
    mask: column.querySelector<HTMLElement>("[data-intro-image-mask]"),
    portrait: column.querySelector<HTMLElement>("[data-intro-portrait]"),
    text: column.querySelector<HTMLElement>("[data-intro-text-block]"),
    parallax: column.querySelector<HTMLElement>("[data-intro-parallax]"),
  };
}

export function IntroductionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const groomColRef = useRef<HTMLDivElement>(null);
  const brideColRef = useRef<HTMLDivElement>(null);
  const ampersandRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const title = titleRef.current;
    const groomCol = groomColRef.current;
    const brideCol = brideColRef.current;
    const ampersand = ampersandRef.current;

    if (
      !section ||
      !header ||
      !title ||
      !groomCol ||
      !brideCol ||
      !ampersand
    ) {
      return;
    }

    const groom = getColumnTargets(groomCol);
    const bride = getColumnTargets(brideCol);

    if (
      !groom.mask ||
      !groom.portrait ||
      !groom.text ||
      !groom.parallax ||
      !bride.mask ||
      !bride.portrait ||
      !bride.text ||
      !bride.parallax
    ) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const scroller = getScroller();
    const scrollTriggers: ScrollTrigger[] = [];

    if (prefersReducedMotion) {
      return;
    }

    gsap.set(title, { y: 30, autoAlpha: 0 });
    gsap.set(ampersand, { autoAlpha: 0 });
    gsap.set(groom.mask, { clipPath: MASK_HIDDEN });
    gsap.set(groom.portrait, { scale: 1.1 });
    gsap.set(groom.text, { y: 20, autoAlpha: 0 });
    gsap.set(bride.mask, { clipPath: MASK_HIDDEN });
    gsap.set(bride.portrait, { scale: 1.1 });
    gsap.set(bride.text, { y: 20, autoAlpha: 0 });

    const entranceTween = gsap
      .timeline({
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
          scroller,
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      })
      .to(
        title,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
        },
        0,
      )
      .to(
        ampersand,
        {
          autoAlpha: 0.15,
          duration: 1.5,
          ease: "power2.out",
        },
        0,
      )
      .to(
        groom.mask,
        {
          clipPath: MASK_VISIBLE,
          duration: 1,
          ease: "power3.inOut",
        },
        0.45,
      )
      .to(
        groom.portrait,
        {
          scale: 1,
          duration: 1,
          ease: "power3.out",
        },
        0.45,
      )
      .to(
        groom.text,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power2.out",
        },
        1.65,
      )
      .to(
        bride.mask,
        {
          clipPath: MASK_VISIBLE,
          duration: 1,
          ease: "power3.inOut",
        },
        0.75,
      )
      .to(
        bride.portrait,
        {
          scale: 1,
          duration: 1,
          ease: "power3.out",
        },
        0.75,
      )
      .to(
        bride.text,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power2.out",
        },
        1.95,
      );

    if (entranceTween.scrollTrigger) {
      scrollTriggers.push(entranceTween.scrollTrigger);
    }

    const groomParallax = gsap.fromTo(
      groom.parallax,
      { y: -20 },
      {
        y: 20,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          scroller,
          invalidateOnRefresh: true,
        },
      },
    );

    const brideParallax = gsap.fromTo(
      bride.parallax,
      { y: 20 },
      {
        y: -20,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          scroller,
          invalidateOnRefresh: true,
        },
      },
    );

    if (groomParallax.scrollTrigger) {
      scrollTriggers.push(groomParallax.scrollTrigger);
    }
    if (brideParallax.scrollTrigger) {
      scrollTriggers.push(brideParallax.scrollTrigger);
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      entranceTween.kill();
      groomParallax.kill();
      brideParallax.kill();
      scrollTriggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      id="section-2"
      ref={sectionRef}
      className="relative flex h-screen min-h-screen items-center overflow-hidden bg-background text-foreground"
    >
      <div
        className={`relative mx-auto flex h-full w-full max-w-7xl flex-col justify-center py-8 md:py-10 ${CONTENT_INSET_X}`}
      >
        <header
          ref={headerRef}
          className="intro-header mb-5 shrink-0 text-center md:mb-8"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-foreground/60 md:text-xs md:tracking-[0.32em]">
            Giới thiệu
          </p>
          <h2
            ref={titleRef}
            className="mt-2 font-display text-[clamp(1.35rem,3.8vw,3rem)] leading-tight text-foreground md:mt-4"
          >
            Hai người, một hành trình
          </h2>
        </header>

        <div className="relative min-h-0 flex-1">
          <span
            ref={ampersandRef}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 translate-y-[-42%] select-none font-display text-[clamp(5rem,18vw,13rem)] italic leading-none text-primary opacity-0"
          >
            &
          </span>

          <div className="relative z-10 grid h-full min-h-0 grid-cols-2 items-center gap-3 md:gap-12 lg:gap-16">
            <div
              ref={groomColRef}
              data-intro-column="groom"
              className="md:-mt-6 lg:-mt-8"
            >
              <PortraitCard person={GROOM} />
            </div>

            <div
              ref={brideColRef}
              data-intro-column="bride"
              className="md:mt-6 lg:mt-8"
            >
              <PortraitCard person={BRIDE} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
