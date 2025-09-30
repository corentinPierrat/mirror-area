import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import Verifcode from './../screens/Verifcode';

const API_URL = 'https://04ad3d20fb84.ngrok-free.app';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/auth/register`, { email, password });

      if (response.status === 200) {
        navigation.navigate('Verifcode');
      }
    } catch (error) {
      console.log('Erreur register:', error.response?.data || error.message);

      if (error.response?.status === 422) {
        setMessage('Le mot de passe doit faire 8 caractères minimum');
      } else if (error.response?.status === 400) {
        setMessage('Cet email est déjà utilisé');
      } else {
        setMessage('Erreur réseau, veuillez réessayer');
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
      <Text style={styles.title}>Créer un compte</Text>

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
        placeholder="Mot de passe"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#ccc"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity onPress={handleRegister} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Inscription...' : "S'inscrire"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text styltokene={styles.link}>Retour à la connexion</Text>
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
});

export default RegisterScreen;
