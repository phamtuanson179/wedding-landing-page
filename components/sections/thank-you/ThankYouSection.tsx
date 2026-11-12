"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getScroller, setFinaleChrome } from "@/lib/scroll/cornerNav";
import {
  getWeddingData,
  type BankInfo,
  type WeddingRole,
} from "@/lib/constants/wedding-data";

gsap.registerPlugin(ScrollTrigger);

const CONTENT_INSET = "px-6 md:px-14 lg:px-20 xl:px-24";

function getQrImageSrc(account: BankInfo) {
  if (account.qrImage) {
    return account.qrImage;
  }
  const accountName = encodeURIComponent(account.holder);
  return `https://img.vietqr.io/image/${account.bankId}-${account.accountNo}-compact2.jpg?accountName=${accountName}`;
}

function QrPanel({ account }: { account: BankInfo }) {
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
            src={getQrImageSrc(account)}
            alt={`Mã QR mừng cưới ${account.holder}`}
            className="aspect-square w-full rounded-lg object-contain"
            loading="lazy"
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
              className={`cursor-pointer border px-2.5 py-0.5 text-[9px] uppercase tracking-[0.16em] transition-colors md:px-3 md:py-1 md:text-[10px] md:tracking-[0.18em] ${copied
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

function GiftQrModal({
  open,
  account,
  onClose,
}: {
  open: boolean;
  account: BankInfo;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) {
      onClose();
      return;
    }

    gsap
      .timeline({ onComplete: onClose })
      .to(panel, {
        autoAlpha: 0,
        y: 16,
        scale: 0.98,
        duration: 0.22,
        ease: "power2.in",
      })
      .to(
        backdrop,
        { autoAlpha: 0, duration: 0.18, ease: "power2.in" },
        "-=0.1",
      );
  }, [onClose]);

  useLayoutEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    gsap.set(backdrop, { autoAlpha: 0 });
    gsap.set(panel, { autoAlpha: 0, y: 20, scale: 0.98 });

    const tween = gsap.timeline();
    tween.to(backdrop, {
      autoAlpha: 1,
      duration: prefersReducedMotion ? 0.15 : 0.3,
      ease: "power2.out",
    });
    tween.to(
      panel,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: prefersReducedMotion ? 0.2 : 0.45,
        ease: "power3.out",
      },
      "-=0.1",
    );

    return () => {
      tween.kill();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, handleClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={account.label}
    >
      <button
        ref={backdropRef}
        type="button"
        aria-label="Đóng hộp mừng cưới"
        onClick={handleClose}
        className="absolute inset-0 cursor-pointer bg-black/75 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        className="relative z-10 max-h-[88dvh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#d4b87a]/35 bg-primary text-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-background/15 px-5 py-3.5 md:px-7 md:py-4">
          <div className="min-w-0 pr-4">
            <p className="text-[9px] uppercase tracking-[0.28em] text-[#d4b87a]">
              Wedding Gift
            </p>
            <p className="mt-0.5 truncate font-display text-base text-background md:text-lg">
              {account.label}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer whitespace-nowrap border border-background/30 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-background/85 transition-colors hover:border-[#d4b87a] hover:text-background"
          >
            Đóng
          </button>
        </div>

        <div className="px-5 py-2 md:px-7 md:py-1">
          <QrPanel account={account} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ThankYouSection({ role = "his" }: { role?: WeddingRole }) {
  const weddingData = getWeddingData(role);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [isQrOpen, setIsQrOpen] = useState(false);

  const account = weddingData.bank;

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
    const panel = panelRef.current;

    if (!section || !title || !message || !panel) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const scroller = getScroller();

    gsap.set([title, message, panel], { y: 40, autoAlpha: 0 });

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
        panel,
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

  return (
    <>
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
                className="mt-3 text-xs leading-relaxed font-light text-background/78 md:mt-5 md:text-base md:leading-7"
              >
                Sự có mặt của quý khách là niềm hạnh phúc nhất của gia đình chúng mình. Chúng mình rất mong được đón bạn đến chung vui và gửi
                lời chúc phúc trong ngày trọng đại này.
              </p>
            </header>

            <div ref={panelRef} className="mt-5 w-full md:mt-6">
              <button
                type="button"
                onClick={() => setIsQrOpen(true)}
                className="cursor-pointer group inline-flex items-center gap-1.5 border border-[#d4b87a] bg-[#d4b87a] px-3.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors duration-300 hover:border-[#dfc58d] hover:bg-[#dfc58d] md:px-4 md:py-1.5 md:text-[10px]"
              >
                <span>{account.label}</span>
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <GiftQrModal
        open={isQrOpen}
        account={account}
        onClose={() => setIsQrOpen(false)}
      />
    </>
  );
}
