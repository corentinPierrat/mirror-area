import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import axios from 'axios';

const API_URL = 'https://ca332d54dc6a.ngrok-free.app';

import { useNavigation } from '@react-navigation/native';

export default function Verifcode({ route }) {
  const { email } = route.params;
  const navigation = useNavigation();

  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setMessage('Le code de vérification est trop court');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post(`${API_URL}/auth/verify`, { email, code });
      if (response.status === 200) {
        navigation.replace('Login');
      }
    } catch (error) {
      if (error?.response?.status === 422 || error?.response?.status === 400) {
        setMessage('Code invalide');
      } else {
        setMessage('Erreur serveur');
      }
    } finally {
      setLoading(false);
    }
  };

const handleresendCode = async () => {
    setMessage('');
    try {
        const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
        if (response.status === 200)
            setMessage('Code renvoyé !');
    } catch (error) {
        if (error?.response?.status === 422)
            setMessage('Erreur lors de l\'envoi du code');
    }
}

  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Code de vérification</Text>
        <Text style={styles.subtitle}>
          Entrez le code envoyé à votre adresse email
        </Text>

        <View style={styles.inputWrapper}>
          <BlurView
            style={styles.blurContainer}
            intensity={80}
            tint="systemUltraThinMaterialDark"
            experimentalBlurMethod="dimezisBlurView"
          />
          <View style={styles.overlayContainer} />
          <TextInput
            style={styles.input}
            placeholder="000000"
            placeholderTextColor="rgba(241,245,249,0.4)"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {message ? (<Text style={styles.message}>{message}</Text>) : null}

        <TouchableOpacity
            activeOpacity={0.2}
            style={styles.buttonWrapper}
            onPress={handleVerify}
        >
          <BlurView
            style={styles.blurContainer}
            intensity={80}
            tint="systemUltraThinMaterialDark"
            experimentalBlurMethod="dimezisBlurView"
          />
          <View style={styles.buttonOverlay} />
          <View style={styles.buttonContent} >
            <Text style={styles.buttonText}>{loading ? 'Vérification...' : 'Vérifier'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton} onPress={handleresendCode}>
          <Text style={styles.resendText}>Renvoyer le code</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(241,245,249,0.7)',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputWrapper: {
    width: '100%',
    borderRadius: 18,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
    message: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
    color: '#ff4d4d',
    },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  input: {
    paddingVertical: 20,
    paddingHorizontal: 22,
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: 'rgba(248,250,252,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(248,250,252,0.2)',
  },
  buttonWrapper: {
    width: '100%',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  buttonContent: {
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});