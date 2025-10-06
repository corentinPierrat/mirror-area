import React from "react";
import styles from "../styles/HowItWorks.module.css";

const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>;

const StepCard = ({ icon, title, description }) => {
  return (
    <div className={styles['step-card']}>
      <div className={styles['step-icon-wrapper']}>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default function HowItWorks() {
  return (
    <section className={styles['how-it-works-section']}>
      <h2 className={styles['how-it-works-title']}>How it works</h2>
      <p className={styles['how-it-works-subtitle']}>
        AREA helps you create powerful automated workflows in a few simple steps.
      </p>
      <div className={styles['steps-container']}>
        <StepCard
          icon={<PlusIcon />}
          title="1. Connect apps"
          description="Choose your applications and link them with AREA."
        />
        <StepCard
          icon={<SettingsIcon />}
          title="2. Set up actions"
          description="Select the triggers and actions for your automation."
        />
        <StepCard
          icon={<CheckIcon />}
          title="3. Activate"
          description="Enable your automated workflow and let it run."
        />
      </div>
    </section>
  );
}