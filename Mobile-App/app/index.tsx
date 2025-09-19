import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import Splash from "./Splash";
import { isAuthenticated } from "../utils/auth";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyLogin = async () => {
      try {
        // Simulate splash delay (e.g., 1.5s) for branding
        await new Promise(res => setTimeout(res, 1500));

        console.log("🔍 Checking authentication...");
        
        // Use the utility function to check authentication
        const hasValidToken = await isAuthenticated();
        
        if (hasValidToken) {
          console.log("✅ Valid token found, redirecting to home");
          router.replace("/(tabs)/home");
        } else {
          console.log("❌ No valid token, redirecting to login");
          router.replace("/auth/login");
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
    return (
      <View style={{ flex: 1 }}>
        <Splash />
      </View>
    );
  }

  return null;
}