import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View, Alert, TextInput, TouchableOpacity } from 'react-native';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');

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

  const filteredWorkflows = workflows.filter((workflow) => {
    const actions = workflow.steps?.filter(s => s.type === 'action') || [];
    const reactions = workflow.steps?.filter(s => s.type === 'reaction') || [];

    if (actions.length !== 1 || reactions.length !== 1) {
      return false;
    }

    const matchesSearch = 
      workflow.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedService === 'all') {
      return matchesSearch;
    }

    const actionService = actions[0]?.service;
    const reactionService = reactions[0]?.service;

    return matchesSearch && (actionService === selectedService || reactionService === selectedService);
  });

  const availableServices = [...new Set(
    workflows
      .filter(wf => {
        const actions = wf.steps?.filter(s => s.type === 'action') || [];
        const reactions = wf.steps?.filter(s => s.type === 'reaction') || [];
        return actions.length === 1 && reactions.length === 1;
      })
      .flatMap(wf => 
        wf.steps?.map(s => s.service).filter(Boolean) || []
      )
  )].sort();

  return (
    <LinearGradient colors={['#171542', '#2f339e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('Feed')}</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search workflows...')}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterButton, selectedService === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedService('all')}
            >
              <Text style={[styles.filterButtonText, selectedService === 'all' && styles.filterButtonTextActive]}>
                {t('All')}
              </Text>
            </TouchableOpacity>
            {availableServices.map((service) => (
              <TouchableOpacity
                key={service}
                style={[styles.filterButton, selectedService === service && styles.filterButtonActive]}
                onPress={() => setSelectedService(service)}
              >
                <Text style={[styles.filterButtonText, selectedService === service && styles.filterButtonTextActive]}>
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {filteredWorkflows.length > 0 ? (
          filteredWorkflows.map((workflow) => {
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
            {loading ? t('Loading...') : searchQuery || selectedService !== 'all' ? t('No workflows match your filters') : t('No workflows in feed')}
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
  searchContainer: {
    width: '90%',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterContainer: {
    width: '100%',
    marginBottom: 20,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#2f339e',
  },
});