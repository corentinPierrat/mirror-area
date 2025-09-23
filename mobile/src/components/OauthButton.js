import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

const OAuthButton = ({ logo, text, onClick, connected }) => {
  const isSvg = typeof logo === 'function';

  return (
    <TouchableOpacity
      onPress={onClick}
      activeOpacity={0.2}
      style={styles.buttonWrapper}
    >
      <BlurView
        style={styles.blurContainer}
        intensity={80}
        tint="systemUltraThinMaterialDark"
        experimentalBlurMethod="dimezisBlurView"
      />

      <View style={styles.overlayContainer} />

      <View style={[styles.content, connected ? styles.connected : styles.disconnected]}>
         <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
        </View>


        <View style={styles.textContainer}>
          <Text style={[styles.status, connected ? styles.statusConnected : styles.statusDisconnected]}>
            {connected ? 'Connecté' : 'Déconnecté'}
          </Text>
        </View>
        <View style={[styles.indicator, connected ? styles.indicatorConnected : styles.indicatorDisconnected]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 18,
    marginVertical: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 22,
    width: '90%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    borderRadius: 4
  },
  textContainer: {
    flex: 1,
    marginLeft: 18,
    marginRight: 14
  },
  status: {
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.85,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  indicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  connected: {
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  disconnected: {
    backgroundColor: 'rgba(248,250,252,0.08)',
    borderColor: 'rgba(248,250,252,0.2)',
  },
  textConnected: {
    color: '#ffffff',
  },
  textDisconnected: {
    color: '#f1f5f9',
  },
  statusConnected: {
    color: 'rgba(255,255,255,0.85)',
  },
  statusDisconnected: {
    color: 'rgba(241,245,249,0.7)',
  },
  indicatorConnected: {
    backgroundColor: '#34d399',
    borderColor: 'rgba(52,211,153,0.4)',
    shadowColor: '#10b981',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 4,
  },
  indicatorDisconnected: {
    backgroundColor: '#94a3b8',
    borderColor: 'rgba(148,163,184,0.3)',
  },
});

export default OAuthButton;