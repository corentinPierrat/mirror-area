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
      const response = await fetch("http://127.0.0.1:5000/get_weather");
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
        error: "Unable to retrieve the weather. Check the server or CORS.",
      });
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const renderReaction = () => {
    const { temperature } = weather;
    if (temperature < 10) return "❄️ It's cold, grab a jacket!";
    if (temperature > 25) return "🔥 It's hot, remember to drink water!";
    return "🙂 The weather is pleasant.";
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
      <h1>Current Weather</h1>
      {weather.loading ? (
        <p>Loading...</p>
      ) : weather.error ? (
        <p className="error">{weather.error}</p>
      ) : (
        <>
          <p className="temperature">🌡️ Temperature: {weather.temperature}°C</p>
          <p className="windspeed">💨 Wind speed: {weather.windspeed} km/h</p>
          <p className="winddirection">🧭 Wind direction: {windCompass(weather.winddirection)}</p>
          <p className="time">
            ⏱️ Time:{" "}
            {new Date(weather.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="weathercode">🌤️ Weather code: {weather.weathercode}</p>
          <p className="reaction">{renderReaction()}</p>
          <button onClick={fetchWeather}>🔄 Refresh</button>
        </>
      )}
    </div>
  </div>
);

}

export default Weather;
