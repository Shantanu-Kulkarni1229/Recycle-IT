import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import api from "../../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Register: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async () => {
    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.phoneNumber.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("users/register", form);

      // if your API returns token on register, store it immediately
      if (res.data.token) {
        await AsyncStorage.setItem("userToken", res.data.token);
        router.replace("/"); // directly logged in
      } else {
        // if API requires OTP first, redirect to verify screen
        router.push("/auth/verify-otp");
      }

      Alert.alert("Success", res.data.message);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldConfig = [
    { 
      key: "name", 
      placeholder: "Full Name", 
      icon: "👤",
      keyboardType: "default" as const
    },
    { 
      key: "email", 
      placeholder: "Email Address", 
      icon: "📧",
      keyboardType: "email-address" as const
    },
    { 
      key: "password", 
      placeholder: "Password", 
      icon: "🔒",
      keyboardType: "default" as const,
      secure: true
    },
    { 
      key: "phoneNumber", 
      placeholder: "Phone Number", 
      icon: "📱",
      keyboardType: "phone-pad" as const
    },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View className="bg-green-600 pt-16 pb-8 px-6 rounded-b-3xl">
            <View className="items-center">
              {/* App Logo */}
              <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <Text className="text-3xl">♻️</Text>
              </View>
              
              <Text className="text-2xl font-bold text-white mb-2">
                Create Account
              </Text>
              <Text className="text-green-100 text-center text-base opacity-90">
                Join Recycle IT and start your journey{'\n'}towards a sustainable future
              </Text>
            </View>
          </View>

          {/* Form Container */}
          <View className="flex-1 px-6 py-6">
            
            {/* Form Card */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              
              {/* Input Fields */}
              {fieldConfig.map((field, index) => (
                <View key={field.key} className="mb-5">
                  <Text className="text-gray-700 font-medium mb-2 ml-1">
                    {field.placeholder}
                  </Text>
                  <View className={`relative border rounded-xl ${
                    focusedField === field.key 
                      ? 'border-green-500 bg-green-50/50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    {/* Input Icon */}
                    <View className="absolute left-4 top-1/2 transform -translate-y-3 z-10">
                      <Text className="text-lg opacity-70">{field.icon}</Text>
                    </View>
                    
                    {/* Text Input */}
                    <TextInput
                      placeholder={`Enter your ${field.placeholder.toLowerCase()}`}
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={field.secure}
                      keyboardType={field.keyboardType}
                      className="pl-14 pr-4 py-4 text-gray-800 text-base"
                      value={(form as any)[field.key]}
                      onChangeText={(text) => setForm({ ...form, [field.key]: text })}
                      onFocus={() => setFocusedField(field.key)}
                      onBlur={() => setFocusedField(null)}
                      editable={!isLoading}
                    />
                  </View>
                </View>
              ))}

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
                className={`mt-4 p-4 rounded-xl ${
                  isLoading 
                    ? 'bg-gray-400' 
                    : 'bg-green-600 active:bg-green-700'
                } shadow-sm`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <View className="flex-row items-center justify-center">
                  {isLoading && (
                    <ActivityIndicator 
                      size="small" 
                      color="#FFFFFF" 
                      className="mr-3"
                    />
                  )}
                  <Text className="text-white text-center text-lg font-semibold">
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Terms and Privacy */}
              <Text className="text-xs text-gray-500 text-center mt-4 leading-4">
                By creating an account, you agree to our{' '}
                <Text className="text-green-600 font-medium">Terms of Service</Text>
                {' '}and{' '}
                <Text className="text-green-600 font-medium">Privacy Policy</Text>
              </Text>

            </View>

            {/* Login Link */}
            <View className="items-center mt-6">
              <TouchableOpacity 
                onPress={() => router.push("/auth/login")}
                className="py-3 px-6"
                disabled={isLoading}
              >
                <Text className="text-center text-gray-600">
                  Already have an account?{' '}
                  <Text className="font-semibold text-green-600">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Eco Badge */}
            <View className="items-center mt-8 mb-4">
              <View className="bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                <Text className="text-xs text-green-700 font-medium tracking-wide">
                  🌱 REDUCE • REUSE • RECYCLE 🌱
                </Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Register;