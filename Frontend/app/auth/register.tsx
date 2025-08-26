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
  Dimensions 
} from "react-native";
import { useRouter } from "expo-router";
import api from "../../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MotiView } from "moti";

const { width } = Dimensions.get('window');

const Register: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("users/register", form);

      // if your API returns token on register, store it immediately
      if (res.data.token) {
        await AsyncStorage.setItem("userToken", res.data.token);
        router.replace("/home"); // directly logged in
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {/* Background with gradient effect using View layers */}
      <View className="absolute inset-0 bg-green-50" />
      <View 
        className="absolute inset-0 opacity-30"
        // To achieve gradients in React Native, use a library like 'react-native-linear-gradient'
      />
      
      {/* Floating Background Elements */}
      <MotiView
        from={{ translateY: -20, opacity: 0.3 }}
        animate={{ translateY: 20, opacity: 0.6 }}
        transition={{
          type: 'timing',
          duration: 4000,
          loop: true,
          repeatReverse: true,
        }}
        className="absolute top-20 right-8"
      >
        <Text className="text-4xl">🌿</Text>
      </MotiView>

      <MotiView
        from={{ translateX: -30, opacity: 0.2 }}
        animate={{ translateX: 10, opacity: 0.5 }}
        transition={{
          type: 'timing',
          duration: 3500,
          loop: true,
          repeatReverse: true,
          delay: 1000,
        }}
        className="absolute top-32 left-4"
      >
        <Text className="text-3xl">🍃</Text>
      </MotiView>

      <MotiView
        from={{ rotate: '0deg', opacity: 0.1 }}
        animate={{ rotate: '360deg', opacity: 0.3 }}
        transition={{
          type: 'timing',
          duration: 8000,
          loop: true,
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-12 -translate-y-12"
      >
        <Text className="text-6xl text-green-200">♻️</Text>
      </MotiView>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-8">
          
          {/* Header Section */}
          <MotiView
            from={{ opacity: 0, translateY: -30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800 }}
            className="items-center mb-8"
          >
            {/* App Logo */}
            <View className="bg-white rounded-full p-4 shadow-lg mb-4">
              <Text className="text-4xl">♻️</Text>
            </View>
            
            <Text className="text-3xl font-bold text-green-700 mb-2">
              Join Recycle IT
            </Text>
            <Text className="text-base text-green-600 text-center leading-6">
              Start your journey towards a{'\n'}
              <Text className="font-semibold">sustainable tomorrow 🌍</Text>
            </Text>
          </MotiView>

          {/* Form Section */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 600, delay: 300 }}
          >
            <View className="bg-white/90 rounded-2xl p-6 shadow-lg backdrop-blur-sm mb-6">
              
              {/* Input Fields */}
              {fieldConfig.map((field, index) => (
                <MotiView
                  key={field.key}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ 
                    type: 'timing', 
                    duration: 500, 
                    delay: 500 + (index * 100) 
                  }}
                  className="mb-4"
                >
                  <View className="relative">
                    {/* Input Icon */}
                    <View className="absolute left-3 top-1/2 transform -translate-y-3 z-10">
                      <Text className="text-lg">{field.icon}</Text>
                    </View>
                    
                    {/* Text Input */}
                    <TextInput
                      placeholder={field.placeholder}
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={field.secure}
                      keyboardType={field.keyboardType}
                      className="bg-gray-50 border border-gray-200 pl-12 pr-4 py-4 rounded-xl text-gray-700 text-base"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                      }}
                      value={(form as any)[field.key]}
                      onChangeText={(text) => setForm({ ...form, [field.key]: text })}
                    />
                  </View>
                </MotiView>
              ))}

              {/* Register Button */}
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  damping: 15, 
                  stiffness: 150, 
                  delay: 900 
                }}
                className="mt-4"
              >
                <TouchableOpacity
                  onPress={handleRegister}
                  disabled={isLoading}
                  className={`${isLoading ? 'bg-green-400' : 'bg-green-600'} p-4 rounded-xl shadow-lg`}
                  style={{
                    shadowColor: '#059669',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading && (
                      <View className="mr-2">
                        <Text>⏳</Text>
                      </View>
                    )}
                    <Text className="text-white text-center text-lg font-semibold">
                      {isLoading ? 'Creating Account...' : 'Create Account 🌱'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </MotiView>

            </View>
          </MotiView>

          {/* Login Link */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 1000 }}
            className="items-center"
          >
            <TouchableOpacity 
              onPress={() => router.push("/auth/login")}
              className="bg-white/80 px-6 py-3 rounded-full"
            >
              <Text className="text-center text-green-700 font-medium">
                Already have an account? <Text className="font-bold text-green-800">Sign In</Text>
              </Text>
            </TouchableOpacity>
          </MotiView>

          {/* Bottom Eco Message */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 1000, delay: 1200 }}
            className="mt-8 items-center"
          >
            <View className="bg-green-100/80 px-4 py-2 rounded-full">
              <Text className="text-xs text-green-600 font-medium tracking-wide">
                🌱 REDUCE • REUSE • RECYCLE 🌱
              </Text>
            </View>
          </MotiView>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;