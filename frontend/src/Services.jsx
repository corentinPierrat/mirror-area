import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import HeaderDashboard from "./components/HeaderDashboard";
import Footer from "./components/Footer";
import styles from "./styles/Services.module.css";
import axios from "axios";

const API_URL = "http://10.18.207.83:8080";

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
        setServices(res.data.services);
      }
    } catch (err) {
      console.error("Erreur chargement services:", err);
      setError("Impossible de charger les services disponibles.");
    }
  };

  const fetchStatus = async (provider) => {
    try {
      const res = await axios.get(`${API_URL}/oauth/${provider}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log(`Réponse API pour ${provider}:`, res.data); 
      console.log(`Statut HTTP pour ${provider}:`, res.status); 

      setConnected((prev) => ({ ...prev, [provider]: res.data.logged_in }));
    } catch (err) {
      console.warn(`Erreur vérif statut ${provider}:`, err.response ? err.response.data : err.message);
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
      console.error(`Erreur déconnexion ${provider}:`, err);
      alert("Impossible de se déconnecter de " + provider);
    }
  };

  const handleLogin = (provider) => {
    window.location.href = `${API_URL}/oauth/${provider}/login?token=${token}`;
  };

  useEffect(() => {
    if (!token) {
      setError("Token manquant. Veuillez vous reconnecter.");
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
        <p>Chargement des services...</p>
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
      <div className={styles.dashboardBody}>
        <aside className={styles.sidebar}>
          <HeaderDashboard />
        </aside>

        <div className={styles.mainContent}>
          <Header />

          <div className={styles.servicesContainer}>
            <h2 className={styles.servicesTitle}>Mes connexions</h2>

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
                        <p className={styles.statusConnected}>Connecté</p>
                        <button
                          className={`${styles.disconnectBtn}`}
                          onClick={() => disconnect(service.provider)}
                        >
                          Déconnecter
                        </button>
                      </>
                    ) : (
                      <>
                        <p className={styles.statusDisconnected}>
                          Non connecté
                        </p>
                        <button
                          className={styles.connectBtn}
                          onClick={() => handleLogin(service.provider)}
                        >
                          Se connecter
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

      <Footer />
    </div>
  );
}
