import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/api";

const ResendOtp: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailError, setEmailError] = useState("");

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError("");
    if (otpSent) setOtpSent(false);
  };

  const handleResend = async () => {
    if (countdown > 0) return; // Prevent spam requests
    
    // Validation
    setEmailError("");
    
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await api.post("users/resend-otp", { email: email.toLowerCase().trim() });
      setOtpSent(true);
      setCountdown(60); // 60 second cooldown
      Alert.alert("Success", res.data.message || "OTP sent successfully to your email");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to resend OTP. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50" 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="pt-16 pb-8 px-6">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm mb-6"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="refresh-outline" size={32} color="#ea580c" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Resend OTP</Text>
            <Text className="text-gray-600 text-center leading-6 px-4">
              Didn&apos;t receive the verification code? We&apos;ll send a new one to your email address.
            </Text>
          </View>
        </View>

        {/* Form Container */}
        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8">
          
          {/* Info Card */}
          <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-start">
              <View className="mr-3 mt-0.5">
                <Ionicons name="information-circle-outline" size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="text-orange-800 font-medium mb-1">Before requesting a new code:</Text>
                <Text className="text-orange-700 text-sm leading-5">
                  • Check your spam/junk folder{'\n'}
                  • Wait a few minutes for delivery{'\n'}
                  • Ensure stable internet connection
                </Text>
              </View>
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
            <View className="relative">
              <TextInput
                placeholder="Enter your registered email"
                placeholderTextColor="#9CA3AF"
                className={`border-2 p-4 rounded-xl text-gray-900 pr-12 ${
                  emailError ? 'border-red-300 bg-red-50' : 
                  otpSent ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <View className="absolute right-4 top-4">
                {otpSent && !emailError ? (
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                ) : (
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                )}
              </View>
            </View>
            {emailError ? (
              <View className="flex-row items-center mt-2">
                <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
                <Text className="text-red-500 text-sm ml-1">{emailError}</Text>
              </View>
            ) : null}
          </View>

          {/* Countdown Timer */}
          {countdown > 0 && (
            <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={20} color="#2563eb" />
                  <Text className="text-blue-800 font-medium ml-2">Cooldown Active</Text>
                </View>
                <Text className="text-blue-600 font-bold text-lg">{formatCountdown(countdown)}</Text>
              </View>
              <Text className="text-blue-700 text-sm">
                Please wait before requesting another code
              </Text>
              {/* Progress Bar */}
              <View className="mt-3 bg-blue-200 rounded-full h-2 overflow-hidden">
                <View 
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((60 - countdown) / 60) * 100}%` }}
                />
              </View>
            </View>
          )}

          {/* Success Message */}
          {otpSent && countdown === 0 && (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                <Text className="text-green-800 font-medium ml-2">OTP Sent Successfully!</Text>
              </View>
              <Text className="text-green-700 text-sm">
                A new verification code has been sent to your email. Please check your inbox and spam folder.
              </Text>
            </View>
          )}

          {/* Resend Button */}
          <TouchableOpacity
            onPress={handleResend}
            disabled={isLoading || countdown > 0}
            className={`p-4 rounded-xl mb-6 ${
              countdown > 0 ? 'bg-gray-400' :
              isLoading ? 'bg-orange-400' : 'bg-orange-600'
            }`}
            style={{ 
              elevation: countdown > 0 ? 0 : 2, 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: countdown > 0 ? 0 : 0.1, 
              shadowRadius: 4 
            }}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">Sending OTP...</Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                <Ionicons 
                  name={countdown > 0 ? "time-outline" : "refresh-outline"} 
                  size={20} 
                  color="white" 
                />
                <Text className="text-white font-semibold ml-2 text-base">
                  {countdown > 0 ? `Wait ${formatCountdown(countdown)}` : 'Resend Verification Code'}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Navigation Options */}
          <View className="flex-row items-center justify-center mb-6">
            <Text className="text-gray-600">Already have a code? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/verify-otp")}>
              <Text className="text-orange-600 font-medium">Verify Now</Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-8">
            <View className="flex-row items-center mb-2">
              <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
              <Text className="text-gray-700 font-medium ml-2">Need Help?</Text>
            </View>
            <Text className="text-gray-600 text-sm leading-5">
              If you continue having issues receiving the OTP, please contact our support team for assistance.
            </Text>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <View className="flex-row items-center">
              <Ionicons name="leaf-outline" size={16} color="#16a34a" />
              <Text className="text-green-600 font-medium ml-1">Eco-Friendly Digital Verification</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">Digital solutions for a greener tomorrow</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResendOtp;