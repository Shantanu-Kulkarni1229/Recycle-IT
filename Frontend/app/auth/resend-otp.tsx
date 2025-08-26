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
  Dimensions
} from "react-native";
import api from "../../api/api";
import { MotiView } from "moti";

const { width } = Dimensions.get('window');

const ResendOtp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return; // Prevent spam requests
    
    setIsLoading(true);
    try {
      const res = await api.post("users/resend-otp", { email });
      setOtpSent(true);
      setCountdown(60); // 60 second cooldown
      Alert.alert("Success", res.data.message);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Resend failed");
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
      <View className="absolute inset-0 bg-orange-50" />
      <View 
        className="absolute inset-0 opacity-30"
        // Gradient backgrounds are not supported in React Native View.
        // Use a gradient library like 'react-native-linear-gradient' for gradients.
      />
      
      {/* Floating Background Elements */}
      <MotiView
        from={{ translateY: -30, opacity: 0.3, rotate: '0deg' }}
        animate={{ translateY: 30, opacity: 0.7, rotate: '360deg' }}
        transition={{
          type: 'timing',
          duration: 6000,
          loop: true,
          repeatReverse: true,
        }}
        className="absolute top-16 right-10"
      >
        <Text className="text-4xl">📱</Text>
      </MotiView>

      <MotiView
        from={{ translateX: -25, opacity: 0.2, scale: 0.8 }}
        animate={{ translateX: 25, opacity: 0.6, scale: 1.2 }}
        transition={{
          type: 'timing',
          duration: 4000,
          loop: true,
          repeatReverse: true,
          delay: 1500,
        }}
        className="absolute top-28 left-8"
      >
        <Text className="text-3xl">📨</Text>
      </MotiView>

      <MotiView
        from={{ scale: 0.6, opacity: 0.1 }}
        animate={{ scale: 1.4, opacity: 0.4 }}
        transition={{
          type: 'timing',
          duration: 5500,
          loop: true,
          repeatReverse: true,
          delay: 3000,
        }}
        className="absolute bottom-32 left-6"
      >
        <Text className="text-5xl">🔄</Text>
      </MotiView>

      <MotiView
        from={{ rotate: '0deg', opacity: 0.15 }}
        animate={{ rotate: '360deg', opacity: 0.35 }}
        transition={{
          type: 'timing',
          duration: 10000,
          loop: true,
        }}
        className="absolute top-1/3 right-1/4 transform translate-x-8 -translate-y-8"
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
            from={{ opacity: 0, translateY: -50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            className="items-center mb-12"
          >
            {/* Refresh Icon Animation */}
            <MotiView
              from={{ scale: 0, rotate: '0deg' }}
              animate={{ scale: 1, rotate: '360deg' }}
              transition={{
                type: 'spring',
                damping: 8,
                stiffness: 80,
                delay: 300,
              }}
              className="mb-6"
            >
              <View className="bg-white rounded-full p-6 shadow-xl">
                <Text className="text-5xl">🔄</Text>
              </View>
            </MotiView>
            
            <Text className="text-4xl font-bold text-orange-700 mb-3 text-center">
              Resend OTP
            </Text>
            <Text className="text-lg text-orange-600 text-center leading-7 px-4">
              Didn't receive the code?{'\n'}
              <Text className="font-semibold">We'll send it again 📱</Text>
            </Text>
          </MotiView>

          {/* Form Section */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 600, delay: 600 }}
          >
            <View className="bg-white/95 rounded-3xl p-8 shadow-xl backdrop-blur-sm mb-8">
              
              {/* Instructions */}
              <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ 
                  type: 'timing', 
                  duration: 500, 
                  delay: 800 
                }}
                className="mb-6"
              >
                <View className="bg-orange-50/80 p-4 rounded-2xl border-l-4 border-orange-400">
                  <Text className="text-orange-700 text-base leading-6">
                    📬 Enter your email address to receive a new verification code. Check your spam folder if you don't see it!
                  </Text>
                </View>
              </MotiView>

              {/* Email Input */}
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ 
                  type: 'timing', 
                  duration: 500, 
                  delay: 1000 
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
                    placeholder="Enter your registered email"
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
                  
                  {/* Success checkmark */}
                  {otpSent && (
                    <MotiView
                      from={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                      className="absolute right-4 top-1/2 transform -translate-y-3"
                    >
                      <Text className="text-xl">✅</Text>
                    </MotiView>
                  )}
                </View>
              </MotiView>

              {/* Countdown Timer */}
              {countdown > 0 && (
                <MotiView
                  from={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                  className="mb-6"
                >
                  <View className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200">
                    <Text className="text-blue-700 text-center text-base font-medium">
                      ⏱️ Please wait {countdown} seconds before requesting again
                    </Text>
                    <View className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
                      <MotiView
                        animate={{ width: `${((60 - countdown) / 60) * 100}%` }}
                        transition={{ type: 'timing', duration: 300 }}
                        className="h-full bg-blue-500"
                      />
                    </View>
                  </View>
                </MotiView>
              )}

              {/* Resend OTP Button */}
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  type: 'spring', 
                  damping: 15, 
                  stiffness: 150, 
                  delay: 1200 
                }}
              >
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={isLoading || countdown > 0}
                  className={`${
                    countdown > 0
                      ? 'bg-gray-400'
                      : otpSent 
                        ? 'bg-green-500' 
                        : isLoading 
                          ? 'bg-orange-400' 
                          : 'bg-orange-600'
                  } p-5 rounded-2xl shadow-lg`}
                  style={{
                    shadowColor: countdown > 0 ? '#6B7280' : otpSent ? '#10B981' : '#EA580C',
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
                    {countdown > 0 && (
                      <View className="mr-3">
                        <Text className="text-lg">⏱️</Text>
                      </View>
                    )}
                    {otpSent && countdown === 0 && (
                      <View className="mr-3">
                        <Text className="text-lg">✅</Text>
                      </View>
                    )}
                    <Text className="text-white text-center text-xl font-bold">
                      {countdown > 0 
                        ? `Wait ${countdown}s` 
                        : otpSent && countdown === 0
                          ? 'OTP Sent Successfully!'
                          : isLoading 
                            ? 'Sending OTP...' 
                            : 'Resend Verification Code 📱'
                      }
                    </Text>
                  </View>
                </TouchableOpacity>
              </MotiView>

              {/* Success Message */}
              {otpSent && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 600 }}
                  className="mt-6"
                >
                  <View className="bg-green-50/80 p-4 rounded-2xl border-l-4 border-green-400">
                    <Text className="text-green-700 text-base leading-6 text-center">
                      🎉 New OTP sent successfully!{'\n'}
                      <Text className="text-sm opacity-80">Check your email and spam folder</Text>
                    </Text>
                  </View>
                </MotiView>
              )}

            </View>
          </MotiView>

          {/* Help Section */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 1400 }}
            className="items-center mb-6"
          >
            <View className="bg-white/80 px-6 py-4 rounded-2xl shadow-sm">
              <Text className="text-center text-orange-700 font-medium text-base mb-2">
                📋 Troubleshooting Tips
              </Text>
              <Text className="text-center text-orange-600 text-sm leading-5">
                • Check your spam/junk folder{'\n'}
                • Ensure stable internet connection{'\n'}
                • Wait a few minutes before trying again
              </Text>
            </View>
          </MotiView>

          {/* Bottom Eco Message */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 1000, delay: 1600 }}
            className="items-center"
          >
            <View className="bg-green-100/90 px-6 py-3 rounded-full shadow-sm">
              <Text className="text-sm text-green-700 font-semibold tracking-wider">
                🌱 ECO-FRIENDLY VERIFICATION 🌱
              </Text>
            </View>
            <Text className="text-xs text-green-600 mt-3 text-center opacity-80">
              Digital solutions for a greener tomorrow
            </Text>
          </MotiView>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResendOtp;