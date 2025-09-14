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

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({ 
    email: "", 
    otp: "", 
    newPassword: "" 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    newPassword: ""
  });
  const [currentStep, setCurrentStep] = useState(1); // 1: Email, 2: OTP & Password

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: minLength && hasUpper && hasLower && hasNumber,
      requirements: {
        minLength,
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial
      }
    };
  };

  const handleInputChange = (field: string, text: string) => {
    setForm({ ...form, [field]: text });
    
    // Clear errors when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleOtpChange = (text: string) => {
    // Only allow numeric input for OTP
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      handleInputChange('otp', numericText);
    }
  };

  const validateForm = () => {
    const newErrors = { email: "", otp: "", newPassword: "" };
    let isValid = true;

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // OTP validation
    if (!form.otp.trim()) {
      newErrors.otp = "OTP is required";
      isValid = false;
    } else if (form.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
      isValid = false;
    }

    // Password validation
    if (!form.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else {
      const passwordValidation = validatePassword(form.newPassword);
      if (!passwordValidation.isValid) {
        newErrors.newPassword = "Password must meet all requirements";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleReset = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await api.post("users/reset-password", {
        email: form.email.toLowerCase().trim(),
        otp: form.otp,
        newPassword: form.newPassword
      });
      
      Alert.alert(
        "Password Reset Successful", 
        res.data.message || "Your password has been reset successfully. Please login with your new password.",
        [
          { text: "OK", onPress: () => router.replace("/auth/login") }
        ]
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Password reset failed. Please try again.";
      Alert.alert("Reset Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(form.newPassword);

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
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="lock-closed-outline" size={32} color="#dc2626" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">Reset Password</Text>
            <Text className="text-gray-600 text-center leading-6 px-4">
              Enter your email, verification code, and new password to reset your account password.
            </Text>
          </View>
        </View>

        {/* Form Container */}
        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-8">
          
          {/* Progress Indicator */}
          <View className="flex-row items-center justify-center mb-8">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <View className="w-12 h-0.5 bg-green-500 mx-2" />
              <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">2</Text>
              </View>
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
            <View className="relative">
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                className={`border-2 p-4 rounded-xl text-gray-900 pr-12 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                value={form.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <View className="absolute right-4 top-4">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              </View>
            </View>
            {errors.email ? (
              <View className="flex-row items-center mt-2">
                <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
                <Text className="text-red-500 text-sm ml-1">{errors.email}</Text>
              </View>
            ) : null}
          </View>

          {/* OTP Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">Verification Code</Text>
            <View className="relative">
              <TextInput
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#9CA3AF"
                className={`border-2 p-4 rounded-xl text-gray-900 text-center text-lg font-mono tracking-widest ${
                  errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                value={form.otp}
                onChangeText={handleOtpChange}
                keyboardType="numeric"
                maxLength={6}
                editable={!loading}
              />
              <View className="absolute right-4 top-4">
                <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" />
              </View>
            </View>
            {errors.otp ? (
              <View className="flex-row items-center mt-2">
                <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
                <Text className="text-red-500 text-sm ml-1">{errors.otp}</Text>
              </View>
            ) : null}
          </View>

          {/* New Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">New Password</Text>
            <View className="relative">
              <TextInput
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                className={`border-2 p-4 rounded-xl text-gray-900 pr-20 ${
                  errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                value={form.newPassword}
                onChangeText={(text) => handleInputChange('newPassword', text)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-12 top-4"
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
              <View className="absolute right-4 top-4">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              </View>
            </View>
            {errors.newPassword ? (
              <View className="flex-row items-center mt-2">
                <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
                <Text className="text-red-500 text-sm ml-1">{errors.newPassword}</Text>
              </View>
            ) : null}
          </View>

          {/* Password Requirements */}
          {form.newPassword.length > 0 && (
            <View className="bg-gray-50 rounded-xl p-4 mb-6">
              <Text className="text-gray-700 font-medium mb-3">Password Requirements:</Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Ionicons 
                    name={passwordValidation.requirements.minLength ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={passwordValidation.requirements.minLength ? "#16a34a" : "#ef4444"} 
                  />
                  <Text className={`ml-2 text-sm ${passwordValidation.requirements.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                    At least 8 characters
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={passwordValidation.requirements.hasUpper ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={passwordValidation.requirements.hasUpper ? "#16a34a" : "#ef4444"} 
                  />
                  <Text className={`ml-2 text-sm ${passwordValidation.requirements.hasUpper ? 'text-green-600' : 'text-gray-600'}`}>
                    One uppercase letter
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={passwordValidation.requirements.hasLower ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={passwordValidation.requirements.hasLower ? "#16a34a" : "#ef4444"} 
                  />
                  <Text className={`ml-2 text-sm ${passwordValidation.requirements.hasLower ? 'text-green-600' : 'text-gray-600'}`}>
                    One lowercase letter
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={passwordValidation.requirements.hasNumber ? "checkmark-circle" : "close-circle"} 
                    size={16} 
                    color={passwordValidation.requirements.hasNumber ? "#16a34a" : "#ef4444"} 
                  />
                  <Text className={`ml-2 text-sm ${passwordValidation.requirements.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                    One number
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Reset Button */}
          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            className={`p-4 rounded-xl mb-6 ${
              loading ? 'bg-gray-400' : 'bg-green-600'
            }`}
            style={{ 
              elevation: 2, 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 4 
            }}
          >
            {loading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold ml-2">Resetting Password...</Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                <Ionicons name="refresh-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-2 text-base">Reset Password</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Navigation Options */}
          <View className="flex-row items-center justify-center mb-6">
            <Text className="text-gray-600">Need a verification code? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/resend-otp")}>
              <Text className="text-green-600 font-medium">Resend OTP</Text>
            </TouchableOpacity>
          </View>

          {/* Security Info */}
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark-outline" size={20} color="#2563eb" />
              <Text className="text-blue-800 font-medium ml-2">Security Notice</Text>
            </View>
            <Text className="text-blue-700 text-sm leading-5">
              After resetting your password, you'll be automatically logged out of all devices for security purposes.
            </Text>
          </View>

          {/* Footer */}
          <View className="items-center pb-8">
            <Text className="text-gray-500 text-xs text-center leading-5">
              Having trouble? Contact support for assistance with password recovery.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPassword;