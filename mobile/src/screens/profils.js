import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import "../components/i18n";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from '../components/LanguageSwitcher';
import { API_URL } from "../../config";
import { Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ProfileDashboard = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [isError, setIsError] = useState(false);
  const isAdmin = !!(userData?.is_admin || userData?.role === 'admin');

  const handleChangePassword = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }
    setMessage('');
    if (!currentPassword || !newPassword) {
      setIsError(true);
      setMessage(t("EmptyFields"));
      return;
    }
    if (newPassword.length < 8) {
      setIsError(true);
      setMessage(t("PasswordTooShort"));
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
        setMessage(t("ErrorChangePassword"));
        return;
      } else {
        setIsError(false);
        setMessage(t("PasswordUpdated"));
      }
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setIsError(true);
      setMessage(t("ErrorChangePassword"));
    }
};

  const handleDeleteAccount = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }
    try {
      const response = await axios.delete(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Login');
      }
    } catch (error) {
      setIsError(true);
      setMessage(t("ErrorDeleteAccount"));
    }
  };

 const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.replace('Login');
    } catch (error) {
      setIsError(true);
      setMessage(t("ErrorLogout"));
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
        console.log('User data loaded:', response.data);
      }
    } catch (error) {
      navigation.replace('Login');
      setIsError(true);
      setMessage(t("UpdateProfileError"));
    }
  };

const handleUploadProfileImage = async (navigation) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      navigation.replace('Login');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('PermissionDenied'), t('GalleryAccessRequired'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const imageUri = asset.uri;
    const mimeType = asset.mimeType || 'image/jpeg';
    const fileName = asset.fileName || `profile_${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;

    setUserData((prev) => ({ ...(prev || {}), profile_image_url: imageUri }));

    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    });

    const response = await axios.post(`${API_URL}/auth/me/profile-image`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status >= 200 && response.status < 300 && response.data) {
      setUserData(response.data);
    }
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    await handleUpdateProfile();
    Alert.alert(
      t('Error'), 
      error.response?.data?.detail || error.message || t('UploadError')
    );
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
    <LanguageSwitcher />
    <LinearGradient
      colors={['#1e293b', '#334155']}
      style={styles.profileCard}
    >
      <View style={styles.profileHeader}>
      <TouchableOpacity style={styles.avatarWrapper} onPress={() => handleUploadProfileImage(navigation)}>
          {userData?.profile_image_url ? (
            <Image source={{ uri: `${API_URL}` + userData?.profile_image_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={32} color="white" />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userData?.username || t("Guest")}</Text>
          <Text style={styles.subText}>{t("Welcome back!")}</Text>
        </View>

        {isAdmin && (
          <Pressable onPress={() => navigation.navigate('Admin')} style={styles.adminButtonTop}>
            <Ionicons name="settings-outline" size={24} color="#60a5fa" />
          </Pressable>
        )}
      </View>
    </LinearGradient>

      <View style={styles.passwordSection}>
        <Text style={styles.sectionTitle}>{t("changePassword")}</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder={t("Current Password")}
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
            placeholder={t("New Password")}
            placeholderTextColor="#64748b"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>

        <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
          <Text style={styles.changePasswordButtonText}>{t("changePassword")}</Text>
        </TouchableOpacity>
      </View>
     {message ? (<Text style={[styles.message, { color: isError ? '#ff4d4d' : '#63f614ff' }]}>{message}</Text>) : null}
     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 40 }}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>{t("logout")}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
        <Ionicons name="trash" size={20} color="#ef4444" />
      </TouchableOpacity>
      </View>
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
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  adminButtonText: { color: '#60a5fa', fontSize: 16, fontWeight: '700' },
  logoutButton: {
    width: '81%',
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
  deleteAccountButton: {
    padding: 15,
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
logoParameter: {
  position: 'absolute',
  bottom: -80,
  right: -5,
  opacity: 0.8,
},
  logoParameter: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
  borderRadius: 20,
  padding: 20,
  marginBottom: 24,
  backgroundColor: '#1e293b',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
},

profileHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
},

avatarWrapper: {
  width: 90,
  height: 90,
  borderRadius: 45,
  overflow: 'hidden',
  backgroundColor: '#000',
  justifyContent: 'center',
  alignItems: 'center',
},

avatar: {
  width: '100%',
  height: '100%',
  borderRadius: 45,
},

avatarPlaceholder: {
  width: '100%',
  height: '100%',
  borderRadius: 45,
  backgroundColor: '#0f172a',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#334155',
},

profileInfo: {
  flex: 1,
  marginLeft: 16,
},

userName: {
  color: '#ffffff',
  fontSize: 22,
  fontWeight: '700',
  marginBottom: 4,
},

subText: {
  color: '#94a3b8',
  fontSize: 14,
},

adminButtonTop: {
  padding: 10,
  borderRadius: 12,
  backgroundColor: '#0f172a',
  borderWidth: 1,
  borderColor: '#60a5fa',
},


});

export default ProfileDashboard;