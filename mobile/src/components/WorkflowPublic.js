import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function WorkflowPublic({ Name, Author, ProfilePicture, ActionLogo, ReactionLogo, onAdd }) {
  const { t } = useTranslation();

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
        <View style={styles.topHeader}>
          {Author && (
            <View style={styles.authorHeader}>
              <Image 
                source={{ uri: ProfilePicture }} 
                style={styles.profilePicture}
                defaultSource={require('../../assets/icon.png')}
              />
              <Text style={styles.authorName}>{Author}</Text>
            </View>
          )}

          <TouchableOpacity testID='addButton' onPress={onAdd} activeOpacity={0.85} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={24} color="#22c55e" />
          </TouchableOpacity>
        </View>

        <View style={styles.servicesRow}>
          {ActionLogo && (
            <View style={styles.serviceContainer}>
              <View style={styles.logoContainer}>
                <Image source={{ uri: ActionLogo }} style={styles.logo} />
              </View>
            </View>
          )}

          <View style={styles.arrowContainer}>
            <Text style={styles.arrowText}>→</Text>
          </View>

          {ReactionLogo && (
            <View style={styles.serviceContainer}>
              <View style={styles.logoContainer}>
                <Image source={{ uri: ReactionLogo }} style={styles.logo} />
              </View>
            </View>
          )}
        </View>

        <Text style={styles.workflowName}>{Name}</Text>
      </View>
    </View>
  );
}

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
  blurContainer: { ...StyleSheet.absoluteFillObject, borderRadius: 18 },
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.9,
  },
  servicesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  serviceContainer: { alignItems: 'center' },
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
  logo: { width: 32, height: 32, resizeMode: 'contain', borderRadius: 4 },
  arrowContainer: {
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  arrowText: { fontSize: 20, color: 'rgba(255,255,255,0.7)' },
  workflowName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 0,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  addButton: {
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
    borderRadius: 12,
    padding: 8,
  },
  addButtonText: { color: '#22c55e', fontWeight: '700' },
});
