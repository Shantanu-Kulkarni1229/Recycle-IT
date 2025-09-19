import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

/**
 * Authentication utilities for token management
 */

export const AUTH_KEYS = {
  TOKEN: "userToken",
  USER_ID: "userId",
} as const;

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
    const userId = await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
    
    return !!(token && userId && token.length > 10 && userId.length > 5);
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Get stored authentication token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_KEYS.TOKEN);
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Get stored user ID
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_KEYS.USER_ID);
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

/**
 * Store authentication data
 */
export const storeAuthData = async (token: string, userId: string): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [AUTH_KEYS.TOKEN, token],
      [AUTH_KEYS.USER_ID, userId],
    ]);
    console.log("✅ Auth data stored successfully");
  } catch (error) {
    console.error("Error storing auth data:", error);
    throw error;
  }
};

/**
 * Clear all authentication data and redirect to login
 */
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_KEYS.TOKEN, AUTH_KEYS.USER_ID]);
    console.log("🚪 User logged out successfully");
    
    // Redirect to login (using replace to prevent going back)
    router.replace("/auth/login");
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
};

/**
 * Clear authentication data without redirect
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_KEYS.TOKEN, AUTH_KEYS.USER_ID]);
    console.log("🧹 Auth data cleared");
  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw error;
  }
};