import * as React from "react";
import  { useState } from "react";
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
  StatusBar,
  Image
} from "react-native";
import { useRouter } from "expo-router";
import api from "../../api/api";
import { useUser } from "@/context/UserContext";
import { storeAuthData } from "../../utils/auth";

const Login: React.FC = () => {
  const router = useRouter();
  const { setUserId } = useUser(); // <-- MOVE THIS TO THE TOP LEVEL
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("users/login", { email, password });

      // ✅ Save token using auth utility
      if (res.data.token && res.data.user) {
        await storeAuthData(res.data.token, res.data.user._id);
        setUserId(res.data.user._id); // 👈 store in context
      }

      Alert.alert("Success", "Login Successful");
      router.replace("/(tabs)/home"); // go to home
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

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
          <View className="bg-green-600 pt-16 pb-12 px-6 rounded-b-3xl">
            <View className="items-center">
              
              {/* App Logo */}
              <View className="bg-white rounded-full   mb-6 shadow-sm">
                <Image 
                  source={require('../../assets/images/Logo.png')}
                  className="w-36 h-36"
                  resizeMode="contain"
                />
              </View>
              
              <Text className="text-3xl font-bold text-white mb-3">
                Welcome
              </Text>
              <Text className="text-green-100 text-center text-base opacity-90 leading-6">
                Continue your journey to make{'\n'}our planet greener
              </Text>
            </View>
          </View>

          {/* Form Container */}
          <View className="flex-1 px-6 py-8">
            
            {/* Login Form Card */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              
              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2 ml-1">
                  Email Address
                </Text>
                <View className={`relative border rounded-xl ${
                  focusedField === 'email' 
                    ? 'border-green-500 bg-green-50/50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  {/* Email Icon */}
                  <View className="absolute left-4 top-1/2 transform -translate-y-3 z-10">
                    <Text className="text-lg opacity-70">📧</Text>
                  </View>
                  
                  {/* Email Input */}
                  <TextInput
                    placeholder="Enter your email address"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="pl-14 pr-4 py-4 text-gray-800 text-base"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2 ml-1">
                  Password
                </Text>
                <View className={`relative border rounded-xl ${
                  focusedField === 'password' 
                    ? 'border-green-500 bg-green-50/50' 
                    : 'border-gray-200 bg-gray-50'
                }`}>
                  {/* Password Icon */}
                  <View className="absolute left-4 top-1/2 transform -translate-y-3 z-10">
                    <Text className="text-lg opacity-70">🔐</Text>
                  </View>
                  
                  {/* Password Input */}
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    className="pl-14 pr-4 py-4 text-gray-800 text-base"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity 
                onPress={() => router.push("/auth/forgot-password")}
                className="self-end mb-6"
                disabled={isLoading}
              >
                <Text className="text-green-600 font-medium text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`p-4 rounded-xl ${
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
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </View>
              </TouchableOpacity>

            </View>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="mx-4 text-gray-500 font-medium text-sm">or</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Register Link */}
            <View className="items-center mb-8">
              <TouchableOpacity 
                onPress={() => router.push("/auth/register")}
                className="bg-green-50 border border-green-200 px-8 py-4 rounded-xl"
                disabled={isLoading}
              >
                <Text className="text-center text-green-700">
                  New to Recycle IT?{' '}
                  <Text className="font-semibold text-green-800">Create Account</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Eco Message */}
            <View className="items-center">
              <View className="bg-green-50 border border-green-200 px-6 py-3 rounded-full">
                <Text className="text-sm text-green-700 font-medium tracking-wide">
                  🌍 EVERY STEP COUNTS 🌍
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-3 text-center">
                Together, we&apos;re building a sustainable future
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Login;