import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../../config';
import { useTranslation } from 'react-i18next';
import WorkflowPublic from '../components/WorkflowPublic';

export default function FeedScreen({ navigation }) {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${API_URL}/oauth/services`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      const urls = res.data.services.map(s => ({ provider: s.provider, logo_url: s.logo_url }));
      setServices(urls);
    } catch (e) {
    }
  }, []);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${API_URL}/feed/workflows`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      setWorkflows(res.data || []);
      console.log('Feed data:', res.data);
    } catch (e) {
      console.log('Feed error:', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToMyWorkflows = useCallback(async (wf) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        navigation.replace('Login');
        return;
      }
      const payload = {
        name: wf.name || 'Workflow',
        description: wf.description || 'Imported from feed',
        visibility: 'private',
        steps: (wf.steps || []).map(s => ({ type: s.type, service: s.service, event: s.event, params: s.params || {} })),
      };
      await axios.post(`${API_URL}/workflows/`, payload, { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {
    }
  }, [navigation, t]);

  useFocusEffect(
    useCallback(() => {
      fetchServices();
      fetchFeed();
    }, [fetchServices, fetchFeed])
  );

  return (
    <LinearGradient colors={['#171542', '#2f339e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('Feed')}</Text>
        {workflows.length > 0 ? (
          workflows.map((workflow) => {
            const actionService = workflow.steps?.find(s => s.type === 'action')?.service;
            const reactionService = workflow.steps?.find(s => s.type === 'reaction')?.service;
            const actionLogo = services.find(u => u.provider === actionService)?.logo_url;
            const reactionLogo = services.find(u => u.provider === reactionService)?.logo_url;
            const profilePicture = workflow.profile_picture ? `${API_URL}${workflow.profile_picture}` : null;
            return (
              <WorkflowPublic
                key={workflow.id || workflow._id || `${workflow.name}-${Math.random()}`}
                Name={workflow.name}
                Author={workflow.author}
                ProfilePicture={profilePicture}
                ActionLogo={actionLogo}
                ReactionLogo={reactionLogo}
                onAdd={() => addToMyWorkflows(workflow)}
              />
            );
          })
        ) : (
          <Text style={{ color: '#fff', marginTop: 20 }}>
            {loading ? t('Loading...') : t('No workflows in feed')}
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { alignItems: 'center', paddingTop: 65, paddingBottom: 125 },
  title: { fontSize: 26, color: '#fff', marginBottom: 20 },
});
