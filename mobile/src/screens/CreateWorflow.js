import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function CreateWorkflowScreen() {
  const API_URL = 'http://10.18.207.151:8080';

  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);

  const [reactions, setReactions] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState(null);

  const fetchActions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.log('No token found');
      const response = await axios.get(`${API_URL}/catalog/actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const keys = Object.keys(response.data || {});
      const data = keys.length > 0 ? response.data[keys[0]] : [];
      setActions(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReactions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.log('No token found');
      const response = await axios.get(`${API_URL}/catalog/reactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const keys = Object.keys(response.data || {});
      const data = keys.length > 0 ? response.data[keys[0]] : [];
      setReactions(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectAction = (action) => {
    setSelectedAction(action);
    setActions([]);
  };

  const handleSelectReaction = (reaction) => {
    setSelectedReaction(reaction);
    setReactions([]);
  };

  const createWorkflow = async () => {
  if (!selectedAction || !selectedReaction) {
    return Alert.alert('Erreur', 'Veuillez sélectionner une action et une réaction.');
  }

  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return console.log('No token found');

    const payload = {
      name: "Mon Workflow",
      description: "Workflow créé via l'app",
      visibility: "private",
      steps: [
        {
          type: "action",
          service: selectedAction?.service || "unknown",
          event: selectedAction?.event || "unknown",
          params: selectedAction?.params || {}
        },
        {
          type: "reaction",
          service: selectedReaction?.service || "unknown",
          event: selectedReaction?.event || "unknown",
          params: selectedReaction?.params || {}
        }
      ]
    };

    const response = await axios.post(`${API_URL}/workflows/`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    Alert.alert('Succès', 'Workflow créé avec succès !');
    console.log(response.data);

  } catch (error) {
    console.error(error);
    Alert.alert('Erreur', 'Impossible de créer le workflow.');
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
        <BlurView style={styles.blurContainer} intensity={80} tint="systemUltraThinMaterialDark" />
        <View style={styles.overlayContainer} />

        <View style={styles.content}>
          <TouchableOpacity style={styles.serviceWrapper} activeOpacity={0.7} onPress={fetchActions}>
            <View style={styles.logoContainer}>
              <Image source={require("../../assets/X.png")} style={styles.logo} />
            </View>
            <View style={[styles.badge, styles.badgeAction]}>
              <Text style={styles.badgeText}>{selectedAction?.title || 'Action'}</Text>
            </View>
          </TouchableOpacity>

          {actions?.length > 0 && (
            <ScrollView style={{ marginTop: 10, maxHeight: 150 }}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4, borderRadius: 8 }}
                  onPress={() => handleSelectAction(action)}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>{action?.title || 'Titre inconnu'}</Text>
                  <Text style={{ color: '#fff' }}>{action?.description || 'Description indisponible'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.connectorWrapper}>
            <View style={styles.connectorLine} />
          </View>

          <TouchableOpacity style={styles.serviceWrapper} activeOpacity={0.7} onPress={fetchReactions}>
            <View style={styles.logoContainer}>
              <Image source={require("../../assets/outlook.png")} style={styles.logo} />
            </View>
            <View style={[styles.badge, styles.badgeReaction]}>
              <Text style={styles.badgeText}>{selectedReaction?.title || 'Reaction'}</Text>
            </View>
          </TouchableOpacity>

          {reactions?.length > 0 && (
            <ScrollView style={{ marginTop: 10, maxHeight: 150 }}>
              {reactions.map((reaction, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4, borderRadius: 8 }}
                  onPress={() => handleSelectReaction(reaction)}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>{reaction?.title || 'Titre inconnu'}</Text>
                  <Text style={{ color: '#fff' }}>{reaction?.description || 'Description indisponible'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.addButton, { marginTop: 20, alignSelf: 'center' }]}
            activeOpacity={0.8}
            onPress={createWorkflow}
          >
            <BlurView style={styles.addButtonBlur} intensity={60} tint="systemUltraThinMaterialDark" />
            <View style={styles.addButtonOverlay} />
            <Text style={[styles.addButtonIcon, { fontSize: 18 }]}>Créer Workflow</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 75 },
  workflowContainer: { width: '100%', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 12 },
  blurContainer: { ...StyleSheet.absoluteFillObject, borderRadius: 24 },
  overlayContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  content: { paddingVertical: 32, paddingHorizontal: 24 },
  serviceWrapper: { alignItems: 'center', marginVertical: 8 },
  logoContainer: { width: 64, height: 64, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: 'rgba(0,0,0,0.2)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, marginBottom: 12 },
  logo: { width: 40, height: 40, resizeMode: 'contain', borderRadius: 6 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeAction: { backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)' },
  badgeReaction: { backgroundColor: 'rgba(168,85,247,0.15)', borderColor: 'rgba(168,85,247,0.3)' },
  badgeText: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  connectorWrapper: { alignItems: 'center', marginVertical: 4 },
  connectorLine: { width: 2, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  addButton: { width: 200, height: 50, borderRadius: 25, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  addButtonBlur: { ...StyleSheet.absoluteFillObject },
  addButtonOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(16,185,129,0.25)', borderRadius: 25, borderWidth: 1, borderColor: 'rgba(16,185,129,0.4)' },
  addButtonIcon: { fontSize: 16, fontWeight: '600', color: '#fff', textAlign: 'center' },
});
