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
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../api/api";

const VerifyOtp: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError("");
  };

  const handleOtpChange = (text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setOtp(numericText);
      if (otpError) setOtpError("");
    }
  };

  const handleVerify = async () => {
    // Reset errors
    setEmailError("");
    setOtpError("");

    // Validation
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (!otp.trim()) {
      setOtpError("OTP is required");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("users/verify-otp", { email: email.toLowerCase().trim(), otp });
      Alert.alert("Success", res.data.message || "OTP verified successfully", [
        { text: "OK", onPress: () => router.replace("/auth/login") }
      ]);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Invalid OTP. Please try again.";
      Alert.alert("Verification Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      setEmailError("Please enter your email first");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      // Assuming there's a resend OTP endpoint
      await api.post("users/resend-otp", { email: email.toLowerCase().trim() });
      Alert.alert("OTP Sent", "A new OTP has been sent to your email address");
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Failed to resend OTP");
    }
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
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="mail-outline" size={32} color="#16a34a" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</Text>
            <Text className="text-gray-600 text-center leading-6">
              We've sent a 6-digit verification code to your email address. Please enter it below to continue.
            </Text>
          </View>
        </View>

        {/* Form Container */}
        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8">
          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
            <View className="relative">
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                className={`border-2 p-4 rounded-xl text-gray-900 pr-12 ${
                  emailError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View className="absolute right-4 top-4">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              </View>
            </View>
            {emailError ? (
              <Text className="text-red-500 text-sm mt-1">{emailError}</Text>
            ) : null}
          </View>

          {/* OTP Input */}
          <View className="mb-8">
            <Text className="text-gray-700 font-medium mb-2">Verification Code</Text>
            <View className="relative">
              <TextInput
                placeholder="Enter 6-digit code"
                placeholderTextColor="#9CA3AF"
                className={`border-2 p-4 rounded-xl text-gray-900 text-center text-lg font-mono tracking-widest ${
                  otpError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="numeric"
                maxLength={6}
              />
              <View className="absolute right-4 top-4">
                <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" />
              </View>
            </View>
            {otpError ? (
              <Text className="text-red-500 text-sm mt-1">{otpError}</Text>
            ) : null}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={loading}
            className={`p-4 rounded-xl mb-4 ${
              loading ? 'bg-gray-400' : 'bg-green-600'
            }`}
            style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">Verifying...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-semibold text-base">Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View className="flex-row items-center justify-center mb-8">
            <Text className="text-gray-600">Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendOtp}>
              <Text className="text-green-600 font-medium">Resend</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="text-gray-500 text-xs text-center leading-5">
              By verifying your email, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyOtp;