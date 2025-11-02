import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [currentApiUrl, setCurrentApiUrl] = useState(API_URL);

  useEffect(() => {
    loadApiUrl();
  }, []);

  const loadApiUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('customApiUrl');
      if (savedUrl) {
        setCurrentApiUrl(savedUrl);
        setCustomApiUrl(savedUrl);
      } else {
        setCustomApiUrl(API_URL);
      }
    } catch (error) {
      console.log('Error loading API URL:', error);
    }
  };

  const saveApiUrl = async () => {
    try {
      if (customApiUrl.trim()) {
        await AsyncStorage.setItem('customApiUrl', customApiUrl.trim());
        setCurrentApiUrl(customApiUrl.trim());
        Alert.alert('Success', 'API URL updated. Please restart the app.');
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Please enter a valid URL');
      }
    } catch (error) {
      console.log('Error saving API URL:', error);
      Alert.alert('Error', 'Failed to save API URL');
    }
  };

  const resetApiUrl = async () => {
    try {
      await AsyncStorage.removeItem('customApiUrl');
      setCurrentApiUrl(API_URL);
      setCustomApiUrl(API_URL);
      Alert.alert('Success', 'API URL reset to default');
      setModalVisible(false);
    } catch (error) {
      console.log('Error resetting API URL:', error);
    }
  };

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
      const authUrl = `${currentApiUrl}/oauth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`;

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
      const response = await axios.post(`${currentApiUrl}/auth/register`, { username, email, password });

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

      <TouchableOpacity 
        style={styles.apiConfigButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="settings-outline" size={24} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <BlurView style={styles.modalBlur} intensity={90} tint="systemUltraThinMaterialDark" />
            <View style={styles.modalBorder} />

            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>API Configuration</Text>

              <Text style={styles.modalLabel}>Current API URL:</Text>
              <Text style={styles.currentUrl}>{currentApiUrl}</Text>

              <Text style={styles.modalLabel}>New API URL:</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://api.example.com"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={customApiUrl}
                onChangeText={setCustomApiUrl}
                autoCapitalize="none"
                keyboardType="url"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.resetButton]}
                  onPress={resetApiUrl}
                >
                  <Text style={styles.modalButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveApiUrl}
                >
                  <Text style={styles.modalButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
apiConfigButton: {
  position: 'absolute',
  top: 40,
  right: 20,
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.2)',
},
modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
},
modalContainer: {
  width: "85%",
  maxWidth: 400,
  borderRadius: 20,
  overflow: "hidden",
  position: "relative",
},
modalBlur: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},
modalBorder: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.2)",
},
modalContent: {
  padding: 24,
},
modalTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: "#fff",
  marginBottom: 20,
  textAlign: "center",
},
modalLabel: {
  fontSize: 14,
  color: "rgba(255,255,255,0.8)",
  marginTop: 12,
  marginBottom: 6,
  fontWeight: "600",
},
currentUrl: {
  fontSize: 12,
  color: "rgba(255,255,255,0.6)",
  fontFamily: "monospace",
  marginBottom: 8,
  padding: 8,
  backgroundColor: "rgba(255,255,255,0.05)",
  borderRadius: 6,
},
modalInput: {
  backgroundColor: "rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: 12,
  color: "#fff",
  fontSize: 14,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.2)",
  fontFamily: "monospace",
},
modalButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 24,
  gap: 8,
},
modalButton: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  borderWidth: 1,
},
cancelButton: {
  backgroundColor: "rgba(255,255,255,0.1)",
  borderColor: "rgba(255,255,255,0.2)",
},
resetButton: {
  backgroundColor: "rgba(255,165,0,0.2)",
  borderColor: "rgba(255,165,0,0.4)",
},
saveButton: {
  backgroundColor: "rgba(99,102,241,0.3)",
  borderColor: "rgba(99,102,241,0.5)",
},
modalButtonText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
},

});

export default RegisterScreen;
