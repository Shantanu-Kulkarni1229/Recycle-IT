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
import { MotiView } from "moti";

const { width } = Dimensions.get('window');

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgot = async () => {
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {/* Background with gradient effect using View layers */}
      <View className="absolute inset-0 bg-blue-50" />
      <View 
        className="absolute inset-0 opacity-30"
        // To use gradients in React Native, consider using 'react-native-linear-gradient'
      />
      
      {/* Floating Background Elements */}
      <MotiView
        from={{ translateY: -25, opacity: 0.3, rotate: '10deg' }}
        animate={{ translateY: 25, opacity: 0.6, rotate: '-10deg' }}
        transition={{
          type: 'timing',
          duration: 4500,
          loop: true,
          repeatReverse: true,
        }}
        className="absolute top-20 right-8"
      >
        <Text className="text-4xl">🔑</Text>
      </MotiView>

      <MotiView
        from={{ translateX: -20, opacity: 0.2, scale: 0.8 }}
        animate={{ translateX: 20, opacity: 0.5, scale: 1.1 }}
        transition={{
          type: 'timing',
          duration: 3800,
          loop: true,
          repeatReverse: true,
          delay: 1000,
        }}
        className="absolute top-32 left-6"
      >
        <Text className="text-3xl">💌</Text>
      </MotiView>

      <MotiView
        from={{ scale: 0.7, opacity: 0.1 }}
        animate={{ scale: 1.3, opacity: 0.4 }}
        transition={{
          type: 'timing',
          duration: 5000,
          loop: true,
          repeatReverse: true,
          delay: 2000,
        }}
        className="absolute bottom-40 right-12"
      >
        <Text className="text-5xl">🔐</Text>
      </MotiView>

      <MotiView
        from={{ rotate: '0deg', opacity: 0.15 }}
        animate={{ rotate: '360deg', opacity: 0.35 }}
        transition={{
          type: 'timing',
          duration: 8000,
          loop: true,
        }}
        className="absolute top-1/3 left-1/3 transform -translate-x-8 -translate-y-8"
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
            {/* Security Icon Animation */}
            <MotiView
              from={{ scale: 0, rotate: '-20deg' }}
              animate={{ scale: 1, rotate: '0deg' }}
              transition={{
                type: 'spring',
                damping: 10,
                stiffness: 80,
                delay: 300,
              }}
              className="mb-6"
            >
              <View className="bg-white rounded-full p-6 shadow-xl">
                <Text className="text-5xl">🔐</Text>
              </View>
            </MotiView>
            
            <Text className="text-4xl font-bold text-blue-700 mb-3 text-center">
              Forgot Password?
            </Text>
            <Text className="text-lg text-blue-600 text-center leading-7 px-4">
              No worries! We'll help you{'\n'}
              <Text className="font-semibold">reset your password 🔄</Text>
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
                <View className="bg-blue-50/80 p-4 rounded-2xl border-l-4 border-blue-400">
                  <Text className="text-blue-700 text-base leading-6">
                    💡 Enter your email address and we'll send you a verification code to reset your password.
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
                    editable={!emailSent}
                    className={`${emailSent ? 'bg-gray-100' : 'bg-gray-50'} border border-gray-200 pl-14 pr-4 py-5 rounded-2xl text-gray-700 text-lg`}
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
                  {emailSent && (
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

              {/* Send OTP Button */}
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
                  onPress={handleForgot}
                  disabled={isLoading || emailSent}
                  className={`${
                    emailSent 
                      ? 'bg-green-500' 
                      : isLoading 
                        ? 'bg-blue-400' 
                        : 'bg-blue-600'
                  } p-5 rounded-2xl shadow-lg`}
                  style={{
                    shadowColor: emailSent ? '#10B981' : '#2563EB',
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
                    {emailSent && (
                      <View className="mr-3">
                        <Text className="text-lg">✅</Text>
                      </View>
                    )}
                    <Text className="text-white text-center text-xl font-bold">
                      {emailSent 
                        ? 'Email Sent Successfully!' 
                        : isLoading 
                          ? 'Sending...' 
                          : 'Send Verification Code 📧'
                      }
                    </Text>
                  </View>
                </TouchableOpacity>
              </MotiView>

              {/* Success Message */}
              {emailSent && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 600 }}
                  className="mt-6"
                >
                  <View className="bg-green-50/80 p-4 rounded-2xl border-l-4 border-green-400">
                    <Text className="text-green-700 text-base leading-6 text-center">
                      🎉 Check your email for the verification code!{'\n'}
                      <Text className="text-sm opacity-80">Redirecting you to reset page...</Text>
                    </Text>
                  </View>
                </MotiView>
              )}

            </View>
          </MotiView>

          {/* Back to Login */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 1400 }}
            className="items-center"
          >
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-white/80 px-8 py-4 rounded-full shadow-sm"
            >
              <Text className="text-center text-blue-700 font-medium text-base">
                ← Back to Login
              </Text>
            </TouchableOpacity>
          </MotiView>

          {/* Bottom Security Message */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 1000, delay: 1600 }}
            className="mt-12 items-center"
          >
            <View className="bg-blue-100/90 px-6 py-3 rounded-full shadow-sm">
              <Text className="text-sm text-blue-700 font-semibold tracking-wider">
                🔒 YOUR DATA IS SECURE 🔒
              </Text>
            </View>
            <Text className="text-xs text-blue-600 mt-3 text-center opacity-80">
              We take your privacy and security seriously
            </Text>
          </MotiView>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;