import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import Verifcode from './../screens/Verifcode';
import { t } from 'i18next';
import { API_URL } from "../../config";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setMessage(t("EmptyFields"));
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t("PasswordDoesNotMatch"));
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });

      if (response.status === 200) {
        navigation.navigate('Verifcode', { email });
      }
    } catch (error) {
      console.log('Erreur register:', error.response?.data || error.message);

      if (error.response?.status === 422) {
        setMessage(t("PasswordTooShort"));
      } else if (error.response?.status === 400) {
        setMessage(t("EmailAlreadyUsed"));
      } else {
        setMessage(t("NetworkError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Text style={styles.title}>{t("Create Account")}</Text>

      <TextInput
        style={styles.input}
        placeholder={t("Username")}
        placeholderTextColor="#ccc"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
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

      <TextInput
        style={styles.input}
        placeholder={t("Confirm Password")}
        placeholderTextColor="#ccc"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

    <View style={styles.buttonRow}>
      <TouchableOpacity onPress={handleRegister} style={[styles.button, { flex: 1 }]} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t("Register") + '...' : t("Register")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoogleAuth} style={styles.googleButton} disabled={loading}>
        <Ionicons name="logo-google" size={20} color="#2f339e" />
      </TouchableOpacity>
    </View>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>{t("Back to Login")}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 40,
    fontWeight: 'bold'
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    color: '#fff'
  },
  button: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15
  },
  buttonText: {
    color: '#2f339e',
    fontWeight: 'bold'
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  oauthButtonText: {
    color: '#2f339e',
    fontWeight: 'bold',
  },
  link: {
    color: '#fff',
    marginTop: 10,
    textDecorationLine: 'underline'
  },
  message: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#ff4d4d'
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

export default RegisterScreen;
