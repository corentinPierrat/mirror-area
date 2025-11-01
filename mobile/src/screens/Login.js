import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "../components/i18n";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../config";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const extractTokenFromUrl = (url) => {
    try {
      const parsed = Linking.parse(url);
      const qp = parsed?.queryParams || {};
      return qp.token || qp.access_token || qp.jwt || null;
    } catch (e) {
      return null;
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setMessage('');

      const redirectUri = Linking.createURL('');
      const authUrl = `${API_URL}/oauth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const token = extractTokenFromUrl(result.url);
        if (token) {
          await AsyncStorage.setItem('userToken', token);
          navigation.replace('Main');
          return;
        }
      }
      setMessage(t('NetworkError'));
    } catch (error) {
      console.log('Erreur OAuth Google:', error);
      setMessage(t('NetworkError'));
    } finally {
      setLoading(false);
    }
  };

   const handleLogin = async () => {
    if (!email || !password) {
      setMessage(t("EmptyFields"));
      return;
    }
    setLoading(true);
    setMessage('');
    try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });

    if (response.status === 200 && response.data.access_token) {
      const token = response.data.access_token;
      await AsyncStorage.setItem('userToken', token);
      navigation.replace('Main');
    }
  } catch (error) {
    console.log('Erreur login:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      setMessage(t("InvalidCredentials"));
    } else if (error.response?.status === 422) {
      setMessage(t("PasswordTooShort"));
   } else if (error.response?.status === 403) {
      try {
        const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
        if (response.status === 200)
            setMessage(t("CodeResent"));
            navigation.navigate('Verifcode', { email });
        } catch (error) {
        if (error?.response?.status === 422)
            setMessage(t("ErrorResendCode"));
    }
      setMessage(t("EmailNotVerified"));
    } else {
      setMessage(t("NetworkError"));
    }
    } finally {
    setLoading(false);
  }
};

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

      <Text style={styles.title}>{t("Connexion")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("Email")}
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder={t("Password")}
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {message ? (<Text style={styles.message}>{message}</Text>) : null}
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={handleLogin} style={[styles.button, { flex: 1 }]} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? t("Login") + '...' : t("Login")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGoogleAuth} style={styles.googleButton} disabled={loading}>
          <Ionicons name="logo-google" size={20} color="#2f339e" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleRegister}>
        <Text style={styles.link}>{t("CreateAccount")}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 40,
    fontWeight: 'bold',
  },
  message: {
  marginBottom: 15,
  textAlign: 'center',
  fontSize: 14,
  color: '#ff4d4d',
},
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    color: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#2f339e',
    fontWeight: 'bold',
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  oauthButtonText: {
    color: '#2f339e',
    fontWeight: 'bold',
  },
  link: {
    color: '#fff',
    marginBottom: 30,
    textDecorationLine: 'underline',
  },
buttonRow: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
},
googleButton: {
  marginLeft: 10,
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 15,
  alignItems: 'center',
  justifyContent: 'center',
  width: 50,
  marginBottom: 15,
},

});

export default LoginScreen;
