import { View, Text } from "react-native";
import React from "react";

const SplashLogo: React.FC = () => {
  return (
    <View className="items-center justify-center">
      <Text className="text-4xl font-extrabold text-green-600">♻ Recycle It</Text>
      <Text className="text-base text-gray-500 mt-2">
        Recycle Today for a Sustainable Tomorrow
      </Text>
    </View>
  );
};

export default SplashLogo;
