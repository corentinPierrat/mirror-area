import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import "../components/i18n";
import { useTranslation } from "react-i18next";

const API_URL = 'https://84518e6399ca.ngrok-free.app';

const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t("Login") + '...' : t("Login")}</Text>
      </TouchableOpacity>

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
  link: {
    color: '#fff',
    marginBottom: 30,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
