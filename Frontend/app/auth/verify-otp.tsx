import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "../../api/api";

const VerifyOtp: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const res = await api.post("users/verify-otp", { email, otp });
      Alert.alert("Success", res.data.message);
      router.replace("/auth/login");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-4">Verify OTP</Text>

      <TextInput
        placeholder="Email"
        className="border p-3 mb-3 rounded-lg"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Enter OTP"
        className="border p-3 mb-3 rounded-lg"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        onPress={handleVerify}
        className="bg-green-600 p-3 rounded-lg"
      >
        <Text className="text-white text-center">Verify</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyOtp;
