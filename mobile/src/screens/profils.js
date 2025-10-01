import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://b107b2467506.ngrok-free.app';

const ProfileDashboard = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [isError, setIsError] = useState(false);

  const handleChangePassword = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }
    setMessage('');
    if (!currentPassword || !newPassword) {
      setIsError(true);
      setMessage('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword.length < 8) {
      setIsError(true);
      setMessage('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    try {
      const response = await axios.patch(`${API_URL}/auth/change-password`, { old_password: currentPassword, new_password: newPassword }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status !== 200) {
        setIsError(true);
        setMessage('Erreur lors du changement de mot de passe');
        return;
      } else {
        setIsError(false);
        setMessage('Mot de passe modifié avec succès');
      }
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setIsError(true);
      setMessage('Erreur lors du changement de mot de passe');
    }
};

 const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      setMessage('Erreur lors de la déconnexion');
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
      setMessage('Erreur lors de la mise à jour du profil');
    }
  };

  useEffect(() => {
    handleUpdateProfile();
  }, []);

  return (

    <LinearGradient
            colors={['#171542', '#2f339e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
          >
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <LinearGradient
        colors={['#1e293b', '#334155']}
        style={styles.profileCard}
      >
        <View style={styles.profileContent}>
          <Text style={styles.welcomeText}>Bienvenue,</Text>
          <Text style={styles.userName}>{userData?.username}</Text>
          <Text style={styles.subText}>Ravi de vous revoir !</Text>
        </View>

        <View style={styles.glowContainer}>
          <LinearGradient
            colors={['#60a5fa', '#3b82f6']}
            style={styles.glowEffect}
          />
          <LinearGradient
            colors={['#67e8f9', '#3b82f6']}
            style={styles.innerGlow}
          />
          <View style={styles.centerOrb} />
        </View>
      </LinearGradient>

      <View style={styles.passwordSection}>
        <Text style={styles.sectionTitle}>Changer le mot de passe</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Mot de passe actuel"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="key-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Nouveau mot de passe"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
          <Text style={styles.changePasswordButtonText}>Modifier le mot de passe</Text>
        </TouchableOpacity>
      </View>
     {message ? (<Text style={[styles.message, { color: isError ? '#ff4d4d' : '#63f614ff' }]}>{message}</Text>) : null}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 38,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
    height: 200,
  },
  profileContent: {
    zIndex: 2,
  },
  welcomeText: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 18,
  },
  glowContainer: {
    position: 'absolute',
    right: -20,
    top: -10,
    width: 120,
    height: 120,
  },
  glowEffect: {
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
    position: 'absolute',
  },
  innerGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.5,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  centerOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#60a5fa',
    opacity: 0.8,
    position: 'absolute',
    top: 20,
    left: 20,
  },
  passwordSection: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  changePasswordButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  changePasswordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  message: {
  marginTop: -10,
  marginBottom: 10,
  textAlign: 'center',
  fontSize: 14,
},
});

export default ProfileDashboard;