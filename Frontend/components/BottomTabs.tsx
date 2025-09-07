import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";

// Icons (You can replace with your preferred icons)
const HomeIcon = () => <Text>🏠</Text>;
const RecyclersIcon = () => <Text>📍</Text>;
const HistoryIcon = () => <Text>📜</Text>;
const LearnIcon = () => <Text>📚</Text>;
const ProfileIcon = () => <Text>👤</Text>;

// Sample screens
const HomeScreen = ({ userId }: { userId: string | null }) => (
  <View className="flex-1 items-center justify-center">
    <Text>Home Screen</Text>
    <Text>UserId: {userId}</Text>
  </View>
);

const RecyclersScreen = ({ userId }: { userId: string | null }) => (
  <View className="flex-1 items-center justify-center">
    <Text>Recyclers Nearby</Text>
    <Text>UserId: {userId}</Text>
  </View>
);

const HistoryScreen = ({ userId }: { userId: string | null }) => (
  <View className="flex-1 items-center justify-center">
    <Text>History</Text>
    <Text>UserId: {userId}</Text>
  </View>
);

const LearnScreen = ({ userId }: { userId: string | null }) => (
  <View className="flex-1 items-center justify-center">
    <Text>Learn</Text>
    <Text>UserId: {userId}</Text>
  </View>
);

const ProfileScreen = ({ userId }: { userId: string | null }) => (
  <View className="flex-1 items-center justify-center">
    <Text>Profile</Text>
    <Text>UserId: {userId}</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    };
    fetchUserId();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#059669",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: { backgroundColor: "#F9FAFB", height: 70, paddingBottom: 10 },
        }}
      >
        <Tab.Screen
          name="Home"
          children={() => <HomeScreen userId={userId} />}
          options={{ tabBarIcon: HomeIcon }}
        />
        <Tab.Screen
          name="Recyclers"
          children={() => <RecyclersScreen userId={userId} />}
          options={{ tabBarIcon: RecyclersIcon }}
        />
        <Tab.Screen
          name="History"
          children={() => <HistoryScreen userId={userId} />}
          options={{ tabBarIcon: HistoryIcon }}
        />
        <Tab.Screen
          name="Learn"
          children={() => <LearnScreen userId={userId} />}
          options={{ tabBarIcon: LearnIcon }}
        />
        <Tab.Screen
          name="Profile"
          children={() => <ProfileScreen userId={userId} />}
          options={{ tabBarIcon: ProfileIcon }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default BottomTabs;
