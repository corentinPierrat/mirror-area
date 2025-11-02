export const BASE = {
    "twitter.tweet": {
      title: "Tweet a message",
      service: "twitter",
      method: "POST",
      path: "/reactions/twitter/tweet",
      payload_schema: { text: "string" },
      description: "Posts a tweet with the provided text."
    },
    "spotify.play_weather_playlist": {
      title: "Play the playlist based on the weather (Paris)",
      service: "spotify",
      method: "GET",
      path: "/reactions/spotify/play_weather_playlist",
      payload_schema: null,
      description: "Selects and launches a playlist based on the current weather."
    }
  };
  
