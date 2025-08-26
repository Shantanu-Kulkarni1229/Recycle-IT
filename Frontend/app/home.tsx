import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const Home: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    // Clear any auth tokens or user data here if you have them
    router.replace("/auth/login"); // Redirect to login screen
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-green-600 mb-6">
        Welcome to Recycle It!
      </Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-bold text-lg">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;
