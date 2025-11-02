import React, { useEffect, useState } from "react";
import styles from "../styles/Hero.module.css";

export default function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    fetch("/arrow.svg")
      .then((res) => res.text())
      .then((text) => setSvgContent(text));
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const y = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(y);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const easeProgress = (scrollY / 200) ** 1.2; 
  const progress = Math.min(easeProgress, 1);

  const startHeight = 460;
  const endHeight = 70;
  const currentHeight = startHeight - (startHeight - endHeight) * progress;

  const startRadius = 40;
  const endRadius = 20;
  const currentRadius = startRadius - (startRadius - endRadius) * progress;

  const startPadding = 40;
  const endPadding = 10;
  const currentPadding = startPadding - (startPadding - endPadding) * progress;

  return (
    <section
      className={styles["hero-section"]}
      style={{
        height: `${currentHeight}px`,
        borderRadius: `${currentRadius}px ${currentRadius}px ${currentRadius / 2}px ${currentRadius / 2}px`,
        padding: `${currentPadding}px 20px 20px`,
      }}
    >
      <div
        className={styles["hero-main"]}
        style={{
          opacity: 1 - progress,
          transform: `translateY(${-progress * 120}px)`,
        }}
      >
        <div
          className={styles["hero-content"]}
          style={{
            transform: `translateY(${-progress * 40}px)`,
            opacity: 1 - progress * 1.2,
          }}
        >
          <h1 className={styles["hero-title"]}>
            Create automations
            <br />
            Actions—Reactions
          </h1>
          <p className={styles["hero-subtitle"]}>
            Connect different applications together and automate workflows.
          </p>
          <button className={styles["hero-button"]}>Get Started</button>
        </div>

        <div
          className={styles["hero-arrow"]}
          style={{
            transform: `translateY(${300 - progress * 50}px)`,
            opacity: 1 - progress * 0.5,
          }}
        >
          {svgContent && (
            <span
              dangerouslySetInnerHTML={{
                __html: svgContent.replace(
                  /strokeDashoffset="[^"]*"/g,
                  `stroke-dasharray="200" stroke-dashoffset="${200 - 200 * progress}"`
                ),
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
