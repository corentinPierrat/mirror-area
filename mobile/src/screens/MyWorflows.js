import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Workflows from '../components/Workflows';

export default function MyWorkflowScreen() {
  return (
    <LinearGradient
      colors={['#171542', '#2f339e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.text}>Mes Workflows</Text>

        <Workflows Name="New Workflow 1" Action="Spotify" Reaction="Outlook" />
        <Workflows Name="New Workflow 1" Action="Faceit" Reaction="Outlook" />
        <Workflows Name="New Workflow 1" Action="Faceit" Reaction="Discord" />
        <Workflows Name="New Workflow 1" Action="Steam" Reaction="Outlook" />
        <Workflows Name="New Workflow 1" Action="X" Reaction="Outlook" />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 65,
    paddingBottom: 125,
  },
  text: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
  },
});
