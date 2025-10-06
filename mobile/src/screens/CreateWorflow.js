import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function CreateWorkflowScreen() {

  const API_URL = 'https://84518e6399ca.ngrok-free.app';
  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found, user might not be logged in.');
        return;
      }
      const response = await axios.get(`${API_URL}/catalog/reactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };


  return (
     <LinearGradient
          colors={['#171542', '#2f339e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
    >
      <View style={styles.workflowContainer}>
        <BlurView
          style={styles.blurContainer}
          intensity={80}
          tint="systemUltraThinMaterialDark"
          experimentalBlurMethod="dimezisBlurView"
        />
        <View style={styles.overlayContainer} />

        <View style={styles.content}>
          <TouchableOpacity
            style={styles.serviceWrapper}
            activeOpacity={0.7}
            onPress={fetchData}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/X.png")}
                style={styles.logo}
              />
            </View>
            <View style={[styles.badge, styles.badgeAction]}>
            <Text style={styles.badgeText}>Action</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.connectorWrapper}>
            <View style={styles.connectorLine} />
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.7}
            >
              <BlurView
                style={styles.addButtonBlur}
                intensity={60}
                tint="systemUltraThinMaterialDark"
              />
              <View style={styles.addButtonOverlay} />
              <Text style={styles.addButtonIcon}>+</Text>
            </TouchableOpacity>
            <View style={styles.connectorLine} />
          </View>

          <TouchableOpacity
            style={styles.serviceWrapper}
            activeOpacity={0.7}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/outlook.png")}
                style={styles.logo}
              />
            </View>
            <View style={[styles.badge, styles.badgeReaction]}>
              <Text style={styles.badgeText}>Reaction</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.connectorWrapper}>
            <View style={styles.connectorLine} />
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.7}
            >
              <BlurView
                style={styles.addButtonBlur}
                intensity={60}
                tint="systemUltraThinMaterialDark"
              />
              <View style={styles.addButtonOverlay} />
              <Text style={styles.addButtonIcon}>+</Text>
            </TouchableOpacity>
            <View style={styles.connectorLine} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.validateButtonWrapper}
        activeOpacity={0.8}
      >
        <BlurView
          style={styles.validateButtonBlur}
          intensity={80}
          tint="systemUltraThinMaterialDark"
        />
        <View style={styles.validateButtonOverlay} />
        <Text style={styles.validateButtonText}>Créer le Workflow</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 75,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  workflowContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  serviceWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 12,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    borderRadius: 6,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeAction: {
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderColor: 'rgba(59,130,246,0.3)',
  },
  badgeReaction: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderColor: 'rgba(168,85,247,0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  connectorWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  addButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    borderRadius: 22,
  },
  addButtonIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: '#34d399',
    textShadowColor: 'rgba(16,185,129,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  validateButtonWrapper: {
    marginTop: 32,
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  validateButtonBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  validateButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,185,129,0.25)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  validateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    paddingVertical: 18,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});