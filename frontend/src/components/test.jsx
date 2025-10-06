export const BASE = {
    "twitter.tweet": {
      title: "Tweeter un message",
      service: "twitter",
      method: "POST",
      path: "/reactions/twitter/tweet",
      payload_schema: { text: "string" },
      description: "Publie un tweet avec le texte fourni."
    },
    "spotify.play_weather_playlist": {
      title: "Jouer la playlist selon la météo (Paris)",
      service: "spotify",
      method: "GET",
      path: "/reactions/spotify/play_weather_playlist",
      payload_schema: null,
      description: "Choisit et lance une playlist selon la météo actuelle."
    }
  };
  