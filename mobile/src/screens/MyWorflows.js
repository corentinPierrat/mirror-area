import React, { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, StyleSheet, Modal, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Workflows from '../components/Workflows';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from "../../config";
import { useTranslation } from "react-i18next";
import { Ionicons } from '@expo/vector-icons';

export default function MyWorkflowScreen({ navigation }) {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState([]);
  const [userData, setUserData] = useState(null);
  const [URLs, setURLs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowName, setWorkflowName] = useState('');
  const [actions, setActions] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [actionParams, setActionParams] = useState({});
  const [reactionParams, setReactionParams] = useState({});
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [isActionParamsModalVisible, setIsActionParamsModalVisible] = useState(false);
  const [isReactionParamsModalVisible, setIsReactionParamsModalVisible] = useState(false);

  const getURLs = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      const res = await axios.get(`${API_URL}/oauth/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const urls = res.data.services.map(s => ({
        provider: s.provider,
        logo_url: s.logo_url,
        connected: s.connected,
      }));
      setURLs(urls);
    } catch (error) {
      console.error('Erreur lors de la récupération des logos :', error);
    }
  };

  const getWorkflows = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(`${API_URL}/workflows/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkflows(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des workflows :', error);
    }
  };

  const handleUpdateProfile = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données utilisateur :', error);
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }
    try {
      const response = await axios.delete(`${API_URL}/workflows/${workflowId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userData: { id: userData.id } },
      });
      if (response.status === 204) {
        setWorkflows((prevWorkflows) => prevWorkflows.filter((wf) => wf.id !== workflowId));
        await getWorkflows();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du workflow :', error);
    }
  };

  const fetchActions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      const response = await axios.get(`${API_URL}/catalog/actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Object.values(response.data || {}).flat();
      setActions(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des actions :', error);
    }
  };

  const fetchReactions = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      const response = await axios.get(`${API_URL}/catalog/reactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Object.values(response.data || {}).flat();
      setReactions(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des réactions :', error);
    }
  };

  const handleEditWorkflow = async (workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowName(workflow.name);

    await fetchActions();
    await fetchReactions();

    const actionStep = workflow.steps?.find(s => s.type === 'action');
    const reactionStep = workflow.steps?.find(s => s.type === 'reaction');
    if (actionStep) {
      setSelectedAction({
        service: actionStep.service,
        event: actionStep.event,
      });
      setActionParams(actionStep.params || {});
    }
    if (reactionStep) {
      setSelectedReaction({
        service: reactionStep.service,
        event: reactionStep.event,
      });
      setReactionParams(reactionStep.params || {});
    }
    setModalVisible(true);
  };

  const handleSelectAction = (action) => {
    setSelectedAction(action);
    const params = action.payload_schema
      ? Object.keys(action.payload_schema).reduce((acc, key) => {
          acc[key] = actionParams[key] || '';
          return acc;
        }, {})
      : {};
    setActionParams(params);
    setIsActionModalVisible(false);
    if (Object.keys(params).length > 0) {
      setIsActionParamsModalVisible(true);
    }
  };

  const handleSelectReaction = (reaction) => {
    setSelectedReaction(reaction);
    const params = reaction.payload_schema
      ? Object.keys(reaction.payload_schema).reduce((acc, key) => {
          acc[key] = reactionParams[key] || '';
          return acc;
        }, {})
      : {};
    setReactionParams(params);
    setIsReactionModalVisible(false);
    if (Object.keys(params).length > 0) {
      setIsReactionParamsModalVisible(true);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow || !selectedAction || !selectedReaction) return;

    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }

    try {
      const payload = {
        name: workflowName,
        steps: [
          {
            type: "action",
            service: selectedAction.service,
            event: selectedAction.event,
            params: actionParams
          },
          {
            type: "reaction",
            service: selectedReaction.service,
            event: selectedReaction.event,
            params: reactionParams
          }
        ]
      };

      const response = await axios.put(
        `${API_URL}/workflows/${selectedWorkflow.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        await getWorkflows();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Erreur lors de la modification du workflow :', error);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedWorkflow(null);
    setWorkflowName('');
    setSelectedAction(null);
    setSelectedReaction(null);
    setActionParams({});
    setReactionParams({});
  };

  useFocusEffect(
    useCallback(() => {
      getWorkflows();
      handleUpdateProfile();
      getURLs();
    }, [])
  );

  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.text}>{t("My Workflows")}</Text>

        {workflows.length > 0 ? (
          workflows.map((workflow) => {
            const actionService = workflow.steps?.find(s => s.type === 'action')?.service;
            const reactionService = workflow.steps?.find(s => s.type === 'reaction')?.service;

            const actionLogo = URLs.find(u => u.provider === actionService)?.logo_url;
            const reactionLogo = URLs.find(u => u.provider === reactionService)?.logo_url;

            return (
              <Workflows
                key={workflow.id}
                Name={workflow.name}
                ActionLogo={actionLogo}
                ReactionLogo={reactionLogo}
                onDelete={() => handleDeleteWorkflow(workflow.id)}
                onEdit={() => handleEditWorkflow(workflow)}
              />
            );
          })
        ) : (
          <Text style={{ color: '#fff', marginTop: 20 }}>Aucun workflow disponible.</Text>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentWrapper}>
            <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
            <View style={styles.modalBorder} />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t("Modifier le workflow")}</Text>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>{t("Nom du workflow")}</Text>
                <TextInput
                  style={styles.input}
                  value={workflowName}
                  onChangeText={setWorkflowName}
                  placeholder={t("Entrez le nom du workflow")}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />

                <Text style={styles.sectionTitle}>{t("Action")}</Text>
                <TouchableOpacity
                  style={styles.serviceSelector}
                  onPress={() => setIsActionModalVisible(true)}
                >
                  <View style={styles.serviceSelectorContent}>
                    {selectedAction && (
                      <Image
                        source={{ uri: URLs.find(u => u.provider === selectedAction.service)?.logo_url }}
                        style={styles.serviceLogo}
                      />
                    )}
                    <Text style={styles.serviceName}>
                      {selectedAction?.event || t("Sélectionner une action")}
                    </Text>
                    {selectedAction && Object.keys(actionParams).length > 0 && (
                        <TouchableOpacity onPress={() => setIsActionParamsModalVisible(true)}>
                          <Ionicons name="settings-outline" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.sectionTitle}>{t("Réaction")}</Text>
                <TouchableOpacity
                  style={styles.serviceSelector}
                  onPress={() => setIsReactionModalVisible(true)}
                >
                  <View style={styles.serviceSelectorContent}>
                    {selectedReaction && (
                      <Image
                        source={{ uri: URLs.find(u => u.provider === selectedReaction.service)?.logo_url }}
                        style={styles.serviceLogo}
                      />
                    )}
                    <Text style={styles.serviceName}>
                      {selectedReaction?.event || t("Sélectionner une réaction")}
                    </Text>
                  {selectedReaction && Object.keys(reactionParams).length > 0 && (
                    <TouchableOpacity onPress={() => setIsReactionParamsModalVisible(true)}>
                      <Ionicons name="settings-outline" size={24} color="white" />
                    </TouchableOpacity>
                  )}
                  </View>
                </TouchableOpacity>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.buttonText}>{t("Annuler")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.closeButton]}
                  onPress={handleSaveWorkflow}
                >
                  <Text style={styles.buttonText}>{t("Enregistrer")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isActionModalVisible} transparent animationType="fade">
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalContent}>
            <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
            <View style={styles.modalBorder} />
            <View style={styles.selectionModalInner}>
              <Text style={styles.selectionModalTitle}>{t("SelectAction")}</Text>
              <ScrollView style={styles.selectionScrollView} showsVerticalScrollIndicator={false}>
                {Object.entries(
                  actions.reduce((acc, action) => {
                    if (!acc[action.service]) acc[action.service] = [];
                    acc[action.service].push(action);
                    return acc;
                  }, {})
                ).map(([service, serviceActions]) => (
                  <View key={service}>
                    <Text style={styles.serviceGroupTitle}>
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </Text>
                    {serviceActions.map((action, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.selectionItem,
                          !URLs.find(u => u.provider === action.service)?.connected && styles.selectionItemDisabled
                        ]}
                        onPress={() => handleSelectAction(action)}
                        disabled={!URLs.find(u => u.provider === action.service)?.connected}
                      >
                        <Text style={styles.selectionItemTitle}>{action.title}</Text>
                        <Text style={styles.selectionItemDesc}>{action.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsActionModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t("Close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isActionParamsModalVisible} transparent animationType="fade">
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalContent}>
            <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
            <View style={styles.modalBorder} />
            <View style={styles.selectionModalInner}>
              <Text style={styles.selectionModalTitle}>{t("ParamAction")}</Text>
              <ScrollView style={styles.selectionScrollView} showsVerticalScrollIndicator={false}>
                {selectedAction && Object.keys(actionParams).map((key) => (
                  <View key={key} style={styles.paramField}>
                    <Text style={styles.paramLabel}>
                      {actions.find(a => a.event === selectedAction.event)?.payload_schema?.[key]?.label || key}
                    </Text>
                    <TextInput
                      style={styles.paramInput}
                      value={actionParams[key]}
                      onChangeText={(text) => setActionParams({ ...actionParams, [key]: text })}
                      placeholder={t("Entrez la valeur")}
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsActionParamsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t("Enregistrer")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isReactionModalVisible} transparent animationType="fade">
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalContent}>
            <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
            <View style={styles.modalBorder} />
            <View style={styles.selectionModalInner}>
              <Text style={styles.selectionModalTitle}>{t("SelectReaction")}</Text>
              <ScrollView style={styles.selectionScrollView} showsVerticalScrollIndicator={false}>
                {Object.entries(
                  reactions.reduce((acc, reaction) => {
                    if (!acc[reaction.service]) acc[reaction.service] = [];
                    acc[reaction.service].push(reaction);
                    return acc;
                  }, {})
                ).map(([service, serviceReactions]) => (
                  <View key={service}>
                    <Text style={styles.serviceGroupTitle}>
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </Text>
                    {serviceReactions.map((reaction, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.selectionItem,
                          !URLs.find(u => u.provider === reaction.service)?.connected && styles.selectionItemDisabled
                        ]}
                        onPress={() => handleSelectReaction(reaction)}
                        disabled={!URLs.find(u => u.provider === reaction.service)?.connected}
                      >
                        <Text style={styles.selectionItemTitle}>{reaction.title}</Text>
                        <Text style={styles.selectionItemDesc}>{reaction.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsReactionModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t("Close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isReactionParamsModalVisible} transparent animationType="fade">
        <View style={styles.selectionModalContainer}>
          <View style={styles.selectionModalContent}>
            <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
            <View style={styles.modalBorder} />
            <View style={styles.selectionModalInner}>
              <Text style={styles.selectionModalTitle}>{t("ParamReaction")}</Text>
              <ScrollView style={styles.selectionScrollView} showsVerticalScrollIndicator={false}>
                {selectedReaction && Object.keys(reactionParams).map((key) => (
                  <View key={key} style={styles.paramField}>
                    <Text style={styles.paramLabel}>
                      {reactions.find(r => r.event === selectedReaction.event)?.payload_schema?.[key]?.label || key}
                    </Text>
                    <TextInput
                      style={styles.paramInput}
                      value={reactionParams[key]}
                      onChangeText={(text) => setReactionParams({ ...reactionParams, [key]: text })}
                      placeholder={t("Entrez la valeur")}
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsReactionParamsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t("Enregistrer")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 65,
    paddingBottom: 125,
  },
  text: {
    fontSize: 26,
    color: '#fff',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContentWrapper: {
    width: '100%',
    maxHeight: '85%',
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
  modalBorder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,30,60,0.85)',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  modalContent: {
    padding: 24,
    height: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
    marginBottom: 12,
  },
  serviceSelector: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  serviceSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceLogo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginRight: 12,
  },
  serviceName: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  paramsButton: {
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
  },
  paramsButtonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(148,163,184,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  saveButton: {
    backgroundColor: 'rgba(59,130,246,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,1)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectionModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  selectionModalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
  },
  selectionModalInner: {
    padding: 24,
    height: '100%',
  },
  selectionModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectionScrollView: {
    flex: 1,
    marginBottom: 16,
  },
  serviceGroupTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 10,
  },
  selectionItem: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectionItemDisabled: {
    opacity: 0.4,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  selectionItemTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  selectionItemDesc: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  closeButton: {
    backgroundColor: 'rgba(99,102,241,0.3)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.5)',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  paramField: {
    marginBottom: 16,
  },
  paramLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  paramInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});