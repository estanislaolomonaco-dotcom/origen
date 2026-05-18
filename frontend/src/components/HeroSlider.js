"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "./HeroSlider.module.css";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1600&q=80&auto=format&fit=crop",
    kicker: "Guitarras eléctricas",
    title: "Donde nace\ntu sonido",
    subtitle:
      "Stratocasters, Les Pauls y más. Instrumentos seleccionados para todos los niveles, con setup profesional incluido.",
    cta: { label: "Ver eléctricas", href: "/productos?categoria=Electricas" },
    ctaSecondary: { label: "Ver todo", href: "/productos" },
    accent: "#c0832a",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=1600&q=80&auto=format&fit=crop",
    kicker: "Guitarras acústicas",
    title: "Sonido natural,\nsentimiento puro",
    subtitle:
      "Desde la folk más íntima hasta la dreadnought más potente. Maderas seleccionadas, proyección excepcional.",
    cta: { label: "Ver acústicas", href: "/productos?categoria=Acusticas" },
    ctaSecondary: { label: "Conocer más", href: "#beneficios" },
    accent: "#2d6a4f",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=1600&q=80&auto=format&fit=crop",
    kicker: "Bajos eléctricos",
    title: "La base\nque mueve todo",
    subtitle:
      "Jazz Bass, Precision Bass y modelos modernos. El instrumento que define el groove de cada canción.",
    cta: { label: "Ver bajos", href: "/productos?categoria=Bajos" },
    ctaSecondary: { label: "Ver catálogo", href: "/productos" },
    accent: "#7c3aed",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80&auto=format&fit=crop",
    kicker: "Envío a todo el país",
    title: "Tu instrumento,\ndonde estés",
    subtitle:
      "Despachamos en 24/48 horas con embalaje reforzado. Garantía oficial y soporte técnico en cada compra.",
    cta: { label: "Ver catálogo", href: "/productos" },
    ctaSecondary: { label: "Cómo compramos", href: "#beneficios" },
    accent: "#c0832a",
  },
];

const AUTOPLAY_MS = 5500;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animDir, setAnimDir] = useState("next");

  const goTo = useCallback((index, dir = "next") => {
    setAnimDir(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length, "next");
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length, "prev");
  }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Slider principal"
    >
      {/* Background images — all preloaded, only current visible */}
      {slides.map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.id}
          src={s.image}
          alt=""
          aria-hidden="true"
          className={`${styles.bg} ${i === current ? styles.bgActive : ""}`}
        />
      ))}

      {/* Dark overlay */}
      <div className={styles.overlay} />

      {/* Content */}
      <div className={`container ${styles.content}`}>
        <div
          className={`${styles.textBlock} ${styles[`anim_${animDir}`]}`}
          key={current}
        >
          <span className={styles.kicker}>{slide.kicker}</span>
          <h1 className={styles.title}>
            {slide.title.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < slide.title.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className={styles.subtitle}>{slide.subtitle}</p>
          <div className={styles.actions}>
            <Link
              href={slide.cta.href}
              className={`btn ${styles.ctaBtn}`}
              style={{ background: slide.accent }}
            >
              {slide.cta.label}
            </Link>
            <Link href={slide.ctaSecondary.href} className={`btn ${styles.ctaOutline}`}>
              {slide.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        className={`${styles.arrow} ${styles.arrowPrev}`}
        onClick={prev}
        aria-label="Anterior"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        className={`${styles.arrow} ${styles.arrowNext}`}
        onClick={next}
        aria-label="Siguiente"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dots */}
      <div className={styles.dots} role="tablist">
        {slides.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Ir al slide ${i + 1}`}
            className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
            onClick={() => goTo(i, i > current ? "next" : "prev")}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className={styles.progressBar} key={current}>
          <div className={styles.progressFill} style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
        </div>
      )}
    </section>
  );
}
