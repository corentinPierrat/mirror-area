import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import OAuthButton from '../components/OauthButton';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from "../../config";

export default function ServiceScreen() {
  const [services, setServices] = useState([]);
  const [statuses, setStatuses] = useState({});

  const fetchStatus = async (serviceName) => {
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
  };

  useEffect(() => {
    const fetchServices = async () => {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const res = await axios.get(`${API_URL}/oauth/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(res.data.services);

      const newStatuses = {};
      for (const service of res.data.services) {
        newStatuses[service.provider] = await fetchStatus(service.provider);
      }
      setStatuses(newStatuses);
      console.log(res.data.services);
    };
    fetchServices();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <LinearGradient colors={['#171542', '#2f339e']} style={styles.container}>
        {services.map((service) => (
          <OAuthButton
            key={service.provider}
            logo={{ uri: service.logo_url }}
            apiRoute={`${API_URL}/oauth/${service.provider}/login`}
            connected={statuses[service.provider] || false}
          />
        ))}
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
