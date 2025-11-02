import React from "react";
import styles from "../styles/LiquidText.module.css";

export default function LiquidText() {
    const text = "TRIGGERS.".split("");

    return (
      <div className={styles.wrapper}>
        <h1 style={{ "--x": 6, "--y": -6}}>
          {text.map((letter, index) => (
            <span
              key={index}
              style={{ "--index": index, "--alpha-l": 0.125, "--alpha-u": 0.25 }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <h1 style={{ "--x": 3, "--y": -3 }}>
          {text.map((letter, index) => (
            <span
              key={index}
              style={{ "--index": index, "--alpha-l": 0.25, "--alpha-u": 0.5 }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <h1>
          {text.map((letter, index) => (
            <span
              key={index}
              style={{ "--index": index, "--alpha-l": 0.5, "--alpha-u": 1 }}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>
    );
}
