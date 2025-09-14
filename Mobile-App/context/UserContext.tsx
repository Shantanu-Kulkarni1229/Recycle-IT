import * as React from "react";

import  { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserContextType = {
  userId: string | null;
  setUserId: (id: string | null) => void;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(null);

  // Load userId from storage on app start
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedId = await AsyncStorage.getItem("userId");
        if (storedId) {
          setUserIdState(storedId);
        }
      } catch (err) {
        console.log("Error loading userId:", err);
      }
    };
    loadUserId();
  }, []);

  // Save userId in storage whenever it changes
  const setUserId = async (id: string | null) => {
    try {
      if (id) {
        await AsyncStorage.setItem("userId", id);
      } else {
        await AsyncStorage.removeItem("userId");
      }
      setUserIdState(id);
    } catch (err) {
      console.log("Error saving userId:", err);
    }
  };

  // Logout handler
  const logout = async () => {
    await AsyncStorage.removeItem("userId");
    await AsyncStorage.removeItem("userToken");
    setUserIdState(null);
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }
  return context;
};
