import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function CreateWorkflowScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [WorkflowName, setWorkflowName] = useState('');
  const [reactions, setReactions] = useState([]);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [actionParams, setActionParams] = useState({});
  const [reactionParams, setReactionParams] = useState({});
  const [isActionParamsModalVisible, setIsActionParamsModalVisible] = useState(false);
  const [isReactionParamsModalVisible, setIsReactionParamsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(true);
  const [URLs, setURLs] = useState([]);

  const fetchActions = async () => {
    setMessage('');
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      const response = await axios.get(`${API_URL}/catalog/actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    const data = Object.values(response.data || {}).flat();
    setActions(data);
    setIsActionModalVisible(true);
    } catch (error) {
      setIsError(true);
      setMessage('Erreur lors de la récupération des actions.');
    }
  };

  const fetchReactions = async () => {
    setMessage('');
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const response = await axios.get(`${API_URL}/catalog/reactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    const data = Object.values(response.data || {}).flat();
    setReactions(data);
    setIsReactionModalVisible(true);
    } catch (error) {
      setIsError(true);
      setMessage(t("GetReaction"));
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
    setIsError(true);
    setMessage(t("SelectActionOrReaction"));
    return;
  }
    setLoading(true);
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.navigate('Login');
      return;
    }

    const payload = {
      name: WorkflowName || "Mon Workflow",
      description: "Workflow créé via l'app",
      visibility: "private",
      steps: [
        {
          type: "action",
          service: selectedAction?.service,
          event: selectedAction?.event,
          params: actionParams
        },
        {
          type: "reaction",
          service: selectedReaction?.service,
          event: selectedReaction?.event,
          params: reactionParams
        }
      ]
    };
    const response = await axios.post(`${API_URL}/workflows/`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setIsError(false);
    setLoading(false);
    setActions([]);
    setSelectedAction(null);
    setWorkflowName('');
    setReactions([]);
    setSelectedReaction(null);
    setActionParams({});
    setMessage("Workflow créé avec succès !");
  } catch (error) {
    setLoading(false);
    setIsError(true);
    setMessage("Impossible de créer le workflow.");
  }
};

  const getURL = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.navigate('Login');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/oauth/services`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      console.log(res.data)
      const urls = res.data.services.map(s => ({
        provider: s.provider,
        logo_url: s.logo_url,
        connected: s.connected,
      }));
      console.log('Liste des URLs :', urls);
      setURLs(urls);
      } catch (error) {
        setIsError(true);
        setMessage(t("ErreurGetServices"));
      }
  };

useEffect(() => {
  getURL();
}, []);

  return (
    <LinearGradient colors={['#171542', '#2f339e']} style={styles.container}>
      <Text style={styles.text}>{t("Create Workflow")}</Text>
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
              <Image source={selectedAction ? { uri: URLs.find(u => u.provider === selectedAction?.service)?.logo_url} : require("../../assets/None.png")} style={styles.logo}/>
            </View>
            <View style={[styles.badge, styles.badgeAction]}>
              <Text style={styles.badgeText}>{selectedAction?.title || 'Action'}</Text>
            </View>
          </TouchableOpacity>

        <Modal visible={isActionParamsModalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContentWrapper}>
              <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
              <View style={styles.modalOverlay} />
              <View style={styles.modalInnerContent}>
                <Text style={styles.modalHeaderText}>{t("ParamAction")}</Text>
                <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                  {selectedAction && Object.keys(actionParams).map((key) => (
                    <View key={key} style={styles.paramInputWrapper}>
                      <BlurView style={styles.paramInputBlur} intensity={60} tint="systemUltraThinMaterialDark" />
                      <View style={styles.paramInputOverlay} />
                      <TextInput
                        style={styles.paramInput}
                        placeholder={selectedAction.payload_schema[key].label || key}
                        placeholderTextColor="#94a3b8"
                        value={actionParams[key]}
                        onChangeText={(text) => setActionParams({ ...actionParams, [key]: text })}
                      />
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setIsActionParamsModalVisible(false)}
                  style={styles.modalButton}
                >
                  <BlurView style={styles.modalButtonBlur} intensity={70} tint="systemUltraThinMaterialDark" />
                  <View style={styles.modalButtonOverlay} />
                  <Text style={styles.modalButtonText}>{t("Enregistrer")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

          <Modal visible={isActionModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContentWrapper}>
                <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
                <View style={styles.modalOverlay} />
                <View style={styles.modalInnerContent}>
                  <Text style={styles.modalHeaderText}>{t("SelectAction")}</Text>
                  <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                    {Object.entries(
                      actions.reduce((acc, action) => {
                        if (!acc[action.service]) acc[action.service] = [];
                        acc[action.service].push(action);
                        return acc;
                      }, {})
                    ).map(([service, serviceActions]) => (
                      <View key={service}>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginVertical: 10 }}>{service.charAt(0).toUpperCase() + service.slice(1)}</Text>
                        {serviceActions.map((action, index) => (
                          <TouchableOpacity
                              key={index}
                              style={[
                                styles.modalItemWrapper,
                                !URLs.find(u => u.provider === action?.service)?.connected && styles.modalItemDisabled
                              ]}
                              onPress={() => handleSelectAction(action)}
                              disabled={!URLs.find(u => u.provider === action?.service)?.connected}
                            >
                            <BlurView style={styles.modalItemBlur} intensity={50} tint="systemUltraThinMaterialDark" />
                            <View style={styles.modalItemOverlay} />
                            <View style={styles.modalItemContent}>
                              <Text style={styles.modalTitle}>{action?.title || 'Titre inconnu'}</Text>
                              <Text style={styles.modalDesc}>{action?.description || 'Description indisponible'}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity onPress={() => setIsActionModalVisible(false)} style={styles.modalButton}>
                    <BlurView style={styles.modalButtonBlur} intensity={70} tint="systemUltraThinMaterialDark" />
                    <View style={styles.modalButtonOverlay} />
                    <Text style={styles.modalButtonText}>{t("Close")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <View style={styles.connectorWrapper}>
            <View style={styles.connectorLine} />
          </View>

          <TouchableOpacity style={styles.serviceWrapper} onPress={fetchReactions}>
            <View style={styles.logoContainer}>
              <Image source={selectedReaction ? { uri: URLs.find(u => u.provider === selectedReaction?.service)?.logo_url} : require("../../assets/None.png")} style={styles.logo}/>
            </View>
            <View style={[styles.badge, styles.badgeReaction]}>
              <Text style={styles.badgeText}>{selectedReaction?.title || 'Reaction'}</Text>
            </View>
          </TouchableOpacity>

          <Modal visible={isReactionParamsModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContentWrapper}>
                <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
                <View style={styles.modalOverlay} />
                <View style={styles.modalInnerContent}>
                  <Text style={styles.modalHeaderText}>{t("ParamReaction")}</Text>
                  <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                    {selectedReaction && Object.keys(reactionParams).map((key) => (
                      <View key={key} style={styles.paramInputWrapper}>
                        <BlurView style={styles.paramInputBlur} intensity={60} tint="systemUltraThinMaterialDark" />
                        <View style={styles.paramInputOverlay} />
                        <TextInput
                          style={styles.paramInput}
                          placeholder={selectedReaction.payload_schema[key].label || key}
                          placeholderTextColor="#94a3b8"
                          value={reactionParams[key]}
                          onChangeText={(text) => setReactionParams({ ...reactionParams, [key]: text })}
                        />
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity
                    onPress={() => setIsReactionParamsModalVisible(false)}
                    style={styles.modalButton}
                  >
                    <BlurView style={styles.modalButtonBlur} intensity={70} tint="systemUltraThinMaterialDark" />
                    <View style={styles.modalButtonOverlay} />
                    <Text style={styles.modalButtonText}>{t("Enregistrer")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={isReactionModalVisible} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContentWrapper}>
                <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
                <View style={styles.modalOverlay} />
                <View style={styles.modalInnerContent}>
                  <Text style={styles.modalHeaderText}>{t("SelectReaction")}</Text>
                  <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                    {Object.entries(
                      reactions.reduce((acc, reaction) => {
                        if (!acc[reaction.service]) acc[reaction.service] = [];
                        acc[reaction.service].push(reaction);
                        return acc;
                      }, {})
                    ).map(([service, serviceReactions]) => (
                      <View key={service}>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginVertical: 10 }}>
                          {service.charAt(0).toUpperCase() + service.slice(1)}
                        </Text>
                        {serviceReactions.map((reaction, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[styles.modalItemWrapper, !URLs.find(u => u.provider === reaction?.service)?.connected && styles.modalItemDisabled
                            ]}
                            onPress={() => handleSelectReaction(reaction)}
                            disabled={!URLs.find(u => u.provider === reaction?.service)?.connected}
                          >

                            <BlurView style={styles.modalItemBlur} intensity={50} tint="systemUltraThinMaterialDark" />
                            <View style={styles.modalItemOverlay} />
                            <View style={styles.modalItemContent}>
                              <Text style={styles.modalTitle}>{reaction?.title || 'Titre inconnu'}</Text>
                              <Text style={styles.modalDesc}>{reaction?.description || 'Description indisponible'}</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity onPress={() => setIsReactionModalVisible(false)} style={styles.modalButton}>
                    <BlurView style={styles.modalButtonBlur} intensity={70} tint="systemUltraThinMaterialDark" />
                    <View style={styles.modalButtonOverlay} />
                    <Text style={styles.modalButtonText}>{t("Close")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {message ? (<Text style={[styles.message, { color: isError ? '#ff4d4d' : '#63f614ff' }]}>{message}</Text>) : null}

          <TouchableOpacity style={[styles.addButton, { marginTop: 70, alignSelf: 'center' }]} onPress={createWorkflow}>
            <BlurView style={styles.addButtonBlur} intensity={60} tint="systemUltraThinMaterialDark" />
            <View style={styles.addButtonOverlay} />
            <Text style={[styles.addButtonIcon, { fontSize: 18 }]}>{loading ? (t("Create Workflow") + '...') : t("Create Workflow")}</Text>
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
  serviceWrapper: { alignItems: 'center', marginVertical: 8, },
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
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
  },
  modalContentWrapper: { 
    width: '100%', 
    maxWidth: 400,
    maxHeight: '80%', 
    borderRadius: 24, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  modalBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,30,60,0.85)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  modalInnerContent: {
    padding: 24,
    height: '100%',
  },
  modalHeaderText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  modalItemWrapper: {
    marginVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalItemBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalItemOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
  },
  modalItemContent: {
    padding: 14,
  },
  modalTitle: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  modalDesc: { 
    color: 'rgba(255,255,255,0.75)', 
    fontSize: 13, 
    lineHeight: 18,
  },
  modalButton: {
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  modalButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(99,102,241,0.3)',
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.5)',
    borderRadius: 16,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  paramInputWrapper: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paramInputBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  paramInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  paramInput: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  text: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 20,
  },
  message: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 15,
  },
  modalItemDisabled: {
    opacity: 0.4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});