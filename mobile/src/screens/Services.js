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
  const [connected, setConnected] = useState(false);

  const API_URL = 'https://84518e6399ca.ngrok-free.app';

  const handleOAuthSuccess = (data) => {
    console.log('Réponse du serveur:', data);
    setConnected(true);
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
        onSuccess={handleOAuthSuccess}
        connected={connected}
      />
      <OAuthButton
        logo={FaceitLogo}
        apiRoute={`${API_URL}/oauth/faceit/login`}
        onSuccess={handleOAuthSuccess}
        connected={connected}
      />
      <OAuthButton
        logo={XLogo}
        apiRoute={`${API_URL}/oauth/twitter/login`}
        onSuccess={handleOAuthSuccess}
        connected={connected}
      />
      <OAuthButton
        logo={OutlookLogo}
        apiRoute={`${API_URL}/oauth/outlook/login`}
        onSuccess={handleOAuthSuccess}
        connected={connected}
      />
      <OAuthButton
        logo={SteamLogo}
        apiRoute={`${API_URL}/oauth/steam/login`}
        onSuccess={handleOAuthSuccess}
        connected={connected}
      />
      <OAuthButton
        logo={Discord}
        apiRoute={`${API_URL}/oauth/discord/login`}
        onSuccess={handleOAuthSuccess}
        connected={connected}
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
