"use client";

import { useEffect } from "react";

/**
 * Marketing-site client interactions:
 *  - mobile menu toggle (data-mkt-menu-toggle / data-mkt-mobile-menu)
 *  - scroll reveals (.reveal → .reveal.visible via IntersectionObserver)
 *  - FAQ accordion (.faq-item .faq-question)
 *  - smooth-scroll voor anchor links
 *  - count-up animations op elementen met class="count-up" + data-target
 *  - nav scroll shadow op .mkt-nav
 *
 * Eén centraal effect, geen externe state. Veilig om op meerdere pagina's te
 * mounten — alle event listeners worden netjes opgeruimd.
 */
export default function MarketingScripts() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    // Mobile menu
    const menuToggle = document.querySelector<HTMLButtonElement>(
      "[data-mkt-menu-toggle]"
    );
    const mobileMenu = document.querySelector<HTMLDivElement>(
      "[data-mkt-mobile-menu]"
    );
    if (menuToggle && mobileMenu) {
      const onToggle = () => {
        const isOpen = mobileMenu.classList.toggle("open");
        menuToggle.classList.toggle("open", isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "";
      };
      menuToggle.addEventListener("click", onToggle);

      const closeOnLink = () => {
        mobileMenu.classList.remove("open");
        menuToggle.classList.remove("open");
        document.body.style.overflow = "";
      };
      const links = mobileMenu.querySelectorAll("a");
      links.forEach((l) => l.addEventListener("click", closeOnLink));
      cleanups.push(() => {
        menuToggle.removeEventListener("click", onToggle);
        links.forEach((l) => l.removeEventListener("click", closeOnLink));
      });
    }

    // Scroll reveals
    const reveals = document.querySelectorAll<HTMLElement>(".reveal");
    if (reveals.length && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: "0px 0px -10% 0px" }
      );
      reveals.forEach((el) => observer.observe(el));

      // Failsafe: alles in initial viewport reveals na korte vertraging
      const failsafe = setTimeout(() => {
        reveals.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight) el.classList.add("visible");
        });
      }, 200);

      cleanups.push(() => {
        observer.disconnect();
        clearTimeout(failsafe);
      });
    } else {
      reveals.forEach((el) => el.classList.add("visible"));
    }

    // FAQ accordion
    const faqItems = document.querySelectorAll<HTMLElement>(".faq-item");
    const faqHandlers: Array<{
      item: HTMLElement;
      question: HTMLElement;
      handler: () => void;
    }> = [];
    faqItems.forEach((item) => {
      const question = item.querySelector<HTMLElement>(".faq-question");
      if (!question) return;
      const handler = () => {
        const isOpen = item.classList.contains("open");
        faqItems.forEach((i) => i.classList.remove("open"));
        if (!isOpen) item.classList.add("open");
      };
      question.addEventListener("click", handler);
      faqHandlers.push({ item, question, handler });
    });
    cleanups.push(() => {
      faqHandlers.forEach((h) =>
        h.question.removeEventListener("click", h.handler)
      );
    });

    // Smooth scroll voor anchor links (interne #)
    const anchorLinks = document.querySelectorAll<HTMLAnchorElement>(
      'a[href^="#"]'
    );
    const anchorHandlers: Array<{
      link: HTMLAnchorElement;
      handler: (e: Event) => void;
    }> = [];
    anchorLinks.forEach((link) => {
      const handler = (e: Event) => {
        const href = link.getAttribute("href");
        if (!href || href.length <= 1) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top =
          target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: "smooth" });
      };
      link.addEventListener("click", handler);
      anchorHandlers.push({ link, handler });
    });
    cleanups.push(() => {
      anchorHandlers.forEach((h) =>
        h.link.removeEventListener("click", h.handler)
      );
    });

    // Count-up animations
    const counters = document.querySelectorAll<HTMLElement>(".count-up");
    if (counters.length && "IntersectionObserver" in window) {
      const animate = (el: HTMLElement) => {
        const target = parseFloat(el.dataset.target ?? el.textContent ?? "0");
        const decimals = el.dataset.decimals
          ? parseInt(el.dataset.decimals, 10)
          : target % 1 !== 0
            ? 1
            : 0;
        const prefix = el.dataset.prefix ?? "";
        const suffix = el.dataset.suffix ?? "";
        const duration = 1800;
        const startTime = performance.now();
        const fmt = (n: number) =>
          decimals > 0
            ? n.toFixed(decimals).replace(".", ",")
            : Math.round(n).toLocaleString("nl-NL");
        const update = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = prefix + fmt(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = prefix + fmt(target) + suffix;
        };
        requestAnimationFrame(update);
      };
      const counterObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animate(entry.target as HTMLElement);
              counterObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      counters.forEach((el) => counterObs.observe(el));
      cleanups.push(() => counterObs.disconnect());
    }

    // Nav scroll shadow
    const nav = document.querySelector<HTMLElement>(".mkt-nav");
    if (nav) {
      const onScroll = () => {
        nav.style.boxShadow =
          window.pageYOffset > 20 ? "0 1px 0 rgba(0,0,0,0.05)" : "none";
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    return () => {
      cleanups.forEach((fn) => fn());
      document.body.style.overflow = "";
    };
  }, []);

  return null;
}
