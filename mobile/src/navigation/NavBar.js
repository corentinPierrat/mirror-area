import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';
import Profils from '../screens/profils';
import CreateWorkflowScreen from '../screens/CreateWorflow';
import MyWorkflowScreen from '../screens/MyWorflows';
import ServiceScreen from '../screens/Services';
import FeedScreen from '../screens/Feed';
import "../components/i18n";
import { useTranslation } from "react-i18next";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'CreateWorkflow') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Feed') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'MyWorkflows') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => {
          try {
            return (
              <BlurView
                style={[StyleSheet.absoluteFill, styles.blurBackground]}
                intensity={80}
                tint="dark"
                experimentalBlurMethod={Platform.OS === 'ios' ? 'dimezisBlurView' : undefined}
              />
            );
          } catch (error) {
            return (
              <View style={[StyleSheet.absoluteFill, styles.fallbackBackground]} />
            );
          }
        },
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIconStyle: styles.tabBarIcon,
      })}
    >
      <Tab.Screen
        name="Profil"
        component={Profils}
        options={{ title: t("Profile") }}
      />
      <Tab.Screen
        name="CreateWorkflow"
        component={CreateWorkflowScreen}
        options={{ title: t("Create Workflow") }}
      />
      <Tab.Screen
        name="MyWorkflows"
        component={MyWorkflowScreen}
        options={{ title: t("My Workflows") }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{ title: t("Feed") }}
      />
      <Tab.Screen
        name="Services"
        component={ServiceScreen}
        options={{ title: t("Services") }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    elevation: 8,
    backgroundColor: 'transparent',
    borderRadius: 18,
    height: 80,
    paddingBottom: 10,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderTopWidth: 0,
    borderWidth: 0,
    ...(Platform.OS === 'android' && {
      elevation: 8,
      borderTopWidth: 0,
    }),
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    marginTop: 8,
    flexShrink: 1,
    textAlign: 'center',
  },
  tabBarIcon: {
    marginBottom: -4,
  },
  blurBackground: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  fallbackBackground: {
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
});
