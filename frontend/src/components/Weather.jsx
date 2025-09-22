import React, { useEffect, useState } from "react";
import "./Weather.css";

function Weather() {
  const [weather, setWeather] = useState({
    temperature: null,
    windspeed: null,
    winddirection: null,
    weathercode: null,
    time: null,
    is_day: 1,
    loading: true,
    error: null,
  });

  const fetchWeather = async () => {
    try {
      const response = await fetch("http://localhost:8080/get_weather");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setWeather({
        temperature: data.temperature,
        windspeed: data.windspeed,
        winddirection: data.winddirection,
        weathercode: data.weathercode,
        time: data.time,
        is_day: data.is_day,
        loading: false,
        error: null,
      });
    } catch (err) {
      setWeather({
        temperature: null,
        windspeed: null,
        winddirection: null,
        weathercode: null,
        time: null,
        is_day: 1,
        loading: false,
        error: "Impossible de récupérer la météo. Vérifiez le serveur ou CORS.",
      });
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const renderReaction = () => {
    const { temperature } = weather;
    if (temperature < 10) return "❄️ Il fait froid, mets une veste !";
    if (temperature > 25) return "🔥 Il fait chaud, pense à boire de l'eau !";
    return "🙂 La météo est agréable.";
  };

  const getBackground = () => {
    const { temperature, is_day } = weather;
    if (weather.loading) return "#f0f0f0";
    if (!is_day) return "#2c3e50";
    if (temperature <= 10) return "#5dade2";
    if (temperature >= 25) return "#f39c12";
    return "#58d68d";
  };

  const windCompass = (deg) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.round(deg / 45) % 8];
  };

return (
  <div className="weather-wrapper">
    <div className="cloud cloud-small"></div>
    <div
      className="cloud cloud-small"
      style={{ top: "50%", animationDuration: "80s", left: "-200px" }}
    ></div>
    <div className="weather-card">
      <h1>Météo actuelle</h1>
      {weather.loading ? (
        <p>Chargement...</p>
      ) : weather.error ? (
        <p className="error">{weather.error}</p>
      ) : (
        <>
          <p className="temperature">🌡️ Température: {weather.temperature}°C</p>
          <p className="windspeed">💨 Vitesse du vent: {weather.windspeed} km/h</p>
          <p className="winddirection">🧭 Direction du vent: {windCompass(weather.winddirection)}</p>
          <p className="time">
            ⏱️ Heure:{" "}
            {new Date(weather.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="weathercode">🌤️ Code météo: {weather.weathercode}</p>
          <p className="reaction">{renderReaction()}</p>
          <button onClick={fetchWeather}>🔄 Rafraîchir</button>
        </>
      )}
    </div>
  </div>
);

}

export default Weather;
