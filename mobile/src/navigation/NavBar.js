import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import ProfileScreen from '../screens/profils';
import CreateWorkflowScreen from '../screens/CreateWorflow';
import MyWorkflowScreen from '../screens/MyWorflows';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Créer Workflow') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Mes Workflows') {
            iconName = focused ? 'folder' : 'folder-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Profil" component={ProfileScreen} />
      <Tab.Screen name="Créer Workflow" component={CreateWorkflowScreen} />
      <Tab.Screen name="Mes Workflows" component={MyWorkflowScreen} />
    </Tab.Navigator>
  );
}
