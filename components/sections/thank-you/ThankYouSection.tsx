"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, isMobileViewport, setFinaleChrome } from "@/lib/scroll/cornerNav";

gsap.registerPlugin(ScrollTrigger);

type PersonKey = "groom" | "bride";

type BankAccount = {
  key: PersonKey;
  buttonLabel: string;
  holder: string;
  bank: string;
  accountNo: string;
  bankId: string;
};

const ACCOUNTS: BankAccount[] = [
  {
    key: "groom",
    buttonLabel: "Mừng cưới Sơn",
    holder: "PHAM TUAN SON",
    bank: "Vietcombank",
    bankId: "970436",
    accountNo: "0123456789",
  },
  {
    key: "bride",
    buttonLabel: "Mừng cưới Linh",
    holder: "NGUYEN THI THUY LINH",
    bank: "Techcombank",
    bankId: "970407",
    accountNo: "0987654321",
  },
];

const CONTENT_INSET = "px-6 md:px-14 lg:px-20 xl:px-24";

function getVietQrUrl(account: BankAccount) {
  const accountName = encodeURIComponent(account.holder);
  return `https://img.vietqr.io/image/${account.bankId}-${account.accountNo}-compact2.jpg?accountName=${accountName}`;
}

function getAccountByKey(key: PersonKey) {
  return ACCOUNTS.find((account) => account.key === key)!;
}

function remeasurePanelHeight(panel: HTMLElement) {
  gsap.set(panel, { height: "auto" });
  const targetHeight = panel.scrollHeight;
  gsap.set(panel, { height: targetHeight });
  return targetHeight;
}

function animatePanelHeight(
  panel: HTMLElement,
  open: boolean,
  onComplete?: () => void,
) {
  if (open) {
    gsap.set(panel, { height: "auto" });
    const targetHeight = panel.scrollHeight;
    gsap.set(panel, { height: 0 });

    return gsap.to(panel, {
      height: targetHeight,
      duration: 0.5,
      ease: "power2.out",
      onComplete: () => {
        gsap.set(panel, { height: "auto" });
        onComplete?.();
      },
    });
  }

  const currentHeight = panel.offsetHeight;
  gsap.set(panel, { height: currentHeight });

  return gsap.to(panel, {
    height: 0,
    duration: 0.4,
    ease: "power2.inOut",
    onComplete,
  });
}

function MagneticButton({
  label,
  active,
  onClick,
  buttonRef,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  buttonRef?: RefObject<HTMLButtonElement | null>;
}) {
  const localRef = useRef<HTMLButtonElement>(null);
  const ref = buttonRef ?? localRef;

  useLayoutEffect(() => {
    const button = ref.current;
    if (!button) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: offsetX * 0.18,
        y: offsetY * 0.18,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
      });
    };

    const handleLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
        overwrite: true,
      });
    };

    button.addEventListener("mousemove", handleMove);
    button.addEventListener("mouseleave", handleLeave);

    return () => {
      button.removeEventListener("mousemove", handleMove);
      button.removeEventListener("mouseleave", handleLeave);
    };
  }, [ref]);

  return (
    <button
      ref={ref}
      type='button'
      onClick={onClick}
      className={`w-full cursor-pointer border px-3 py-2.5 text-[10px] uppercase tracking-[0.18em] transition-[color,border-color,background-color] duration-300 sm:px-4 sm:py-3 sm:text-[11px] md:w-auto md:px-6 md:py-3.5 md:text-xs md:tracking-[0.2em] ${
        active
          ? "border-[#d4b87a] bg-background/14 text-background"
          : "border-background/50 text-background/88 hover:border-background hover:bg-background/8 hover:text-background"
      }`}
    >
      {label}
    </button>
  );
}

