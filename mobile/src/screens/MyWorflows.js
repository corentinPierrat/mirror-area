import React, { useCallback, useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Workflows from '../components/Workflows';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from "../../config";
import { useTranslation } from "react-i18next";

export default function MyWorkflowScreen({ navigation }) {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState([]);
  const [userData, setUserData] = useState(null);
  const [URLs, setURLs] = useState([]);

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
              />
            );
          })
        ) : (
          <Text style={{ color: '#fff', marginTop: 20 }}>Aucun workflow disponible.</Text>
        )}
      </ScrollView>
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
});
