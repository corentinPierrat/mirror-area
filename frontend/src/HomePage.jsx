import React from "react";
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import HowItWorks from './components/HowItWorks';
import styles from "./styles/HomePage.module.css";

function HomePage() {
  return (
    <>
      <main>
        <div className={styles.container}>
          <Hero />
          <HowItWorks />
          <HowItWorks />
          <HowItWorks />
          <Footer />
        </div>
      </main>
    </>
  );
}

export default HomePage;

