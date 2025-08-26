import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Splash = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // wait 2-3 seconds to show splash
      await new Promise(resolve => setTimeout(resolve, 2000));

      // get stored user token
      const userToken = await AsyncStorage.getItem("userToken");

      if (userToken) {
        router.replace("/home"); // ✅ logged in → go to home
      } else {
        router.replace("/auth/login"); // ❌ not logged in → go to login
      }
    };

    checkAuth();
  }, [router]);

  return (
    <LinearGradient
      colors={['#E8F5E8', '#C8E6C9', '#A5D6A7']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View className="flex-1 items-center justify-center relative">
        
        {/* Floating Leaf Animation - Top Left */}
        <MotiView
          from={{ 
            translateY: -20,
            rotate: '0deg',
            opacity: 0.7
          }}
          animate={{ 
            translateY: 0,
            rotate: '10deg',
            opacity: 1
          }}
          transition={{
            type: 'timing',
            duration: 3000,
            loop: true,
            repeatReverse: true,
          }}
          className="absolute top-20 left-8"
        >
          <Text className="text-3xl">🍃</Text>
        </MotiView>

        {/* Floating Leaf Animation - Top Right */}
        <MotiView
          from={{ 
            translateY: 20,
            rotate: '0deg',
            opacity: 0.6
          }}
          animate={{ 
            translateY: -10,
            rotate: '-15deg',
            opacity: 1
          }}
          transition={{
            type: 'timing',
            duration: 2500,
            loop: true,
            repeatReverse: true,
            delay: 500,
          }}
          className="absolute top-32 right-12"
        >
          <Text className="text-2xl">🌿</Text>
        </MotiView>

        {/* Recycling Symbol Background */}
        <MotiView
          from={{ 
            scale: 0.5,
            opacity: 0.1,
            rotate: '0deg'
          }}
          animate={{ 
            scale: 1.2,
            opacity: 0.3,
            rotate: '360deg'
          }}
          transition={{
            type: 'timing',
            duration: 4000,
            loop: true,
          }}
          className="absolute"
        >
          <Text className="text-9xl text-green-300">♻️</Text>
        </MotiView>

        {/* Main Content */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1200,
            type: 'timing',
          }}
          className="items-center z-10"
        >
          {/* App Icon/Logo */}
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              damping: 8,
              stiffness: 100,
              delay: 300,
            }}
            className="mb-6"
          >
            <View className="bg-white rounded-full p-6 shadow-lg">
              <Text className="text-5xl">♻️</Text>
            </View>
          </MotiView>

          {/* App Name with Gradient Effect */}
          <MotiView
            from={{ translateY: 30, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 800,
              delay: 600,
            }}
          >
            <Text className="text-5xl font-extrabold text-green-700 text-center">
              Recycle IT
            </Text>
          </MotiView>

          {/* Tagline */}
          <MotiView
            from={{ translateY: 20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 800,
              delay: 900,
            }}
          >
            <Text className="text-lg text-green-600 mt-3 font-medium text-center">
              Sustainable Tomorrow 🌍
            </Text>
            <Text className="text-sm text-green-500 mt-2 text-center font-light">
              Turn waste into wonder
            </Text>
          </MotiView>
        </MotiView>

        {/* Bottom Decorative Elements */}
        <View className="absolute bottom-20 left-0 right-0">
          <MotiView
            from={{ translateX: -50, opacity: 0 }}
            animate={{ translateX: 0, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 1000,
              delay: 1200,
            }}
          >
            <Text className="text-center text-xs text-green-600 font-medium tracking-wide">
              REDUCE • REUSE • RECYCLE
            </Text>
          </MotiView>
        </View>

        {/* Enhanced Loading Indicator */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 600,
            delay: 1500,
          }}
          style={{ marginTop: 50 }}
        >
          <View className="items-center">
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text className="text-green-600 text-xs mt-3 font-medium">
              Loading your eco journey...
            </Text>
          </View>
        </MotiView>

        {/* Floating Particles */}
        <MotiView
          from={{ 
            translateY: height,
            opacity: 0
          }}
          animate={{ 
            translateY: -50,
            opacity: 0.4
          }}
          transition={{
            type: 'timing',
            duration: 8000,
            loop: true,
            delay: 2000,
          }}
          className="absolute bottom-0 left-16"
        >
          <Text className="text-lg">🌱</Text>
        </MotiView>

        <MotiView
          from={{ 
            translateY: height,
            opacity: 0
          }}
          animate={{ 
            translateY: -80,
            opacity: 0.5
          }}
          transition={{
            type: 'timing',
            duration: 6000,
            loop: true,
            delay: 3000,
          }}
          className="absolute bottom-0 right-20"
        >
          <Text className="text-sm">🌸</Text>
        </MotiView>

        <MotiView
          from={{ 
            translateY: height,
            opacity: 0
          }}
          animate={{ 
            translateY: -30,
            opacity: 0.3
          }}
          transition={{
            type: 'timing',
            duration: 7000,
            loop: true,
            delay: 1000,
          }}
          className="absolute bottom-0 left-1/2"
        >
          <Text className="text-base">🍀</Text>
        </MotiView>

      </View>
    </LinearGradient>
  );
};

export default Splash;