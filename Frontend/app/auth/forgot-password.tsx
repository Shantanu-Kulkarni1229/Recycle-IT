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

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleForgot = async () => {
    // Basic validation
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("users/forgot-password", { email });
      setEmailSent(true);
      Alert.alert("Success", res.data.message);
      
      // Small delay before navigation for better UX
      setTimeout(() => {
        router.push("/auth/reset-password");
      }, 1500);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
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
          <View className="bg-blue-600 pt-16 pb-12 px-6 rounded-b-3xl">
            <View className="items-center">
              
              {/* Security Icon */}
              <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
                <Text className="text-4xl">🔐</Text>
              </View>
              
              <Text className="text-3xl font-bold text-white mb-3">
                Forgot Password?
              </Text>
              <Text className="text-blue-100 text-center text-base opacity-90 leading-6">
                No worries! We'll help you{'\n'}reset your password securely
              </Text>
            </View>
          </View>

          {/* Form Container */}
          <View className="flex-1 px-6 py-8">
            
            {/* Instructions Card */}
            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <View className="flex-row items-start">
                <Text className="text-xl mr-3 mt-0.5">💡</Text>
                <Text className="text-blue-700 text-sm leading-5 flex-1">
                  Enter your registered email address and we'll send you a verification code to reset your password.
                </Text>
              </View>
            </View>
            
            {/* Form Card */}
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              
              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-2 ml-1">
                  Email Address
                </Text>
                <View className={`relative border rounded-xl ${
                  emailSent 
                    ? 'border-green-300 bg-green-50/30' 
                    : focusedField === 'email' 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-gray-200 bg-gray-50'
                }`}>
                  {/* Email Icon */}
                  <View className="absolute left-4 top-1/2 transform -translate-y-3 z-10">
                    <Text className="text-lg opacity-70">📧</Text>
                  </View>
                  
                  {/* Email Input */}
                  <TextInput
                    placeholder="Enter your registered email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!emailSent && !isLoading}
                    className="pl-14 pr-14 py-4 text-gray-800 text-base"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                  
                  {/* Success checkmark */}
                  {emailSent && (
                    <View className="absolute right-4 top-1/2 transform -translate-y-3">
                      <Text className="text-lg">✅</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Send Code Button */}
              <TouchableOpacity
                onPress={handleForgot}
                disabled={isLoading || emailSent}
                className={`p-4 rounded-xl shadow-sm ${
                  emailSent 
                    ? 'bg-green-500' 
                    : isLoading 
                      ? 'bg-gray-400' 
                      : 'bg-blue-600 active:bg-blue-700'
                }`}
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
                  {emailSent && (
                    <Text className="text-lg mr-3">✅</Text>
                  )}
                  <Text className="text-white text-center text-lg font-semibold">
                    {emailSent 
                      ? 'Email Sent Successfully!' 
                      : isLoading 
                        ? 'Sending...' 
                        : 'Send Verification Code'
                    }
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Success Message */}
              {emailSent && (
                <View className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
                  <View className="flex-row items-start">
                    <Text className="text-xl mr-3 mt-0.5">🎉</Text>
                    <View className="flex-1">
                      <Text className="text-green-700 text-sm font-medium mb-1">
                        Check your email for the verification code!
                      </Text>
                      <Text className="text-green-600 text-xs">
                        Redirecting you to reset page...
                      </Text>
                    </View>
                  </View>
                </View>
              )}

            </View>

            {/* Back to Login */}
            <View className="items-center mb-8">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm"
                disabled={isLoading}
              >
                <Text className="text-center text-gray-600 font-medium">
                  ← Back to Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Security Message */}
            <View className="items-center">
              <View className="bg-blue-50 border border-blue-200 px-6 py-3 rounded-full">
                <Text className="text-sm text-blue-700 font-medium tracking-wide">
                  🔒 YOUR DATA IS SECURE 🔒
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-3 text-center">
                We take your privacy and security seriously
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default ForgotPassword;