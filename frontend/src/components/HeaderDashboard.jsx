import React from "react";
import styles from "../styles/HeaderDashboard.module.css";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LoginIcon from "@mui/icons-material/Login";
import BuildIcon from "@mui/icons-material/Build";
import PersonIcon from "@mui/icons-material/Person";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import GroupIcon from "@mui/icons-material/Group";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export default function HeaderDashboard() {
  const menuMain = [
    { name: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
    { name: "Connexion", icon: <LoginIcon />, href: "/Services" },
    { name: "Cr-rea", icon: <BuildIcon />, href: "/CreationPage" },
  ];

  const menuAccount = [
    { name: "Profile", icon: <PersonIcon />, href: "/Account" },
    { name: "Feeds", icon: <RssFeedIcon />, href: "/Feeds" },
    { name: "Abonments", icon: <GroupIcon />, href: "#" },
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.ulElem}>
            <ul className={styles.navLinks}>
              {menuMain.map((item) => (
                <li key={item.name}>
                  <span className={styles.icon}>{item.icon}</span>
                  <a href={item.href}>{item.name}</a>
                </li>
              ))}
            </ul>

            <h2 className={styles.sectionTitle}>Account Pages</h2>
            <ul className={styles.navLinks}>
              {menuAccount.map((item) => (
                <li key={item.name}>
                  <span className={styles.icon}>{item.icon}</span>
                  <a href={item.href}>{item.name}</a>
                </li>
              ))}
            </ul>

            <div className={styles.docSection}>
              <h2>
                <HelpOutlineIcon className={styles.helpIcon} /> Needs help?
              </h2>
              <p>Please check our docs</p>
              <a href="https://trigger.ink/docs#/">DOCUMENTATION</a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
