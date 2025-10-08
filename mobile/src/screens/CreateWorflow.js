import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Modal } from 'react-native';

export default function CreateWorkflowScreen() {
  const API_URL = 'http://10.18.207.151:8080';
  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [WorkflowName, setWorkflowName] = useState('');
  const [reactions, setReactions] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [serverId, setServerId] = useState('');
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [actionParams, setActionParams] = useState({});
  const [reactionParams, setReactionParams] = useState({});
  const [isActionParamsModalVisible, setIsActionParamsModalVisible] = useState(false);
  const [isReactionParamsModalVisible, setIsReactionParamsModalVisible] = useState(false);


  const fetchActions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.log('No token found');
      const response = await axios.get(`${API_URL}/catalog/actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    const data = Object.values(response.data || {}).flat();
    setActions(data);
    console.log(data);
    setIsActionModalVisible(true);
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
    const data = Object.values(response.data || {}).flat();
    setReactions(data);
    console.log(data);
    setIsReactionModalVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectAction = (action) => {
    setSelectedAction(action);

    const params = action.payload_schema
      ? Object.keys(action.payload_schema).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {})
      : {};

    setActionParams(params);
    setIsActionModalVisible(false);
    setIsActionParamsModalVisible(true);
  };


  const handleSelectReaction = (reaction) => {
    setSelectedReaction(reaction);

    const params = reaction.payload_schema
      ? Object.keys(reaction.payload_schema).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {})
      : {};

    setReactionParams(params);
    setIsReactionModalVisible(false);
    setIsReactionParamsModalVisible(true);
  };

  const createWorkflow = async () => {
  if (!selectedAction || !selectedReaction) {
    return Alert.alert('Erreur', 'Veuillez sélectionner une action et une réaction.');
  }

  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token)
      return console.log('No token found');

    const payload = {
      name: WorkflowName || "Mon Workflow",
      description: "Workflow créé via l'app",
      visibility: "private",
      steps: [
        {
          type: "action",
          service: selectedAction?.service || "unknown",
          event: selectedAction?.event || "unknown",
          params: actionParams
        },
        {
          type: "reaction",
          service: selectedReaction?.service || "unknown",
          event: selectedReaction?.event || "unknown",
          params: reactionParams
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
    <LinearGradient colors={['#171542', '#2f339e']} style={styles.container}>
      <View style={styles.workflowContainer}>
        <BlurView style={styles.blurContainer} intensity={80} tint="systemUltraThinMaterialDark" />
        <View style={styles.overlayContainer} />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Workflow Name"
            placeholderTextColor="#64748b"
            value={WorkflowName}
            onChangeText={setWorkflowName}
          />
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.serviceWrapper} onPress={fetchActions}>
            <View style={styles.logoContainer}>
              <Image source={selectedAction ? require("../../assets/discord.png") : require("../../assets/None.png")} style={styles.logo} />
            </View>
            <View style={[styles.badge, styles.badgeAction]}>
              <Text style={styles.badgeText}>{selectedAction?.title || 'Action'}</Text>
            </View>
          </TouchableOpacity>

        <Modal visible={isActionParamsModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
                Paramètres de l’action
              </Text>
              <ScrollView>
                {selectedAction && Object.keys(actionParams).map((key) => (
                  <TextInput
                    key={key}
                    style={styles.input}
                    placeholder={selectedAction.payload_schema[key].label || key}
                    placeholderTextColor="#64748b"
                    value={actionParams[key]}
                    onChangeText={(text) => setActionParams({ ...actionParams, [key]: text })}
                  />
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={() => setIsActionParamsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


          <Modal visible={isActionModalVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ScrollView>
                  {actions.map((action, index) => (
                    <TouchableOpacity key={index} style={styles.modalItem} onPress={() => handleSelectAction(action)}>
                      <Text style={styles.modalTitle}>{action?.title || 'Titre inconnu'}</Text>
                      <Text style={styles.modalDesc}>{action?.description || 'Description indisponible'}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setIsActionModalVisible(false)} style={styles.closeButton}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.connectorWrapper}>
            <View style={styles.connectorLine} />
          </View>

          <TouchableOpacity style={styles.serviceWrapper} onPress={fetchReactions}>
            <View style={styles.logoContainer}>
              <Image source={selectedReaction ? require("../../assets/X.png") : require("../../assets/None.png")} style={styles.logo} />
            </View>
            <View style={[styles.badge, styles.badgeReaction]}>
              <Text style={styles.badgeText}>{selectedReaction?.title || 'Reaction'}</Text>
            </View>
          </TouchableOpacity>

          <Modal visible={isReactionParamsModalVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
                  Paramètres de la réaction
                </Text>
                <ScrollView>
                  {selectedReaction && Object.keys(reactionParams).map((key) => (
                    <TextInput
                      key={key}
                      style={styles.input}
                      placeholder={selectedReaction.payload_schema[key].label || key}
                      placeholderTextColor="#64748b"
                      value={reactionParams[key]}
                      onChangeText={(text) => setReactionParams({ ...reactionParams, [key]: text })}
                    />
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setIsReactionParamsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal visible={isReactionModalVisible} transparent animationType="slide">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <ScrollView>
                  {reactions.map((reaction, index) => (
                    <TouchableOpacity key={index} style={styles.modalItem} onPress={() => handleSelectReaction(reaction)}>
                      <Text style={styles.modalTitle}>{reaction?.title || 'Titre inconnu'}</Text>
                      <Text style={styles.modalDesc}>{reaction?.description || 'Description indisponible'}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setIsReactionModalVisible(false)} style={styles.closeButton}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity style={[styles.addButton, { marginTop: 20, alignSelf: 'center' }]} onPress={createWorkflow}>
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
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  input: {
    marginTop: 25,
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
 modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { width: '90%', maxHeight: '70%', backgroundColor: '#22225A', borderRadius: 20, padding: 20 },
  modalItem: { padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 6, borderRadius: 10 },
  modalTitle: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalDesc: { color: '#fff', fontSize: 12, marginTop: 2 },
  closeButton: { marginTop: 10, alignSelf: 'center', padding: 10, backgroundColor: '#4444AA', borderRadius: 10 },
});
