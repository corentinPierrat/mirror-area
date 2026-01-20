import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import HeaderDashboard from "./components/HeaderDashboard";
import Footer from "./components/Footer";
import styles from "./styles/Services.module.css";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
export default function Services() {
  const [services, setServices] = useState([]);
  const [connected, setConnected] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("userToken");

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/oauth/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(res.data.services)) {
        const filteredServices = res.data.services.filter(
          (service) => service.provider?.toLowerCase() !== "timer"
        );
        setServices(filteredServices);
      }
    } catch (err) {
      console.error("Error loading services:", err);
      setError("Unable to load available services.");
    }
  };

  const fetchStatus = async (provider) => {
    try {
      const res = await axios.get(`${API_URL}/oauth/${provider}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`API response for ${provider}:`, res.data);
      console.log(`HTTP status for ${provider}:`, res.status);

      setConnected((prev) => ({ ...prev, [provider]: res.data.logged_in }));
    } catch (err) {
      console.warn(`Error while checking status for ${provider}:`, err.response ? err.response.data : err.message);
      setConnected((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const disconnect = async (provider) => {
    try {
      await axios.delete(`${API_URL}/oauth/${provider}/disconnect`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConnected((prev) => ({ ...prev, [provider]: false }));
    } catch (err) {
      console.error(`Disconnect error ${provider}:`, err);
      alert("Unable to log out of " + provider);
    }
  };

  const handleLogin = (provider) => {
    window.location.href = `${API_URL}/oauth/${provider}/login?token=${token}&redirect_uri=${window.location.href}`;
  };

  useEffect(() => {
    if (!token) {
      setError("Missing token. Please log in again.");
      setLoading(false);
      return;
    }

    (async () => {
      await fetchServices();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      services.forEach((s) => fetchStatus(s.provider));
    }
  }, [services]);

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <p>Loading services...</p>
      </div>
    );

  if (error)
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );

  return (
    <div className={styles.dashboardContainer}>
      <video
        className={styles.videoBackground}
        src="/bg-video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className={styles.dashboardBody}>
        <aside className={styles.sidebar}>
          <HeaderDashboard />
        </aside>

        <div className={styles.mainContent}>
          <div style={{ width: '0%' }}>
            <Header />
          </div>

          <div className={styles.servicesContainer}>
            <h2 className={styles.servicesTitle}>My connections</h2>

            <div className={styles.oauthList}>
              {services.map((service) => {
                const isConnected = connected[service.provider];
                return (
                  <div key={service.provider} className={styles.serviceCard}>
                    <img
                      src={service.logo_url}
                      alt={service.provider}
                      className={styles.serviceLogo}
                    />
                    <h3 className={styles.serviceName}>{service.provider}</h3>

                    {isConnected ? (
                      <>
                        <p className={styles.statusConnected}>Connected</p>
                        <button
                          className={`${styles.disconnectBtn}`}
                          onClick={() => disconnect(service.provider)}
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <>
                        <p className={styles.statusDisconnected}>
                        Not connected
                        </p>
                        <button
                          className={styles.connectBtn}
                          onClick={() => handleLogin(service.provider)}
                        >
                          Log in
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
}
