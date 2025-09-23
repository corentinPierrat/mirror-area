import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OAuthButton from '../components/OauthButton';
import { LinearGradient } from 'expo-linear-gradient';
import SpotifyLogo from '../../assets/Spotify.png';

export default function ServiceScreen() {
  const [connected, setConnected] = useState(false);

  const handleOAuthClick = () => {
    console.log("OAuth button clicked");
    setConnected(!connected);
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
        text={connected ? "Déconnecter Spotify" : "Connecter Spotify"}
        onClick={handleOAuthClick}
        connected={connected}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
});
