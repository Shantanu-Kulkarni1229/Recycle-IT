// app/(tabs)/_layout.tsx
import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Enhanced tab bar styling
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          paddingHorizontal: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        // Enhanced active/inactive colors with better contrast
        tabBarActiveTintColor: "#10b981", // Emerald-500 for better accessibility
        tabBarInactiveTintColor: "#6b7280", // Gray-500 for subtle inactive state
        // Enhanced label styling
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
          letterSpacing: 0.3,
        },
        // Icon styling with better spacing
        tabBarIconStyle: {
          marginBottom: -2,
        },
        // Add smooth transition animation
        tabBarHideOnKeyboard: true,
        // Enhanced item styling
        tabBarItemStyle: {
          paddingVertical: 4,
          borderRadius: 16,
          marginHorizontal: 2,
        },
        // Add background color change on press
        tabBarPressOpacity: 0.8,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
          tabBarBadge: undefined, // Can be used for notifications
        }}
      />
      <Tabs.Screen
        name="previous-history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "time" : "time-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="recyclers-nearby"
        options={{
          title: "recyclers-nearby",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "location" : "location-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "book" : "book-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={focused ? size + 2 : size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}