import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Animated, Easing, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/context/UserContext";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const { setUserId } = useUser();
  const [checking, setChecking] = useState(true);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const leafScale1 = new Animated.Value(0);
  const leafScale2 = new Animated.Value(0);
  const leafScale3 = new Animated.Value(0);
  const particleAnim = new Animated.Value(0);
  
  // Particle positions
  const particles = Array.from({ length: 15 }).map(() => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(Math.random() * height),
    scale: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }));

  useEffect(() => {
    // Start animations
    Animated.parallel([
      // Main content fade in and scale
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      
      // Leaf animations (staggered)
      Animated.stagger(200, [
        Animated.timing(leafScale1, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(leafScale2, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
        Animated.timing(leafScale3, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
        }),
      ]),
      
      // Particle animation
      Animated.timing(particleAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();

    // Animate particles
    particles.forEach(particle => {
      // Random delay for each particle
      const delay = Math.random() * 1000;
      
      // Show particle
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 800,
            easing: Easing.elastic(1),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
        
        // Float animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.y, {
              toValue: (particle.y as any).__getValue() - 20 - Math.random() * 30,
              duration: 1500 + Math.random() * 1000,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: (particle.y as any).__getValue() + 20 + Math.random() * 30,
              duration: 1500 + Math.random() * 1000,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    });

    const checkLogin = async () => {
      try {
        // Wait for animations to complete before checking login
        await new Promise((res) => setTimeout(res, 2500));

        const token = await AsyncStorage.getItem("userToken");
        const storedId = await AsyncStorage.getItem("userId");

        if (token && storedId) {
          // update context so the rest of app knows we're logged in
          await setUserId(storedId);
          router.replace("/(tabs)/home");   // go straight to Home tab
        } else {
          router.replace("./auth/login");  // go to login screen
        }
      } catch (err) {
        console.log("Splash check error:", err);
        router.replace("./auth/login");
      } finally {
        setChecking(false);
      }
    };

    checkLogin();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-green-600">
      {/* Animated particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            transform: [{ scale: particle.scale }],
            opacity: particle.opacity,
            width: 6 + Math.random() * 6,
            height: 6 + Math.random() * 6,
            borderRadius: 50,
            backgroundColor: ['#86efac', '#4ade80', '#22c55e', '#16a34a'][index % 4],
          }}
        />
      ))}
      
      {/* Main content */}
      <Animated.View 
        className="items-center justify-center"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
      >
        {/* Leaf icon group */}
        <View className="flex-row mb-6">
          <Animated.View style={{ transform: [{ scale: leafScale1 }], marginHorizontal: 5 }}>
            <Ionicons name="leaf" size={36} color="#d9f99d" />
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: leafScale2 }], marginHorizontal: 5 }}>
            <Ionicons name="leaf" size={42} color="#bef264" />
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: leafScale3 }], marginHorizontal: 5 }}>
            <Ionicons name="leaf" size={36} color="#d9f99d" />
          </Animated.View>
        </View>
        
        <Text className="text-white text-4xl font-bold mb-2">
          Recycle IT
        </Text>
        
        <Text className="text-green-100 text-lg mb-8">
          Giving e-waste a new life
        </Text>
        
        {/* Loading indicator with animation */}
        <View className="mt-10">
          {checking && (
            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }] 
              }}
            >
              <ActivityIndicator size="large" color="#fff" />
              <Text className="text-green-100 mt-3 text-center">
                Preparing your eco-journey...
              </Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>
      
      {/* Footer with subtle animation */}
      <Animated.View 
        className="absolute bottom-10"
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })}] 
        }}
      >
        <Text className="text-green-200 text-sm">
          Together for a greener planet
        </Text>
      </Animated.View>
    </View>
  );
}
