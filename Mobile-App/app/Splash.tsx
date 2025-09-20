/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Animated, Easing, Dimensions, StatusBar, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/context/UserContext";

const { width, height } = Dimensions.get('window');

export default function Splash() {
  const router = useRouter();
  const { setUserId } = useUser();
  const [checking, setChecking] = useState(true);
  
  const fadeAnim = new Animated.Value(0);
  
  const scaleAnim = new Animated.Value(0.9);
  const slideUpAnim = new Animated.Value(30);
  const iconRotateAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);
  
  // Simple floating particles (reduced count)
  const particles = Array.from({ length: 8 }).map(() => ({
    x: new Animated.Value(Math.random() * width),
    y: new Animated.Value(Math.random() * height),
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
  }));

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Clean, professional animation sequence
    Animated.sequence([
      // Initial fade and scale in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      
      // Icon rotation (subtle)
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle pulsing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Minimal particle animations
    particles.forEach((particle, index) => {
      const delay = index * 200 + 500;
      
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(particle.opacity, {
            toValue: 0.3,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.spring(particle.scale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Gentle floating
        Animated.loop(
          Animated.sequence([
            Animated.timing(particle.y, {
              toValue: (particle.y as any).__getValue() - 20,
              duration: 3000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(particle.y, {
              toValue: (particle.y as any).__getValue() + 20,
              duration: 3000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    });

    const checkLogin = async () => {
      try {
        await new Promise((res) => setTimeout(res, 2800));
        
        const token = await AsyncStorage.getItem("userToken");
        const storedId = await AsyncStorage.getItem("userId");
        
        if (token && storedId) {
          await setUserId(storedId);
          router.replace("/(tabs)/home");
        } else {
          router.replace("/auth/login");
        }
      } catch (err) {
        console.log("Splash check error:", err);
        router.replace("/auth/login");
      } finally {
        setChecking(false);
      }
    };

    checkLogin();
  }, [fadeAnim, iconRotateAnim, particles, pulseAnim, router, scaleAnim, setUserId, slideUpAnim]);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#4CAF50', // Lighter green color
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Subtle gradient overlay */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#4CAF50',
        opacity: 0.8,
      }} />

      {/* Minimal floating particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            backgroundColor: '#A5D6A7', // Lighter particle color
            borderRadius: 2,
            transform: [
              { translateX: particle.x },
              { translateY: particle.y },
              { scale: particle.scale }
            ],
            opacity: particle.opacity,
          }}
        />
      ))}

      {/* Main content */}
      <Animated.View
        style={{
          alignItems: 'center',
          transform: [
            { scale: scaleAnim },
            { translateY: slideUpAnim }
          ],
          opacity: fadeAnim,
        }}
      >
        {/* Subtle background glow */}
        <Animated.View
          style={{
            position: 'absolute',
            width: 120,
            height: 120,
            backgroundColor: '#66BB6A', // Lighter glow color
            borderRadius: 60,
            opacity: 0.1,
            transform: [{ scale: pulseAnim }],
          }}
        />

        {/* Logo */}
        <Animated.View
          style={{
            marginBottom: 40,
            transform: [
              { scale: pulseAnim },
              { rotate: iconRotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '5deg'],
              }) }
            ],
          }}
        >
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#66BB6A',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}>
            <Image 
              source={require('../assets/images/Logo.png')} 
              style={{ width: 80, height: 80, resizeMode: 'contain' }}
            />
          </View>
        </Animated.View>

        {/* App title */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: 8,
              letterSpacing: 1.2,
            }}
          >
            Recycle IT
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View
          style={{
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            }),
            transform: [{ translateY: slideUpAnim }],
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: '#E8F5E9', // Lighter text color
              textAlign: 'center',
              marginBottom: 60,
              fontWeight: '400',
              letterSpacing: 0.5,
            }}
          >
            Giving e-waste a new life
          </Text>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View
          style={{
            opacity: fadeAnim,
          }}
        >
          {checking && (
            <View style={{
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(102, 187, 106, 0.3)', // Lighter border color
              backdropFilter: 'blur(10px)',
            }}>
              <ActivityIndicator 
                size="small" 
                color="#A5D6A7" // Lighter indicator color
                style={{ marginBottom: 12 }}
              />
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 14,
                  fontWeight: '500',
                  textAlign: 'center',
                  opacity: 0.9,
                }}
              >
                Loading...
              </Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>

      {/* Footer */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 60,
          opacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.6],
          }),
        }}
      >
        <Text
          style={{
            color: '#E8F5E9', // Lighter footer text color
            fontSize: 14,
            fontWeight: '400',
            textAlign: 'center',
          }}
        >
          Together for a greener planet
        </Text>
      </Animated.View>
    </View>
  );
}