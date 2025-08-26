import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "../../api/api";

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });

  const handleReset = async () => {
    try {
      const res = await api.post("users/reset-password", form);
      Alert.alert("Success", res.data.message);
      router.replace("/auth/login");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-4">Reset Password</Text>

      {["email", "otp", "newPassword"].map((field) => (
        <TextInput
          key={field}
          placeholder={field}
          secureTextEntry={field === "newPassword"}
          className="border p-3 mb-3 rounded-lg"
          value={(form as any)[field]}
          onChangeText={(text) => setForm({ ...form, [field]: text })}
        />
      ))}

      <TouchableOpacity
        onPress={handleReset}
        className="bg-green-600 p-3 rounded-lg"
      >
        <Text className="text-white text-center">Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResetPassword;
