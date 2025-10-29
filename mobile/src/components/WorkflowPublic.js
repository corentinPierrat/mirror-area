import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Simplified workflow card for the public feed: no toggle/edit/delete/visibility
export default function WorkflowPublic({ Name, ActionLogo, ReactionLogo, onAdd }) {
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

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={onAdd} activeOpacity={0.85} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={22} color="#22c55e" />
            <Text style={styles.addButtonText}>{t('Add')}</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 20,
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.35)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: { color: '#22c55e', fontWeight: '700' },
});
