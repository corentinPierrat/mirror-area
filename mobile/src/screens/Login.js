import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    Alert.alert('Login', `Email: ${email}\nPassword: ${password}`);
  };

  const handleRegister = () => {
    Alert.alert('Register', 'Redirection vers la page d’inscription');
  };

  const handleForgotPassword = () => {
    Alert.alert('Mot de passe oublié', 'Redirection vers la récupération du mot de passe');
  };

  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

    <TouchableOpacity style={styles.backButton} onPress={() => navigation.replace('Main')}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
    </TouchableOpacity>
      <Text style={styles.title}>Connexion</Text>

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
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.link}>Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Créer un compte</Text>
    </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
    },
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
  registerButton: {
    borderColor: '#fff',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
