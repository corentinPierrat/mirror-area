import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Workflows from '../components/Workflows';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function MyWorkflowScreen({ navigation }) {
  const [workflows, setWorkflows] = useState([]);
  const API_URL = 'http://10.18.207.151:8080';

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

      // Mettre les données dans le state
      setWorkflows(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des workflows :', error);
    }
  };

  useEffect(() => {
    getWorkflows();
  }, []);

  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.text}>Mes Workflows</Text>

        {workflows.length > 0 ? (
          workflows.map((workflow) => (
            <Workflows
              key={workflow.id}
              Name={workflow.name}
              Action={workflow.action || 'Action inconnue'}
              Reaction={workflow.reaction || 'Reaction inconnue'}
            />
          ))
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
