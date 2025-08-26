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

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("users/login", { email, password });

      // ✅ Save token
      if (res.data.token) {
        await AsyncStorage.setItem("userToken", res.data.token);
      }

      Alert.alert("Success", "Login Successful");
      router.replace("/home"); // go to home
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {/* Background with gradient effect using View layers */}
      <View className="absolute inset-0 bg-green-50" />
      <View 
        className="absolute inset-0 opacity-30"
        // To add a gradient background in React Native, use a library like 'react-native-linear-gradient'
      />
      
      {/* Floating Background Elements */}
      <MotiView
        from={{ translateY: -30, opacity: 0.2 }}
        animate={{ translateY: 30, opacity: 0.5 }}
        transition={{
          type: 'timing',
          duration: 5000,
          loop: true,
          repeatReverse: true,
        }}
        className="absolute top-16 right-6"
      >
        <Text className="text-5xl">🌲</Text>
      </MotiView>

      <MotiView
        from={{ translateX: -20, opacity: 0.3 }}
        animate={{ translateX: 20, opacity: 0.6 }}
        transition={{
          type: 'timing',
          duration: 4000,
          loop: true,
          repeatReverse: true,
          delay: 1500,
        }}
        className="absolute top-28 left-8"
      >
        <Text className="text-3xl">🌿</Text>
      </MotiView>

      <MotiView
        from={{ scale: 0.8, opacity: 0.1 }}
        animate={{ scale: 1.2, opacity: 0.25 }}
        transition={{
          type: 'timing',
          duration: 6000,
          loop: true,
          repeatReverse: true,
        }}
        className="absolute top-1/3 right-4"
      >
        <Text className="text-4xl">🍃</Text>
      </MotiView>

      <MotiView
        from={{ rotate: '0deg', opacity: 0.1 }}
        animate={{ rotate: '360deg', opacity: 0.3 }}
        transition={{
          type: 'timing',
          duration: 10000,
          loop: true,
        }}
        className="absolute bottom-32 left-1/4 transform -translate-x-8"
      >
        <Text className="text-7xl text-green-200">♻️</Text>
      </MotiView>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-8">
          
          {/* Header Section */}
          <MotiView
            from={{ opacity: 0, translateY: -40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            className="items-center mb-12"
          >
            {/* Welcome Back Animation */}
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                damping: 12,
                stiffness: 100,
                delay: 300,
              }}
              className="mb-6"
            >
              <View className="bg-white rounded-full p-6 shadow-xl">
                <Text className="text-5xl">🌍</Text>
              </View>
            </MotiView>
            
            <Text className="text-4xl font-bold text-green-700 mb-3 text-center">
              Welcome Back
            </Text>
            <Text className="text-lg text-green-600 text-center leading-7 px-4">
              Continue your journey to make{'\n'}
              <Text className="font-semibold">our planet greener 🌱</Text>
            </Text>
          </MotiView>

          {/* Form Section */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 600, delay: 600 }}
          >
            <View className="bg-white/95 rounded-3xl p-8 shadow-xl backdrop-blur-sm mb-8">
              
              {/* Email Input */}
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ 
                  type: 'timing', 
                  duration: 500, 
                  delay: 800 
                }}
                className="mb-6"
              >
                <View className="relative">
                  {/* Email Icon */}
                  <View className="absolute left-4 top-1/2 transform -translate-y-3 z-10">
                    <Text className="text-xl">📧</Text>
                  </View>
                  
                  {/* Email Input */}
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="bg-gray-50 border border-gray-200 pl-14 pr-4 py-5 rounded-2xl text-gray-700 text-lg"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </MotiView>

              {/* Password Input */}
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ 
                  type: 'timing', 
                  duration: 500, 
                  delay: 950 
                }}
                className="mb-6"
              >
                <View className="relative">
                  {/* Password Icon */}
                  <View className="absolute left-4 top-1/2 transform -translate-y-3 z-10">
                    <Text className="text-xl">🔐</Text>
                  </View>
                  
                  {/* Password Input */}
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    className="bg-gray-50 border border-gray-200 pl-14 pr-4 py-5 rounded-2xl text-gray-700 text-lg"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 3,
                    }}
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
              </MotiView>

              {/* Login Button */}
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  damping: 15, 
                  stiffness: 150, 
                  delay: 1100 
                }}
              >
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  className={`${isLoading ? 'bg-green-400' : 'bg-green-600'} p-5 rounded-2xl shadow-lg`}
                  style={{
                    shadowColor: '#059669',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 10,
                    elevation: 8,
                  }}
                >
                  <View className="flex-row items-center justify-center">
                    {isLoading && (
                      <View className="mr-3">
                        <Text className="text-lg">⏳</Text>
                      </View>
                    )}
                    <Text className="text-white text-center text-xl font-bold">
                      {isLoading ? 'Signing In...' : 'Sign In 🚀'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </MotiView>

            </View>
          </MotiView>

          {/* Action Links */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 1300 }}
            className="items-center space-y-4"
          >
            
            {/* Forgot Password */}
            <TouchableOpacity 
              onPress={() => router.push("/auth/forgot-password")}
              className="bg-white/80 px-6 py-3 rounded-full shadow-sm"
            >
              <Text className="text-center text-green-700 font-medium text-base">
                🔑 Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <View className="flex-row items-center mt-4">
              <View className="flex-1 h-px bg-green-200" />
              <Text className="mx-4 text-green-600 font-medium">or</Text>
              <View className="flex-1 h-px bg-green-200" />
            </View>

            <TouchableOpacity 
              onPress={() => router.push("/auth/register")}
              className="bg-green-100 px-8 py-4 rounded-full shadow-sm"
              style={{
                shadowColor: '#16A34A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text className="text-center text-green-800 font-semibold text-base">
                🌱 New to Recycle IT? <Text className="font-bold">Join Us</Text>
              </Text>
            </TouchableOpacity>

          </MotiView>

          {/* Bottom Eco Message */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 1000, delay: 1500 }}
            className="mt-12 items-center"
          >
            <View className="bg-green-100/90 px-6 py-3 rounded-full shadow-sm">
              <Text className="text-sm text-green-700 font-semibold tracking-wider">
                🌍 EVERY STEP COUNTS 🌍
              </Text>
            </View>
            <Text className="text-xs text-green-600 mt-3 text-center opacity-80">
              Together, we're building a sustainable future
            </Text>
          </MotiView>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;