import React from 'react';
import '../styles/Spotify.css';

const HomePage = () => {
    return (
        <div className="homepage-container-spotify">
          <div className='home-headers-spotify'>
              <header className="header-spotify">
                  <div className="logo">Triggers.</div>
                  <nav className="nav-links">
                      <a href="#">Features</a>
                      <a href="#">Pricing</a>
                      <a href="#">Docs</a>
                  </nav>
                  <div className="auth-buttons">
                      <button className="btn btn-sign-in">Sign in</button>
                      <button className="btn btn-sign-up">Sign up</button>
                  </div>
              </header>

              <section className="hero">
                  <div className="hero-content">
                      <h1>
                          Create automations <br />
                          Actions—Reactions
                      </h1>
                      <p>
                          Connect different applications together <br />
                          and automate workflows.
                      </p>
                      <button className="btn btn-get-started">Get Started</button>
                  </div>
                  <div className="hero-image">
                      <svg viewBox="0 0 248 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M124 2.00001L124 298" stroke="#007BFF" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 172.5L124 298L241 172.5" stroke="#007BFF" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M241 127.5L124 2L7 127.5" stroke="#007BFF" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </div>
              </section>
            </div>

            <section className="how-it-works">
                <h2>How it works</h2>
                <p className="subtitle">
                    AREA helps you create powerful automated workflows in a few simple steps.
                </p>
                <div className="steps-container">
                    <div className="step-card">
                        <div className="icon">+</div>
                        <h3>1. Connect apps</h3>
                        <p>Choose your applications and link them with AREA</p>
                    </div>
                    <div className="step-card">
                        <div className="icon">⚙️</div>
                        <h3>2. Set up actions</h3>
                        <p>Select the triggers and actions for your automations</p>
                    </div>
                    <div className="step-card">
                        <div className="icon">✔️</div>
                        <h3>3. Activate</h3>
                        <p>Enable your automated workflow and let it run</p>
                    </div>
                </div>
            </section>

            <section className="custom-buttons-section">
                <div className="custom-buttons">
                    <button className="btn btn-spotify" onClick={() => alert('Connexion à Spotify...')}>
                        Connexion à Spotify
                    </button>
                    <button className="btn btn-launch-area" onClick={() => alert('Lancer l\'AREA...')}>
                        Lancer l'AREA
                    </button>
                </div>
            </section>

        </div>
    );
};

export default HomePage;