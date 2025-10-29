import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import OAuthButton from '../components/OauthButton';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { API_URL } from "../../config";

export default function ServiceScreen() {
  const [services, setServices] = useState([]);
  const [statuses, setStatuses] = useState({});

  const fetchStatus = useCallback(async (serviceName) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return false;
    try {
      const res = await axios.get(`${API_URL}/oauth/${serviceName}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.logged_in;
    } catch (err) {
      console.error(err);
      return false;
    }
  }, []);


  const loadServices = useCallback(async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/oauth/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data.services);

      const newStatuses = {};
      for (const service of res.data.services) {
        newStatuses[service.provider] = await fetchStatus(service.provider);
      }
      setStatuses(newStatuses);
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
    }
  }, [fetchStatus]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    const handleDeepLink = async ({ url }) => {
      if (!url) return;
      const { path, queryParams } = Linking.parse(url);
      const normalizedPath = Array.isArray(path) ? path.join('/') : path;
      if (normalizedPath && normalizedPath.replace(/^\//, '') === 'oauth/callback') {
        await loadServices();
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleDeepLink({ url: initialUrl });
      }
    })();

    return () => {
      subscription.remove?.();
    };
  }, [loadServices]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <LinearGradient colors={['#171542', '#2f339e']} style={styles.container}>
     {services.map((service) => {
      const isConnected = statuses[service.provider] || false;
      const route = `${API_URL}/oauth/${service.provider}/${isConnected ? 'disconnect' : 'login'}`;
      return (
        <OAuthButton
          key={service.provider}
          logo={{ uri: service.logo_url }}
          apiRoute={route}
          provider={service.provider}
          connected={isConnected}
          onSuccess={loadServices}
        />
      );
    })}
    </LinearGradient>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 65,
  },
});