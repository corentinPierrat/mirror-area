import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Verifcode() {
  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
        <Text style={styles.text}>Code de vérification</Text>
        <input style={styles.text}>Entrez le code envoyé à votre adresse email</input>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
     flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 65,
  },
  text: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
});
