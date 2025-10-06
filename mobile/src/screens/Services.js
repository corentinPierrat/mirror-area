import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import OAuthButton from '../components/OauthButton';
import { LinearGradient } from 'expo-linear-gradient';
import SpotifyLogo from '../../assets/Spotify.png';
import FaceitLogo from '../../assets/faceit.png';
import XLogo from '../../assets/X.png';
import OutlookLogo from '../../assets/outlook.png';
import SteamLogo from '../../assets/steam.jpeg';
import Discord from '../../assets/discord.png';

export default function ServiceScreen() {
  // État pour chaque service
  const [connectedServices, setConnectedServices] = useState({
    spotify: false,
    faceit: false,
    twitter: false,
    outlook: false,
    steam: false,
    discord: false,
  });

  const API_URL = 'http://10.18.207.151:8080';

  const handleOAuthSuccess = (service, data) => {
    console.log(`Réponse du serveur pour ${service}:`, data);
    setConnectedServices((prev) => ({
      ...prev,
      [service]: true,
    }));
  };

  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <OAuthButton
        logo={SpotifyLogo}
        apiRoute={`${API_URL}/oauth/spotify/login`}
        onSuccess={(data) => handleOAuthSuccess('spotify', data)}
        connected={connectedServices.spotify}
      />
      <OAuthButton
        logo={FaceitLogo}
        apiRoute={`${API_URL}/oauth/faceit/login`}
        onSuccess={(data) => handleOAuthSuccess('faceit', data)}
        connected={connectedServices.faceit}
      />
      <OAuthButton
        logo={XLogo}
        apiRoute={`${API_URL}/oauth/twitter/login`}
        onSuccess={(data) => handleOAuthSuccess('twitter', data)}
        connected={connectedServices.twitter}
      />
      <OAuthButton
        logo={OutlookLogo}
        apiRoute={`${API_URL}/oauth/outlook/login`}
        onSuccess={(data) => handleOAuthSuccess('outlook', data)}
        connected={connectedServices.outlook}
      />
      <OAuthButton
        logo={SteamLogo}
        apiRoute={`${API_URL}/oauth/steam/login`}
        onSuccess={(data) => handleOAuthSuccess('steam', data)}
        connected={connectedServices.steam}
      />
      <OAuthButton
        logo={Discord}
        apiRoute={`${API_URL}/oauth/discord/login`}
        onSuccess={(data) => handleOAuthSuccess('discord', data)}
        connected={connectedServices.discord}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 65,
  },
});
