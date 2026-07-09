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
import { getScroller, setFinaleChrome } from "./cornerNav";

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

const CONTENT_INSET = "px-6 md:px-14 lg:px-20";

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
      className={`cursor-pointer border px-4 py-3 text-[11px] uppercase tracking-[0.2em] transition-[color,border-color,background-color] duration-300 md:px-6 md:py-3.5 md:text-xs ${
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
    <div className='qr-panel-inner mx-auto grid max-w-xl grid-cols-1 gap-6 py-8 md:grid-cols-[minmax(0,200px)_1fr] md:items-center md:gap-10 md:py-10'>
      <div className='mx-auto w-full max-w-[200px]'>
        <div className='overflow-hidden rounded-xl border border-background/25 bg-white p-2.5 shadow-[0_16px_48px_rgba(0,0,0,0.22)]'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getVietQrUrl(account)}
            alt={`Mã QR mừng cưới ${account.holder}`}
            className='aspect-square w-full rounded-lg object-contain'
            loading='lazy'
          />
        </div>
      </div>

      <div className='space-y-5 text-center md:text-left'>
        <div>
          <p className='text-[10px] uppercase tracking-[0.24em] text-background/55'>
            Tên ngân hàng
          </p>
          <p className='mt-1.5 text-sm text-background/92 md:text-base'>
            {account.bank}
          </p>
        </div>

        <div>
          <p className='text-[10px] uppercase tracking-[0.24em] text-background/55'>
            Số tài khoản
          </p>
          <div className='mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:justify-start'>
            <p className='font-mono text-base tracking-[0.12em] text-background md:text-lg'>
              {account.accountNo}
            </p>
            <button
              type='button'
              onClick={copyAccountNo}
              aria-live='polite'
              className='cursor-pointer border border-background/45 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#d4b87a] transition-colors hover:border-[#d4b87a] hover:text-background'
            >
              {copied ? "Đã sao chép" : "Sao chép"}
            </button>
          </div>
        </div>

        <div>
          <p className='text-[10px] uppercase tracking-[0.24em] text-background/55'>
            Chủ tài khoản
          </p>
          <p className='mt-1.5 font-display text-lg text-background md:text-xl'>
            {account.holder}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ThankYouSection() {
  const sectionRef = useRef<HTMLElement>(null);
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
      start: "top bottom",
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
            });
          },
        });
      } else {
        panelTweenRef.current = animatePanelHeight(panel, false, () => {
          setActiveKey(null);
        });
      }
      return;
    }

    if (activeKey === null) {
      setActiveKey(key);
      requestAnimationFrame(() => {
        panelTweenRef.current = animatePanelHeight(
          panel,
          true,
          animateContentIn,
        );
      });
      return;
    }

    animateContentSwap(key);
  };

  const activeAccount = activeKey ? getAccountByKey(activeKey) : null;

  return (
    <section
      id='section-6'
      ref={sectionRef}
      className='relative flex h-screen min-h-screen flex-col overflow-hidden bg-primary text-background'
    >
      <div
        className='pointer-events-none absolute inset-0 bg-linear-to-b from-black/12 via-transparent to-black/24'
        aria-hidden
      />

      <div
        className={`relative z-10 mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center text-center ${CONTENT_INSET}`}
      >
        <header className='max-w-2xl'>
          <p className='text-[10px] uppercase tracking-[0.36em] text-[#d4b87a] md:text-xs'>
            Thank You
          </p>
          <h2
            ref={titleRef}
            className='mt-4 font-display text-[clamp(2rem,6vw,4rem)] leading-tight text-background'
          >
            Trân trọng cảm ơn
          </h2>
          <p
            ref={messageRef}
            className='mt-5 text-sm leading-relaxed text-background/78 md:mt-6 md:text-base md:leading-7 font-light'
          >
            Cảm ơn bạn đã dành thời gian đến chung vui và gửi những lời chúc
            phúc ý nghĩa đến chúng mình. Sự hiện diện của bạn là món quà quý giá
            nhất trong ngày trọng đại này.
          </p>
        </header>

        <div className='mt-10 w-full max-w-2xl md:mt-14'>
          <div
            ref={buttonsRef}
            className='flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4'
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

          <div
            ref={panelRef}
            data-qr-content-wrapper
            className='qr-content-wrapper overflow-hidden'
            style={{ height: 0 }}
          >
            <div ref={contentRef} className='qr-content-panel'>
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
