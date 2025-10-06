import React from "react";
import styles from "../styles/Footer.module.css";

function Footer() {
  return (
    <footer className={styles['footer']}>
      <div className={styles['footer-container']}>
        <div className={styles['footer-section']}>
          <h3>3Triggers.</h3>
          <p>
          Create automations Actions—Reactions. Connect different applications together and automate workflows.
          </p>
          <div className={styles['footer-socials']}>
            <a href="#"><i className="fa fa-facebook"></i></a>
            <a href="#"><i className="fa fa-twitter"></i></a>
            <a href="#"><i className="fa fa-linkedin"></i></a>
            <a href="#"><i className="fa fa-instagram"></i></a>
          </div>
        </div>

        <div className={styles['footer-section']}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/Catalog">Projects</a></li>
            <li><a href="/News">News</a></li>
            <li><a href="/News">Events</a></li>
            <li><a href="/About">About</a></li>
          </ul>
        </div>

        <div className={styles['footer-section']}>
          <h4>Contact Info</h4>
          <p><i className="fa fa-map-marker"></i> 123 Innovation Street, Nancy</p>
          <p><i className="fa fa-phone"></i> +1 (555) 123-4567</p>
          <p><i className="fa fa-envelope"></i> contact@3Triggers.com</p>
        </div>

        <div className={styles['footer-section']}>
          <h4>Newsletter</h4>
          <p>Subscribe to our newsletter for updates</p>
          <form className={styles['footer-form']}>
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className={styles['footer-bottom']}>
        <p>© {new Date().getFullYear()} 3Triggers. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