function QrPanel({ account }: { account: BankAccount }) {
  const [copied, setCopied] = useState(false);

  const copyAccountNo = async () => {
    try {
      await navigator.clipboard.writeText(account.accountNo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="qr-panel-inner mx-auto grid max-w-xl grid-cols-1 gap-4 py-4 md:grid-cols-[minmax(0,200px)_1fr] md:items-center md:gap-8 md:py-8">
      <div className="mx-auto w-full max-w-[148px] md:max-w-[200px]">
        <div className="overflow-hidden rounded-lg border border-background/25 bg-white p-2 md:rounded-xl md:p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getVietQrUrl(account)}
            alt={`Mã QR mừng cưới ${account.holder}`}
            className='aspect-square w-full rounded-lg object-contain'
            loading='lazy'
          />
        </div>
      </div>

      <div className="space-y-3 text-center md:space-y-5 md:text-left">
        <div>
          <p className="text-[9px] uppercase tracking-[0.22em] text-background/55 md:text-[10px] md:tracking-[0.24em]">
            Tên ngân hàng
          </p>
          <p className="mt-1 text-sm text-background/92 md:mt-1.5 md:text-base">
            {account.bank}
          </p>
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.22em] text-background/55 md:text-[10px] md:tracking-[0.24em]">
            Số tài khoản
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 md:mt-1.5 md:justify-start md:gap-x-3 md:gap-y-2">
            <p className="font-mono text-sm tracking-[0.1em] text-background md:text-lg md:tracking-[0.12em]">
              {account.accountNo}
            </p>
            <button
              type="button"
              onClick={copyAccountNo}
              aria-live="polite"
              className={`cursor-pointer border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.16em] transition-colors md:px-3 md:py-1 md:text-[10px] md:tracking-[0.18em] ${
                copied
                  ? "border-[#f5c842] bg-[#f5c842] text-primary"
                  : "border-background/45 text-[#d4b87a] hover:border-[#d4b87a] hover:text-background"
              }`}
            >
              {copied ? "Đã sao chép" : "Sao chép"}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.22em] text-background/55 md:text-[10px] md:tracking-[0.24em]">
            Chủ tài khoản
          </p>
          <p className="mt-1 font-display text-base text-background md:mt-1.5 md:text-xl">
            {account.holder}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ThankYouSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelTweenRef = useRef<gsap.core.Tween | null>(null);
  const contentTweenRef = useRef<gsap.core.Timeline | null>(null);

  const [activeKey, setActiveKey] = useState<PersonKey | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const scroller = getScroller();
    const chromeTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top 50%",
      end: "bottom top",
      scroller,
      invalidateOnRefresh: true,
      onEnter: () => setFinaleChrome(true),
      onEnterBack: () => setFinaleChrome(true),
      onLeaveBack: () => setFinaleChrome(false),
    });

    return () => {
      chromeTrigger.kill();
      setFinaleChrome(false);
    };
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const message = messageRef.current;
    const buttons = buttonsRef.current;

    if (!section || !title || !message || !buttons) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const scroller = getScroller();

    gsap.set([title, message, buttons], { y: 40, autoAlpha: 0 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 72%",
        scroller,
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });

    timeline
      .to([title, message], {
        y: 0,
        autoAlpha: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.12,
      })
      .to(
        buttons,
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power3.out",
        },
        0.4,
      );

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, []);

  const animateContentIn = useCallback(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    contentTweenRef.current?.kill();
    contentTweenRef.current = gsap.timeline().fromTo(
      content,
      { autoAlpha: 0, scale: 0.9 },
      {
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      },
    );
  }, []);

  const animateContentSwap = useCallback((nextKey: PersonKey) => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!content || !panel) {
      setActiveKey(nextKey);
      return;
    }

    contentTweenRef.current?.kill();
    panelTweenRef.current?.kill();

    contentTweenRef.current = gsap.timeline().to(content, {
      autoAlpha: 0,
      scale: 0.95,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        setActiveKey(nextKey);
        requestAnimationFrame(() => {
          const nextHeight = remeasurePanelHeight(panel);
          panelTweenRef.current = gsap.to(panel, {
            height: nextHeight,
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => gsap.set(panel, { height: "auto" }),
          });

          gsap.fromTo(
            content,
            { autoAlpha: 0, scale: 0.9 },
            {
              autoAlpha: 1,
              scale: 1,
              duration: 0.45,
              ease: "power2.out",
            },
          );
        });
      },
    });
  }, []);

  const handleSelect = (key: PersonKey) => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    panelTweenRef.current?.kill();
    contentTweenRef.current?.kill();

    const isMobile = isMobileViewport();

    if (activeKey === key) {
      const content = contentRef.current;

      if (content) {
        gsap.to(content, {
          autoAlpha: 0,
          scale: 0.95,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            panelTweenRef.current = animatePanelHeight(panel, false, () => {
              setActiveKey(null);
              ScrollTrigger.refresh();
            });
          },
        });
      } else {
        panelTweenRef.current = animatePanelHeight(panel, false, () => {
          setActiveKey(null);
          ScrollTrigger.refresh();
        });
      }
      return;
    }

    if (activeKey === null) {
      setActiveKey(key);
      requestAnimationFrame(() => {
        panelTweenRef.current = animatePanelHeight(panel, true, () => {
          animateContentIn();
          ScrollTrigger.refresh();
        });

        if (!isMobile) {
          panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
      return;
    }

    animateContentSwap(key);
  };

  const activeAccount = activeKey ? getAccountByKey(activeKey) : null;

  return (
    <section
      id="section-6"
      ref={sectionRef}
      className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-primary text-background md:h-dvh md:overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black/20"
        aria-hidden
      />

      <div
        ref={stageRef}
        className={`relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col items-center justify-center pt-6 pb-[calc(1.5rem+var(--section-nav-height,0px))] text-center md:h-full md:pt-8 md:pb-[calc(2.5rem+var(--section-nav-height,0px))] ${CONTENT_INSET}`}
      >
        <div className="w-full max-w-3xl shrink-0">
          <header className="w-full">
            <p className="text-[9px] uppercase tracking-[0.32em] text-[#d4b87a] md:text-xs md:tracking-[0.36em]">
              Thank You
            </p>
            <h2
              ref={titleRef}
              className="mt-2 font-display text-[clamp(1.75rem,7.5vw,4rem)] leading-tight text-background md:mt-4"
            >
              Trân trọng cảm ơn
            </h2>
            <p
              ref={messageRef}
              className="mt-3 text-xs leading-relaxed text-background/78 md:mt-5 md:text-base md:leading-7 font-light"
            >
              Việc có mặt của mọi người chính là niềm vui lớn nhất của cô dâu
              chú rể. Chúng mình rất mong được đón bạn đến chung vui và gửi
              lời chúc phúc trong ngày trọng đại này.
            </p>
          </header>

          <div className="mt-6 w-full md:mt-14">
            <div
              ref={buttonsRef}
              className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-4"
            >
              {ACCOUNTS.map((account) => (
                <MagneticButton
                  key={account.key}
                  label={account.buttonLabel}
                  active={activeKey === account.key}
                  onClick={() => handleSelect(account.key)}
                />
              ))}
            </div>
          </div>

          <div
            ref={panelRef}
            data-qr-content-wrapper
            className={`qr-content-wrapper w-full overflow-hidden ${
              activeKey ? "mt-4 md:mt-0" : ""
            }`}
            style={{ height: 0 }}
          >
            <div ref={contentRef} className="qr-content-panel w-full">
              {activeAccount ? (
                <QrPanel key={activeAccount.key} account={activeAccount} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
