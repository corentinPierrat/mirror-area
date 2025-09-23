import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OAuthButton from '../components/OauthButton';
import { LinearGradient } from 'expo-linear-gradient';
import SpotifyLogo from '../../assets/Spotify.png';
import FaceitLogo from '../../assets/faceit.png';
import XLogo from '../../assets/X.png';
import OutlookLogo from '../../assets/outlook.png';
import SteamLogo from '../../assets/steam.jpeg';

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
        onClick={handleOAuthClick}
        connected={connected}
      />
      <OAuthButton
        logo={FaceitLogo}
        onClick={handleOAuthClick}
        connected={connected}
      />
      <OAuthButton
        logo={XLogo}
        onClick={handleOAuthClick}
        connected={connected}
      />
       <OAuthButton
        logo={OutlookLogo}
        onClick={handleOAuthClick}
        connected={connected}
      />
      <OAuthButton
        logo={SteamLogo}
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
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  text: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
});
