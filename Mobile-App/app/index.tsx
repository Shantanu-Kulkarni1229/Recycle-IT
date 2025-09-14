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

        // Check for stored token or user id
        const token = await AsyncStorage.getItem("token");
        if (token) {
          router.replace("/(tabs)/home");   // logged in
        } else {
          router.replace("/auth/login");     // not logged in
        }
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
    // ✅ Fixed: Added flex: 1 to make the View fill the entire screen
    return (
      <View style={{ flex: 1 }}>
        <Splash />
      </View>
    );
  }

  // ✅ Added: Return null when not checking (though router.replace should handle navigation)
  return null;
}