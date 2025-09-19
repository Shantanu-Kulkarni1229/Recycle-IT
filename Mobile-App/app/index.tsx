import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Image } from "react-native";
import { SplashScreen, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Splash from "./Splash";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        // Simulate splash delay (e.g., 1.5s) for branding
        await new Promise(res => setTimeout(res, 1500));

        // ✅ Nuclear option: Clear all AsyncStorage
        await AsyncStorage.clear();
        
        // Always go to login screen
        router.replace("/(tabs)/home");
        
      } catch (err) {
        console.error("Error checking login:", err);
        router.replace("/auth/login");
      } finally {
        setChecking(false);
      }
    };

    verifyLogin();
  }, [router]);

  if (checking) {
    return (
      <View style={{ flex: 1 }}>
        <Splash />
      </View>
    );
  }

  return null;
}