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
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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

    // 3D tilt op kaarten met [data-tilt]
    if (!reduceMotion) {
      const tiltEls = document.querySelectorAll<HTMLElement>("[data-tilt]");
      tiltEls.forEach((el) => {
        const max = parseFloat(el.dataset.tilt || "6");
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateX(${(-py * max).toFixed(
            2
          )}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
        };
        const onLeave = () => {
          el.style.transform = "";
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
        });
      });
    }

    // Magnetische knoppen met [data-magnetic]
    if (!reduceMotion) {
      const magnets = document.querySelectorAll<HTMLElement>("[data-magnetic]");
      magnets.forEach((el) => {
        const onMove = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left - r.width / 2) * 0.25;
          const y = (e.clientY - r.top - r.height / 2) * 0.35;
          el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        };
        const onLeave = () => {
          el.style.transform = "";
        };
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("mousemove", onMove);
          el.removeEventListener("mouseleave", onLeave);
        });
      });
    }

    // Parallax op [data-parallax] (snelheid via data-parallax="0.2")
    if (!reduceMotion) {
      const parEls = Array.from(
        document.querySelectorAll<HTMLElement>("[data-parallax]")
      );
      if (parEls.length) {
        let ticking = false;
        const apply = () => {
          const vh = window.innerHeight;
          parEls.forEach((el) => {
            const speed = parseFloat(el.dataset.parallax || "0.15");
            const r = el.getBoundingClientRect();
            const offset = r.top + r.height / 2 - vh / 2;
            el.style.transform = `translateY(${(-offset * speed).toFixed(1)}px)`;
          });
          ticking = false;
        };
        const onScroll = () => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(apply);
          }
        };
        apply();
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => window.removeEventListener("scroll", onScroll));
      }
    }

    // Live-feed rotator: marktplaats-activiteit die "binnenstroomt"
    const feed = document.querySelector<HTMLElement>("[data-live-feed]");
    if (feed && !reduceMotion) {
      const rotate = () => {
        const last = feed.lastElementChild as HTMLElement | null;
        if (!last) return;
        feed.prepend(last);
        last.classList.remove("feed-in");
        // force reflow zodat de animatie opnieuw triggert
        void last.offsetWidth;
        last.classList.add("feed-in");
      };
      const id = window.setInterval(rotate, 2600);
      cleanups.push(() => window.clearInterval(id));
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
