import React, { useState } from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View, Switch } from 'react-native';
import { BlurView } from 'expo-blur';

const Workflows = ({ Name, Action, Reaction }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const getServiceImage = (service) => {
    switch (service) {
      case "Spotify":
        return require('../../assets/Spotify.png');
      case "Outlook":
        return require('../../assets/outlook.png');
      case "Steam":
        return require('../../assets/steam.jpeg');
      case "Faceit":
        return require('../../assets/faceit.png');
      case "X":
        return require('../../assets/X.png');
      case "Discord":
        return require('../../assets/discord.png');
      default:
        return null;
    }
  };

  const imageAction = getServiceImage(Action);
  const imageReaction = getServiceImage(Reaction);

  const handleDelete = () => {
    console.log('Supprimé');
  };

  return (
    <View style={styles.workflowWrapper}>
      <BlurView
        style={styles.blurContainer}
        intensity={80}
        tint="systemUltraThinMaterialDark"
        experimentalBlurMethod="dimezisBlurView"
      />
      <View style={styles.overlayContainer} />

      <View style={styles.content}>
        <View style={styles.servicesRow}>
          {imageAction && (
            <View style={styles.serviceContainer}>
              <View style={styles.logoContainer}>
                <Image source={imageAction} style={styles.logo} />
              </View>
            </View>
          )}

          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>→</Text>
          </View>

          {imageReaction && (
            <View style={styles.serviceContainer}>
              <View style={styles.logoContainer}>
                <Image source={imageReaction} style={styles.logo} />
              </View>
            </View>
          )}
        </View>

        <Text style={styles.workflowName}>{Name}</Text>

        <View style={styles.controlsRow}>
          <View style={styles.statusContainer}>
            <View style={[styles.indicator, isEnabled ? styles.indicatorActive : styles.indicatorInactive]} />
            <Text style={[styles.statusText, isEnabled ? styles.statusActive : styles.statusInactive]}>
              {isEnabled ? 'Actif' : 'Inactif'}
            </Text>
          </View>

          <Switch
            trackColor={{ false: 'rgba(148,163,184,0.3)', true: 'rgba(16,185,129,0.4)' }}
            thumbColor={isEnabled ? '#34d399' : '#94a3b8'}
            ios_backgroundColor="rgba(148,163,184,0.2)"
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switch}
          />

          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.7}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  workflowWrapper: {
    borderRadius: 18,
    marginVertical: 8,
    width: '90%',
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
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  servicesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  serviceContainer: {
    alignItems: 'center',
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
    borderRadius: 4,
  },
  arrowContainer: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  arrowText: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
  },
  workflowName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  indicatorActive: {
    backgroundColor: '#34d399',
    borderColor: 'rgba(52,211,153,0.4)',
    shadowColor: '#10b981',
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 4,
  },
  indicatorInactive: {
    backgroundColor: '#94a3b8',
    borderColor: 'rgba(148,163,184,0.3)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  statusActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  statusInactive: {
    color: 'rgba(241,245,249,0.7)',
  },
  switch: {
    marginHorizontal: 12,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },
});

export default Workflows;